<template>
  <div class="border border-[#e5e7eb] px-[17px] py-[33px] hover:shadow-sm transition-shadow">
    <div class="flex items-center justify-between">
      <!-- 左侧 - 金额 -->
      <div class="flex items-center gap-1">
        <span class="text-base font-medium text-[#191a1d] leading-5">¥</span>
        <span class="text-[36px] font-medium text-[#191a1d] leading-9">{{ amount }}</span>
      </div>

      <!-- 右侧 - 描述 -->
      <div class="flex flex-col gap-2 items-end">
        <p class="text-sm font-medium text-[#4a5565] leading-5">{{ title }}</p>
        <p class="text-xs font-normal text-[#4a5565] leading-4">{{ description }}</p>
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
}

defineOptions({
  name: 'CouponCard',
})

defineProps<Props>()
</script>

<style scoped>
/* Noto Sans SC 和 Inter 字体已在全局引入 */
</style>

