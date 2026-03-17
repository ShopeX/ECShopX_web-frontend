<template>
  <div
    class="border border-[#e5e7eb] rounded overflow-hidden hover:shadow-sm transition-shadow bg-white flex"
    data-testid="coupon-card"
  >
    <!-- 左侧区域：与 Figma 3375:4423 一致，px-8 py-6、gap-1，¥16px+金额36px、门槛12px #99a1af -->
    <div
      class="bg-[#f3f4f6] shrink-0 flex flex-col items-center justify-center gap-1 px-8 py-6 min-w-[120px]"
    >
      <div class="flex items-baseline justify-center gap-1">
        <span class="text-base font-medium text-[#191a1d] leading-5 font-['Inter']">¥</span>
        <span class="text-[36px] font-medium leading-[36px] text-[#191a1d] font-['Inter']">{{
          amount
        }}</span>
      </div>
      <div v-if="thresholdText" class="text-xs text-[#99a1af] leading-4">{{ thresholdText }}</div>
    </div>

    <!-- 右侧区域：与 Figma 3375:4430 一致，px-4、gap-2，标题14px Medium、描述12px、有效期12px #99a1af -->
    <div class="flex-1 flex flex-col justify-center gap-2 py-3 px-4">
      <p class="text-sm font-medium text-[#4a5565] leading-5">{{ title }}</p>
      <p class="text-xs font-normal text-[#4a5565] leading-4">{{ description }}</p>
      <div v-if="expireText" class="flex items-center gap-1">
        <Icon name="ph:clock" class="w-3 h-3 text-[#99a1af] shrink-0" />
        <span class="text-xs text-[#99a1af] leading-4">{{ expireText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 优惠券金额 */
  amount: number
  /** 标题（如：满500减100） */
  title: string
  /** 描述（如：全场无门槛使用） */
  description: string
  /** 使用门槛（如：满500可用） */
  thresholdText?: string
  /** 有效期文本（如：有效期至 2026-06-30） */
  expireText?: string
}

defineOptions({
  name: 'CouponCard',
})

defineProps<Props>()
</script>

<style scoped>
/* Noto Sans SC 和 Inter 字体已在全局引入 */
</style>
