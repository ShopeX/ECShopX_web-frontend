<template>
  <div
    class="w-[285px] bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <NuxtLink :to="`/product/${product.id}`" class="block">
      <!-- 商品图片 -->
      <div class="relative w-full h-[252px] overflow-hidden p-4">
        <!-- 加载占位符 -->
        <div 
          v-show="isLoading" 
          class="absolute inset-0 bg-gray-100 animate-pulse"
        ></div>
        <!-- 错误占位符 -->
        <div 
          v-if="hasError" 
          class="absolute inset-0 bg-gray-50 flex items-center justify-center"
        >
          <span class="text-gray-400">图片加载失败</span>
        </div>
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          loading="lazy"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- 商品信息 -->
      <div class="px-6 pt-4 pb-6">
        <h3 class="text-base font-medium text-dark text-center line-clamp-2">{{ product.name }}</h3>
        <p class="mt-2 text-sm text-secondary text-center line-clamp-2">
          {{ product.description }}
        </p>

        <!-- 价格区域 -->
        <div class="mt-4 flex items-center justify-center space-x-4">
          <span class="text-lg font-medium text-primary">¥{{ formatPrice(product.price) }}</span>
          <span v-if="product.originalPrice" class="text-sm text-light line-through">
            ¥{{ formatPrice(product.originalPrice) }}
          </span>
        </div>

        <!-- 标签 -->
        <div class="mt-4 flex items-center justify-center space-x-2">
          <span
            v-for="(tag, index) in product.tags"
            :key="index"
            class="px-2 py-1 text-xs text-primary border border-primary rounded-sm"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags?: string[]
}

const props = defineProps<{
  product: Product
}>()

const isLoading = ref(true)
const hasError = ref(false)

const handleImageLoad = () => {
  isLoading.value = false
}

const handleImageError = () => {
  isLoading.value = false
  hasError.value = true
}

// 格式化价格，添加千位分隔符
const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
.product-card {
  @apply bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
