<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <!-- Loading 图标 -->
    <span v-if="loading" class="inline-flex items-center">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    
    <!-- 默认插槽 -->
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buttonVariants, buttonSizes } from '../theme'

interface Props {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  disabled?: boolean
  loading?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  size: 'md',
  disabled: false,
  loading: false,
  className: ''
})

// 按钮样式
const buttonClasses = computed(() => [
  'inline-flex items-center justify-center gap-2 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  buttonVariants[props.variant],
  buttonSizes[props.size],
  props.className
])
</script>

