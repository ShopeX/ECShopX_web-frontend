<!-- Input.vue -->
<template>
  <input
    :class="[
      'transition-colors',
      variant ? inputVariants[variant] : '',
      size ? inputSizes[size] : '',
      className
    ]"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { inputVariants, inputSizes } from './theme'

interface Props {
  variant?: keyof typeof inputVariants
  size?: keyof typeof inputSizes
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  className: ''
});</script> 