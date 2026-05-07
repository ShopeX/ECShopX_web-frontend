<template>
  <NuxtLayout
    :header-decoration-dsl="headerRenderDsl"
    :footer-decoration-dsl="footerRenderDsl"
    :decoration-preview-session-key="DECORATION_PAGE_TYPE"
    :highlighted-block="highlightedBlock"
  >
    <div class="min-h-screen bg-white">
      <DecorationRenderer
        :dsl="pageRenderDsl"
        :preview-session-key="DECORATION_PAGE_TYPE"
        :highlighted-block="highlightedBlock"
        data-testid="home-decoration-renderer-page"
      >
        <!-- <HomePageDecorationFallback
          :page-config="pageConfig"
          :products="fallbackProducts"
          :pending="pending"
        /> -->
      </DecorationRenderer>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import DecorationRenderer from '~/decoration-engine/components/DecorationRenderer.vue'
import HomePageDecorationFallback from '~/components/home/HomePageDecorationFallback.vue'
import { useHomeData } from '~/composables/useHomeData'
import type { IProduct } from '~/components/BCProductCard/types'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'
import { useDecorationPageDslFetch } from '~/decoration-engine/composables/useDecorationPageDslFetch'
import { useDecorationRouteContext } from '~/decoration-engine/composables/useDecorationRouteContext'
import { useHomeDecorationSplit } from '~/decoration-engine/composables/useHomeDecorationSplit'
import { hasDecorationSections, type DecorationDSL } from '~/decoration-engine/types/decoration'

/** 与后台、postMessage、`preview-session-key` 保持一致；其他页面改为各自 pageType 并复用下方 composables */
const DECORATION_PAGE_TYPE = 'home' as const satisfies DecorationDSL['pageType']
const DECORATION_PAGE_ID = 'home'

const { isPreview } = useDecorationRouteContext()
const { pageConfig, products, pending, fetchHomeData } = useHomeData()
const fallbackProducts = computed(() => products.value as ReadonlyArray<IProduct>)
const {
  dsl: previewDsl,
  pageDsl: previewPageDsl,
  globalDsl: previewGlobalDsl,
  highlightedBlock,
} = useDecorationPreview(DECORATION_PAGE_TYPE)
const hasRequestedFallback = ref(false)

const { ssrDsl } = await useDecorationPageDslFetch({
  pageType: DECORATION_PAGE_TYPE,
  pageId: DECORATION_PAGE_ID,
})

const { activePageDsl, headerRenderDsl, footerRenderDsl, pageRenderDsl } = useHomeDecorationSplit({
  ssrDsl,
  previewDsl,
  previewPageDsl,
  previewGlobalDsl,
})

const shouldRenderDecoration = computed(() => hasDecorationSections(activePageDsl.value))

// Disable default layout wrapping
definePageMeta({
  layout: false,
})

// Lifecycle：预览态由后台推送 DSL，不拉首页兜底数据
onMounted(() => {
  if (isPreview.value) return
  if (!shouldRenderDecoration.value && !hasRequestedFallback.value) {
    hasRequestedFallback.value = true
    fetchHomeData()
  }
})
</script>
