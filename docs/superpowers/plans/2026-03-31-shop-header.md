# BCShopHeader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `BCShopHeader` — the BBC store-specific header component (PC-first) with store info, smart search, category nav, follow toggle, and contact emit — and integrate it into `app/pages/shop/[id].vue`.

**Architecture:** Single-file component approach. `BCShopHeader.vue` owns all interaction logic (smart route-aware search, local follow state). `useHomeData` is extended with an optional `keywords` param so the shop homepage can reflect search queries from the URL. Search results stay on `/shop/[id]?q=keyword` (same page, no new route needed).

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Nuxt 3, Tailwind CSS, `UIcon` (heroicons), Node.js `node:test` for static source assertions.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `app/components/BCShopHeader/types.ts` | Props / Emits type definitions |
| Create | `app/components/BCShopHeader/BCShopHeader.vue` | PC store header component |
| Create | `app/components/BCShopHeader/shop-header.test.js` | Static source assertion tests |
| Modify | `app/composables/useHomeData.ts` | Add optional `keywords` param |
| Modify | `app/pages/shop/[id].vue` | Integrate BCShopHeader + watch `q` query |

---

## Task 1: Create BCShopHeader types and test scaffold

**Files:**
- Create: `app/components/BCShopHeader/types.ts`
- Create: `app/components/BCShopHeader/shop-header.test.js`

- [ ] **Step 1: Write the failing test scaffold**

Create `app/components/BCShopHeader/shop-header.test.js`:

```js
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const typesSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCShopHeader/types.ts'),
  'utf8'
)

const vuePath = path.resolve(process.cwd(), 'app/components/BCShopHeader/BCShopHeader.vue')
const vueSource = existsSync(vuePath) ? readFileSync(vuePath, 'utf8') : ''

const homeDataSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useHomeData.ts'),
  'utf8'
)

const shopPagePath = path.resolve(process.cwd(), 'app/pages/shop/[id].vue')
const shopPageSource = existsSync(shopPagePath) ? readFileSync(shopPagePath, 'utf8') : ''

test('BCShopHeaderProps defines required fields', () => {
  assert.match(typesSource, /distributorId:\s*string/)
  assert.match(typesSource, /logo:\s*string/)
  assert.match(typesSource, /name:\s*string/)
  assert.match(typesSource, /tagline:\s*string/)
  assert.match(typesSource, /categories:\s*string\[\]/)
  assert.match(typesSource, /followed\?:\s*boolean/)
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: FAIL — `app/components/BCShopHeader/types.ts` does not exist

- [ ] **Step 3: Create `app/components/BCShopHeader/types.ts`**

```ts
/**
 * BCShopHeader — BBC 店铺首页 Header 组件类型定义
 */

export interface BCShopHeaderProps {
  /** 店铺 ID，用于搜索路由跳转 */
  distributorId: string
  /** 店铺 Logo 图片 URL */
  logo: string
  /** 店铺名称 */
  name: string
  /** 店铺描述文案 */
  tagline: string
  /** 分类导航列表 */
  categories: string[]
  /** 初始关注状态，默认 false */
  followed?: boolean
}

export interface BCShopHeaderEmits {
  /** 关注/取消关注，携带最新布尔状态 */
  follow: [isFollowed: boolean]
  /** 联系客服点击 */
  contact: []
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add app/components/BCShopHeader/types.ts app/components/BCShopHeader/shop-header.test.js
git commit -m "feat(BCShopHeader): add types and test scaffold"
```

---

## Task 2: Create BCShopHeader.vue (PC layout)

**Files:**
- Create: `app/components/BCShopHeader/BCShopHeader.vue`
- Modify: `app/components/BCShopHeader/shop-header.test.js`

- [ ] **Step 1: Add test assertions**

Append to `app/components/BCShopHeader/shop-header.test.js`:

```js
test('BCShopHeader declares correct emits', () => {
  assert.match(vueSource, /emit\(['"]follow['"]/)
  assert.match(vueSource, /emit\(['"]contact['"]/)
})

test('BCShopHeader has required data-testid attributes', () => {
  assert.match(vueSource, /data-testid="shop-header"/)
  assert.match(vueSource, /data-testid="shop-header-search"/)
  assert.match(vueSource, /data-testid="shop-header-follow"/)
  assert.match(vueSource, /data-testid="shop-header-contact"/)
})

test('BCShopHeader follow button toggles isFollowed and emits', () => {
  assert.match(vueSource, /isFollowed\.value\s*=\s*!isFollowed\.value/)
  assert.match(vueSource, /emit\(['"]follow['"],\s*isFollowed\.value\)/)
})

test('BCShopHeader search navigates to shop page with q param', () => {
  assert.match(vueSource, /router\.replace/)
  assert.match(vueSource, /router\.push/)
  assert.match(vueSource, /props\.distributorId/)
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: 4 new tests FAIL — `BCShopHeader.vue` does not exist

- [ ] **Step 3: Create `app/components/BCShopHeader/BCShopHeader.vue`**

```vue
<template>
  <!-- PC store header — H5 layout to be added when design is provided -->
  <div
    class="hidden lg:flex w-full bg-[#f6f6f6] items-center justify-center px-4"
    data-testid="shop-header"
  >
    <div class="flex flex-1 items-center justify-between py-6">
      <!-- Left: Store Info -->
      <div class="flex items-center gap-4 shrink-0">
        <img :src="props.logo" :alt="props.name" class="w-9 h-9 object-cover" />
        <div class="flex flex-col gap-2">
          <p class="text-[14px] font-medium text-[#191A1D] leading-5 whitespace-nowrap">
            {{ props.name }}
          </p>
          <p class="text-[12px] text-[#99A1AF] leading-4 whitespace-nowrap">
            {{ props.tagline }}
          </p>
        </div>
      </div>

      <!-- Center: Search + Category Nav -->
      <div class="flex flex-col gap-2 items-start shrink-0">
        <!-- Search Box -->
        <div
          class="flex items-center justify-between w-[500px] h-10 bg-white border border-[#E5E7EB] pl-[9px] pr-[5px] py-[5px]"
          data-testid="shop-header-search"
        >
          <div class="flex items-center gap-[10px]">
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[#99A1AF] shrink-0" />
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="searchPlaceholder"
              class="bg-transparent text-[14px] text-[#99A1AF] leading-5 outline-none w-[360px]"
              @keyup.enter="onSearch"
            />
          </div>
          <button
            class="flex items-center justify-center px-2 py-1 bg-[#E5E7EB] h-full"
            @click="onSearch"
          >
            <span class="text-[12px] text-[#4A5565] leading-4 whitespace-nowrap">搜本店</span>
          </button>
        </div>

        <!-- Category Nav -->
        <div class="flex gap-4 items-center">
          <button
            v-for="cat in props.categories"
            :key="cat"
            class="text-[12px] text-[#4A5565] leading-4 hover:text-[#191A1D] transition-colors"
            @click="onCategoryClick(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-4 shrink-0">
        <!-- Follow Button -->
        <button
          class="flex items-center gap-1 px-[17px] py-[9px] border transition-colors"
          :class="isFollowed
            ? 'bg-[#0F0F10] border-[#0F0F10] text-white'
            : 'bg-transparent border-[#0F0F10] text-[#191A1D]'"
          data-testid="shop-header-follow"
          @click="toggleFollow"
        >
          <UIcon
            :name="isFollowed ? 'i-heroicons-check' : 'i-heroicons-heart'"
            class="w-4 h-4"
          />
          <span class="text-[12px] font-medium leading-4 whitespace-nowrap">
            {{ isFollowed ? '已关注' : '关注店铺' }}
          </span>
        </button>

        <!-- Contact Button -->
        <button
          class="flex items-center gap-1 px-4 py-2 bg-[#0F0F10] text-white"
          data-testid="shop-header-contact"
          @click="emit('contact')"
        >
          <UIcon name="i-heroicons-phone" class="w-4 h-4" />
          <span class="text-[12px] font-medium leading-4 whitespace-nowrap">联系客服</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BCShopHeaderProps, BCShopHeaderEmits } from './types'

const props = withDefaults(defineProps<BCShopHeaderProps>(), {
  followed: false,
})

const emit = defineEmits<BCShopHeaderEmits>()

const route = useRoute()
const router = useRouter()

// Search
const searchKeyword = ref('')
const searchPlaceholder = '搜索本店商品'

function onSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return

  const isOnShopPage = route.path === `/shop/${props.distributorId}`
  if (isOnShopPage) {
    router.replace({ query: { ...route.query, q: keyword } })
  } else {
    router.push({ path: `/shop/${props.distributorId}`, query: { q: keyword } })
  }
}

function onCategoryClick(category: string) {
  router.push({ path: `/shop/${props.distributorId}`, query: { category } })
}

// Follow toggle
const isFollowed = ref(props.followed)

function toggleFollow() {
  isFollowed.value = !isFollowed.value
  emit('follow', isFollowed.value)
}
</script>
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/BCShopHeader/BCShopHeader.vue app/components/BCShopHeader/shop-header.test.js
git commit -m "feat(BCShopHeader): create PC store header component with search and follow toggle"
```

---

## Task 3: Extend `useHomeData` with optional `keywords` param

**Files:**
- Modify: `app/composables/useHomeData.ts`
- Modify: `app/components/BCShopHeader/shop-header.test.js`

- [ ] **Step 1: Add test assertion**

Append to `app/components/BCShopHeader/shop-header.test.js`:

```js
test('useHomeData accepts optional keywords parameter', () => {
  assert.match(homeDataSource, /function useHomeData\s*\(\s*distributorId\?[^)]*keywords\?/)
})

test('useHomeData passes keywords to loadProducts', () => {
  assert.match(homeDataSource, /keywords:\s*keywords/)
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: 2 new tests FAIL

- [ ] **Step 3: Update `app/composables/useHomeData.ts`**

Replace the function signature and `loadProducts` call. Full updated file:

```ts
import { templateApiClient } from '~/infrastructure/http/clients/TemplateApiClient'
import { useProduct } from './useProduct'

export function useHomeData(distributorId?: string, keywords?: string) {
  const { loadProducts, products, listLoading: productsLoading } = useProduct()

  const pageConfig = ref<any>(null)
  const pending = ref(false)
  const error = ref<any>(null)

  async function fetchHomeData() {
    pending.value = true
    error.value = null

    try {
      // Parallel fetch for better performance
      const [configRes] = await Promise.all([
        templateApiClient.getTemplateConfig('index'),
        loadProducts({
          page: '1',
          pageSize: '20',
          item_type: 'normal',
          main_category: '0',
          is_tdk: '0',
          type: 'all',
          ...(distributorId && { distributor_id: distributorId }),
          ...(keywords && { keywords: keywords }),
        }),
      ])

      if (configRes) {
        pageConfig.value = configRes
      }
    } catch (e: any) {
      error.value = e
      console.error('[useHomeData] Fetch error:', e)
    } finally {
      pending.value = false
    }
  }

  // SSR Support
  const fetchWithSSR = () => {
    const cacheKey = distributorId ? `home-data-${distributorId}` : 'home-data'
    return useAsyncData(cacheKey, async () => {
      await fetchHomeData()
      return {
        pageConfig: pageConfig.value,
        products: products.value,
      }
    })
  }

  return {
    pageConfig,
    products,
    pending: computed(() => pending.value || productsLoading.value),
    error,
    fetchHomeData,
    fetchWithSSR,
  }
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: All 7 tests PASS

Also confirm the existing shop page tests still pass:

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useHomeData.ts app/components/BCShopHeader/shop-header.test.js
git commit -m "feat(BCShopHeader): extend useHomeData with optional keywords param"
```

---

## Task 4: Integrate BCShopHeader into `app/pages/shop/[id].vue`

**Files:**
- Modify: `app/pages/shop/[id].vue`
- Modify: `app/components/BCShopHeader/shop-header.test.js`

- [ ] **Step 1: Add test assertions**

Append to `app/components/BCShopHeader/shop-header.test.js`:

```js
test('shop/[id].vue includes BCShopHeader component', () => {
  assert.match(shopPageSource, /BCShopHeader/)
  assert.match(shopPageSource, /:distributor-id="distributorId"/)
})

test('shop/[id].vue passes q query param as keywords to useHomeData', () => {
  assert.match(shopPageSource, /route\.query\.q/)
  assert.match(shopPageSource, /useHomeData\(distributorId,/)
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: 2 new tests FAIL — `BCShopHeader` not yet in shop page

- [ ] **Step 3: Update `app/pages/shop/[id].vue`**

Replace the full file content:

```vue
<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-white">
      <!-- BBC Store Header -->
      <BCShopHeader
        :distributor-id="distributorId"
        :logo="shopInfo.logo"
        :name="shopInfo.name"
        :tagline="shopInfo.tagline"
        :categories="shopInfo.categories"
        :followed="shopInfo.followed"
        @follow="onFollow"
        @contact="onContact"
      />

      <!-- 1. Hero Banner Section -->
      <WCHeroBanner v-if="heroItems.length > 0" :items="heroItems" />

      <!-- 2. Main Content -->
      <main class="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <!-- 热门商品 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-popular-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">热门商品</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCProductCard
              v-for="product in popularProducts"
              :key="product.itemId"
              :product="product"
              mode="popular"
            />
          </div>
        </section>

        <!-- 新品推荐 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-new-arrival-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">新品</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCProductCard
              v-for="product in newArrivals"
              :key="product.itemId"
              :product="product"
              mode="new"
            />
          </div>
        </section>

        <!-- 品牌资讯 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-brand-news-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">品牌资讯</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCNewsCard v-for="item in brandNews" :key="item.id" :item="item" />
          </div>
        </section>
      </main>

      <!-- Loading State -->
      <div
        v-if="pending"
        data-testid="home-loading"
        class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import WCHeroBanner from '~/components/WCHeroBanner/WCHeroBanner.vue'
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import BCNewsCard from '~/components/BCNewsCard/BCNewsCard.vue'
import BCShopHeader from '~/components/BCShopHeader/BCShopHeader.vue'
import { useHomeData } from '~/composables/useHomeData'

const route = useRoute()
const distributorId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

// Read search keyword from URL query param
const keywords = computed(() => route.query.q as string | undefined)

const { products, pending, fetchHomeData } = useHomeData(distributorId, keywords.value)

definePageMeta({
  layout: false,
})

// Mock store info — replace with API data when available
const shopInfo = {
  logo: 'https://www.figma.com/api/mcp/asset/efb28441-c97e-49ad-b4ff-9c178ed5ac6e',
  name: '小米京东自营商城',
  tagline: '精选镇店好物，快来逛逛',
  categories: ['耳机', '数码产品', '电脑', '笔记本'],
  followed: false,
}

const heroItems = [
  {
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
    title: '声音可见',
    subtitle: '音乐便更有吸引力。舒适度更优秀，悦耳如昔。',
    link: '#',
  },
]

const brandNews = [
  {
    id: 1,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
  },
  {
    id: 2,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/499903fe1e08c926b9231a740b55d96768d41d0f.png',
  },
  {
    id: 3,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/ddb47e30da9c615963fd4aa5722a61a678e08f5e.png',
  },
  {
    id: 4,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/4a239fb9fcf5109253fd99820cdc96bdb98f7229.png',
  },
]

const popularProducts = computed(() => products.value.slice(0, 4))
const newArrivals = computed(() => products.value.slice(4, 12))

// Watch for q query param changes and re-fetch
watch(
  () => route.query.q,
  async (newQ) => {
    if (newQ !== undefined) {
      await fetchHomeData()
    }
  }
)

onMounted(() => {
  fetchHomeData()
})

function onFollow(isFollowed: boolean) {
  // TODO: call follow/unfollow API with distributorId
  console.log('[shop] follow toggled:', isFollowed)
}

function onContact() {
  // TODO: open customer service chat
  console.log('[shop] contact customer service')
}
</script>
```

- [ ] **Step 4: Run all tests**

```bash
node --test app/components/BCShopHeader/shop-header.test.js
```

Expected: All 9 tests PASS

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/shop/[id].vue app/components/BCShopHeader/shop-header.test.js
git commit -m "feat(BCShopHeader): integrate into shop homepage with keyword search support"
```
