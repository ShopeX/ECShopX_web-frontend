<template>
  <Teleport v-if="overlayTarget" :to="overlayTarget">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-[10050]"
      :style="{ height: `${overlayDocHeight}px` }"
    >
      <div
        v-if="adminSyncedChromeStyle && adminSyncedChrome"
        class="pointer-events-none absolute box-border"
        :style="adminSyncedChromeStyle"
      >
        <div
          class="pointer-events-none absolute inset-0 rounded-none border-2 border-primary shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        />
        <div
          class="pointer-events-auto absolute left-0 top-0 z-[1] -translate-y-full rounded-none bg-primary px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-sm"
        >
          {{ adminSyncedChromeLabel }}
        </div>
        <div
          class="pointer-events-auto absolute right-0 top-0 z-[1] ml-2 flex translate-x-full flex-col gap-0.5 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
          @pointerdown.stop
        >
          <button type="button" class="rounded p-1.5 text-neutral-600 hover:bg-neutral-100" title="上移" @click.stop.prevent>
            <UIcon name="i-heroicons-arrow-up" class="h-4 w-4" />
          </button>
          <button type="button" class="rounded p-1.5 text-neutral-600 hover:bg-neutral-100" title="下移" @click.stop.prevent>
            <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
          </button>
          <button type="button" class="rounded p-1.5 text-neutral-600 hover:bg-neutral-100" title="复制" @click.stop.prevent>
            <UIcon name="i-heroicons-document-duplicate" class="h-4 w-4" />
          </button>
          <button type="button" class="rounded p-1.5 text-red-500 hover:bg-red-50" title="删除" @click.stop.prevent>
            <UIcon name="i-heroicons-trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        v-for="item in dashedBlockOverlays"
        :key="item.key"
        class="absolute rounded-none border border-dashed border-primary/50 bg-transparent"
        :style="item.style"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import type { DecorationSection, PageType } from '~/decoration-engine/types/decoration'
import { getDecorationPreviewEditContext } from '~/decoration-engine/composables/useDecorationPreviewEditStore'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'

const props = withDefaults(
  defineProps<{
    /** 须与 DecorationRenderer / useDecorationPreview 的 pageType 一致 */
    pageType?: PageType
  }>(),
  {
    pageType: 'home',
  }
)

const overlayTarget = ref<HTMLElement | null>(null)
const overlayDocHeight = ref(0)
let overlayResizeObserver: ResizeObserver | null = null

const previewPageType = computed<PageType>(() => {
  const k = props.pageType
  if (k === 'home' || k === 'list' || k === 'detail' || k === 'custom' || k === 'global') {
    return k
  }
  return 'home'
})

const editContext = computed(() => getDecorationPreviewEditContext(previewPageType.value))
/** 与 index / Preview 的 useDecorationPreview(pageType) 同一 key，角标文案才能读到 global+page 合并分区 */
const decorationPreviewBundle = useDecorationPreview(previewPageType.value)

const mergedPreviewSections = computed((): Record<string, DecorationSection> => ({
  ...(decorationPreviewBundle.globalDsl.value?.sections || {}),
  ...(decorationPreviewBundle.pageDsl.value?.sections || {}),
}))

const SECTION_TYPE_LABEL: Record<string, string> = {
  'announcement-bar': '公告栏',
  header: '标头',
  footer: '页脚',
  carousel: '轮播',
  'image-hotspot': '图片热区',
  'product-shelf': '商品货架',
}

function buildPreviewSelectionLabel(
  sections: Record<string, DecorationSection>,
  kind: 'section' | 'block',
  sectionId: string,
  blockId?: string
): string {
  const section = sections[sectionId]
  if (!section) {
    return sectionId
  }
  if (kind === 'block' && blockId) {
    const block = section.blocks?.[blockId]
    if (!block) {
      return blockId
    }
    const s = (block.settings || {}) as Record<string, unknown>
    const t = String(s.label || s.title || '').trim()
    if (t) {
      return t
    }
    return SECTION_TYPE_LABEL[block.type] || block.type || blockId
  }
  const st = String(section.title || '').trim()
  if (st) {
    return st
  }
  return SECTION_TYPE_LABEL[section.type] || section.type || sectionId
}

function updateOverlayDocHeight() {
  if (!import.meta.client) {
    return
  }
  const doc = document.documentElement
  const body = document.body
  overlayDocHeight.value = Math.max(
    doc?.scrollHeight || 0,
    doc?.clientHeight || 0,
    body?.scrollHeight || 0,
    body?.clientHeight || 0
  )
}

function ensureOverlayRootAttached() {
  if (!import.meta.client) {
    return
  }
  const id = 'decoration-overlay-root'
  let target = document.getElementById(id)
  if (!target) {
    target = document.createElement('div')
    target.id = id
  }
  target.setAttribute('data-decoration-overlay-root', '1')
  document.body.appendChild(target)
  overlayTarget.value = target
}

function detachOverlayRoot() {
  if (!import.meta.client) {
    return
  }
  const target = overlayTarget.value
  overlayTarget.value = null
  if (target?.parentNode) {
    target.parentNode.removeChild(target)
  }
}

function bindOverlayMetrics() {
  if (!import.meta.client) {
    return
  }
  updateOverlayDocHeight()
  if (!overlayResizeObserver) {
    overlayResizeObserver = new ResizeObserver(() => updateOverlayDocHeight())
    overlayResizeObserver.observe(document.documentElement)
    overlayResizeObserver.observe(document.body)
  }
  window.addEventListener('resize', updateOverlayDocHeight)
}

function unbindOverlayMetrics() {
  if (!import.meta.client) {
    return
  }
  overlayResizeObserver?.disconnect()
  overlayResizeObserver = null
  window.removeEventListener('resize', updateOverlayDocHeight)
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  ensureOverlayRootAttached()
  bindOverlayMetrics()
})

onBeforeUnmount(() => {
  unbindOverlayMetrics()
  detachOverlayRoot()
})

watch(
  () => ({
    sectionRects: editContext.value.sectionRects.value,
    blockRects: editContext.value.blockRects.value,
    pinnedSectionId: editContext.value.pinnedSectionId.value,
    highlightedBlock: editContext.value.highlightedBlock.value,
    hoverSectionId: editContext.value.hoverSectionId.value,
    hoveredBlock: editContext.value.hoveredBlock.value,
  }),
  () => {
    if (import.meta.client) {
      updateOverlayDocHeight()
    }
  },
  { deep: true }
)

const activeBlockKey = computed(() => {
  const ctx = editContext.value
  const hb = ctx.hoveredBlock.value
  const hbId = hb?.blockId != null ? String(hb.blockId).trim() : ''
  if (hb?.sectionId && hbId) {
    return `${hb.sectionId}::${hbId}`
  }
  const hl = ctx.highlightedBlock.value
  const hlId = hl?.blockId != null ? String(hl.blockId).trim() : ''
  if (hl?.sectionId && hlId) {
    return `${hl.sectionId}::${hlId}`
  }
  return ''
})

type PreviewChromeRect = { top: number; left: number; width: number; height: number }

const adminSyncedChrome = computed(() => {
  const ctx = editContext.value
  const hl = unref(ctx.highlightedBlock)
  const blockIdRaw = hl?.blockId != null ? String(hl.blockId).trim() : ''

  if (hl?.sectionId && blockIdRaw) {
    const key = `${hl.sectionId}::${blockIdRaw}`
    const rect = ctx.blockRects.value[key] as PreviewChromeRect | undefined
    if (rect) {
      return { kind: 'block' as const, sectionId: hl.sectionId, blockId: blockIdRaw, rect }
    }
    return null
  }

  const pin = ctx.pinnedSectionId.value
  const sid = pin || hl?.sectionId || ''
  if (!sid) {
    return null
  }
  if (hl?.sectionId && hl.sectionId !== sid) {
    return null
  }
  if (hl?.sectionId === sid && blockIdRaw) {
    return null
  }
  const rect = ctx.sectionRects.value[sid] as PreviewChromeRect | undefined
  if (!rect) {
    return null
  }
  return { kind: 'section' as const, sectionId: sid, rect }
})

const adminSyncedChromeStyle = computed(() => {
  const c = adminSyncedChrome.value
  if (!c?.rect) {
    return null
  }
  const r = c.rect
  return {
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }
})

const adminSyncedChromeLabel = computed(() => {
  const c = adminSyncedChrome.value
  if (!c) {
    return ''
  }
  const sections = mergedPreviewSections.value
  if (c.kind === 'block') {
    return buildPreviewSelectionLabel(sections, 'block', c.sectionId, c.blockId)
  }
  return buildPreviewSelectionLabel(sections, 'section', c.sectionId)
})

const dashedBlockOverlays = computed(() => {
  const ctx = editContext.value
  const sid = ctx.hoverSectionId.value
  if (!sid) {
    return []
  }
  return Object.keys(ctx.blockRects.value)
    .map((key) => ({ key, ...ctx.blockRects.value[key] }))
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
