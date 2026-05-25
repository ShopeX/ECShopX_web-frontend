<template>
  <div class="bg-white content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
    <!-- 商品图片 -->
    <div class="bg-[#f9fafb] relative shrink-0 size-[96px]">
      <img
        :src="item.productImage"
        :alt="item.productName"
        class="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
      />
      <!-- 选中状态标记 -->
      <div
        v-if="item.selected"
        class="absolute bg-black content-stretch flex flex-col items-start left-0 pb-0 pt-[2px] px-[2px] size-[20px] top-0 cursor-pointer"
        @click="$emit('toggle-selection', item.id)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.3332 4L5.99984 11.3333L2.6665 8"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div
        v-else
        class="absolute bg-white border border-[#191a1d] border-solid content-stretch flex flex-col items-start left-0 pb-0 pt-[2px] px-[2px] size-[20px] top-0 cursor-pointer"
        @click="$emit('toggle-selection', item.id)"
      />
    </div>

    <!-- 商品信息 -->
    <div
      class="basis-0 content-stretch flex flex-col gap-[4px] grow items-start min-h-px min-w-px relative shrink-0"
    >
      <!-- 商品名称 -->
      <div class="relative shrink-0 w-full overflow-hidden">
        <p
          class="font-['Noto_Sans_SC'] font-medium leading-[20px] text-[16px] text-[#191a1d] line-clamp-2"
        >
          {{ item.productName }}
        </p>
      </div>

      <!-- 款号 -->
      <div v-if="item.productId" class="h-[24px] relative shrink-0 w-full overflow-hidden">
        <p
          class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] truncate"
        >
          {{ t('0ab56a3e.e54891') }}:{{ item.productId }}
        </p>
      </div>

      <!-- 款式 -->
      <div v-if="item.specName" class="h-[24px] relative shrink-0 w-full overflow-hidden">
        <p
          class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] truncate"
        >
          {{ t('0ab56a3e.568510') }}:{{ item.specName }}
        </p>
      </div>

      <!-- 尺寸 -->
      <div class="h-[24px] relative shrink-0 w-full overflow-hidden">
        <p
          class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] truncate"
        >
          {{ t('0ab56a3e.c8339f') }}:{{ t('0ab56a3e.85533e') }}
        </p>
      </div>

      <!-- 价格 -->
      <div class="relative shrink-0 w-full overflow-hidden">
        <div class="content-stretch flex flex-col items-start relative">
          <p
            class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] mb-0 truncate"
          >
            {{ t('0ab56a3e.0e9fd9') }}: {{ item.priceDisplay }}
          </p>
          <p
            v-if="item.hasDiscount"
            class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#d0112f] truncate"
          >
            {{ t('0ab56a3e.894991') }}:{{ item.subtotalDisplay }}
          </p>
        </div>
      </div>
    </div>

    <!-- 数量调整器 -->
    <div
      class="bg-white border border-[#e5e7eb] border-solid content-stretch flex h-[40px] items-center justify-end p-px relative shrink-0 w-[120px]"
    >
      <!-- 减号按钮 -->
      <button
        class="basis-0 grow h-[38px] min-h-px min-w-px relative shrink-0 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center"
        :disabled="item.quantity <= item.quantityMin || loading"
        @click="$emit('quantity-change', item.id, item.quantity - 1)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.33331 8H12.6666"
            stroke="#191A1D"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- 数量显示 -->
      <div class="h-[38px] relative shrink-0 w-[40px] flex items-center justify-center">
        <p
          class="font-['Inter'] font-medium leading-[20px] not-italic text-[#101828] text-[14px] tracking-[-0.1504px]"
        >
          {{ item.quantity }}
        </p>
      </div>

      <!-- 加号按钮 -->
      <button
        class="basis-0 grow h-[38px] min-h-px min-w-px relative shrink-0 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center"
        :disabled="item.quantity >= item.quantityMax || loading"
        @click="$emit('quantity-change', item.id, item.quantity + 1)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 3.33331V12.6666M3.33331 8H12.6666"
            stroke="#191A1D"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICartUI } from '~/composables/useCart'

interface Props {
  item: ICartUI['items'][number]
  loading?: boolean
}

const { t } = useI18n()

defineProps<Props>()

defineEmits<{
  (e: 'toggle-selection', itemId: string): void
  (e: 'quantity-change', itemId: string, quantity: number): void
}>()
</script>
