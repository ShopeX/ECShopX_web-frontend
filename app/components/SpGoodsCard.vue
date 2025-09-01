<template>
  <div 
    class="bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    @click="navigateToDetail"
  >
    <!-- 商品图片 -->
    <div class="relative pt-[100%]">
      <img 
        :src="info.pics[0]" 
        :alt="info.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- 商品信息 -->
    <div class="p-3">
      <h3 class="text-sm leading-[1.4] h-10 mb-2 overflow-hidden text-ellipsis line-clamp-2">
        {{ info.title }}
      </h3>
      
      <div class="flex items-baseline gap-2 mb-2">
        <div class="text-primary">
          <span class="text-xs">¥</span>
          <span class="text-lg font-medium">{{ formatPrice(info.price) }}</span>
        </div>
        <div 
          v-if="info.market_price" 
          class="text-xs text-gray-400 line-through"
        >
          ¥{{ formatPrice(info.market_price) }}
        </div>
      </div>

      <div class="flex justify-between text-xs text-gray-500">
        <span>销量 {{ info.sales }}</span>
        <span 
          v-if="info.stock <= 10" 
          class="text-primary"
        >
          库存 {{ info.stock }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 格式化价格
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

// 跳转到详情页
const navigateToDetail = () => {
  router.push(`/item/${props.info.id}`)
}
</script> 