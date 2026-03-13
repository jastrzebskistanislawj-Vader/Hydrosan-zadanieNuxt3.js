<template>
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Filtry zamówień</h3>
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

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-600 mb-1">Wyszukaj frazę</label>
        <input
          v-model="filters.searchPhrase"
          :type="filters.searchColumn === 'id' || filters.searchColumn === 'bill_phone' ? 'number' : 'text'"
          placeholder="Wpisz frazę..."
          autocomplete="off"
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
        />
        <div class="flex flex-wrap gap-2">
          <label v-for="col in searchColumns" :key="col.value" class="flex items-center">
            <input
              type="radio"
              v-model="filters.searchColumn"
              :value="col.value"
              class="mr-1"
            />
            {{ col.label }}
            <span v-if="col.value === 'id' && filters.searchColumn === 'id'" class="ml-2 text-xs text-blue-600 bg-blue-100 rounded px-2 py-1" style="white-space:nowrap;">
              Szukanie po ID wymaga wpisania całego numeru
            </span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Przycisk zastosuj -->
    <div class="mt-3 flex justify-end">
      <button 
        @click="applyFilters" 
        class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
      >
        Zastosuj filtry
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loadUniqueStatuses } from '~/utils/helpers';

const emit = defineEmits<{ apply: [filters: Record<string, any>] }>()

// Stałe opcje
const perPageOptions = [10, 20, 50, 100]
const uniqueStatuses = ref<string[]>([])
const searchColumns = [
  { label: 'ID', value: 'id' },
  { label: 'Klient', value: 'klient' },
  { label: 'Email', value: 'email_adress' },
  { label: 'Telefon', value: 'bill_phone' },
]

// Obiekt filtrów
const filters = ref<{ 
  status: string;
  dateFrom: string;
  dateTo: string;
  perPage: number;
  searchPhrase: string;
  searchColumn: string;
}>({
  status: '',
  dateFrom: '',
  dateTo: '',
  perPage: 20,
  searchPhrase: '',
  searchColumn: '',
})

onMounted(async () => {
  uniqueStatuses.value = await loadUniqueStatuses(useSupabaseClient())
})

const applyFilters = () => {
  emit('apply', { ...filters.value })
}
</script>