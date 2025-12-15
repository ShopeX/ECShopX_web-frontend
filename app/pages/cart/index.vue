<template>
  <div class="bg-gray-50 min-h-screen pb-12">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Your cart</h1>
        <NuxtLink to="/" class="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
          Continue shopping
        </NuxtLink>
      </div>

      <div v-if="cartUIStore.loading && !cartStore.initialized" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <div v-else-if="cartStore.items.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
        <UIcon name="i-heroicons-shopping-cart" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 class="text-xl font-medium text-gray-900 mb-2">{{ $t('app.pages.cart.index.cart') }}</h2>
        <p class="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#ea580c] hover:bg-[#c2410c] transition-colors"
        >
         {{ $t('app.pages.cart.index.fastbuy') }}
        </NuxtLink>
      </div>

      <div v-else class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <!-- Cart Items List -->
        <section class="lg:col-span-7 bg-white rounded-lg shadow-sm overflow-hidden">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="item in cartStore.items" :key="item.id" class="p-6 sm:flex">
              <div class="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden border border-gray-200">
                <img
                  :src="item.productImage"
                  :alt="item.productName"
                  class="w-full h-full object-center object-cover"
                />
              </div>

              <div class="mt-4 sm:mt-0 sm:ml-6 flex-1 flex flex-col justify-between">
                <div class="flex justify-between">
                  <div>
                    <h3 class="text-base font-medium text-gray-900">
                      <NuxtLink :to="`/products/${item.productId}`">{{ item.productName }}</NuxtLink>
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">{{ item.specName }}</p>
                    <p class="mt-1 text-lg font-medium text-gray-900">{{ item.price.display }}</p>
                  </div>
                  <p class="text-lg font-medium text-gray-900 sm:hidden">
                    {{ (item.price.amount * item.quantity.value).toFixed(2) }}
                  </p>
                </div>

                <div class="mt-4 flex items-center justify-between sm:mt-0">
                  <div class="flex items-center border border-gray-300 rounded">
                    <button 
                      type="button"
                      class="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      :disabled="item.quantity.value <= 1 || cartUIStore.isActionLoading(item.id)"
                      @click="cartStore.updateQuantity(item.id, item.quantity.value - 1)"
                    >
                      −
                    </button>
                    <span class="px-3 text-gray-900 min-w-[2rem] text-center">{{ item.quantity.value }}</span>
                    <button 
                      type="button"
                      class="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      :disabled="cartUIStore.isActionLoading(item.id)"
                      @click="cartStore.updateQuantity(item.id, item.quantity.value + 1)"
                    >
                      +
                    </button>
                  </div>

                  <div class="flex items-center gap-4">
                    <p class="hidden sm:block text-lg font-medium text-gray-900">
                      ${{ (item.price.amount * item.quantity.value).toFixed(2) }}
                    </p>
                    <button
                      type="button"
                      class="text-gray-400 hover:text-red-500 transition-colors p-2"
                      :disabled="cartUIStore.isActionLoading(item.id)"
                      @click="cartStore.removeItem(item.id)"
                    >
                      <UIcon v-if="cartUIStore.isActionLoading(item.id)" name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
                      <UIcon v-else name="i-heroicons-trash" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- Order Summary -->
        <section class="lg:col-span-5 mt-8 lg:mt-0 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">{{ $t('app.pages.cart.index.ordertotal') }}</h2>

          <div class="flow-root">
            <dl class="-my-4 text-sm divide-y divide-gray-200">
              <div class="py-4 flex items-center justify-between">
                <dt class="text-gray-600">Subtotal</dt>
                <dd class="font-medium text-gray-900">${{ cartStore.estimatedTotal.toFixed(2) }}</dd>
              </div>
              <div class="py-4 flex items-center justify-between">
                <dt class="text-gray-600">Shipping</dt>
                <dd class="font-medium text-gray-900">Calculated at checkout</dd>
              </div>
              <div class="py-4 flex items-center justify-between">
                <dt class="text-gray-600">Tax</dt>
                <dd class="font-medium text-gray-900">Calculated at checkout</dd>
              </div>
              <div class="py-4 flex items-center justify-between border-t border-gray-200">
                <dt class="text-base font-medium text-gray-900">Estimated total</dt>
                <dd class="text-xl font-bold text-gray-900">${{ cartStore.estimatedTotal.toFixed(2) }} USD</dd>
              </div>
            </dl>
          </div>
          
          <p class="mt-4 text-xs text-gray-500">
            Taxes, discounts and shipping calculated at checkout.
          </p>

          <div class="mt-6">
            <button
              type="button"
              class="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#ea580c] hover:bg-[#c2410c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea580c] transition-colors"
            >
              {{ $t('app.pages.cart.index.checkout') }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const cartUIStore = useCartUIStore()

onMounted(() => {
  if (!cartStore.initialized) {
    cartStore.loadCart()
  }
})
</script>
