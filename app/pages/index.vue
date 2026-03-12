<script setup>
// Inicjalizacja klienta Supabase
import { ref, onMounted } from 'vue';

const client = useSupabaseClient()
const orders = ref([])
const error = ref<String | null>(null)
const page = ref(1)
const perPage = 20

const loadOrders = async () => {
  try {    
    const from = (page.value -1) * perPage
    const to = from + perPage - 1

    const { data, error: fetchError } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to) // to jest zakres popbieranych danych

    if (fetchError) {
      throw fetchError
    }
    orders.value = data || []
    // console.log('Pobrane zamówienia:', orders.value)
  } catch (err) {
    error.value = err.message || 'Nie można pobrać zamówień.'
    console.error('Błąd:', err)
  }
}

onMounted(loadOrders)

  const nextPage = () => {
    page.value++
    loadOrders()
  }

  const prevPage = () => {
    if (page.value > 1) {
      page.value--
      loadOrders()
    }
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
      <main>

        <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded mb-4">
          Błąd: {{ error }}
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
              <tr v-for="order in orders" :key="order.id" class="border-b hover:bg-gray-50">
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
                <td class="px-4 py-3 text-right font-semibold">{{ order.total_price }} PLN</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 flex items-center justify-between">
          <button 
            @click="prevPage" 
            :disabled="page === 1"
            class="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ← Poprzednia
          </button>

          <span class="text-gray-600">Strona {{ page }}</span>

          <button 
            @click="nextPage"
            :disabled="orders.length < perPage"
            class="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Następna →
          </button>
        </div>



      </main>
    </div>
  </div>
</template>