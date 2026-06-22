<template>
  <!-- H5 布局：勾选框在图片左侧 -->
  <div class="flex w-full items-start gap-4 bg-white lg:hidden">
    <button
      type="button"
      class="mt-0.5 flex size-3.5 shrink-0 items-center justify-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
      :class="
        item.selected ? 'border border-black bg-black' : 'border border-black bg-white'
      "
      :aria-pressed="item.selected"
      @click="$emit('toggle-selection', item.id)"
    >
      <svg
        v-if="item.selected"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div class="relative size-24 shrink-0 overflow-hidden bg-[#f9f9f9]">
      <img
        :src="item.productImage"
        :alt="item.productName"
        class="absolute inset-0 size-full object-cover"
      />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-4 self-stretch">
      <div class="flex flex-col gap-1">
        <p
          class="line-clamp-2 font-['Noto_Sans_SC'] text-base font-medium leading-6 text-[#191a1d]"
        >
          {{ item.productName }}
        </p>

        <p
          v-if="styleNoText"
          class="truncate font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#364153]"
        >
          {{ t('9864a2ba.fe930f') }} {{ styleNoText }}
        </p>

        <p
          v-for="(line, index) in specLines"
          :key="`${line.label}-${index}`"
          class="truncate font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#364153]"
        >
          {{ line.label }}:{{ line.value }}
        </p>

        <p class="font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#364153]">
          {{ t('9864a2ba.b388f8') }}
          <span class="ml-1 font-['Inter'] text-base font-medium leading-5 text-[#364153]">
            {{ item.priceDisplay }}
          </span>
        </p>

        <button
          v-if="showRemove"
          type="button"
          class="self-start font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#191a1d] hover:text-red-600"
          @click="showConfirm = true"
        >
          {{ t('9864a2ba.2f4aad') }}
        </button>
      </div>

      <div class="flex h-10 items-center self-start">
        <QuantityStepper
          :quantity="item.quantity"
          :min="item.quantityMin"
          :max="item.quantityMax"
          :loading="loading"
          @decrease="$emit('quantity-change', item.id, item.quantity - 1)"
          @increase="$emit('quantity-change', item.id, item.quantity + 1)"
        />
      </div>
    </div>
  </div>

  <!-- Web 布局：勾选框叠在商品图左上角，数量器在右侧 -->
  <div class="hidden w-full items-start gap-4 bg-white lg:flex">
    <div class="relative size-24 shrink-0 overflow-hidden bg-[#f3f4f7]">
      <img
        :src="item.productImage"
        :alt="item.productName"
        class="absolute inset-0 size-full object-cover"
      />
      <button
        type="button"
        class="absolute left-0 top-0 flex size-5 items-center justify-center p-0.5"
        :class="
          item.selected ? 'border border-black bg-black' : 'border border-black bg-white'
        "
        :aria-pressed="item.selected"
        @click="$emit('toggle-selection', item.id)"
      >
        <svg
          v-if="item.selected"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M13.3333 4L6 11.3333L2.66667 8"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <p class="font-['Noto_Sans_SC'] text-base font-medium leading-6 text-[#191a1d]">
        {{ item.productName }}
      </p>

      <p
        v-if="styleNoText"
        class="truncate font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#4a5565]"
      >
        {{ t('9864a2ba.fe930f') }}{{ styleNoText }}
      </p>

      <p
        v-for="(line, index) in specLines"
        :key="`web-${line.label}-${index}`"
        class="truncate font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#4a5565]"
      >
        {{ line.label }}:{{ line.value }}
      </p>

      <p class="font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#4a5565]">
        {{ t('ee3264ed.0bf60b') }}:{{ item.quantity }}
      </p>

      <p class="font-['Noto_Sans_SC'] text-sm font-normal leading-5">
        <span class="text-[#4a5565]">{{ t('0ab56a3e.0e9fd9') }}:</span>
        <span class="font-['Inter'] text-[#4a5565]">{{ originalPriceDisplay }}</span>
        <template v-if="item.hasDiscount">
          <br />
          <span class="text-[#d0112f]">{{ t('0ab56a3e.894991') }}:</span>
          <span class="font-['Inter'] text-[#d0112f]">{{ item.priceDisplay }}</span>
        </template>
      </p>
    </div>

    <div class="flex h-10 w-[120px] shrink-0 items-center justify-end">
      <QuantityStepper
        class="w-full"
        :quantity="item.quantity"
        :min="item.quantityMin"
        :max="item.quantityMax"
        :loading="loading"
        full-width
        @decrease="$emit('quantity-change', item.id, item.quantity - 1)"
        @increase="$emit('quantity-change', item.id, item.quantity + 1)"
      />
    </div>
  </div>

  <ECModal
    v-if="showRemove"
    v-model="showConfirm"
    :title="t('9864a2ba.2f4aad')"
    :content="t('9864a2ba.3e3483')"
    :confirm-text="t('9864a2ba.2f4aad')"
    @confirm="handleConfirmRemove"
  />
</template>

<script setup lang="ts">
import QuantityStepper from './QuantityStepper.vue'
import type { ICartUI } from '~/composables/useCart'

interface Props {
  item: ICartUI['items'][number]
  loading?: boolean
  showRemove?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'toggle-selection', itemId: string): void
  (e: 'quantity-change', itemId: string, quantity: number): void
  (e: 'remove', itemId: string): void
}>()

const { t } = useI18n()
const showConfirm = ref(false)

const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

const styleNoText = computed(() => {
  const bn = props.item.productBn?.trim()
  if (bn) return bn
  return props.item.productId || ''
})

const originalPriceDisplay = computed(() => {
  if (props.item.hasDiscount && props.item.marketPriceDisplay) {
    return props.item.marketPriceDisplay
  }
  return props.item.priceDisplay
})

const specLines = computed(() => {
  const specName = props.item.specName?.trim()
  if (!specName || generatedKeyPattern.test(specName)) {
    return []
  }

  try {
    const parsed = JSON.parse(specName)
    if (parsed && typeof parsed === 'object') {
      return Object.values(parsed)
        .map((spec: any) => ({
          label: String(spec?.spec_name || ''),
          value: String(spec?.spec_values?.[0]?.spec_value_name || ''),
        }))
        .filter((line) => line.label && line.value)
    }
  } catch {
    // 普通文本规格
  }

  return [{ label: t('9864a2ba.a74053').replace(':', ''), value: specName }]
})

function handleConfirmRemove() {
  showConfirm.value = false
  emit('remove', props.item.id)
}
</script>
