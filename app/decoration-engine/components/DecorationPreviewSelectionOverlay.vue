<template>
  <Teleport v-if="overlayTarget" :to="overlayTarget">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-[10050] h-0 overflow-visible"
    >
      <div
        v-if="selectedChromeStyle && selectedChrome"
        class="pointer-events-none absolute box-border"
        :style="selectedChromeStyle"
      >
        <div
          class="pointer-events-none absolute inset-0 rounded-none border-2 border-primary shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        />
        <div :class="selectedChromeLabelClass">
          {{ selectedChromeLabel }}
        </div>
        <div
          v-if="selectedChrome.kind === 'section'"
          :class="selectedChromeActionsClass"
          @pointerdown.stop
        >
          <button type="button" :class="selectedChromeActionButtonClass" aria-label="上移" @click.stop.prevent="handleSelectedSectionAction('up')">
            <ArrowUp :size="16" :stroke-width="1.8" />
          </button>
          <button type="button" :class="selectedChromeActionButtonClass" aria-label="下移" @click.stop.prevent="handleSelectedSectionAction('down')">
            <ArrowDown :size="16" :stroke-width="1.8" />
          </button>
          <button type="button" :class="selectedChromeActionButtonClass" aria-label="复制" @click.stop.prevent="handleSelectedSectionAction('duplicate')">
            <Copy :size="16" :stroke-width="1.8" />
          </button>
          <button type="button" :class="selectedChromeActionButtonClass" aria-label="删除" @click.stop.prevent="handleSelectedSectionAction('remove')">
            <Trash2 :size="16" :stroke-width="1.8" />
          </button>
        </div>
      </div>
      <div
        v-if="adminSyncedChromeStyle && adminSyncedChrome"
        class="pointer-events-none absolute box-border"
        :style="adminSyncedChromeStyle"
      >
        <div
          class="pointer-events-none absolute inset-0 rounded-none border-2 border-primary shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        />
        <div
          :class="adminSyncedChromeLabelClass"
        >
          {{ adminSyncedChromeLabel }}
        </div>
        <template v-if="adminSyncedChrome.source === 'hover'">
          <button
            type="button"
            data-decoration-add-control="1"
            class="group pointer-events-auto absolute left-1/2 top-0 z-[2] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white"
            aria-label="添加"
            @pointerenter="keepAddControlHover"
            @pointerdown.stop
            @click.stop.prevent="handleAddClick('before')"
          >
            <span class="absolute inset-0 rounded-full bg-primary shadow-sm" />
            <UIcon name="i-heroicons-plus" class="relative h-3.5 w-3.5 shrink-0" />
            <span class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-75 items-center gap-1 whitespace-nowrap rounded-full bg-primary py-1 pl-1 pr-2 text-xs leading-none text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100">
              <UIcon name="i-heroicons-plus" class="h-3.5 w-3.5 shrink-0" />
              {{ addButtonLabel }}
            </span>
          </button>
          <button
            type="button"
            data-decoration-add-control="1"
            class="group pointer-events-auto absolute bottom-0 left-1/2 z-[2] flex h-5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center text-white"
            aria-label="添加"
            @pointerenter="keepAddControlHover"
            @pointerdown.stop
            @click.stop.prevent="handleAddClick('after')"
          >
            <span class="absolute inset-0 rounded-full bg-primary shadow-sm" />
            <UIcon name="i-heroicons-plus" class="relative h-3.5 w-3.5 shrink-0" />
            <span class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-75 items-center gap-1 whitespace-nowrap rounded-full bg-primary py-1 pl-1 pr-2 text-xs leading-none text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100">
              <UIcon name="i-heroicons-plus" class="h-3.5 w-3.5 shrink-0" />
              {{ addButtonLabel }}
            </span>
          </button>
        </template>
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
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-vue-next'
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
const overlayViewportWidth = ref(0)
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
const {
  requestAddBlock,
  requestAddSection,
  requestMoveSection,
  requestDuplicateSection,
  requestRemoveSection,
} = decorationPreviewBundle

const mergedPreviewSections = computed((): Record<string, DecorationSection> => ({
  ...(decorationPreviewBundle.headerDsl.value?.sections || {}),
  ...(decorationPreviewBundle.footerDsl.value?.sections || {}),
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

const BLOCK_TRANSLATION_LABEL: Record<string, string> = {
  'blocks.header_product_list.name': '商品列表',
  'blocks.header_collection_product_list.name': '产品系列商品列表',
  'blocks.mega_menu.name': '大型菜单',
}

const BLOCK_TYPE_LABEL: Record<string, string> = {
  announcement: '公告',
  image: '图片',
  video: '视频',
  hotspot: '热区',
  'nav-item': '导航菜单',
  'footer-link': '页脚链接',
  'product-tab': '产品系列',
  'header-product-list': '商品列表',
  'header-collection-product-list': '产品系列商品列表',
  'mega-menu': '大型菜单',
}

function resolvePreviewLabel(value: unknown): string {
  const text = String(value || '').trim()
  if (!text.startsWith('t:')) {
    return text
  }
  const key = text.slice(2)
  return BLOCK_TRANSLATION_LABEL[key] || key || text
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
    const t = resolvePreviewLabel(s.label || s.title)
    if (t) {
      return t
    }
    return BLOCK_TYPE_LABEL[block.type] || block.type || blockId
  }
  const st = String(section.title || '').trim()
  if (st) {
    return st
  }
  return SECTION_TYPE_LABEL[section.type] || section.type || sectionId
}

function updateOverlayViewportWidth() {
  if (!import.meta.client) {
    return
  }
  overlayViewportWidth.value = window.innerWidth || document.documentElement?.clientWidth || 0
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
  updateOverlayViewportWidth()
  if (!overlayResizeObserver) {
    overlayResizeObserver = new ResizeObserver(() => updateOverlayViewportWidth())
    overlayResizeObserver.observe(document.documentElement)
  }
  window.addEventListener('resize', updateOverlayViewportWidth)
}

function unbindOverlayMetrics() {
  if (!import.meta.client) {
    return
  }
  overlayResizeObserver?.disconnect()
  overlayResizeObserver = null
  window.removeEventListener('resize', updateOverlayViewportWidth)
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
      updateOverlayViewportWidth()
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
  const hb = ctx.hoveredBlock.value
  const hoverBlockIdRaw = hb?.blockId != null ? String(hb.blockId).trim() : ''
  if (hb?.sectionId && hoverBlockIdRaw) {
    const key = `${hb.sectionId}::${hoverBlockIdRaw}`
    const rect = ctx.blockRects.value[key] as PreviewChromeRect | undefined
    if (rect) {
      return {
        kind: 'block' as const,
        source: 'hover' as const,
        sectionId: hb.sectionId,
        blockId: hoverBlockIdRaw,
        rect,
      }
    }
  }

  const hoverSectionId = ctx.hoverSectionId.value
  if (hoverSectionId) {
    const rect = ctx.sectionRects.value[hoverSectionId] as PreviewChromeRect | undefined
    if (rect) {
      return {
        kind: 'section' as const,
        source: 'hover' as const,
        sectionId: hoverSectionId,
        rect,
      }
    }
  }

  return null
})

const selectedChrome = computed(() => {
  const ctx = editContext.value

  const hl = unref(ctx.highlightedBlock)
  const blockIdRaw = hl?.blockId != null ? String(hl.blockId).trim() : ''

  if (hl?.sectionId && blockIdRaw) {
    const key = `${hl.sectionId}::${blockIdRaw}`
    const rect = ctx.blockRects.value[key] as PreviewChromeRect | undefined
    if (rect) {
      return {
        kind: 'block' as const,
        source: 'selected' as const,
        sectionId: hl.sectionId,
        blockId: blockIdRaw,
        rect,
      }
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
  return { kind: 'section' as const, source: 'selected' as const, sectionId: sid, rect }
})

function toChromeStyle(chrome: { rect?: PreviewChromeRect } | null) {
  if (!chrome?.rect) {
    return null
  }
  const r = chrome.rect
  return {
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }
}

const adminSyncedChromeStyle = computed(() => {
  return toChromeStyle(adminSyncedChrome.value)
})

const selectedChromeStyle = computed(() => toChromeStyle(selectedChrome.value))

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

const selectedChromeLabel = computed(() => {
  const c = selectedChrome.value
  if (!c) {
    return ''
  }
  const sections = mergedPreviewSections.value
  if (c.kind === 'block') {
    return buildPreviewSelectionLabel(sections, 'block', c.sectionId, c.blockId)
  }
  return buildPreviewSelectionLabel(sections, 'section', c.sectionId)
})

const adminSyncedChromeLabelClass = computed(() => {
  const c = adminSyncedChrome.value
  const canPlaceAbove = Boolean(c?.rect && c.rect.top >= 24)
  return [
    'pointer-events-auto absolute left-0 z-[1] rounded-none bg-primary px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-sm',
    canPlaceAbove ? 'top-0 -translate-y-full' : 'top-0 translate-y-0',
  ]
})

const selectedChromeLabelClass = computed(() => {
  const c = selectedChrome.value
  const canPlaceAbove = Boolean(c?.rect && c.rect.top >= 24)
  return [
    'pointer-events-auto absolute left-0 z-[1] rounded-none bg-primary px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-sm',
    canPlaceAbove ? 'top-0 -translate-y-full' : 'top-0 translate-y-0',
  ]
})

const selectedChromeActionsClass = computed(() => {
  const c = selectedChrome.value
  const viewportWidth = overlayViewportWidth.value
  const actionsWidth = 40
  const gap = 8
  const canPlaceOutsideRight = Boolean(
    c?.rect && c.rect.left + c.rect.width + actionsWidth + gap <= viewportWidth
  )
  return [
    'pointer-events-auto absolute top-0 z-[1] flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-white px-2 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)]',
    canPlaceOutsideRight ? 'right-0 ml-2 translate-x-full' : 'right-1 translate-x-0',
  ]
})

const selectedChromeActionButtonClass = [
  'flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors',
  'hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
]

const addButtonLabel = computed(() =>
  adminSyncedChrome.value?.kind === 'block' ? '添加块' : '添加分区'
)

function handleSelectedSectionAction(action: 'up' | 'down' | 'duplicate' | 'remove') {
  const chrome = selectedChrome.value
  if (!chrome || chrome.kind !== 'section') {
    return
  }
  if (action === 'up' || action === 'down') {
    requestMoveSection(chrome.sectionId, action)
    return
  }
  if (action === 'duplicate') {
    requestDuplicateSection(chrome.sectionId)
    return
  }
  requestRemoveSection(chrome.sectionId)
}

function keepAddControlHover() {
  const chrome = adminSyncedChrome.value
  const ctx = editContext.value
  if (!chrome) {
    return
  }
  if (chrome.kind === 'block') {
    ctx.setHoveredBlock(chrome.sectionId, chrome.blockId)
    return
  }
  ctx.setHoverSection(chrome.sectionId)
}

function handleAddClick(position: 'before' | 'after') {
  const chrome = adminSyncedChrome.value
  if (!chrome) return
  if (chrome.kind === 'block') {
    handleAddBlockClick(chrome.sectionId, chrome.blockId, position)
    return
  }
  handleAddSectionClick(chrome.sectionId, position)
}

function handleAddBlockClick(sectionId: string, blockId: string, position: 'before' | 'after') {
  const section = mergedPreviewSections.value[sectionId]
  const blockOrder = Array.isArray(section?.block_order) ? section.block_order : []
  const activeIndex = blockId ? blockOrder.indexOf(blockId) : -1
  const insertIndex =
    activeIndex >= 0
      ? activeIndex + (position === 'after' ? 1 : 0)
      : blockOrder.length || undefined
  requestAddBlock(sectionId, insertIndex)
}

function handleAddSectionClick(sectionId: string, position: 'before' | 'after') {
  const order = decorationPreviewBundle.pageDsl.value?.order || []
  const activeIndex = order.indexOf(sectionId)
  const insertIndex = activeIndex >= 0 ? activeIndex + (position === 'after' ? 1 : 0) : undefined
  requestAddSection(sectionId, insertIndex)
}

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
