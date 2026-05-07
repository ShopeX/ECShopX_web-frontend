/**
 * 调试说明：`initPreview` / `postMessage(PREVIEW_READY)` 仅在浏览器、且由 DecorationRenderer 的 onMounted 触发。
 * Chrome 断点须切到 **iframe 的 JS 上下文**（Sources 面板左上角选 127.0.0.1:3000 等商城源），在后台顶层窗口打断点不会命中子帧脚本。
 * 勿在 composable 顶层打断点指望只在浏览器停：Nuxt 可能在 Node 端 SSR 先执行一遍 setup。
 */
import { toValue, type MaybeRefOrGetter } from 'vue'
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

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]'
  )
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin)
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false
    }
    return isLoopbackHostname(hostname)
  } catch {
    return false
  }
}

/** 开发环境：配置的 NUXT_PUBLIC_DECORATION_ADMIN_ORIGINS 与后台实际 origin（localhost ↔ 127.0.0.1）不一致时仍接收 DECORATION_INIT */
function isAllowedAdminMessageOrigin(eventOrigin: string, allowed: string[]): boolean {
  if (allowed.includes(eventOrigin)) {
    return true
  }
  if (!import.meta.dev || allowed.length === 0) {
    return false
  }
  return allowed.some((configured) => {
    try {
      const a = new URL(eventOrigin)
      const b = new URL(configured)
      if (a.protocol !== b.protocol) {
        return false
      }
      if (a.port !== b.port) {
        return false
      }
      return isLoopbackHostname(a.hostname) && isLoopbackHostname(b.hostname)
    } catch {
      return false
    }
  })
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

  if (!sectionId) {
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
  if (!sectionId) {
    return null
  }
  return { sectionId, blockId }
}

/** 开发环境：在 iframe 内打开 DevTools 可确认是否发出 PREVIEW_READY */
function devLogHandshake(phase: string, detail?: Record<string, unknown>) {
  if (!import.meta.dev) return
  console.info(`[ecshopx-decoration-handshake] ${phase}`, detail ?? {})
}

function devWarnHandshake(phase: string, detail?: Record<string, unknown>) {
  if (!import.meta.dev) return
  console.warn(`[ecshopx-decoration-handshake] ${phase}`, detail ?? {})
}

export function useDecorationPreview(pageTypeSource: MaybeRefOrGetter<PageType> = 'home') {
  const config = useRuntimeConfig()
  const route = useRoute()
  const resolvePageType = (): PageType => toValue(pageTypeSource)
  const pageTypeKey = resolvePageType()
  /** 单页共享，避免多处调用 useDecorationPreview 时出现多份 dsl/highlight（监听只更新其中一份） */
  const dsl = useState<DecorationDSL | null>(`decoration-preview-dsl-${pageTypeKey}`, () => null)
  const pageDsl = useState<DecorationDSL | null>(`decoration-preview-page-dsl-${pageTypeKey}`, () => null)
  const globalDsl = useState<DecorationDSL | null>(
    `decoration-preview-global-dsl-${pageTypeKey}`,
    () => null
  )
  const highlightedBlock = useState<DecorationHighlightedBlock | null>(
    `decoration-preview-hl-${pageTypeKey}`,
    () => null
  )
  const isInitialized = ref(false)
  let removeScrollListeners: (() => void) | null = null

  const allowedOrigins = computed(() =>
    normalizeAllowedOrigins(config.public.decorationAdminOrigins as string | undefined)
  )

  /** 接收 postMessage 时：列表 + 单独的 NUXT_PUBLIC_DECORATION_ADMIN_ORIGIN（很多人只配后者） */
  const allowedAdminOriginsForMessages = computed(() => {
    const list = [...allowedOrigins.value]
    const single = String(config.public.decorationAdminOrigin || '').trim()
    if (single && !list.includes(single)) {
      list.push(single)
    }
    return list
  })

  const targetOrigin = computed(() => {
    const configuredOrigin = String(config.public.decorationAdminOrigin || '').trim()
    if (configuredOrigin) {
      return configuredOrigin
    }

    const fromList = allowedOrigins.value[0]
    if (fromList) {
      return fromList
    }

    // 未配 NUXT_PUBLIC_DECORATION_ADMIN_ORIGIN 时，从嵌入后台的 referrer 推断父窗口 origin（生产同样需要，否则无法 postMessage PREVIEW_READY）
    if (import.meta.client && typeof document !== 'undefined' && document.referrer) {
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
    // 仅当 payload 显式携带 selection 时更新高亮，避免无 selection 的推送把选中态清空
    if (Object.prototype.hasOwnProperty.call(raw, 'selection')) {
      highlightedBlock.value = extractSelectionFromDslPayload(raw)
    }
  }

  const handleMessage = (event: MessageEvent<DecorationMessage>) => {
    const allowed = allowedAdminOriginsForMessages.value
    const originOk =
      allowed.length > 0
        ? isAllowedAdminMessageOrigin(event.origin, allowed)
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
      const raw = message as unknown as Record<string, unknown>
      const payload = (raw.payload ?? raw) as Record<string, unknown>
      highlightedBlock.value = extractHighlightedBlock(payload)
    }
  }

  const postToParent = (message: DecorationMessage) => {
    if (import.meta.server || window.parent === window) {
      if (import.meta.dev && message.type === 'PREVIEW_READY') {
        devWarnHandshake('PREVIEW_READY 未发送', {
          reason: import.meta.server ? 'ssr' : 'top-level-window',
        })
      }
      return
    }

    let origin = String(targetOrigin.value || '').trim()
    // 开发环境：NUXT_PUBLIC_DECORATION_ADMIN_ORIGIN 若与后台实际地址（localhost / 127.0.0.1）不一致，
    // 浏览器会静默丢弃 postMessage，握手永远完不成；嵌入 iframe 时统一用 * 送达父窗口。
    if (import.meta.dev) {
      origin = '*'
    } else if (!origin) {
      // 生产未配置时仍允许 iframe 通知父窗口（与原先逻辑一致）
      origin = '*'
    }
    if (!origin) {
      if (import.meta.dev && message.type === 'PREVIEW_READY') {
        devWarnHandshake('PREVIEW_READY 未发送', { reason: 'empty-target-origin' })
      }
      return
    }

    if (import.meta.dev && message.type === 'PREVIEW_READY') {
      devLogHandshake('postMessage PREVIEW_READY → parent', {
        pageType: resolvePageType(),
        targetOrigin: origin,
      })
    }

    window.parent.postMessage(message, origin)
  }

  const initPreview = () => {
    if (import.meta.server) {
      return
    }
    if (isInitialized.value) {
      if (import.meta.dev) {
        devLogHandshake('initPreview 跳过（已初始化）', { pageType: resolvePageType() })
      }
      return
    }

    window.addEventListener('message', handleMessage)
    isInitialized.value = true
    if (import.meta.dev) {
      devLogHandshake('initPreview 开始', {
        pageType: resolvePageType(),
        designMode: route.query.designMode,
        inIframe: (() => {
          try {
            return window.parent !== window
          } catch {
            return 'unknown'
          }
        })(),
      })
    }
    const handlePreviewScroll = () => {
      postToParent({
        type: 'PREVIEW_SCROLL',
        payload: {
          pageType: resolvePageType(),
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
      payload: { pageType: resolvePageType() },
    })
    handlePreviewScroll()
  }

  const focusSection = (sectionId: string) => {
    postToParent({
      type: 'SECTION_FOCUSED',
      payload: { pageType: resolvePageType(), sectionId },
    })
  }

  const focusBlock = (sectionId: string, blockId: string) => {
    postToParent({
      type: 'BLOCK_FOCUSED',
      payload: { pageType: resolvePageType(), sectionId, blockId },
    })
  }

  const reportBlockRect = (sectionId: string, blockId: string, rect: DecorationBlockRect) => {
    postToParent({
      type: 'BLOCK_RECT',
      payload: {
        pageType: resolvePageType(),
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
        pageType: resolvePageType(),
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
        pageType: resolvePageType(),
        sectionId: sectionId || '',
      },
    })
  }

  const setHoveredBlock = (sectionId: string | null, blockId: string | null) => {
    postToParent({
      type: 'BLOCK_HOVERED',
      payload: {
        pageType: resolvePageType(),
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
