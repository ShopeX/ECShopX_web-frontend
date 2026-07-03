<template>
  <!-- 会员价：复用 BCProductPrice（与 collections / 详情页一致） -->
  <BCProductPrice
    v-if="hasMemberPriceLayout"
    :sale-price-cents="salePriceCents"
    :member-price-cents="memberPriceCents"
    :market-price-cents="0"
    size="sm"
    :layout="productPriceLayout"
  />

  <!-- 市场价折扣：购物袋 PC 行内样式 -->
  <p
    v-else-if="variant === 'mini-pc' && hasMarketDiscount"
    class="font-['Noto_Sans_SC'] text-sm font-normal leading-5"
  >
    <span class="text-[#4a5565]">{{ t('0ab56a3e.0e9fd9') }}:</span>
    <span class="font-['Inter'] text-[#4a5565]">{{ marketPriceDisplay }}</span>
    <br />
    <span class="text-[#d0112f]">{{ t('0ab56a3e.894991') }}:</span>
    <span class="font-['Inter'] text-[#d0112f]">{{ effectivePriceDisplay }}</span>
  </p>

  <!-- 单行单价 -->
  <p
    v-else
    class="font-['Noto_Sans_SC'] text-sm font-normal leading-5"
    :class="inlineClass"
  >
    <span v-if="unitLabel" :class="labelClass">{{ unitLabel }}</span>
    <span :class="priceClass">{{ effectivePriceDisplay }}</span>
  </p>
</template>

<script setup lang="ts">
import BCProductPrice from '~/components/BCProductPrice/BCProductPrice.vue'

interface Props {
  salePriceCents: number
  memberPriceCents: number
  marketPriceCents: number
  effectivePriceDisplay: string
  marketPriceDisplay: string
  hasMemberPriceLayout: boolean
  hasMarketDiscount: boolean
  /** mini-h5 | mini-pc | cart-page */
  variant?: 'mini-h5' | 'mini-pc' | 'cart-page'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'cart-page',
})

const { t } = useI18n()

const productPriceLayout = computed(() =>
  props.variant === 'mini-pc' ? 'stack' : 'inline'
)

const unitLabel = computed(() => {
  if (props.variant === 'mini-pc') {
    return ''
  }
  return `${t('9864a2ba.b388f8')} `
})

const inlineClass = computed(() => {
  if (props.variant === 'mini-h5') {
    return 'text-[#364153]'
  }
  return 'text-[#364153] text-[14px] leading-[20px]'
})

const labelClass = computed(() => {
  if (props.variant === 'cart-page') {
    return ''
  }
  return ''
})

const priceClass = computed(() => {
  if (props.variant === 'cart-page') {
    return "font-['Inter'] font-medium text-[16px] ml-1"
  }
  return "ml-1 font-['Inter'] text-base font-medium leading-5 text-[#364153]"
})
</script>
