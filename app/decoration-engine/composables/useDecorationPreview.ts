import type {
  DecorationBlockRect,
  DecorationDSL,
  DecorationHighlightedBlock,
  DecorationMessage,
  PageType,
} from '~/decoration-engine/types/decoration'
import { normalizeDecorationDSL } from '~/decoration-engine/types/decoration'

function normalizeAllowedOrigins(origins: string | undefined): string[] {
  if (!origins) {
    return []
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

/** 后台 PreviewCanvas 发送的 payload 为 { pageType, pageId, dsl }，DSL 在 dsl 字段内 */
function extractDslPayload(payload: Record<string, unknown>): unknown {
  if (payload && typeof payload.dsl === 'object' && payload.dsl !== null) {
    return payload.dsl
  }
  return payload
}

function extractSplitDslPayload(payload: Record<string, unknown>): {
  pageDsl: unknown
  globalDsl: unknown
} | null {
  const hasPage = typeof payload.pageDsl === 'object' && payload.pageDsl !== null
  const hasGlobal = typeof payload.globalDsl === 'object' && payload.globalDsl !== null
  if (!hasPage && !hasGlobal) {
    return null
  }
  return {
    pageDsl: payload.pageDsl ?? null,
    globalDsl: payload.globalDsl ?? null,
  }
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin)
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false
    }
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

function extractHighlightedBlock(payload: Record<string, unknown>): DecorationHighlightedBlock | null {
  const nested =
    typeof payload.data === 'object' && payload.data !== null
      ? (payload.data as Record<string, unknown>)
      : undefined
  const sectionId = String(
    payload.sectionId ??
      payload.section_id ??
      nested?.sectionId ??
      nested?.section_id ??
      ''
  ).trim()
  const blockId = String(
    payload.blockId ?? payload.block_id ?? nested?.blockId ?? nested?.block_id ?? ''
  ).trim()

  if (!sectionId || !blockId) {
    return null
  }

  return { sectionId, blockId }
}

function extractSelectionFromDslPayload(payload: Record<string, unknown>): DecorationHighlightedBlock | null {
  const selection =
    typeof payload.selection === 'object' && payload.selection !== null
      ? (payload.selection as Record<string, unknown>)
      : null
  if (!selection) {
    return null
  }
  const sectionId = String(selection.sectionId ?? '').trim()
  const blockId = String(selection.blockId ?? '').trim()
  if (!sectionId || !blockId) {
    return null
  }
  return { sectionId, blockId }
}

export function useDecorationPreview(pageType: PageType = 'home') {
  const config = useRuntimeConfig()
  /** 单页共享，避免多处调用 useDecorationPreview 时出现多份 dsl/highlight（监听只更新其中一份） */
  const dsl = useState<DecorationDSL | null>(`decoration-preview-dsl-${pageType}`, () => null)
  const pageDsl = useState<DecorationDSL | null>(`decoration-preview-page-dsl-${pageType}`, () => null)
  const globalDsl = useState<DecorationDSL | null>(
    `decoration-preview-global-dsl-${pageType}`,
    () => null
  )
  const highlightedBlock = useState<DecorationHighlightedBlock | null>(
    `decoration-preview-hl-${pageType}`,
    () => null
  )
  const isInitialized = ref(false)
  let removeScrollListeners: (() => void) | null = null

  const allowedOrigins = computed(() =>
    normalizeAllowedOrigins(config.public.decorationAdminOrigins as string | undefined)
  )

  const targetOrigin = computed(() => {
    const configuredOrigin = String(config.public.decorationAdminOrigin || '').trim()
    if (configuredOrigin) {
      return configuredOrigin
    }

    const fromList = allowedOrigins.value[0]
    if (fromList) {
      return fromList
    }

    // 开发环境未配 NUXT_PUBLIC_DECORATION_ADMIN_ORIGIN 时，从嵌入 admin 的 referrer 推断父窗口 origin，否则无法发出 PREVIEW_READY
    if (import.meta.client && import.meta.dev && typeof document !== 'undefined' && document.referrer) {
      try {
        return new URL(document.referrer).origin
      } catch {
        /* noop */
      }
    }

    return ''
  })

  const syncDslFromMessage = (message: DecorationMessage) => {
    const raw = message.payload as Record<string, unknown>
    const split = extractSplitDslPayload(raw)
    if (split) {
      pageDsl.value = normalizeDecorationDSL(split.pageDsl)
      globalDsl.value = normalizeDecorationDSL(split.globalDsl)
      // Keep legacy single dsl state for existing consumers.
      dsl.value = pageDsl.value || normalizeDecorationDSL(extractDslPayload(raw))
    } else {
      const nextDsl = normalizeDecorationDSL(extractDslPayload(raw))
      if (nextDsl) {
        dsl.value = nextDsl
        pageDsl.value = nextDsl
      }
      globalDsl.value = null
    }
    highlightedBlock.value = extractSelectionFromDslPayload(raw)
  }

  const handleMessage = (event: MessageEvent<DecorationMessage>) => {
    const allowed = allowedOrigins.value
    const originOk =
      allowed.length > 0
        ? allowed.includes(event.origin)
        : import.meta.dev && isLocalDevOrigin(event.origin)

    if (!originOk) {
      return
    }

    const message = event.data
    if (!message || typeof message !== 'object' || !('type' in message)) {
      return
    }

    if (message.type === 'DECORATION_INIT' || message.type === 'DECORATION_UPDATE') {
      syncDslFromMessage(message)
      return
    }

    if (message.type === 'BLOCK_HIGHLIGHT') {
      const raw = message as Record<string, unknown>
      const payload = (raw.payload ?? raw) as Record<string, unknown>
      highlightedBlock.value = extractHighlightedBlock(payload)
    }
  }

  const postToParent = (message: DecorationMessage) => {
    if (import.meta.server || window.parent === window) {
      return
    }

    const origin = targetOrigin.value || (import.meta.dev ? '*' : '')
    if (!origin) {
      return
    }

    window.parent.postMessage(message, origin)
  }

  const initPreview = () => {
    if (import.meta.server || isInitialized.value) {
      return
    }

    window.addEventListener('message', handleMessage)
    isInitialized.value = true
    const handlePreviewScroll = () => {
      postToParent({
        type: 'PREVIEW_SCROLL',
        payload: {
          pageType,
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        },
      })
    }
    window.addEventListener('scroll', handlePreviewScroll, { capture: true, passive: true })
    document.addEventListener('scroll', handlePreviewScroll, { capture: true, passive: true })
    removeScrollListeners = () => {
      window.removeEventListener('scroll', handlePreviewScroll, true)
      document.removeEventListener('scroll', handlePreviewScroll, true)
    }

    postToParent({
      type: 'PREVIEW_READY',
      payload: { pageType },
    })
    handlePreviewScroll()
  }

  const focusSection = (sectionId: string) => {
    postToParent({
      type: 'SECTION_FOCUSED',
      payload: { pageType, sectionId },
    })
  }

  const focusBlock = (sectionId: string, blockId: string) => {
    postToParent({
      type: 'BLOCK_FOCUSED',
      payload: { pageType, sectionId, blockId },
    })
  }

  const reportBlockRect = (sectionId: string, blockId: string, rect: DecorationBlockRect) => {
    postToParent({
      type: 'BLOCK_RECT',
      payload: {
        pageType,
        sectionId,
        blockId,
        rect,
        viewport: {
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        },
      },
    })
  }

  const reportSectionRect = (sectionId: string, rect: DecorationBlockRect) => {
    postToParent({
      type: 'SECTION_RECT',
      payload: {
        pageType,
        sectionId,
        rect,
        viewport: {
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        },
      },
    })
  }

  const setHoveredSection = (sectionId: string | null) => {
    postToParent({
      type: 'SECTION_HOVERED',
      payload: {
        pageType,
        sectionId: sectionId || '',
      },
    })
  }

  const setHoveredBlock = (sectionId: string | null, blockId: string | null) => {
    postToParent({
      type: 'BLOCK_HOVERED',
      payload: {
        pageType,
        sectionId: sectionId || '',
        blockId: blockId || '',
      },
    })
  }

  onBeforeUnmount(() => {
    if (import.meta.client && isInitialized.value) {
      window.removeEventListener('message', handleMessage)
      removeScrollListeners?.()
      removeScrollListeners = null
      isInitialized.value = false
    }
  })

  return {
    dsl,
    pageDsl,
    globalDsl,
    highlightedBlock,
    initPreview,
    focusSection,
    focusBlock,
    reportBlockRect,
    reportSectionRect,
    setHoveredSection,
    setHoveredBlock,
  }
}
