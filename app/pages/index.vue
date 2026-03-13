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
                <th class="px-6 py-5 text-left font-semibold text-gray-600">ID</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600 hidden md:table-cell">Data</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600">Klient</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600">Status</th>
                <th class="px-6 py-5 text-right font-semibold text-gray-600">Kwota</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in orders" 
                  :key="order.id" 
                  @click="openDetails(order)" 
                  class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                  >

                <td class="px-6 py-4 text-sm text-gray-900">{{ order.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">{{ formatFullDate(order.created_at)}}</td> <!-- Tu można użyć daty bez godziny z utils, zależy od wymagań-->
                <td class="px-6 py-4 text-sm text-gray-900">{{ order.bill_name }} {{ order.bill_surname }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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