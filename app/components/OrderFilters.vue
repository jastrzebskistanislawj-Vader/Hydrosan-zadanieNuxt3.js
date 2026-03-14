<template>
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Filtry zamówień</h3>
    
    <!-- Sekcja wyszukiwania na górze -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-1">Wyszukaj frazę</label>
      <div class="grid grid-cols-4 gap-2">
        <div class="col-span-3">
          <input
            v-model="filters.searchPhrase"
            :type="filters.searchColumn === 'id' || filters.searchColumn === 'bill_phone' ? 'number' : 'text'"
            placeholder="Wpisz frazę..."
            autocomplete="off"
            @keyup.enter="applyFilters"
            class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div class="flex flex-wrap gap-2 mt-2">
            <label v-for="col in searchColumns" :key="col.value" class="flex items-center">
              <input
                type="radio"
                v-model="filters.searchColumn"
                :value="col.value"
                class="mr-1"
              />
              {{ col.label }}
              <span v-if="filters.searchColumn === col.value" class="ml-2 text-xs text-blue-600 bg-blue-100 rounded px-2 py-1" style="white-space:nowrap;">
                {{ col.title }}
              </span>
            </label>
          </div>
        </div>

        <div class="col-span-1 flex items-start gap-2">
          <button 
            @click="applyFilters" 
            class="flex-[3] px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium transition-colors text-sm"
          >
            Zastosuj
          </button>
          <button 
            @click="clearFilters" 
            title="Wyczyść filtry"
            class="flex-[1] px-2 py-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- Dropdown dla statusu -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Status</label>
        <select 
          v-model="filters.status" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Wszystkie</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      
      <!-- Input dla daty od -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Data od</label>
        <input 
          v-model="filters.dateFrom" 
          type="date" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- Input dla daty do -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Data do</label>
        <input 
          v-model="filters.dateTo" 
          type="date" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Dropdown dla ilości na stronę -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Na stronę</label>
        <select 
          v-model="filters.perPage" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { loadUniqueStatuses } from '~/utils/helpers';

const emit = defineEmits<{ apply: [filters: Record<string, any>] }>()

// Stałe opcje
const perPageOptions = [10, 20, 50, 100]
const uniqueStatuses = ref<string[]>([])
const searchColumns = [
  { label: 'Klient', value: 'klient', title: 'Szuka frazy w imieniu i nazwisku klienta' },
  { label: 'ID', value: 'id', title: 'Szukanie po ID wymaga wpisania całego numeru' },
  { label: 'Email', value: 'email_adress', title: 'Szuka frazy w adresie email' },
  { label: 'Telefon', value: 'bill_phone', title: 'Szuka frazy w numerze telefonu' },
]

// Obiekt filtrów
const filters = reactive({
  status: '',
  dateFrom: '',
  dateTo: '',
  perPage: 20,
  searchPhrase: '',
  searchColumn: 'klient' // Domyślnie wybór
})

onMounted(async () => {
  uniqueStatuses.value = await loadUniqueStatuses(useSupabaseClient())
})

const clearFilters = () => {
  filters.status = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.perPage = 20
  filters.searchPhrase = ''
  filters.searchColumn = 'klient'
  applyFilters()
}

const applyFilters = () => {
  emit('apply', { ...filters })
}
</script>