<!-- ProductCard.vue -->
<template>
  <NuxtLink 
    :to="`/product/${product.id}`"
    class="product-card bg-white p-4 rounded-sm transition-all duration-300 hover:shadow-md block"
  >
    <!-- 商品图片 -->
    <div class="product-image relative aspect-[1/1] overflow-hidden mb-4">
      <img 
        :src="product.imageUrl" 
        :alt="product.title"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>

    <!-- 商品标题 -->
    <h3 class="text-[16px] font-medium text-[#333333] mb-2 line-clamp-1">
      {{ product.title }}
    </h3>

    <!-- 商品副标题 -->
    <p class="text-[14px] text-[#333333] mb-4 line-clamp-1">
      {{ product.subtitle }}
    </p>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- 会员价标签 -->
        <div 
          v-if="showMemberPrice && product.memberPrice" 
          class="px-3 py-1 bg-[#ffefe5] rounded-sm"
        >
          <span class="text-[12px] text-[#fc8b19]">会员价</span>
        </div>

        <!-- 价格区域 -->
        <div class="flex items-baseline gap-2">
          <span class="text-[18px] font-medium text-[#b22420]">¥{{ formatPrice(product.price) }}</span>
          <span 
            v-if="product.originalPrice && product.originalPrice !== product.price" 
            class="text-[14px] text-[#999999] line-through"
          >
            ¥{{ formatPrice(product.originalPrice) }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  product: {
    id: string
    title: string
    subtitle: string
    price: number
    originalPrice: number
    memberPrice?: number
    imageUrl: string
  }
  showMemberPrice?: boolean
}>()

// 格式化价格
const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
.product-card {
  width: 100%;
  height: 100%;
}

.product-image {
  background: #f5f5f5;
}

/* 确保图片加载时保持卡片布局 */
.product-image::before {
  content: "";
  display: block;
  padding-top: 100%;
}
</style>
