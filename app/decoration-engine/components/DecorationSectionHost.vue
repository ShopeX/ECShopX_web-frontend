<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

const props = defineProps<{
  sectionId: string
}>()

const ctx = useDecorationEditOptional()
const isEditPreview = computed(() => (ctx ? unref(ctx.isPreview) : false))
const root = ref<HTMLElement | null>(null)

function onPointerEnter() {
  if (!isEditPreview.value || !ctx) {
    return
  }
  ctx.setHoverSection(props.sectionId)
  reportSelfRect()
}

function onPointerLeave(e: PointerEvent) {
  if (!isEditPreview.value || !ctx) {
    return
  }
  const next = e.relatedTarget
  const host = e.currentTarget as HTMLElement
  if (next instanceof Node && host.contains(next)) {
    return
  }
  ctx.setHoverSection(null)
}

function isEventOnDecorationBlock(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest?.('[data-decoration-block]'))
}

function onSectionPointerDownCapture(e: PointerEvent) {
  if (!ctx || !isEditPreview.value) {
    return
  }
  if (isEventOnDecorationBlock(e.target)) {
    return
  }
  ctx.setPinnedSection(props.sectionId)
}

function onSectionClick(e: MouseEvent) {
  if (!ctx || !isEditPreview.value) {
    return
  }
  if (isEventOnDecorationBlock(e.target)) {
    return
  }
  ctx.setPinnedSection(props.sectionId)
}

function reportSelfRect() {
  if (!isEditPreview.value || !root.value || !ctx) {
    return
  }
  const rect = root.value.getBoundingClientRect()
  const scrollX = window.scrollX || 0
  const scrollY = window.scrollY || 0
  ctx.setSectionRect(props.sectionId, {
    top: rect.top + scrollY,
    left: rect.left + scrollX,
    width: rect.width,
    height: rect.height,
  })
}

if (import.meta.client) {
  let rafId: number | null = null
  const scheduleReport = () => {
    if (rafId !== null) {
      return
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = null
      reportSelfRect()
    })
  }

  watch(
    () => [root.value, props.sectionId, isEditPreview.value],
    async () => {
      if (!isEditPreview.value) {
        return
      }
      await nextTick()
      scheduleReport()
    },
    { immediate: true, flush: 'post' }
  )

  useResizeObserver(
    computed(() => root.value),
    () => {
      if (!isEditPreview.value) {
        return
      }
      scheduleReport()
    }
  )

  onMounted(() => {
    window.addEventListener('resize', scheduleReport)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', scheduleReport)
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  })
}
</script>

<template>
  <div
    v-if="isEditPreview"
    ref="root"
    class="relative w-full min-w-0"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerdown.capture="onSectionPointerDownCapture"
    @click="onSectionClick"
  >
    <slot />
  </div>
  <template v-else>
    <slot />
  </template>
</template>
