<script setup lang="ts">
// Inicjalizacja klienta Supabase
import { ref, onMounted, computed } from 'vue'
import type { Database } from '~/types/database'
import type { Order } from '~/types/order'
import { loadUniqueStatuses, getStatusColor } from '~/utils/helpers'
import OrderFilters from '~/components/OrderFilters.vue'

//router do przechowywania danych o stronie w linku
const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(false)

//działanie na bazie danych Supabase
const client = useSupabaseClient<Database>()
const orders = ref<Order[]>([])
const loadError = ref<string | null>(null)

// Paginacja - zarządzanie stanem paginacji
const initialPage = Number(route.query.page ?? 1) || 1 // łapanie strony z url, jesli jest i jest poprawnie konwertowan w innym przypadu 1
const page = ref<number>(initialPage) //ustawiania aktualnej strony
const perPage = ref<number>(20) // ilość elementów na stronę
const totalPages = ref<number>(1) // całkowita liczba stron

// Sortowanie
const sortColumn = ref<string>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

const applyFilters = (filters: Record<string, any>) => {
  perPage.value = filters.perPage
  page.value = 1
  loadOrders(filters) // przekazujesz cały obiekt filtrów
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/*
  Funkcja do ładowania zamówień z bazy danych Supabase z obsługą paginacji i filtrów.
  Przyjmuje opcjonalny obiekt filtrów, który może zawierać status, zakres daty i frazę wyszukiwania.
  Fraza wyszukiwania jest dynamicznie dopasowywana do wybranej kolumny, 
  dla filtrowania stringów używany jest ilike aby ignorować wielkość liter i dopasowywać częściowo
  dla ID które jest numeryczne używany jest equals aby wymagać dokładnego dopasowania
*/
const loadOrders = async (filters?: Record<string, any>): Promise<void> => {
  loading.value = true
  loadError.value = null
  try {
    let query = client
      .from('orders')
      .select('*', { count: 'exact' })
      .order(sortColumn.value, { ascending: sortOrder.value === 'asc' })

    // Dodaj filtry
    if (filters?.status) {
      query = query.eq('status', filters.status) // filtrowanie po statusie, status równy podanemu z filtra
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom) // dodwanie warunku zakresu daty, większe lub równe
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo + 'T23:59:59') // dodawanie warunku zakresu daty, mniejsze lub równe
    }
    if (filters?.searchPhrase && filters?.searchColumn) {
      const { searchPhrase, searchColumn } = filters;
      const phrase = searchPhrase.trim();
      let condition: string | null = null;

      
      // szukanie po ID które jest typu numerycznego więc dopasowanie jedynie na equals
      if (searchColumn === 'id') {
        const parsedId = Number(phrase);
        if (!isNaN(parsedId) && phrase !== '') {
          condition = `${searchColumn}.eq.${parsedId}`;
        }
      } 
      
      // Dynamicznie wysuzkiwanie dal reszty podstawowych danych typu string, injectowanie kolumny i frazy
      else {
        condition = `${searchColumn}.ilike.%${phrase}%`;
      }

      // Wykonanie
      if (condition) {
        query = query.or(condition);
      }
    }

    const from = (page.value - 1) * perPage.value
    const to = from + perPage.value - 1

    const { data, error: fetchError, count } = await query.range(from, to)

    if (fetchError) throw fetchError
    
    orders.value = data || []
    totalPages.value = Math.ceil((count || 0) / perPage.value)
  } catch (err: unknown) {
    if (err instanceof Error) {
      loadError.value = err.message
    } else {
      loadError.value = 'Nieznany błąd podczas ładowania zamówień'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadOrders()
})

watch(
  () => route.query.page,
  (newPage) => {
    const pageNum = Number(newPage) || 1
    if (pageNum !== page.value) {
      page.value = pageNum
      loadOrders()
    }
  },
)

const toggleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'desc'
  }
  page.value = 1
  loadOrders()
}

const setPage = (pageNum: number): void => {
  page.value = pageNum
  router.push({ // tu można wykorzystać replace, jeśłi nie chcemy aby tworzyłą się historia przeglądania przy zmianie strony
    query: {
      ...route.query,
      page: String(pageNum),
    },
  })
}

const goToPage = async (pageNum: number): Promise<void> => {
  setPage(pageNum)
  await loadOrders()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const pageInput = ref<number | null>(page.value) //strona do przeskoku
const jumpToPage = async (): Promise<void> => {
  const num = pageInput.value || 0
  if (num > 0 && num <= totalPages.value) {
    await goToPage(num)
  }
  pageInput.value = page.value
}

const pageNumbers = computed<number[]>(() => {
  const delta = 2
  
  // wyświetlanie zawsze takiej samej ilości stron delta*2+1 ilości numerów stron jeśli jest ich tyle
  const startPage = Math.max(1, Math.min(page.value - delta, totalPages.value - delta * 2)) 
  const endPage = Math.min(totalPages.value, startPage + delta * 2)

  const pages: number[] = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})


const selectedOrder = ref<Order | null>(null)
const isDrawerOpen = ref(false)

const openDetails = (order: Order) => {
  selectedOrder.value = order
  isDrawerOpen.value = true
}

const closeDetails = () => {
  selectedOrder.value = null
  isDrawerOpen.value = false
}


// Miejsce na Twoją logikę pobierania danych, paginację itp.
// Powodzenia! 🚀
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-gray-800">
    <div class="max-w-7xl mx-auto">
      
      <!-- Nagłówek powitalny (śmiało, możesz go usunąć lub zmodyfikować!) -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Lista Zamówień</h1>
        <p class="text-gray-500 mt-2">To jest Twoja strona startowa. Powodzenia w zadaniu! 🚀</p>
      </header>

      <OrderFilters 
        @apply="applyFilters" 
      />
      <!-- Główne miejsce na Twoją aplikację -->
      <main class="relative min-h-[600px]">
        <Transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-xl">
            <div class="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-3 text-blue-600 font-bold animate-pulse">Aktualizowanie danych...</p>
            </div>
          </div>
        </Transition>

        <div v-if="loadError" class="bg-red-100 text-red-700 p-4 rounded mb-4">
          Błąd: {{ loadError }}
        </div>

        <div v-else-if="!loading && orders.length === 0" class="bg-white p-20 rounded-xl shadow-sm border border-gray-100 text-center">
          <p class="text-gray-400 text-lg">Nie znaleziono zamówień</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th @click="toggleSort('id')" class="px-6 py-5 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors group">
                  <div class="flex items-center gap-1">
                    ID
                    <span :class="{'opacity-100': sortColumn === 'id', 'opacity-0 group-hover:opacity-50': sortColumn !== 'id'}">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th @click="toggleSort('created_at')" class="px-6 py-5 text-left font-semibold text-gray-600 hidden md:table-cell cursor-pointer hover:text-blue-600 transition-colors group">
                  <div class="flex items-center gap-1">
                    Data
                    <span :class="{'opacity-100': sortColumn === 'created_at', 'opacity-0 group-hover:opacity-50': sortColumn !== 'created_at'}">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th @click="toggleSort('bill_surname')" class="px-6 py-5 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors group">
                  <div class="flex items-center gap-1">
                    Klient
                    <span :class="{'opacity-100': sortColumn === 'bill_surname', 'opacity-0 group-hover:opacity-50': sortColumn !== 'bill_surname'}">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th @click="toggleSort('status')" class="px-6 py-5 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors group">
                  <div class="flex items-center gap-1">
                    Status
                    <span :class="{'opacity-100': sortColumn === 'status', 'opacity-0 group-hover:opacity-50': sortColumn !== 'status'}">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th @click="toggleSort('total_price')" class="px-6 py-5 text-right font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors group">
                  <div class="flex items-center justify-end gap-1">
                    Kwota
                    <span :class="{'opacity-100': sortColumn === 'total_price', 'opacity-0 group-hover:opacity-50': sortColumn !== 'total_price'}">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in orders" 
                  :key="order.id" 
                  @click="openDetails(order)" 
                  class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  :class="selectedOrder?.id === order.id ? 'bg-blue-100 border-b-blue-300' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                  >

                <td class="px-6 py-4 text-sm text-gray-900">{{ order.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">{{ formatFullDate(order.created_at)}}</td> <!-- Tu można użyć daty bez godziny z utils, zależy od wymagań-->
                <td class="px-6 py-4 text-sm text-gray-900">{{ order.bill_name }} {{ order.bill_surname }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="getStatusColor(order.status)">
                    {{ order.status || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900">{{ formatCurrency(order.total_price) }}</td>
                
              </tr>
            </tbody>
          </table>
        </div>


        <div class="mt-6 flex items-center justify-center gap-4">
          <!-- przyciski nawigacji -->
          <div class="inline-flex rounded-md shadow-sm" role="group">

            <!-- przycisk do pierwszej strony -->
            <button 
              @click="goToPage(1)" 
              :disabled="page === 1"
              class="px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-l-md hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;&lt;
            </button>

            <!-- Przycisk do porzedniej strony -->
            <button 
              @click="goToPage(page - 1)" 
              :disabled="page === 1"
              class="px-3 py-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            <!-- wyświetlanie numerów stron -->
            <button 
              v-for="item in pageNumbers" 
              :key="item"
              @click="goToPage(item)"
              :disabled="item === page"
              class="px-3 py-2 text-sm font-medium border-t border-b border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500"
              :class="{
                'bg-blue-600 text-white border-blue-600': item === page,
                'bg-white hover:bg-gray-50': item !== page
              }"
            >
              {{ item }}
            </button>
            
            <!-- przycisk do następnej strony -->
            <button 
              @click="goToPage(page + 1)" 
              :disabled="page === totalPages"
              class="px-3 py-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>

            <!-- Przycisk do ostatniej strony -->
            <button 
              @click="goToPage(totalPages)" 
              :disabled="page === totalPages"
              class="px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-r-md hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;&gt;
            </button>
          </div>

          

          <!-- skoczenie do strony -->
          <div class="flex items-center gap-2 border-l border-gray-300 pl-4">
            <label class="text-sm text-gray-600">Przejdź do:</label>
            <input 
              v-model.number="pageInput"
              type="number" 
              min="1"
              :max="totalPages"
              @keyup.enter="jumpToPage"
              class="w-14 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <button 
              @click="jumpToPage"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>

        <OrderDetailsDrawer 
          :order="selectedOrder" 
          :is-open="isDrawerOpen" 
          @close="closeDetails()" 
        />

      </main>
    </div>
  </div>
</template>