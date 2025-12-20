<template>
  <div class="border border-[#e5e7eb] p-[25px] flex flex-col gap-4">
    <!-- 头部：姓名和编辑按钮 -->
    <div class="flex items-center justify-between h-5">
      <div class="flex items-center">
        <p class="text-sm font-medium text-[#191a1d] leading-5">
          {{ address.name }} {{ address.gender }}
        </p>
      </div>
      <button
        class="text-xs text-[#4a5565] leading-4 underline hover:text-[#191a1d] transition-colors"
        @click="handleEdit"
      >
        编辑
      </button>
    </div>

    <!-- 地址信息 -->
    <div class="flex flex-col gap-1">
      <!-- 电话号码 -->
      <p class="text-sm text-[#4a5565] leading-5">
        {{ address.phone }}
      </p>

      <!-- 详细地址 -->
      <p class="text-sm text-[#4a5565] leading-5">
        {{ address.fullAddress }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Address {
  id: string | number
  name: string
  gender: string
  phone: string
  fullAddress: string
}

interface Props {
  address: Address
}

defineOptions({
  name: 'AddressCard',
})

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [addressId: string | number]
}>()

/**
 * 处理编辑
 */
function handleEdit() {
  emit('edit', props.address.id)
}
</script>

<style scoped>
/* Noto Sans SC 字体已在全局引入 */
</style>

