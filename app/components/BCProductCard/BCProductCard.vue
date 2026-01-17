<template>
  <div
    ref="cardRef"
    class="sp-product-card block group relative opacity-0 translate-y-4"
    :class="{ 'sp-product-card--visible': isVisible }"
  >
    <NuxtLink :to="`/products/${product.itemId}`" class="flex flex-col">
      <!-- 商品图片容器 - 正方形 1:1 -->
      <div class="sp-product-card__image relative overflow-hidden aspect-square w-full">
        <!-- 商品图片 -->
        <img
          :src="product.img || product.imgs?.[0] || '/images/placeholder-product.png'"
          :alt="product.itemName"
          class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          loading="lazy"
          @error="handleImageError"
        />
      </div>

      <!-- 商品信息区域 - 带灰色背景 -->
      <div
        class="sp-product-card__info bg-[#f6f6f6] flex flex-col gap-3 items-center px-6 py-8 w-full text-center leading-none"
      >
        <!-- 商品标题 -->
        <h2
          class="sp-product-card__title text-[#191a1d] text-sm font-medium leading-5 w-full min-w-full h-10"
        >
          {{ product.itemName }}
        </h2>

        <!-- 价格区域 -->
        <div class="sp-product-card__price w-full h-6 flex flex-col justify-center">
          <ECPrice
            :amount="getCurrentPrice()"
            class-name="text-[#191a1d]"
            amount-class="text-md leading-[14px]"
            symbol-class="text-xs"
          />
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import ECPrice from '../ECPrice/ECPrice.vue'
import type { IProduct } from './types'
import { useToastMessage } from '~/composables/useToastMessage'
import { useCart } from '~/composables/useCart'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  product: IProduct
}

const props = defineProps<Props>()

// 懒加载动画
const cardRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// 监听元素进入视口
onMounted(() => {
  if (cardRef.value) {
    useIntersectionObserver(
      cardRef,
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          isVisible.value = true
        }
      },
      {
        rootMargin: '50px', // 提前50px开始动画
        threshold: 0.1,
      }
    )
  }
})

// 购物车功能
const { addToCart, isItemLoading } = useCart()

// Toast 消息
const toast = useToastMessage()

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
      item_id: props.product.itemId,
      num: 1,
      cart_type: 'cart'
    })
  } catch (error: any) {
    toast.show(error.message || '添加失败，请重试')
  }
}
</script>

<style scoped>
/* 懒加载动画 */
.sp-product-card {
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
  will-change: opacity, transform;
}

.sp-product-card--visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* 组件特定样式 - 基于主题类扩展 */
.sp-product-card__title {
  /* 标题多行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

/* 响应式增强 - 移动端优化 */
@media (max-width: 768px) {
  .sp-product-card {
    /* 移动端优化动画性能 */
    transition:
      opacity 0.4s ease-out,
      transform 0.4s ease-out;
  }

  .sp-product-card:hover img {
    transform: none;
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
