import { computed, inject, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { DecorationHighlightedBlock } from '~/decoration-engine/types/decoration'

interface OverlayRect {
  top: number
  left: number
  width: number
  height: number
}

export interface DecorationEditContext {
  isPreview: ComputedRef<boolean>
  /** 点击选中的选区（外边框常驻，不因 hover 其它选区而消失）；可与后台 BLOCK_HIGHLIGHT 同步 */
  pinnedSectionId: Ref<string | null>
  /** 指针当前悬停的选区（决定该选区内 block 虚线提示） */
  hoverSectionId: Ref<string | null>
  hoveredBlock: Ref<{ sectionId: string; blockId: string } | null>
  /** 与 useDecorationPreview / Admin 的 BLOCK_HIGHLIGHT 一致 */
  highlightedBlock: Readonly<Ref<DecorationHighlightedBlock | null | undefined>>
  setPinnedSection: (id: string | null) => void
  setHoverSection: (id: string | null) => void
  setHoveredBlock: (sectionId: string, blockId: string) => void
  /**
   * pointer 离开某个 block 时，若移向同 section 内其他 block 则不清理（避免虚线/实线闪一下）
   */
  tryClearHoveredFromBlock: (e: PointerEvent, sectionId: string, blockId: string) => void
  sectionRects: Ref<Record<string, OverlayRect>>
  blockRects: Ref<Record<string, OverlayRect & { sectionId: string; blockId: string }>>
  setSectionRect: (sectionId: string, rect: OverlayRect) => void
  setBlockRect: (sectionId: string, blockId: string, rect: OverlayRect) => void
}

export const decorationEditKey: InjectionKey<DecorationEditContext> = Symbol('decorationEdit')

/**
 * 子 block 使用；非预览或未 provide 时返回 null
 */
export function useDecorationEditOptional(): DecorationEditContext | null {
  return inject(decorationEditKey, null)
}

export function useDecorationEditOrDisabled(): DecorationEditContext {
  const v = useDecorationEditOptional()
  if (v) {
    return v
  }
  return {
    isPreview: computed(() => false),
    pinnedSectionId: ref(null),
    hoverSectionId: ref(null),
    hoveredBlock: ref(null),
    highlightedBlock: ref(undefined),
    setPinnedSection: () => {},
    setHoverSection: () => {},
    setHoveredBlock: () => {},
    tryClearHoveredFromBlock: () => {},
    sectionRects: ref({}),
    blockRects: ref({}),
    setSectionRect: () => {},
    setBlockRect: () => {},
  }
}
