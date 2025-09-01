<!-- Button.vue -->
<template>
  <button
    :class="[
      'inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50',
      variant ? buttonVariants[variant] : '',
      size ? buttonSizes[size] : '',
      className
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { buttonVariants, buttonSizes } from './theme'

interface Props {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'solid',
  size: 'md',
  className: ''
});</script> 