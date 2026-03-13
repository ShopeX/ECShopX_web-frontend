<template>
  <div class="bg-white content-stretch flex flex-col items-start p-[32px] relative size-full">
    <!-- 顶部标题栏 -->
    <div class="relative shrink-0 w-full">
      <div
        class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between px-0 py-[16px] relative w-full"
      >
        <div class="relative shrink-0">
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative"
          >
            <p
              class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[20px] text-[#191a1d] text-nowrap"
            >
              优惠券
            </p>
          </div>
        </div>
        <!-- 关闭按钮 -->
        <button
          class="relative shrink-0 size-[24px] hover:opacity-70 transition-opacity"
          @click="handleClose"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-[#191a1d]" />
        </button>
      </div>
    </div>

    <!-- 优惠券列表容器 -->
    <div
      class="content-stretch flex flex-col gap-[32px] items-start overflow-auto pb-0 pt-[32px] px-0 relative shrink-0 w-full max-h-[calc(100vh-200px)]"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-10 w-full">
        <ECLoading />
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading && coupons.length === 0"
        class="flex flex-col items-center justify-center py-10 w-full"
      >
        <svg
          class="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
        <p class="text-base text-gray-600 mb-2">暂无可用优惠券</p>
        <p class="text-sm text-gray-400">快去领取优惠券吧</p>
      </div>

      <!-- 优惠券列表 -->
      <div v-else class="flex flex-col gap-4 w-full" data-testid="coupon-list">
        <BCCouponCard
          v-for="coupon in coupons"
          :key="coupon.id"
          data-testid="coupon-item"
          :coupon="coupon"
          :is-selected="selectedCoupon?.id === coupon.id"
          :loading="loading"
          @claim="handleClaim"
          @select="handleSelect"
          @unselect="handleUnselect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 优惠券选择组件
 *
 * 从右往左弹出的优惠券选择抽屉，用于选择和使用优惠券
 * 参照 MiniCart 的实现方式
 */

import { ECLoading } from '~/components/ECLoading'
import BCCouponCard from '~/components/BCCouponCard/BCCouponCard.vue'
import type { ICouponModel } from '~/infrastructure/transformers'

defineOptions({
  name: 'CouponSelector',
})

// Props
interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 优惠券列表 */
  coupons?: ICouponModel[]
  /** 已选中的优惠券 */
  selectedCoupon?: ICouponModel | null
  /** 加载状态 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  coupons: () => [],
  selectedCoupon: null,
  loading: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  claim: [coupon: ICouponModel]
  select: [coupon: ICouponModel]
  unselect: []
}>()

/**
 * 处理关闭
 */
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 处理领取优惠券
 */
function handleClaim(coupon: ICouponModel) {
  emit('claim', coupon)
}

/**
 * 处理选择优惠券
 */
function handleSelect(coupon: ICouponModel) {
  emit('select', coupon)
  // 选择后自动关闭抽屉
  handleClose()
}

/**
 * 处理取消选择
 */
function handleUnselect() {
  emit('unselect')
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
