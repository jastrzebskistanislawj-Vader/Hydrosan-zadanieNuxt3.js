<script setup lang="ts">
import type { Order } from '~/types/order'
import { getStatusColor } from '~/utils/helpers'

const props = defineProps<{
  order: Order | null
  isOpen: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div class="relative z-50">
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" @click="emit('close')" class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
    </Transition>

    <div 
      class="fixed inset-y-0 right-0 flex max-w-full pl-10 transition-transform duration-500 ease-in-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div v-if="order" class="w-screen max-w-xl">
        <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
          
          <div class="bg-gray-50 px-6 py-6 border-b">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Zamówienie #{{ order.id }}</h2>
                <p class="text-sm text-gray-500 mt-1">Złożone: {{ formatFullDate(order.created_at) }}</p>
              </div>
              <button @click="emit('close')" class="rounded-md bg-white text-gray-400 hover:text-gray-500 p-2 border">
                <span class="sr-only">Zamknij</span>
                <span class="text-xl">✕</span>
              </button>
            </div>
            
            <div class="mt-4">
              <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" :class="getStatusColor(order.status)">
                {{ order.status || 'Nowe' }}
              </span>
            </div>
          </div>

          <div class="relative flex-1 px-6 py-6 space-y-8">
            
            <div class="grid grid-cols-2 gap-8">
              <section>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dane klienta</h3>
                <div class="text-sm text-gray-900 space-y-1">
                  <p class="font-semibold text-base">{{ order.bill_name }} {{ order.bill_surname }}</p>
                  <p class="text-gray-600">{{ order.email_adress }}</p>
                  <p class="text-gray-600">{{ order.bill_phone }}</p>
                </div>
              </section>
              <section>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Adres dostawy</h3>
                <div class="text-sm text-gray-600 space-y-1">
                  <p>{{ order.bill_street }}</p>
                  <p>{{ order.bill_postcode }} {{ order.bill_city }}</p>
                </div>
              </section>
            </div>

            <div class="bg-gray-100 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-1">Metoda płatności</h4>
                <p class="text-sm font-medium">{{ order.payment.name }}</p>
                <p class="text-[10px] text-gray-400 uppercase italic">{{ order.payment.status }}</p>
              </div>
              <div>
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-1">Wysyłka</h4>
                <p class="text-sm font-medium">{{ order.shipment.name }}</p>
                <p class="text-[10px] text-gray-600 font-bold">{{ formatCurrency(order.shipment.total) }}</p>
              </div>
            </div>

            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Produkty ({{ order.products.length }})</h3>
              <div class="divide-y divide-gray-100 border-t border-b overflow-hidden">
                <div v-for="item in order.products" :key="item.sku" class="py-4 flex gap-4 items-center">
                  <OrderProductImage :src="item.image_url" :alt="item.name" />
                  <div class="flex flex-1 flex-col">
                    <p class="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{{ item.name }}</p>
                    <p class="text-xs text-gray-400 mt-1 uppercase tracking-tighter">SKU: {{ item.sku }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900">{{ formatCurrency(item.price) }}</p>
                    <p class="text-xs text-gray-500">ilość: {{ item.quantity }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="border-t border-gray-200 px-6 py-6 bg-gray-50">
            <div class="flex justify-between text-base font-medium text-gray-900">
              <p>Wartość zamówienia</p>
              <p class="text-2xl font-black text-blue-600">{{ formatCurrency(order.total_price) }}</p>
            </div>
            <p class="mt-0.5 text-xs text-gray-500 text-right">Ceny zawierają podatek VAT</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>