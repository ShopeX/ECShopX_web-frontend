<template>
  <div class="flex flex-col">
    <template v-if="hasRenderableSections">
      <template v-for="sectionId in dsl.order" :key="sectionId">
        <DecorationSectionHost
          v-if="shouldRenderSection(sectionId)"
          :section-id="sectionId"
        >
          <component
            :is="resolveSectionComponent(sectionId)"
            :section="dsl.sections[sectionId]"
            :section-id="sectionId"
            :is-preview="isPreview"
            @click="emit('section-click', sectionId)"
          />
        </DecorationSectionHost>
      </template>
    </template>
    <div
      v-else-if="isPreview"
      class="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500"
    >
      等待装修数据推送中...
    </div>
    <slot v-else />
  </div>
  <Teleport v-if="isPreview && overlayTarget" :to="overlayTarget">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-9999"
      :style="{ height: `${overlayDocHeight}px` }"
    >
      <div
        v-if="selectedSectionOverlay"
        class="absolute border-2 border-[#3b82f6] bg-transparent"
        :style="selectedSectionOverlay"
      />
      <div
        v-for="item in dashedBlockOverlays"
        :key="item.key"
        class="absolute border border-dashed border-[#6366f1] bg-transparent"
        :style="item.style"
      />
      <div
        v-if="activeBlockOverlay"
        class="absolute border-2 border-[#6366f1] bg-transparent"
        :style="activeBlockOverlay"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Component, Ref } from 'vue'
import type { DecorationDSL, DecorationHighlightedBlock } from '~/decoration-engine/types/decoration'
import {
  decorationEditKey,
  type DecorationEditContext,
} from '~/decoration-engine/composables/useDecorationEditContext'

const props = defineProps<{
  dsl: DecorationDSL
  isPreview?: boolean
  highlightedBlock?: DecorationHighlightedBlock | null
}>()

const emit = defineEmits<{
  (e: 'section-click', sectionId: string): void
}>()

const { $decorationRegistry } = useNuxtApp()
const sectionRegistry = computed<Record<string, Component>>(
  () => ($decorationRegistry || {}) as Record<string, Component>
)

const pinnedSectionId = ref<string | null>(null)
const hoverSectionId = ref<string | null>(null)
const hoveredBlock = ref<{ sectionId: string; blockId: string } | null>(null)
const overlayTarget = ref<HTMLElement | null>(null)
const overlayDocHeight = ref(0)
const sectionRects = ref<Record<string, { top: number; left: number; width: number; height: number }>>({})
const blockRects = ref<
  Record<string, { sectionId: string; blockId: string; top: number; left: number; width: number; height: number }>
>({})
const isPreview = computed(() => Boolean(props.isPreview))
const highlightedBlock = toRef(props, 'highlightedBlock') as Readonly<Ref<DecorationHighlightedBlock | null | undefined>>

function tryClearHoveredFromBlock(e: PointerEvent, sectionId: string, blockId: string) {
  if (hoveredBlock.value?.sectionId !== sectionId || hoveredBlock.value?.blockId !== blockId) {
    return
  }
  const next = e.relatedTarget
  if (next && next instanceof Element) {
    const el = next.closest?.('[data-decoration-block]')
    if (el) {
      const d = el.getAttribute('data-decoration-block') || ''
      if (d.startsWith(`${sectionId}::`)) {
        return
      }
    }
  }
  hoveredBlock.value = null
}

const editContext: DecorationEditContext = {
  isPreview,
  pinnedSectionId,
  hoverSectionId,
  hoveredBlock,
  highlightedBlock,
  setPinnedSection: (id) => {
    pinnedSectionId.value = id
  },
  setHoverSection: (id) => {
    hoverSectionId.value = id
  },
  setHoveredBlock: (sectionId, blockId) => {
    hoveredBlock.value = { sectionId, blockId }
  },
  tryClearHoveredFromBlock,
  sectionRects,
  blockRects,
  setSectionRect: (sectionId, rect) => {
    sectionRects.value = {
      ...sectionRects.value,
      [sectionId]: rect,
    }
  },
  setBlockRect: (sectionId, blockId, rect) => {
    blockRects.value = {
      ...blockRects.value,
      [`${sectionId}::${blockId}`]: {
        sectionId,
        blockId,
        ...rect,
      },
    }
  },
}

provide(decorationEditKey, editContext)

let overlayResizeObserver: ResizeObserver | null = null

function updateOverlayDocHeight() {
  if (!import.meta.client) return
  const doc = document.documentElement
  const body = document.body
  overlayDocHeight.value = Math.max(
    doc?.scrollHeight || 0,
    doc?.clientHeight || 0,
    body?.scrollHeight || 0,
    body?.clientHeight || 0
  )
}

onMounted(() => {
  const id = 'decoration-overlay-root'
  let target = document.getElementById(id)
  if (!target) {
    target = document.createElement('div')
    target.id = id
  }
  target.setAttribute('data-decoration-overlay-root', '1')
  document.body.appendChild(target)
  overlayTarget.value = target
  updateOverlayDocHeight()
  overlayResizeObserver = new ResizeObserver(() => updateOverlayDocHeight())
  overlayResizeObserver.observe(document.documentElement)
  overlayResizeObserver.observe(document.body)
  window.addEventListener('resize', updateOverlayDocHeight)
})

onBeforeUnmount(() => {
  overlayResizeObserver?.disconnect()
  overlayResizeObserver = null
  window.removeEventListener('resize', updateOverlayDocHeight)
  if (overlayTarget.value && overlayTarget.value.parentNode) {
    overlayTarget.value.parentNode.removeChild(overlayTarget.value)
  }
  overlayTarget.value = null
})

/** 后台选中时同步「点击态」选区边框（pinned），与指针 hover 独立 */
watch(
  () => props.highlightedBlock,
  (hb) => {
    pinnedSectionId.value = hb?.sectionId ?? null
  },
  { immediate: true, deep: true }
)

const shouldRenderSection = (sectionId: string) => {
  const section = props.dsl.sections[sectionId]
  if (!section || section.disabled) {
    return false
  }

  return Boolean(sectionRegistry.value[section.type])
}

const resolveSectionComponent = (sectionId: string): Component | null => {
  const section = props.dsl.sections[sectionId]
  if (!section) {
    return null
  }

  return sectionRegistry.value[section.type] || null
}

const hasRenderableSections = computed(() => {
  if (!props.dsl?.order?.length) {
    return false
  }
  return props.dsl.order.some((sectionId) => shouldRenderSection(sectionId))
})

const selectedSectionOverlay = computed(() => {
  const sid = pinnedSectionId.value
  if (!sid) {
    return null
  }
  const rect = sectionRects.value[sid]
  if (!rect) {
    return null
  }
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
})

const activeBlockKey = computed(() => {
  if (hoveredBlock.value?.sectionId && hoveredBlock.value?.blockId) {
    return `${hoveredBlock.value.sectionId}::${hoveredBlock.value.blockId}`
  }
  if (highlightedBlock.value?.sectionId && highlightedBlock.value?.blockId) {
    return `${highlightedBlock.value.sectionId}::${highlightedBlock.value.blockId}`
  }
  return ''
})

const activeBlockOverlay = computed(() => {
  if (!activeBlockKey.value) {
    return null
  }
  const rect = blockRects.value[activeBlockKey.value]
  if (!rect) {
    return null
  }
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
})

const dashedBlockOverlays = computed(() => {
  const sid = hoverSectionId.value
  if (!sid) {
    return []
  }
  return Object.keys(blockRects.value)
    .map((key) => ({ key, ...blockRects.value[key] }))
    .filter((item) => item.sectionId === sid && item.key !== activeBlockKey.value)
    .map((item) => ({
      key: item.key,
      style: {
        top: `${item.top}px`,
        left: `${item.left}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
      },
    }))
})
</script>
