<template>
  <div
    class="flex h-10 items-center border border-[#e5e7eb] bg-white p-px"
    :class="fullWidth ? 'w-full' : ''"
  >
    <button
      type="button"
      class="flex h-[38px] w-10 items-center justify-center hover:bg-gray-50 disabled:opacity-30"
      :class="fullWidth ? 'grow' : ''"
      :disabled="quantity <= min || loading"
      @click="$emit('decrease')"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.33331 8H12.6666"
          stroke="#191A1D"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div class="flex h-[38px] w-10 items-center justify-center">
      <span class="font-['Inter'] text-sm font-medium leading-5 tracking-[-0.15px] text-[#101828]">
        {{ quantity }}
      </span>
    </div>

    <button
      type="button"
      class="flex h-[38px] w-10 items-center justify-center hover:bg-gray-50 disabled:opacity-30"
      :class="fullWidth ? 'grow' : ''"
      :disabled="quantity >= max || loading"
      @click="$emit('increase')"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
</template>

<script setup lang="ts">
interface Props {
  quantity: number
  min: number
  max: number
  loading?: boolean
  fullWidth?: boolean
}

defineProps<Props>()

defineEmits<{
  (e: 'decrease'): void
  (e: 'increase'): void
}>()
</script>
