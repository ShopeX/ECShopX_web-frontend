<template>
  <div
    class="sp-product-card sp-hover-lift sp-card--hover block group relative"
    style="height: 400px; width: 194px"
  >
    <NuxtLink :to="`/item/${product.itemId}`" class="block">
      <!-- 商品图片容器 -->
      <div
        class="sp-product-card__image relative overflow-hidden rounded-2xl"
        style="height: 299px"
      >
        <!-- 商品图片 -->
        <img
          :src="product.img || product.imgs?.[0] || '/images/placeholder-product.png'"
          :alt="product.itemName"
          class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
          @error="handleImageError"
        />

        <!-- 加入购物车按钮 (悬浮在图片上) -->
        <!-- <button
          type="button"
          :disabled="isAdding"
          class="absolute bottom-2 right-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          @click.prevent="handleAddToCart"
        >
          {{ isAdding ? '添加中...' : '加入购物车' }}
        </button> -->
      </div>

      <!-- 商品信息区域 -->
      <div class="sp-product-card__info px-1 pt-3 space-y-1" style="height: 101px">
        <!-- 商品标题 -->
        <h3 class="sp-product-card__title group-hover:text-red-600 transition-colors duration-200">
          {{ product.itemName }}
        </h3>

        <!-- 价格区域 -->
        <div class="sp-product-card__price pt-2">
          <span class="sp-price--medium group-hover:text-red-700 transition-colors duration-200">
            ${{ formatPrice(getCurrentPrice()) }} USD
          </span>
          <span v-if="showOriginalPrice" class="sp-price--original text-xs ml-2">
            ${{ formatPrice(product.price) }}
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { IProduct } from './types'
import { useMessage } from '~/composables/useMessage'
import { useCart } from '~/composables/useCart'

interface Props {
  product: IProduct
}

const props = defineProps<Props>()

// 购物车功能
const { addToCart, isItemLoading } = useCart()

// Toast 消息
const message = useMessage()

// 获取当前有效价格（优先级：活动价 > 会员价 > 原价）
const getCurrentPrice = (): number => {
  if (props.product.activityPrice && props.product.activityPrice > 0) {
    return props.product.activityPrice
  }

  if (props.product.memberPrice && props.product.memberPrice > 0) {
    return props.product.memberPrice
  }

  return props.product.price || 0
}

// 是否显示原价（当有优惠时）
const showOriginalPrice = computed(() => {
  const currentPrice = getCurrentPrice()
  return currentPrice < props.product.price && props.product.price > 0
})

// 格式化价格
const formatPrice = (price: number): string => {
  if (!price || price <= 0) return '0.00'

  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/placeholder-product.png'
}

/**
 * 处理加入购物车
 */
async function handleAddToCart(event: Event) {
  // 阻止链接跳转
  event.preventDefault()
  event.stopPropagation()

  try {
    // 添加到购物车
    await addToCart({
      productId: props.product.itemId,
      specId: props.product.specId || 'default',
      quantity: 1,
      productName: props.product.itemName,
      productImage: props.product.img || props.product.imgs?.[0],
      specName: props.product.specName || '默认规格',
      price: getCurrentPrice(),
      marketPrice: props.product.price,
      stock: props.product.stock || 999,
    })
  } catch (error: any) {
    message.error(error.message || '添加失败，请重试')
  }
}
</script>

<style scoped>
/* 组件特定样式 - 基于主题类扩展 */
.sp-product-card {
  /* 固定卡片尺寸匹配Figma设计 */
  width: 194px;
  height: 400px;
  max-width: none;
  flex-shrink: 0;

  /* 增强hover效果 */
}

.sp-product-card:hover {
  /* 3D 卡片效果 */
  /* box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(239, 68, 68, 0.1); */
}

.sp-product-card__image {
  /* 图片容器固定尺寸 */
  height: 299px;
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
}

.sp-product-card__title {
  /* 标题文本样式 - 匹配Figma设计 */
  word-break: break-word;
  hyphens: auto;
  font-size: 1rem;
  font-weight: 400;
  color: #111827;
  line-height: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3rem;
}

.sp-product-card__price {
  /* 价格样式 - 增强显示效果 */
  font-weight: 600;
}

.sp-product-card__info {
  /* 信息区域固定高度 */
  height: 101px;
  position: relative;
}

.sp-product-card__info::after {
  /* 信息区域底部光晕效果 */
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sp-product-card:hover .sp-product-card__info::after {
  opacity: 1;
}

/* 响应式增强 */
@media (max-width: 768px) {
  .sp-product-card {
    /* 移动端禁用复杂hover效果以提升性能 */
    transition: none;
  }

  .sp-product-card:hover {
    transform: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
}

/* 加载状态样式 */
.sp-product-card[data-loading='true'] {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sp-product-card[data-loading='true'] .sp-product-card__image {
  background-color: #e5e7eb;
}

.sp-product-card[data-loading='true'] .sp-product-card__title,
.sp-product-card[data-loading='true'] .sp-product-card__price {
  background-color: #e5e7eb;
  color: transparent;
  border-radius: 0.25rem;
}
</style>
