export interface DecorationBlock {
  type: string
  settings: Record<string, unknown>
}

export interface DecorationSection {
  type: string
  title: string
  disabled: boolean
  settings: Record<string, unknown>
  blocks: Record<string, DecorationBlock>
  block_order: string[]
}

export type PageType = 'home' | 'list' | 'detail' | 'custom' | 'global'

export interface DecorationDSL {
  pageType: PageType
  pageId: string
  sections: Record<string, DecorationSection>
  order: string[]
}

export type DecorationMessageType =
  | 'DECORATION_INIT'
  | 'DECORATION_UPDATE'
  | 'PREVIEW_READY'
  | 'SECTION_FOCUSED'
  | 'SECTION_HOVERED'
  | 'SECTION_RECT'
  | 'PREVIEW_SCROLL'
  | 'BLOCK_FOCUSED'
  | 'BLOCK_HOVERED'
  | 'BLOCK_HIGHLIGHT'
  | 'BLOCK_RECT'

export interface DecorationMessage {
  type: DecorationMessageType
  payload: Record<string, unknown>
}

export interface DecorationHighlightedBlock {
  sectionId: string
  blockId: string
}

export interface DecorationBlockRect {
  top: number
  left: number
  width: number
  height: number
}

export const EMPTY_DECORATION_DSL: DecorationDSL = {
  pageType: 'home',
  pageId: 'home',
  sections: {},
  order: [],
}

export function isDecorationDSL(value: unknown): value is DecorationDSL {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<DecorationDSL>

  return Boolean(
    candidate.pageType &&
      candidate.pageId &&
      candidate.sections &&
      typeof candidate.sections === 'object' &&
      Array.isArray(candidate.order)
  )
}

export function normalizeDecorationDSL(
  value: unknown,
  fallback: DecorationDSL | null = null
): DecorationDSL | null {
  if (!isDecorationDSL(value)) {
    return fallback
  }

  return {
    pageType: value.pageType,
    pageId: value.pageId,
    sections: value.sections,
    order: value.order,
  }
}

export function hasDecorationSections(value: DecorationDSL | null | undefined): boolean {
  return Boolean(value?.order?.length)
}
