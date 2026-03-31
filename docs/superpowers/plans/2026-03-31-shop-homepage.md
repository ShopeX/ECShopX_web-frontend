# Shop Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a BBC store homepage at `/shop/[id]` that mirrors the platform `index.vue` but filters products by `distributor_id`.

**Architecture:** Add `distributor_id` to the item API type and client, extend `useHomeData` with an optional `distributorId` parameter (zero impact on `index.vue`), then create the new page reusing all existing components.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript, Tailwind CSS, Node.js built-in test runner (`node:test`)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/types/api/item.ts` | Add `distributor_id?: string` to `IItemListParams` |
| Modify | `app/infrastructure/http/clients/ItemApiClient.ts` | Transparently pass `distributor_id` query param |
| Modify | `app/composables/useHomeData.ts` | Accept optional `distributorId`, forward to `loadProducts` |
| Create | `app/pages/shop/[id].vue` | Store homepage — same structure as `index.vue` |
| Create | `app/pages/shop/shop-homepage.test.js` | Static source assertions for all above |

---

## Task 1: Add `distributor_id` to `IItemListParams`

**Files:**
- Create: `app/pages/shop/shop-homepage.test.js`
- Modify: `app/types/api/item.ts`

- [ ] **Step 1: Write the failing test**

Create `app/pages/shop/shop-homepage.test.js`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const itemTypesSource = readFileSync(
  path.resolve(process.cwd(), 'app/types/api/item.ts'),
  'utf8'
)
const itemClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/ItemApiClient.ts'),
  'utf8'
)
const homeDataSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useHomeData.ts'),
  'utf8'
)
const shopPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/shop/[id].vue'),
  'utf8'
)

test('IItemListParams has optional distributor_id field', () => {
  assert.match(itemTypesSource, /distributor_id\?:\s*string/)
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: FAIL — `distributor_id?: string` not found in `IItemListParams`

- [ ] **Step 3: Add `distributor_id` to `IItemListParams`**

In `app/types/api/item.ts`, inside `IItemListParams`, after the `keywords?: string` line add:

```ts
  distributor_id?: string
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: PASS (only the one test runs; others fail because files don't exist yet — that's fine)

- [ ] **Step 5: Commit**

```bash
git add app/types/api/item.ts app/pages/shop/shop-homepage.test.js
git commit -m "feat(shop): add distributor_id to IItemListParams"
```

---

## Task 2: Forward `distributor_id` in `ItemApiClient.getItemList`

**Files:**
- Modify: `app/infrastructure/http/clients/ItemApiClient.ts`
- Modify: `app/pages/shop/shop-homepage.test.js`

- [ ] **Step 1: Add test assertion**

Append to `app/pages/shop/shop-homepage.test.js` (before the closing of the file):

```js
test('ItemApiClient.getItemList passes distributor_id query param when provided', () => {
  assert.match(itemClientSource, /distributor_id.*params\.distributor_id/)
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: FAIL — `distributor_id` not yet forwarded in client

- [ ] **Step 3: Implement in `ItemApiClient.getItemList`**

In `app/infrastructure/http/clients/ItemApiClient.ts`, inside the `apiParams` object in `getItemList`, add after the `keywords` spread line:

```ts
      ...(params.distributor_id && { distributor_id: params.distributor_id }),
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: Tasks 1 & 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/infrastructure/http/clients/ItemApiClient.ts app/pages/shop/shop-homepage.test.js
git commit -m "feat(shop): forward distributor_id in ItemApiClient.getItemList"
```

---

## Task 3: Extend `useHomeData` to accept optional `distributorId`

**Files:**
- Modify: `app/composables/useHomeData.ts`
- Modify: `app/pages/shop/shop-homepage.test.js`

- [ ] **Step 1: Add test assertions**

Append to `app/pages/shop/shop-homepage.test.js`:

```js
test('useHomeData accepts optional distributorId parameter', () => {
  assert.match(homeDataSource, /function useHomeData\s*\(\s*distributorId\?/)
})

test('useHomeData passes distributor_id to loadProducts', () => {
  assert.match(homeDataSource, /distributor_id:\s*distributorId/)
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: 2 new tests FAIL

- [ ] **Step 3: Update `useHomeData.ts`**

Replace the function signature and the `loadProducts` call. The full updated file:

```ts
import { templateApiClient } from '~/infrastructure/http/clients/TemplateApiClient'
import { useProduct } from './useProduct'

export function useHomeData(distributorId?: string) {
  const { loadProducts, products, listLoading: productsLoading } = useProduct()

  const pageConfig = ref<any>(null)
  const pending = ref(false)
  const error = ref<any>(null)

  async function fetchHomeData() {
    pending.value = true
    error.value = null

    try {
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

  const fetchWithSSR = () => {
    return useAsyncData('home-data', async () => {
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

- [ ] **Step 4: Run tests to confirm they pass**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: All 4 tests so far PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useHomeData.ts app/pages/shop/shop-homepage.test.js
git commit -m "feat(shop): extend useHomeData with optional distributorId param"
```

---

## Task 4: Create `app/pages/shop/[id].vue`

**Files:**
- Create: `app/pages/shop/[id].vue`
- Modify: `app/pages/shop/shop-homepage.test.js`

- [ ] **Step 1: Add test assertions**

Append to `app/pages/shop/shop-homepage.test.js`:

```js
test('shop page uses route.params.id as distributorId', () => {
  assert.match(shopPageSource, /route\.params\.id/)
  assert.match(shopPageSource, /useHomeData\(distributorId\)/)
})

test('shop page renders hero banner, popular products, new arrivals and brand news sections', () => {
  assert.match(shopPageSource, /data-testid="home-popular-section"/)
  assert.match(shopPageSource, /data-testid="home-new-arrival-section"/)
  assert.match(shopPageSource, /data-testid="home-brand-news-section"/)
  assert.match(shopPageSource, /WCHeroBanner/)
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: FAIL — `app/pages/shop/[id].vue` does not exist yet

- [ ] **Step 3: Create `app/pages/shop/[id].vue`**

```vue
<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-white">
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
import { useHomeData } from '~/composables/useHomeData'

const route = useRoute()
const distributorId = route.params.id as string

const { products, pending, fetchHomeData } = useHomeData(distributorId)

definePageMeta({
  layout: false,
})

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

onMounted(() => {
  fetchHomeData()
})
</script>
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
node --test app/pages/shop/shop-homepage.test.js
```

Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/shop/[id].vue app/pages/shop/shop-homepage.test.js
git commit -m "feat(shop): create BBC store homepage at /shop/[id]"
```
