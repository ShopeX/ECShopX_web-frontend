<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  total: number
  pageSize: number
  currentPage: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const pages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const delta = 2
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined

  range.push(1)

  if (total <= 1) return range

  for (let i = current - delta; i <= current + delta; i++) {
    if (i < total && i > 1) {
      range.push(i)
    }
  }
  range.push(total)

  for (const i of range) {
    if (l) {
      if (typeof i === 'number' && i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (typeof i === 'number' && i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = typeof i === 'number' ? i : l
  }

  return rangeWithDots
})

const handlePageChange = (page: number | string) => {
  if (
    typeof page === 'number' &&
    page !== props.currentPage &&
    page >= 1 &&
    page <= totalPages.value
  ) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-end gap-2">
    <button
      class="px-3 py-1 border rounded text-sm text-gray-600 hover:border-primary-500 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
    >
      &lt;
    </button>

    <button
      v-for="(page, index) in pages"
      :key="index"
      class="px-3 py-1 border rounded text-sm transition-colors"
      :class="[
        page === currentPage
          ? 'bg-primary-500 border-primary-500 text-white'
          : 'text-gray-600 hover:border-primary-500 hover:text-primary-500',
        page === '...' ? 'border-none hover:border-none cursor-default' : '',
      ]"
      @click="handlePageChange(page)"
    >
      {{ page }}
    </button>

    <button
      class="px-3 py-1 border rounded text-sm text-gray-600 hover:border-primary-500 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
    >
      &gt;
    </button>
  </div>
</template>
