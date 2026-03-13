<template>
  <div class="flex flex-col overflow-hidden">
    <!-- 商品图片 -->
    <div class="aspect-square w-full relative">
      <img
        :src="product.image"
        :alt="product.name"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- 商品信息 -->
    <div class="bg-[#f6f6f6] flex flex-col gap-3 items-center px-6 py-8">
      <!-- 商品名称 -->
      <h2 class="text-sm font-medium text-[#191a1d] text-center leading-5 w-full">
        {{ product.name }}
      </h2>

      <!-- 价格 -->
      <p class="text-sm text-[#191a1d] text-center h-6 flex items-center justify-center">
        ￥{{ formatPrice(product.price) }}
      </p>

      <!-- 移出收藏按钮 -->
      <button
        class="border border-[#0f0f10] px-8 py-2 hover:bg-[#0f0f10] hover:text-white transition-colors"
        @click="handleRemove"
      >
        <span class="text-xs font-medium text-[#0f0f10] hover:text-white leading-4">
          移出收藏
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string | number
  name: string
  price: number
  image: string
}

interface Props {
  product: Product
}

defineOptions({
  name: 'FavoriteProductCard',
})

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [productId: string | number]
}>()

/**
 * 格式化价格
 */
function formatPrice(price: number): string {
  return price.toFixed(2)
}

/**
 * 处理移出收藏
 */
function handleRemove() {
  emit('remove', props.product.id)
}
</script>

<style scoped>
button:hover span {
  color: white;
}
</style>
