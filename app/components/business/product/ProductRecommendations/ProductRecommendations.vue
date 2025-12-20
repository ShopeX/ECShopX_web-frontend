<template>
  <div class="w-full flex flex-col">
    <!-- Tab 切换区域 -->
    <div class="bg-white flex justify-center pt-16 pb-8 px-32">
      <div class="flex gap-8 items-start justify-center">
        <button
          class="flex flex-col items-center justify-center border-b transition-colors"
          :class="activeTab === 'recommended' ? 'border-[#191a1d]' : 'border-transparent'"
          @click="activeTab = 'recommended'"
        >
          <h2
            class="text-2xl leading-[48px] whitespace-nowrap"
            :class="[
              activeTab === 'recommended' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565] font-normal'
            ]"
          >
            猜你喜欢
          </h2>
        </button>
        <button
          class="flex flex-col items-center justify-center border-b transition-colors"
          :class="activeTab === 'recent' ? 'border-[#191a1d]' : 'border-transparent'"
          @click="activeTab = 'recent'"
        >
          <h2
            class="text-2xl leading-[48px] whitespace-nowrap"
            :class="[
              activeTab === 'recent' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565] font-normal'
            ]"
          >
            最近浏览
          </h2>
        </button>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="bg-white flex items-start pb-16 w-full">
      <div
        v-for="(product, index) in displayProducts"
        :key="product.id || index"
        class="flex-1 flex flex-col items-start overflow-hidden"
      >
        <NuxtLink :to="`/products/${product.id}`" class="w-full">
          <!-- 商品图片 -->
          <div class="aspect-square w-full relative">
            <img
              :src="product.image"
              :alt="product.name"
              class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              loading="lazy"
            />
          </div>

          <!-- 商品信息 -->
          <div class="bg-[#f6f6f6] flex flex-col gap-3 items-center px-6 py-8 w-full text-center">
            <h2 class="text-sm font-medium leading-5 text-[#191a1d] w-full min-w-full">
              {{ product.name }}
            </h2>
            <div class="h-6 flex flex-col justify-center w-full">
              <p class="text-sm leading-[14px] text-[#191a1d]">
                ￥{{ formatPrice(product.price) }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductRecommendation } from './types'

interface Props {
  recommendedProducts?: ProductRecommendation[]
  recentProducts?: ProductRecommendation[]
}

const props = withDefaults(defineProps<Props>(), {
  recommendedProducts: () => [],
  recentProducts: () => []
})

const activeTab = ref<'recommended' | 'recent'>('recommended')

const displayProducts = computed(() => {
  const products = activeTab.value === 'recommended' 
    ? props.recommendedProducts 
    : props.recentProducts
  
  // 限制最多显示 5 个商品
  return products.slice(0, 5)
})

const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
/* 可以添加过渡动画等样式 */
</style>

