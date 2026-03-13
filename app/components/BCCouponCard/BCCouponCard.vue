<template>
  <div
    class="border border-[#e5e7eb] border-solid content-stretch flex flex-col items-start p-px relative shrink-0 w-full"
  >
    <!-- 优惠券内容区域 -->
    <div class="relative shrink-0 w-full">
      <div
        class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between px-[16px] py-[32px] relative w-full"
      >
        <!-- 左侧：金额 -->
        <div class="relative shrink-0">
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex font-['Inter'] font-medium gap-[4px] items-center justify-center not-italic relative text-[#191a1d] text-nowrap"
          >
            <p class="leading-[20px] relative shrink-0 text-[16px]">¥</p>
            <p class="leading-[36px] relative shrink-0 text-[36px]">
              {{ discountDisplay }}
            </p>
          </div>
        </div>

        <!-- 右侧：满减条件和说明 -->
        <div class="relative shrink-0">
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col gap-[8px] items-start justify-center relative"
          >
            <!-- 满减条件 -->
            <div class="content-stretch flex items-center justify-end relative shrink-0 w-full">
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-[#4a5565] text-nowrap"
              >
                {{ conditionText }}
              </p>
            </div>
            <!-- 使用说明 -->
            <div class="content-stretch flex items-center justify-end relative shrink-0 w-full">
              <p
                class="font-['Noto_Sans_SC'] font-normal leading-[16px] relative shrink-0 text-[12px] text-[#4a5565] text-nowrap"
              >
                {{ description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：领取/使用按钮 -->
    <div class="relative shrink-0 w-full">
      <div
        class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col items-start relative w-full"
      >
        <button
          v-if="!isSelected"
          class="bg-[#0f0f10] relative shrink-0 w-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="handleClaim"
        >
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
          >
            <p
              class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-white"
            >
              领取优惠券
            </p>
          </div>
        </button>
        <button
          v-else
          class="bg-gray-100 relative shrink-0 w-full hover:bg-gray-200 transition-colors"
          @click="handleUnselect"
        >
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
          >
            <p
              class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-[#191a1d]"
            >
              已选择
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICouponModel } from '~/infrastructure/transformers'
import { MoneyValueObject } from '~/shared/value-objects'

defineOptions({
  name: 'CouponCard',
})

interface Props {
  /** 优惠券数据 */
  coupon: ICouponModel
  /** 是否已选中 */
  isSelected?: boolean
  /** 加载状态 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'claim', coupon: ICouponModel): void
  (e: 'select', coupon: ICouponModel): void
  (e: 'unselect'): void
}>()

/**
 * 优惠金额显示
 */
const discountDisplay = computed(() => {
  return Math.round(props.coupon.discount).toString()
})

/**
 * 满减条件文本
 */
const conditionText = computed(() => {
  if (props.coupon.minFee > 0) {
    return `满${Math.round(props.coupon.minFee)}减${Math.round(props.coupon.discount)}`
  }
  return `减${Math.round(props.coupon.discount)}`
})

/**
 * 使用说明
 */
const description = computed(() => {
  // 如果有标题，优先使用标题
  if (props.coupon.title) {
    return props.coupon.title
  }
  // 否则使用默认说明
  return '全场无门槛使用'
})

/**
 * 处理领取优惠券
 */
function handleClaim() {
  if (props.loading) return
  emit('claim', props.coupon)
  emit('select', props.coupon)
}

/**
 * 处理取消选择
 */
function handleUnselect() {
  emit('unselect')
}
</script>
