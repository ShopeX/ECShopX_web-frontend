---
name: ecshopx-cms
description: "ECShopX CMS内容管理功能开发指南。包含页面渲染、组件库、模板引擎、版本管理、SEO优化等。适用场景: (1) 开发CMS页面渲染引擎 (2) 实现可配置页面组件 (3) 模板管理 (4) 页面发布和版本控制 (5) SEO元数据管理。采用简化架构，CMS数据通过API动态加载。"
---

# CMS 内容管理功能开发

## 概述

CMS（内容管理系统）允许运营人员通过配置生成页面，无需开发即可创建营销页面。

**核心功能**：
- 页面模板渲染
- 组件库（轮播图、商品推荐、图文等）
- 动态页面路由
- 页面配置加载
- SEO 元数据管理

**架构方案**：**方案 2（简化架构）** - 页面数据动态加载，不需要全局状态

## 快速开始

### 基本结构

```
app/
├── pages/
│   └── cms/
│       └── [slug].vue              # CMS 页面路由
│
├── components/cms/
│   ├── sections/                   # 区块组件
│   │   ├── HeroBanner.vue         # 主横幅
│   │   ├── ProductGrid.vue        # 商品网格
│   │   ├── ImageText.vue          # 图文
│   │   └── Carousel.vue           # 轮播图
│   └── CmsRenderer.vue            # 渲染引擎
│
├── composables/
│   └── useCms.ts                   # CMS 逻辑
│
└── infrastructure/http/clients/
    └── CmsApiClient.ts             # CMS API
```

## 核心功能实现

### 1. CMS 页面路由

```vue
<!-- app/pages/cms/[slug].vue -->
<template>
  <div>
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
    
    <CmsRenderer 
      v-else-if="pageData"
      :sections="pageData.sections"
      :config="pageData.config"
    />
    
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-300 mb-4">404</h1>
        <p class="text-gray-500">页面不存在</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { pageData, loading, loadPage } = useCms()

// 加载页面数据
onMounted(async () => {
  await loadPage(slug)
})

// 动态 SEO
useHead({
  title: computed(() => pageData.value?.seo?.title || ''),
  meta: computed(() => {
    if (!pageData.value?.seo) return []
    
    return [
      { name: 'description', content: pageData.value.seo.description },
      { name: 'keywords', content: pageData.value.seo.keywords },
      // Open Graph
      { property: 'og:title', content: pageData.value.seo.title },
      { property: 'og:description', content: pageData.value.seo.description },
      { property: 'og:image', content: pageData.value.seo.image }
    ]
  })
})
</script>
```

### 2. CMS 渲染引擎

```vue
<!-- app/components/cms/CmsRenderer.vue -->
<template>
  <div class="cms-page">
    <component
      v-for="(section, index) in sections"
      :key="index"
      :is="resolveComponent(section.type)"
      v-bind="section.props"
      :class="section.className"
    />
  </div>
</template>

<script setup lang="ts">
import { resolveComponent as vueResolveComponent } from 'vue'

interface Section {
  type: string
  props: Record<string, any>
  className?: string
}

interface Props {
  sections: Section[]
  config?: Record<string, any>
}

const props = defineProps<Props>()

// 组件映射
const componentMap: Record<string, any> = {
  'hero-banner': resolveAsyncComponent(() => import('./sections/HeroBanner.vue')),
  'product-grid': resolveAsyncComponent(() => import('./sections/ProductGrid.vue')),
  'image-text': resolveAsyncComponent(() => import('./sections/ImageText.vue')),
  'carousel': resolveAsyncComponent(() => import('./sections/Carousel.vue')),
  'html-content': resolveAsyncComponent(() => import('./sections/HtmlContent.vue'))
}

const resolveComponent = (type: string) => {
  return componentMap[type] || 'div'
}
</script>
```

### 3. CMS 区块组件示例

```vue
<!-- app/components/cms/sections/HeroBanner.vue -->
<template>
  <div 
    class="relative h-96 bg-cover bg-center"
    :style="{ backgroundImage: `url(${image})` }"
  >
    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
      <div class="text-center text-white max-w-2xl px-4">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-lg md:text-xl mb-8">
          {{ subtitle }}
        </p>
        <UButton 
          v-if="buttonText"
          :to="buttonLink"
          size="lg"
          color="white"
        >
          {{ buttonText }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  image: string
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
}

const props = defineProps<Props>()
</script>
```

```vue
<!-- app/components/cms/sections/ProductGrid.vue -->
<template>
  <div class="container mx-auto px-4 py-12">
    <h2 v-if="title" class="text-2xl font-bold mb-6 text-center">
      {{ title }}
    </h2>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  productIds: string[]  // 商品 ID 列表
}

const props = defineProps<Props>()

// 加载商品数据
const { products, loadProducts } = useProduct()

onMounted(async () => {
  if (props.productIds.length > 0) {
    await loadProducts({ ids: props.productIds })
  }
})
</script>
```

### 4. CMS Composable

```typescript
// app/composables/useCms.ts

import { ref, readonly } from 'vue'
import type { ICmsPage } from '~/types/cms'
import { cmsApiClient } from '~/infrastructure/http/clients/CmsApiClient'
import { logger } from '~/utils/log'

export function useCms() {
  const pageData = ref<ICmsPage | null>(null)
  const loading = ref(false)
  
  /**
   * 加载 CMS 页面
   */
  async function loadPage(slug: string) {
    loading.value = true
    
    try {
      const response = await cmsApiClient.getPage(slug)
      
      pageData.value = {
        id: response.id,
        slug: response.slug,
        title: response.title,
        sections: response.sections,
        config: response.config,
        seo: {
          title: response.seo_title,
          description: response.seo_description,
          keywords: response.seo_keywords,
          image: response.seo_image
        }
      }
      
      logger.info('[useCms] 加载页面成功:', slug)
    } catch (e: any) {
      logger.error('[useCms] 加载页面失败:', e)
      pageData.value = null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 预览页面（用于管理后台预览）
   */
  async function previewPage(pageId: string, version?: string) {
    try {
      const response = await cmsApiClient.previewPage(pageId, version)
      pageData.value = response
      
      logger.info('[useCms] 预览页面:', pageId, version)
    } catch (e: any) {
      logger.error('[useCms] 预览页面失败:', e)
      throw e
    }
  }
  
  return {
    pageData: readonly(pageData),
    loading: readonly(loading),
    
    loadPage,
    previewPage
  }
}
```

## 页面配置示例

### JSON 配置格式

```json
{
  "id": "page-001",
  "slug": "summer-sale",
  "title": "夏季大促",
  "sections": [
    {
      "type": "hero-banner",
      "props": {
        "image": "/images/summer-banner.jpg",
        "title": "夏季狂欢购",
        "subtitle": "全场5折起",
        "buttonText": "立即抢购",
        "buttonLink": "/collections/summer"
      }
    },
    {
      "type": "product-grid",
      "props": {
        "title": "热门商品",
        "productIds": ["001", "002", "003", "004"]
      }
    },
    {
      "type": "image-text",
      "props": {
        "image": "/images/feature.jpg",
        "title": "品质保证",
        "content": "100%正品保证，假一赔十",
        "imagePosition": "left"
      }
    }
  ],
  "seo": {
    "title": "夏季大促 - ECShopX",
    "description": "ECShopX夏季大促，全场5折起",
    "keywords": "夏季大促,促销,优惠",
    "image": "/images/summer-og.jpg"
  }
}
```

## 组件库规范

### 组件接口

每个 CMS 组件应该：

1. **接受配置 Props**：所有配置通过 props 传入
2. **完全独立**：不依赖全局状态
3. **响应式设计**：支持移动端和桌面端
4. **可配置样式**：支持自定义 className

### 标准组件清单

- ✅ HeroBanner - 主横幅
- ✅ ProductGrid - 商品网格
- ✅ ImageText - 图文组合
- ✅ Carousel - 轮播图
- ✅ HtmlContent - 富文本内容
- ✅ VideoPlayer - 视频播放器
- ✅ Countdown - 倒计时
- ✅ Testimonials - 用户评价

## 开发检查清单

**核心功能**：
- [ ] CMS 页面路由
- [ ] 渲染引擎
- [ ] 组件注册系统
- [ ] 页面数据加载
- [ ] SEO 元数据

**组件库**：
- [ ] 主横幅组件
- [ ] 商品网格组件
- [ ] 图文组合组件
- [ ] 轮播图组件
- [ ] 富文本组件

**优化**：
- [ ] 组件懒加载
- [ ] 图片懒加载
- [ ] SSR 支持
- [ ] 缓存策略

## 性能优化

### 组件懒加载

```typescript
const componentMap = {
  'hero-banner': defineAsyncComponent(() => 
    import('./sections/HeroBanner.vue')
  ),
  'product-grid': defineAsyncComponent(() => 
    import('./sections/ProductGrid.vue')
  )
}
```

### 页面缓存

```typescript
// 缓存 CMS 页面数据（10分钟）
const cacheKey = `cms_page_${slug}`
const cached = useSessionStorage(cacheKey, null)

if (cached.value) {
  pageData.value = cached.value
} else {
  const data = await loadPage(slug)
  cached.value = data
}
```

## 常见问题

**Q: 如何添加新的组件类型？**
A: 在 `components/cms/sections/` 创建组件，在 `componentMap` 中注册。

**Q: 如何处理组件内的商品数据？**
A: 组件内使用 `useProduct` composable 加载商品数据。

**Q: CMS 页面如何做 SEO？**
A: 使用 `useHead` 动态设置 meta 标签，支持 SSR。

**Q: 如何实现页面预览？**
A: 添加 `?preview=true&version=xxx` 参数，调用预览 API。

---

**相关 Skills**：
- `ecshopx-catalog` - 商品目录（CMS 中展示商品）
- `ecshopx-system` - 系统架构

**最后更新**：2025-01-12
