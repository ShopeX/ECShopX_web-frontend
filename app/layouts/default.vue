<template>
  <div class="min-h-screen bg-gray-50" :style="layoutCssVars">
    <!-- 头部导航栏 - 支持 CMS 装修，API 失败时自动使用默认模板 -->
    <div
      ref="headerContainerRef"
      class="header-container sticky top-0 z-50 bg-white"
      :class="hideMobileHeader ? 'hidden lg:block' : ''"
      v-if="!useDecorationDrivenChrome"
    >
      <TemplateEngine template="header">
        <template #header>
          <BCHeaderBar
            @open-category-nav="handleOpenCategoryNav"
            @open-mini-cart="handleOpenMiniCart"
            @open-search="handleOpenSearch"
          />
        </template>
      </TemplateEngine>
      <!-- Web 端商城导航菜单（管理后台配置的 key，如 header_nav） -->
      <DecorationNavMenu menu-key="header_nav" />
    </div>

    <!-- 页面内容区域 -->
    <main class="mx-auto">
      <slot />
    </main>

    <!-- Footer 区域 -->
    <div v-if="!useDecorationDrivenChrome" :class="hideMobileFooter ? 'hidden lg:block' : ''">
      <BCFooter />
    </div>

    <!-- 全局搜索抽屉 - 使用 USlideover 包裹，和分类导航一致 -->
    <USlideover v-model:open="showSearchDrawer" side="left">
      <template #content>
        <BCSearchDrawer
          v-model="showSearchDrawer"
          :hot-keywords="hotKeywords"
          @close="showSearchDrawer = false"
          @search="handleSearch"
        />
      </template>
    </USlideover>

    <!-- 分类导航侧边栏 -->
    <USlideover v-model:open="showCategoryNav" side="left">
      <template #content>
        <BCCategoryNav
          v-model="showCategoryNav"
          @close="showCategoryNav = false"
          @search="handleCategorySearch"
          @change-region="handleChangeRegion"
        />
      </template>
    </USlideover>

    <!-- Mini 购物车侧边栏 -->
    <USlideover v-model:open="showMiniCart" side="right">
      <template #content>
        <BCMiniCart v-model="showMiniCart" @close="showMiniCart = false" />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BCHeaderBar from '~/components/BCHeaderBar/BCHeaderBar.vue'
import BCFooter from '~/components/BCFooter/BCFooter.vue'
import BCCategoryNav from '~/components/BCCategoryNav/BCCategoryNav.vue'
import BCMiniCart from '~/components/BCMiniCart/BCMiniCart.vue'
import BCSearchDrawer from '~/components/BCSearchDrawer/BCSearchDrawer.vue'

// 默认布局组件 - 使用完整的电商头部

const router = useRouter()
const route = useRoute()
const isEmbedded = ref(false)
if (import.meta.client) {
  try {
    isEmbedded.value = window.parent !== window
  } catch {
    isEmbedded.value = false
  }
}
const isDecorationPreview = computed(
  () => String(route.query.preview || '') === 'true' || isEmbedded.value
)
const isHomePage = computed(() => route.path === '/')
// 首页头尾统一由 app/pages/index.vue 的 DecorationRenderer 负责，避免与 layout 的模板引擎混用。
const useDecorationDrivenChrome = computed(() => isDecorationPreview.value || isHomePage.value)

const hideMobileHeader = computed(() => Boolean(route.meta.hideMobileHeader))
const hideMobileFooter = computed(() => Boolean(route.meta.hideMobileFooter))
const headerContainerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)
const layoutCssVars = computed(() => ({
  '--layout-header-height': `${headerHeight.value}px`,
}))

// 分类导航侧边栏状态
const showCategoryNav = ref(false)
// Mini 购物车侧边栏状态
const showMiniCart = ref(false)
// 搜索抽屉状态
const showSearchDrawer = ref(false)

// 热门搜索关键词
const hotKeywords = ref(['手袋', '双十二', '新品', '手表', '香水彩妆', '珠宝腕表', '手提袋'])
let headerResizeObserver: ResizeObserver | null = null

const updateHeaderHeight = () => {
  headerHeight.value = headerContainerRef.value?.offsetHeight ?? 0
}

// 手动处理打开分类导航
const handleOpenCategoryNav = () => {
  showCategoryNav.value = true
}

// 手动处理打开 Mini 购物车
const handleOpenMiniCart = () => {
  showMiniCart.value = true
}

// 手动处理打开搜索抽屉
const handleOpenSearch = () => {
  showSearchDrawer.value = true
}

/**
 * 处理搜索 - 跳转到商品列表页
 */
const handleSearch = (keyword: string) => {
  if (keyword.trim()) {
    showSearchDrawer.value = false
    router.push({
      path: '/collections/all',
      query: { keyword },
    })
  }
}

/**
 * 处理分类导航搜索
 */
const handleCategorySearch = (keyword: string) => {
  console.log('分类搜索:', keyword)
  // TODO: 实现搜索逻辑，例如跳转到搜索结果页
  if (keyword.trim()) {
    showCategoryNav.value = false
    router.push({
      path: '/search',
      query: { q: keyword },
    })
  }
}

/**
 * 处理更改配送地区
 */
const handleChangeRegion = () => {
  console.log('更改配送地区')
  // TODO: 实现地区选择逻辑，例如打开地区选择弹窗
}

onMounted(() => {
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)

  if (headerContainerRef.value && typeof ResizeObserver !== 'undefined') {
    headerResizeObserver = new ResizeObserver(updateHeaderHeight)
    headerResizeObserver.observe(headerContainerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeaderHeight)
  headerResizeObserver?.disconnect()
})
</script>
