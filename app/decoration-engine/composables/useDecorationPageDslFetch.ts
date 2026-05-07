import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  normalizeDecorationDSL,
  type DecorationDSL,
  type PageType,
} from '~/decoration-engine/types/decoration'
import { isDecorationPreviewActiveOnRoute } from '~/decoration-engine/composables/useDecorationRouteContext'

export interface UseDecorationPageDslFetchOptions {
  /** 与 `useDecorationPreview(pageType)`、后台协议中的 pageType 一致 */
  pageType: PageType
  /**
   * 请求后端时的 `pageId`（常与模板 ID 一致）；默认与 `pageType` 相同。
   * 首页一般为 `'home'`。
   */
  pageId?: MaybeRefOrGetter<string>
}

/**
 * 拉取单页装修 DSL（`/api/decoration/:pageType`），行为与首页 `index.vue` 原逻辑对齐。
 *
 * 新页面接入步骤概要：
 * 1. 在 `PageType` 中增加枚举值（若尚未有）
 * 2. 本 composable 传入相同 `pageType` / `pageId`
 * 3. `useDecorationPreview(pageType)` + `useHomeDecorationSplit`（可不传 `isPreview`）+ 模板里 `preview-session-key` / layout 上 `decoration-preview-session-key` 与 **同一 pageType** 对齐
 * 4. 仅当要切 `design` layout 或业务上要区分预览时，再在页面引入 `useDecorationRouteContext`（见该文件说明）
 */
export async function useDecorationPageDslFetch(options: UseDecorationPageDslFetchOptions) {
  const route = useRoute()
  const pageId = computed(() => toValue(options.pageId) ?? options.pageType)

  const { data: ssrDsl } = await useFetch(
    () => `/api/decoration/${options.pageType}`,
    {
      query: computed(() => ({ pageId: pageId.value })),
      default: () => null,
      /** 设计器（designMode=1）内由 iframe 推送 DSL，跳过首包 SSR 拉取 */
      immediate: !isDecorationPreviewActiveOnRoute(route),
      transform: (value): DecorationDSL | null => normalizeDecorationDSL(value, null),
    }
  )

  return { ssrDsl, pageId }
}
