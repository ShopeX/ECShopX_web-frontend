<template>
  <div
    class="flex items-center gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
  >
    <!-- 勾选框 -->
    <div class="flex-shrink-0">
      <input
        type="checkbox"
        :checked="item.selected"
        :disabled="!item.canBePurchased || loading"
        class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @change="handleToggleSelection"
      />
    </div>

    <!-- 商品图片 -->
    <div class="flex-shrink-0">
      <img
        :src="item.productImage"
        :alt="item.productName"
        class="w-20 h-20 object-cover rounded border border-gray-200"
      />
    </div>

    <!-- 商品信息 -->
    <div class="flex-1 min-w-0">
      <h4 class="text-base font-medium text-gray-900 truncate">
        {{ item.productName }}
      </h4>
      <p v-if="item.specName" class="text-sm text-gray-500 mt-1">规格: {{ item.specName }}</p>
      <!-- 不可购买提示 -->
      <p v-if="!item.canBePurchased" class="text-sm text-red-600 mt-1">该商品已下架或库存不足</p>
    </div>

    <!-- 单价 -->
    <div class="flex-shrink-0 w-24 text-center">
      <div class="text-gray-900 font-medium">{{ item.priceDisplay }}</div>
      <div v-if="item.hasDiscount" class="text-sm text-gray-400 line-through">
        {{ item.marketPriceDisplay }}
      </div>
    </div>

    <!-- 数量调整器 -->
    <div class="flex-shrink-0 w-32">
      <QuantityInput
        :model-value="item.quantity"
        :min="item.quantityMin"
        :max="item.quantityMax"
        :disabled="!item.canBePurchased"
        :loading="isUpdating"
        @change="handleQuantityChange"
      />
    </div>

    <!-- 小计 -->
    <div class="flex-shrink-0 w-24 text-center">
      <div class="text-lg font-semibold text-red-600">{{ item.subtotalDisplay }}</div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex-shrink-0 flex flex-col gap-2">
      <button
        type="button"
        :disabled="isRemoving"
        class="text-sm text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handleRemove"
      >
        {{ isRemoving ? '删除中...' : '删除' }}
      </button>
      <button
        type="button"
        class="text-sm text-gray-600 hover:text-primary transition-colors"
        @click="handleFavorite"
      >
        收藏
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 购物车商品项组件
 *
 * 显示单个购物车商品的完整信息和操作
 */

import type { ICartUI } from '~/composables/useCart'
import { useCart } from '~/composables/useCart'

// QuantityInput 组件由 Nuxt 自动导入，无需手动 import

interface Props {
  /** 购物车商品项 */
  item: ICartUI['items'][number]
  /** 是否正在更新 */
  loading?: boolean
}

interface Emits {
  /** 选中状态变化 */
  (e: 'toggle-selection', itemId: string): void
  /** 数量变化 */
  (e: 'quantity-change', itemId: string, quantity: number): void
  /** 删除商品 */
  (e: 'remove', itemId: string): void
  /** 收藏商品 */
  (e: 'favorite', itemId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// 购物车操作
const { isItemLoading } = useCart()

/**
 * 是否正在更新数量
 */
const isUpdating = computed(() => {
  return props.loading || isItemLoading(props.item.id, 'update')
})

/**
 * 是否正在删除
 */
const isRemoving = computed(() => {
  return props.loading || isItemLoading(props.item.id, 'remove')
})

/**
 * 切换选中状态
 */
function handleToggleSelection() {
  if (!props.item.canBePurchased) return
  emit('toggle-selection', props.item.id)
}

/**
 * 数量变化
 *
 * @param quantity - 新数量
 */
function handleQuantityChange(quantity: number) {
  emit('quantity-change', props.item.id, quantity)
}

/**
 * 删除商品
 */
function handleRemove() {
  emit('remove', props.item.id)
}

/**
 * 收藏商品
 */
function handleFavorite() {
  emit('favorite', props.item.id)
}
</script>
