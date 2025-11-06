<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <h1 class="text-2xl font-bold text-gray-900 mb-6">购物车</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 购物车内容 -->
    <template v-else>
      <!-- 购物车列表 -->
      <CartList
        :items="cartUIData.items"
        :is-all-selected="cartUIData.isAllSelected"
        :loading="false"
        @toggle-all="handleToggleAll"
        @toggle-selection="handleToggleSelection"
        @quantity-change="handleQuantityChange"
        @remove="handleRemove"
        @favorite="handleFavorite"
      />

      <!-- 底部操作栏 (只在有商品时显示) -->
      <CartFooter
        v-if="!cartUIData.isEmpty"
        :is-all-selected="cartUIData.isAllSelected"
        :total-count="cartUIData.itemCount"
        :selected-count="cartUIData.selectedCount"
        :selected-total="cartUIData.selectedAmount"
        :has-selected-items="cartUIData.hasSelectedItems"
        :batch-removing="false"
        :checking="isCheckingOut"
        class="mt-6"
        @toggle-all="handleToggleAll"
        @batch-remove="handleBatchRemove"
        @batch-favorite="handleBatchFavorite"
        @checkout="handleCheckout"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 购物车页面（轻量级 DDD 架构）
 *
 * 使用轻量级 DDD 架构，通过 useCart 访问业务逻辑
 *
 * 提供完整的购物车功能：
 * - 商品列表展示
 * - 商品选择和数量管理
 * - 批量操作
 * - 结算功能
 */

import { useMessage } from '~/composables/useMessage'
import { useCart } from '~/composables/useCart'

// CartList 和 CartFooter 组件由 Nuxt 自动导入，无需手动 import

// 设置页面元信息
useHead({
  title: '购物车',
  meta: [
    {
      name: 'description',
      content: 'ECSHOPX 购物车 - 管理您的商品，随时结算',
    },
  ],
})

// 购物车页面禁用 SSR - 用户私密数据，不需要 SEO
definePageMeta({
  ssr: false,
})

// Toast 消息
const message = useMessage()

// 结算加载状态
const isCheckingOut = ref(false)

// 购物车业务功能
const {
  cartUI: cartUIData,
  loading,
  error,
  loadCart,
  updateQuantity,
  removeItem,
  removeSelectedItems,
  toggleItemSelection,
  toggleAllSelection,
  validateCheckout,
} = useCart()

/**
 * 页面初始化
 */
onMounted(async () => {
  await loadCart()

  // 显示加载错误
  if (error.value) {
    message.error(error.value)
  }
})

/**
 * 处理全选/取消全选
 */
async function handleToggleAll() {
  await toggleAllSelection()
}

/**
 * 处理商品选中状态切换
 */
async function handleToggleSelection(itemId: string) {
  await toggleItemSelection(itemId)
}

/**
 * 处理商品数量变化
 */
async function handleQuantityChange(itemId: string, quantity: number) {
  await updateQuantity(itemId, quantity)
}

/**
 * 处理删除单个商品
 */
async function handleRemove(itemId: string) {
  // 确认删除
  const confirmed = confirm('确定要删除该商品吗？')
  if (!confirmed) return

  await removeItem(itemId)
}

/**
 * 处理批量删除
 */
async function handleBatchRemove() {
  if (!cartUIData.value.hasSelectedItems) {
    message.warning('请先选择要删除的商品')
    return
  }

  // 确认删除
  const confirmed = confirm(`确定要删除选中的 ${cartUIData.value.selectedCount} 件商品吗？`)
  if (!confirmed) return

  await removeSelectedItems()
}

/**
 * 处理收藏单个商品
 */
function handleFavorite(itemId: string) {
  // TODO: 实现收藏功能
  message.info('收藏功能开发中...')
}

/**
 * 处理批量收藏
 */
function handleBatchFavorite() {
  if (!cartUIData.value.hasSelectedItems) {
    message.warning('请先选择要收藏的商品')
    return
  }

  // TODO: 实现批量收藏功能
  message.info('批量收藏功能开发中...')
}

/**
 * 处理结算
 */
async function handleCheckout() {
  if (!cartUIData.value.hasSelectedItems) {
    message.warning('请先选择要结算的商品')
    return
  }

  isCheckingOut.value = true

  try {
    // 1. 验证商品库存和状态
    const validation = await validateCheckout()

    if (!validation.valid) {
      // 显示验证错误
      validation.errors.forEach((err) => message.error(err))
      return
    }

    // 2. TODO: 创建订单并跳转到支付页面
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.info('结算功能开发中，即将跳转到订单页面...')

    // 跳转到订单页面
    // navigateTo('/order/checkout')
  } catch (error: any) {
    message.error(error.message || '结算失败，请重试')
  } finally {
    isCheckingOut.value = false
  }
}
</script>
