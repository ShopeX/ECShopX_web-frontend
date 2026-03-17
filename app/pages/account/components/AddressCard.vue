<template>
  <div
    class="w-full border border-solid p-[17px] flex flex-col gap-[16px] border-[#e5e7eb]"
    :class="[isDefault && layout === 'h5' ? 'border-[#191a1d]!' : '']"
    data-testid="address-card"
  >
    <!-- 默认标签 + 头部：姓名和编辑（Figma: 14px Medium #191a1d, 编辑 12px Regular #4a5565 underline）-->
    <div class="flex items-center justify-between gap-2 min-h-5">
      <div class="flex items-center gap-2 flex-wrap min-w-0">
        <span
          v-if="isDefault"
          class="text-xs font-medium leading-4 px-2 py-0.5 rounded bg-[#f3f4f6] text-[#191a1d] shrink-0"
        >
          默认
        </span>
        <p class="font-['Noto_Sans_SC',sans-serif] font-medium text-[14px] leading-5 text-[#191a1d]">
          {{ address.name }}{{ address.gender ? ` ${address.gender}` : '' }}
        </p>
      </div>
      <button
        type="button"
        class="font-['Noto_Sans_SC',sans-serif] font-normal text-[12px] leading-4 text-[#4a5565] underline hover:text-[#191a1d] transition-colors shrink-0"
        data-testid="address-edit-btn"
        @click="handleEdit"
      >
        编辑
      </button>
    </div>

    <!-- 地址信息（Figma: 14px Regular #4a5565, gap-4）-->
    <div class="flex flex-col gap-[4px]">
      <p class="font-['Noto_Sans_SC',sans-serif] font-normal text-[14px] leading-5 text-[#4a5565]">
        {{ address.phone }}
      </p>
      <p class="font-['Noto_Sans_SC',sans-serif] font-normal text-[14px] leading-5 text-[#4a5565]">
        {{ address.fullAddress }}
      </p>
    </div>

    <!-- 删除、设为默认（H5 显示，PC 可选保留）-->
    <div
      v-if="layout === 'h5'"
      class="flex items-center gap-4 pt-1 border-t border-[#e5e7eb]"
    >
      <button
        type="button"
        class="text-xs text-[#4a5565] leading-4 hover:text-[#191a1d] transition-colors"
        @click="handleDelete"
      >
        删除
      </button>
      <button
        v-if="!isDefault"
        type="button"
        class="text-xs text-[#4a5565] leading-4 hover:text-[#191a1d] transition-colors"
        @click="handleSetDefault"
      >
        设为默认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Address {
  id: string | number
  name: string
  gender?: string
  phone: string
  fullAddress: string
}

interface Props {
  address: Address
  isDefault?: boolean
  /** pc: 两列卡片样式（与 Figma PC 一致）；h5: 单列含删除/设为默认 */
  layout?: 'pc' | 'h5'
}

defineOptions({
  name: 'AddressCard',
})

const props = withDefaults(defineProps<Props>(), {
  isDefault: false,
  layout: 'h5',
})

const emit = defineEmits<{
  edit: [addressId: string | number]
  delete: [addressId: string | number]
  'set-default': [addressId: string | number]
}>()

function handleEdit() {
  emit('edit', props.address.id)
}

function handleDelete() {
  emit('delete', props.address.id)
}

function handleSetDefault() {
  emit('set-default', props.address.id)
}
</script>
