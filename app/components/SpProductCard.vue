<!-- SpProductCard.vue -->
<template>
  <NuxtLink 
    :to="`/product/${product.id}`"
    class="group block bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
  >
    <!-- 商品图片容器 -->
    <div class="relative aspect-square overflow-hidden">
      <!-- 商品图片 -->
      <img 
        :src="product.pics[0]" 
        :alt="product.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      <!-- 会员价标签 -->
      <div 
        v-if="showMemberPrice && product.member_price" 
        class="absolute top-2 left-2 px-2 py-1 bg-[#b22420] rounded text-white text-xs font-medium"
      >
        会员价
      </div>

      <!-- 商品标签 -->
      <div 
        class="absolute bottom-2 left-2 flex flex-wrap gap-1"
      >
        <span 
          v-if="product.is_new"
          class="px-2 py-0.5 text-xs bg-white/80 text-[#b22420] rounded backdrop-blur-sm"
        >
          新品
        </span>
        <span 
          v-if="product.stock <= 10"
          class="px-2 py-0.5 text-xs bg-white/80 text-[#b22420] rounded backdrop-blur-sm"
        >
          库存紧张
        </span>
        <span 
          v-if="product.sales >= 100"
          class="px-2 py-0.5 text-xs bg-white/80 text-[#b22420] rounded backdrop-blur-sm"
        >
          热销
        </span>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="p-3 space-y-2">
      <!-- 商品标题 -->
      <h3 class="text-base font-medium text-gray-900 line-clamp-2">
        {{ product.title }}
      </h3>

      <!-- 商品副标题 -->
      <p 
        v-if="product.sub_title" 
        class="text-sm text-gray-500 line-clamp-1"
      >
        {{ product.sub_title }}
      </p>

      <!-- 价格区域 -->
      <div class="flex items-baseline gap-2">
        <span class="text-lg font-medium text-[#b22420]">
          <small class="text-sm">¥</small>
          {{ formatPrice(product.price) }}
        </span>
        <span 
          v-if="showOriginalPrice" 
          class="text-sm text-gray-400 line-through"
        >
          ¥{{ formatPrice(product.market_price) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IItem } from '~/types/api/item'

interface Props {
  product: IItem
  showMemberPrice?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMemberPrice: true
})

// 是否显示原价
const showOriginalPrice = computed(() => {
  return props.product.market_price && props.product.market_price !== props.product.price
})

// 格式化价格
const formatPrice = (price: number) => {
  return (price / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script> 