<script setup lang="ts">
const props = defineProps<{
  src: string | null | undefined
  alt: string
}>()

// Stan: czy obrazek został już w pełni pobrany?
const isLoaded = ref(false)

const handleLoad = () => {
  isLoaded.value = true
}
</script>

<template>
  <div class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
    
    <div 
      v-if="!isLoaded && src" 
      class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
    >
      <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
    </div>

    <img 
      v-if="src"
      :src="src" 
      :alt="alt"
      @load="handleLoad"
      class="h-full w-full object-cover transition-opacity duration-500"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
    />

    <div v-else class="text-[10px] text-gray-400 uppercase font-bold text-center p-1">
      Brak foto
    </div>
    
  </div>
</template>