<template>
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Filtry zamówień</h3>
    
    <!-- Sekcja wyszukiwania na górze -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-1">Wyszukaj frazę</label>
      <div class="grid grid-cols-4 gap-2">
        <div class="col-span-3">
          <div class="relative">
            <input
              v-model="filters.searchPhrase"
              :type="filters.searchColumn === 'id' || filters.searchColumn === 'bill_phone' ? 'number' : 'text'"
              placeholder="Wpisz frazę..."
              autocomplete="off"
              @keyup.enter="applyFilters"
              class="w-full pl-2 h-[34px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              :class="filters.searchPhrase ? 'pr-8' : 'pr-2'"
            />
            <button 
              v-if="filters.searchPhrase"
              @click="filters.searchPhrase = ''; applyFilters()"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            <label v-for="col in searchColumns" :key="col.value" class="flex items-center cursor-pointer">
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
            class="flex-[3] h-[34px] inline-flex items-center justify-center px-2 bg-blue-600 text-white border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium transition-colors text-sm cursor-pointer"
          >
            Zastosuj
          </button>
          <button 
            @click="clearFilters" 
            title="Wyczyść filtry"
            class="flex-[1] h-[34px] inline-flex items-center justify-center px-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- Dropdown dla statusu -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Status</label>
        <div class="relative">
          <select 
            v-model="filters.status" 
            class="w-full pl-2 pr-10 h-[34px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
          >
            <option value="">Wszystkie</option>
            <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
          <button 
            v-if="filters.status"
            @click="filters.status = ''; applyFilters()"
            class="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
          <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      
      <!-- Input dla daty od -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Data od</label>
        <div class="relative">
          <input 
            v-model="filters.dateFrom" 
            type="date" 
            class="w-full pl-2 h-[34px] border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="[filters.dateFrom ? 'pr-6' : 'pr-2', !isDateRangeValid ? 'border-red-400 ring-red-100 ring-2' : 'border-gray-300']"
          />
          <button 
            v-if="filters.dateFrom"
            @click="filters.dateFrom = ''; applyFilters()"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 text-base cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- Input dla daty do -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Data do</label>
        <div class="relative">
          <input 
            v-model="filters.dateTo" 
            type="date" 
            class="w-full pl-2 h-[34px] border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="[filters.dateTo ? 'pr-6' : 'pr-2', !isDateRangeValid ? 'border-red-400 ring-red-100 ring-2' : 'border-gray-300']"
          />
          <button 
            v-if="filters.dateTo"
            @click="filters.dateTo = ''; applyFilters()"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 text-base cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Input dla kwoty od -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Kwota od</label>
        <div class="relative">
          <input 
            v-model="filters.priceFrom" 
            type="number" 
            placeholder="0.00"
            class="w-full pl-2 h-[34px] border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="[filters.priceFrom ? 'pr-8' : 'pr-2', !isPriceRangeValid ? 'border-red-400 ring-red-100 ring-2' : 'border-gray-300']"
          />
          <button 
            v-if="filters.priceFrom"
            @click="filters.priceFrom = ''; applyFilters()"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Input dla kwoty do -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Kwota do</label>
        <div class="relative">
          <input 
            v-model="filters.priceTo" 
            type="number" 
            placeholder="0.00"
            class="w-full pl-2 h-[34px] border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="[filters.priceTo ? 'pr-8' : 'pr-2', !isPriceRangeValid ? 'border-red-400 ring-red-100 ring-2' : 'border-gray-300']"
          />
          <button 
            v-if="filters.priceTo"
            @click="filters.priceTo = ''; applyFilters()"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Dropdown dla ilości na stronę -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Na stronę</label>
        <select 
          v-model="filters.perPage" 
          class="w-full px-2 h-[34px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>

    <!-- Sekcja błędów walidacji -->
    <div v-if="!isDateRangeValid || !isPriceRangeValid" class="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex flex-col gap-1">
      <p v-if="!isDateRangeValid" class="flex items-center gap-1 font-medium">✕ Data "od" nie może być późniejsza niż data "do"</p>
      <p v-if="!isPriceRangeValid" class="flex items-center gap-1 font-medium">✕ Kwota "od" nie może być wyższa niż kwota "do"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { loadUniqueStatuses } from '~/utils/helpers';

const emit = defineEmits<{ apply: [filters: Record<string, any>] }>()

// Stałe opcje
const perPageOptions = [10, 20, 50, 100]
const uniqueStatuses = ref<string[]>([])
const searchColumns = [
  { label: 'Imie', value: 'bill_name', title: 'Szuka frazy w imieniu' },
  { label: 'ID', value: 'id', title: 'Szukanie po ID wymaga wpisania całego numeru' },
  { label: 'Email', value: 'email_adress', title: 'Szuka frazy w adresie email' },
  { label: 'Telefon', value: 'bill_phone', title: 'Szuka frazy w numerze telefonu' },
  { label: 'status', value: 'status', title: 'Szuka frazy w statusie' },
]

// Obiekt filtrów
const filters = reactive({
  status: '',
  dateFrom: '',
  dateTo: '',
  priceFrom: '',
  priceTo: '',
  perPage: 20,
  searchPhrase: '',
  searchColumn: 'bill_name' // Domyślnie wybór
})

// Walidacja dat: Od nie może być większa niż Do
const isDateRangeValid = computed(() => {
  if (!filters.dateFrom || !filters.dateTo) return true
  return filters.dateFrom <= filters.dateTo
})

// Walidacja kwot: Od nie może być większa niż Do
const isPriceRangeValid = computed(() => {
  if (filters.priceFrom === '' || filters.priceFrom === null || filters.priceTo === '' || filters.priceTo === null) return true
  return Number(filters.priceFrom) <= Number(filters.priceTo)
})

onMounted(async () => {
  uniqueStatuses.value = await loadUniqueStatuses(useSupabaseClient())
})

const clearFilters = () => {
  filters.status = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.priceFrom = ''
  filters.priceTo = ''
  filters.searchPhrase = ''
  filters.searchColumn = 'bill_name'
  applyFilters()
}

const applyFilters = () => {
  if (!isDateRangeValid.value || !isPriceRangeValid.value) return
  emit('apply', { ...filters })
}
</script>