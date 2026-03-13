<template>
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Filtry zamówień</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- Dropdown dla statusu -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Status</label>
        <select 
          v-model="localStatusFilter" 
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
          v-model="localDateFrom" 
          type="date" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- Input dla daty do -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Data do</label>
        <input 
          v-model="localDateTo" 
          type="date" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Dropdown dla ilości na stronę -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Na stronę</label>
        <select 
          v-model="localPerPage" 
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
        </select>
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

const emit = defineEmits<{
  apply: [filters: { status: string; dateFrom: string; dateTo: string; perPage: number }]
}>()

// Wewnętrzne opcje – stała lista
const perPageOptions = [10, 20, 50, 100]

// Wewnętrzny stan komponentu
const localStatusFilter = ref('')
const localDateFrom = ref('')
const localDateTo = ref('')
const localPerPage = ref(20)
const uniqueStatuses = ref<string[]>([])

onMounted(async () => {
  uniqueStatuses.value = await loadUniqueStatuses(useSupabaseClient())
})

const applyFilters = () => {
  emit('apply', {
    status: localStatusFilter.value,
    dateFrom: localDateFrom.value,
    dateTo: localDateTo.value,
    perPage: localPerPage.value,
  })
}
</script>