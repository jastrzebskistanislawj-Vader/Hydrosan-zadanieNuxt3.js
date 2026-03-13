<script setup lang="ts">
// Inicjalizacja klienta Supabase
import { ref, onMounted, computed } from 'vue'
import type { Database } from '~/types/database'
import type { Order } from '~/types/order'

const client = useSupabaseClient<Database>()

const orders = ref<Order[]>([])
const loadError = ref<string | null>(null)

const page = ref<number>(1) // aktualna strona
const perPage = ref<number>(20) // ilość elementów na stronę
const totalPages = ref<number>(1) // całkowita liczba stron

const loading = ref<boolean>(false)

const loadOrders = async (): Promise<void> => {
  loading.value = true
  loadError.value = null
  try {    
    const from = (page.value -1) * perPage.value
    const to = from + perPage.value - 1

    const { data, error: fetchError, count } = await client
      .from('orders')
      .select('*', {count: 'exact'}) //porbranie ilości zamówień
      .order('created_at', { ascending: false })
      .range(from, to) // to jest zakres popbieranych danych

    if (fetchError) throw fetchError

    orders.value = data || []
    totalPages.value = Math.ceil((count || 0) / perPage.value) // obliczenie ilości stron
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

onMounted(loadOrders)

const nextPage = (): void => {
  page.value++
  loadOrders()
}

const prevPage = (): void => {
  if (page.value > 1) {
    page.value--
    loadOrders()
  }
}

const goToPage = (pageNum: number): void => {
  page.value = pageNum
  loadOrders()
}

const pageInput = ref<number | null>(page.value) //strona do przeskoku
const jumpToPage = (): void => {
  const num = pageInput.value || 0
  if (num > 0 && num <= totalPages.value) {
    goToPage(num)
  }
  
  pageInput.value = page.value
}

const pageNumbers = computed<number[]>(() => {
  const delta = 2
  const pages: number[] = []
  for (let i = Math.max(1, page.value - delta); 
        i <= Math.min(totalPages.value, page.value + delta); 
        i++) {
    pages.push(i)
  }
  return pages
})

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)
}


const selectedOrder = ref<Order | null>(null)
const isDrawerOpen = ref(false)

const openDetails = (order: Order) => {
  selectedOrder.value = order
  isDrawerOpen.value = true
}

const testError = (): void => {
  loadError.value = 'To jest testowy błąd!'
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
      <button @click="testError" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Error TEST
      </button>
      {{ loadError }}

      <!-- Główne miejsce na Twoją aplikację -->
      <main>
        <div v-if="loading" class="text-center py-10">
          <p class="text-blue-600 font-semibold animate-pulse">Ładowanie zamówień...</p>
        </div>

        <div v-if="loadError" class="bg-red-100 text-red-700 p-4 rounded mb-4">
          Błąd: {{ loadError }}
        </div>

        <div v-else-if="orders.length === 0" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p class="text-gray-400 text-lg">Brak zamówień do wyświetlenia</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-100 border-b">
                <th class="px-4 py-3 text-left font-semibold">ID</th>
                <th class="px-4 py-3 text-left font-semibold">Data</th>
                <th class="px-4 py-3 text-left font-semibold">Klient</th>
                <th class="px-4 py-3 text-left font-semibold">Status</th>
                <th class="px-4 py-3 text-right font-semibold">Kwota</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" 
                  :key="order.id" 
                  @click="openDetails(order)" 
                  class="border-b hover:bg-gray-50 cursor-pointer transition-colors group"
                  >

                <td class="px-4 py-3">{{ order.id }}</td>
                <td class="px-4 py-3">{{ new Date(order.created_at).toLocaleDateString('pl-PL') }}</td>
                <td class="px-4 py-3">{{ order.bill_name }} {{ order.bill_surname }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-sm" :class="{
                    'bg-green-100 text-green-800': order.status === 'completed',
                    'bg-yellow-100 text-yellow-800': order.status === 'pending',
                    'bg-red-100 text-red-800': order.status === 'cancelled',
                    'bg-gray-100 text-gray-800': !order.status
                  }">
                    {{ order.status || '-' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-semibold">{{ formatCurrency(order.total_price) }}</td>
                
              </tr>
            </tbody>
          </table>
        </div>


        <div class="mt-6 flex items-center justify-center gap-4">
          <!-- przyciski nawigacji -->
          <div class="flex items-center justify-center gap-2">
            <button 
              @click="goToPage(page - 1)" 
              :disabled="page === 1"
              class="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            <button 
              v-for="item in pageNumbers" 
              :key="item"
              @click="goToPage(item)"
              :disabled="item === page"
              class="px-3 py-2 rounded"
              :class="{
                'bg-blue-600 text-white': item === page,
                'bg-gray-100 hover:bg-gray-200': item !== page
              }"
            >
              {{ item }}
            </button>

            <button 
              @click="goToPage(page + 1)" 
              :disabled="page === totalPages"
              class="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
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
          @close="isDrawerOpen = false" 
        />

      </main>
    </div>
  </div>
</template>