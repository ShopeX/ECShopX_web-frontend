<template>
  <div data-testid="order-detail-info" class="flex flex-col gap-[16px] items-start w-full">
    <p class="text-[16px] font-medium leading-5 text-[#191a1d]">{{ t('1cc0f760.8eab5c') }}</p>
    <div class="flex flex-col gap-[8px] w-full">
      <!-- 订单编号 -->
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] shrink-0">{{
          t('de8076e6.1e8dc2')
        }}</span>
        <div class="flex items-center gap-[8px]">
          <span
            data-testid="order-id"
            class="text-[14px] font-medium leading-5 text-[#191a1d] break-all text-right"
          >
            {{ orderId }}
          </span>
          <button
            type="button"
            v-copy="orderId"
            class="shrink-0 text-[#6b7280] hover:text-[#191a1d] transition-colors"
            :title="t('1cc0f760.a2da82')"
          >
            <UIcon name="i-heroicons-document-duplicate" class="w-4 h-4" />
          </button>
        </div>
      </div>
      <!-- 下单时间 -->
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] whitespace-nowrap">{{
          t('de8076e6.2240cc')
        }}</span>
        <span
          data-testid="order-create-time"
          class="text-[14px] font-medium leading-5 text-[#191a1d]"
        >
          {{ createTime }}
        </span>
      </div>
      <!-- 金额明细 -->
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] whitespace-nowrap">{{
          t('1cc0f760.a03deb')
        }}</span>
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">¥ {{ itemFee }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] whitespace-nowrap">{{
          t('ee3264ed.9a935b')
        }}</span>
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">¥ {{ freightFee }}</span>
      </div>
      <div v-if="hasDiscount" class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] whitespace-nowrap">{{
          t('ee3264ed.f06ebf')
        }}</span>
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">¥ {{ discountFee }}</span>
      </div>
      <div v-if="hasPointFee" class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] whitespace-nowrap">{{
          t('ee3264ed.d443a9')
        }}</span>
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">¥ {{ pointFee }}</span>
      </div>
      <!-- 实付金额 -->
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#4a5565] whitespace-nowrap">{{
          t('1cc0f760.94a7de')
        }}</span>
        <span data-testid="total-fee" class="text-[16px] font-medium leading-5 text-[#191a1d]"
          >¥ {{ totalFee }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { t } = useI18n()

interface Props {
  orderId: string
  createTime: string
  itemFee: string
  freightFee: string
  discountFee: string
  pointFee: string
  totalFee: string
}

const props = defineProps<Props>()

const hasDiscount = computed(() => parseFloat(props.discountFee.replace(',', '')) > 0)
const hasPointFee = computed(() => parseFloat(props.pointFee.replace(',', '')) > 0)

</script>
