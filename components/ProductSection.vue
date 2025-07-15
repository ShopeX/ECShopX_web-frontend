<template>
  <section class="w-full mt-8">
    <!-- 标题区域 -->
    <div class="flex items-center justify-between h-[60px]">
      <h2 class="text-2xl font-medium text-dark">{{ title }}</h2>
      <NuxtLink :to="moreLink" class="flex items-center text-sm text-secondary hover:text-primary">
        更多
        <img src="/icons/arrow-small.svg" alt="" class="w-1.5 h-[11px] ml-2" aria-hidden="true" />
      </NuxtLink>
    </div>

    <!-- 商品列表 -->
    <div class="grid grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @mounted="preloadImage(product.image)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

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
  title: string
  products: Product[]
  moreLink?: string
}>()

// 预加载图片
const preloadImage = (src: string) => {
  const img = new Image()
  img.src = src
}

// 组件挂载时预加载所有商品图片
onMounted(() => {
  props.products.forEach((product) => {
    preloadImage(product.image)
  })
})
</script>

<style scoped>
.product-section {
  @apply w-full;
}

.section-header {
  @apply h-[100px] flex items-center justify-between;
}

.title {
  @apply text-2xl font-normal text-black;
}

.more-link {
  @apply flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#b22420] transition-colors;
}

.arrow-icon {
  @apply w-[6px] h-[11px];
}

.product-grid {
  @apply grid gap-[16px];
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
}
</style>
