# Aftersales Detail Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone aftersales detail page that opens from the aftersales list, matches the supplied Figma PC/H5 layouts, and loads real data from `GET /wxapp/aftersales/info`.

**Architecture:** Add a dedicated aftersales detail route and a detail-specific composable/model path instead of reusing the account-center shell or the generic order detail page. Keep list navigation, API access, payload normalization, and page sections separate so the route remains clean and the data contract stays isolated inside the aftersales layer.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, existing HTTP client / transformer patterns, Tailwind utility classes already used in the repo, Node `node:test` source-assertion tests.

---

### Task 1: Add aftersales detail API contract coverage

**Files:**
- Modify: `app/infrastructure/http/clients/AftersalesApiClient.ts`
- Modify: `app/types/api/aftersales.ts`
- Test: `app/pages/account/aftersales/aftersales-detail-api.test.js`

**Step 1: Write the failing test**

Add assertions that:

- `AftersalesApiClient.ts` exposes `getAftersalesDetail`
- the client calls `/wxapp/aftersales/info`
- the request includes `aftersales_bn`
- the shared aftersales types define a detail response/model contract

Suggested assertions:

```js
assert.match(apiClientSource, /async getAftersalesDetail\(/)
assert.match(apiClientSource, /\/wxapp\/aftersales\/info/)
assert.match(apiClientSource, /aftersales_bn:/)
assert.match(typesSource, /IAftersalesDetailModel/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-api.test.js
```

Expected: FAIL because detail API loading and dedicated detail types do not exist yet.

**Step 3: Write minimal implementation**

Implement:

- `getAftersalesDetail()` in `AftersalesApiClient.ts`
- detail request/response typing in `app/types/api/aftersales.ts`
- keep the odd `aftersales_bn` / `item_id` request contract localized to the client API

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-api.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/infrastructure/http/clients/AftersalesApiClient.ts app/types/api/aftersales.ts app/pages/account/aftersales/aftersales-detail-api.test.js
git commit -m "feat: add aftersales detail api contract"
```

### Task 2: Add aftersales detail model transformation

**Files:**
- Modify: `app/infrastructure/transformers/aftersalesTransformer.ts`
- Test: `app/pages/account/aftersales/aftersales-detail-transformer.test.js`

**Step 1: Write the failing test**

Add assertions that the transformer:

- exposes a dedicated detail transform method
- reads `detail[]`
- builds receiver info, reason info, payment info, and order info fields
- maps progress/status into a page-ready detail model

Suggested assertions:

```js
assert.match(source, /static toAftersalesDetailModel\(/)
assert.match(source, /detail \|\|/)
assert.match(source, /receiverName:/)
assert.match(source, /reason:/)
assert.match(source, /paymentMethod:/)
assert.match(source, /progressSteps:/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-transformer.test.js
```

Expected: FAIL because only list-level transformation exists.

**Step 3: Write minimal implementation**

Implement `toAftersalesDetailModel()` with:

- normalized aftersales id / order id / store name
- normalized items from `detail[]`
- receiver information from `contact`, `mobile`, and address-related fields
- aftersales reason and description
- evidence image list normalization
- payment / order summary fields with safe empty fallbacks
- progress step derivation from `aftersales_status` and `progress`

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-transformer.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/infrastructure/transformers/aftersalesTransformer.ts app/pages/account/aftersales/aftersales-detail-transformer.test.js
git commit -m "feat: add aftersales detail transformer"
```

### Task 3: Add detail composable for route-level loading

**Files:**
- Create: `app/composables/useAftersalesDetail.ts`
- Test: `app/pages/account/aftersales/aftersales-detail-composable.test.js`

**Step 1: Write the failing test**

Add assertions that the composable:

- reads the route id
- calls `aftersalesApiClient.getAftersalesDetail`
- transforms the response with `AftersalesTransformer.toAftersalesDetailModel`
- exposes `detail`, `loading`, `error`, and `fetchAftersalesDetail`

Suggested assertions:

```js
assert.match(source, /useRoute\(\)/)
assert.match(source, /aftersalesApiClient\.getAftersalesDetail/)
assert.match(source, /AftersalesTransformer\.toAftersalesDetailModel/)
assert.match(source, /const detail = ref/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-composable.test.js
```

Expected: FAIL because the composable does not exist.

**Step 3: Write minimal implementation**

Create `useAftersalesDetail.ts` that:

- reads the route param
- loads the detail once on page entry
- exposes reactive `detail`, `loading`, `error`
- keeps toast/error handling at composable boundary

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-composable.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/composables/useAftersalesDetail.ts app/pages/account/aftersales/aftersales-detail-composable.test.js
git commit -m "feat: add aftersales detail composable"
```

### Task 4: Make list cards navigate to the new detail route

**Files:**
- Modify: `app/pages/account/components/AftersalesOrderCard.vue`
- Test: `app/pages/account/aftersales/aftersales-card-navigation.test.js`

**Step 1: Write the failing test**

Add assertions that the card:

- uses router navigation or locale-aware link behavior
- routes to `/account/aftersales/${order.aftersalesId}`
- keeps the current card content structure intact

Suggested assertions:

```js
assert.match(source, /navigateTo|NuxtLink|localePath/)
assert.match(source, /\/account\/aftersales\/\$\{order\.aftersalesId\}/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-card-navigation.test.js
```

Expected: FAIL because the list card does not yet route into a detail page.

**Step 3: Write minimal implementation**

Update `AftersalesOrderCard.vue` to:

- make the card or a clear affordance clickable
- navigate to the new detail route using `order.aftersalesId`
- preserve current list rendering

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-card-navigation.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/pages/account/components/AftersalesOrderCard.vue app/pages/account/aftersales/aftersales-card-navigation.test.js
git commit -m "feat: link aftersales cards to detail page"
```

### Task 5: Add page section components and detail route structure

**Files:**
- Create: `app/pages/account/components/AftersalesDetailProgress.vue`
- Create: `app/pages/account/components/AftersalesDetailItems.vue`
- Create: `app/pages/account/components/AftersalesDetailInfoSection.vue`
- Create: `app/pages/account/components/AftersalesDetailSummary.vue`
- Create: `app/pages/account/aftersales/[id].vue`
- Test: `app/pages/account/aftersales/aftersales-detail-structure.test.js`

**Step 1: Write the failing test**

Add assertions that the detail page:

- exists at `app/pages/account/aftersales/[id].vue`
- uses `useAftersalesDetail`
- renders the major Figma sections
- includes PC and H5 summary layouts
- includes placeholder action buttons without real business handlers

Suggested assertions:

```js
assert.match(pageSource, /useAftersalesDetail/)
assert.match(pageSource, /AftersalesDetailProgress/)
assert.match(pageSource, /AftersalesDetailItems/)
assert.match(pageSource, /AftersalesDetailInfoSection/)
assert.match(pageSource, /AftersalesDetailSummary/)
assert.match(pageSource, /返回售后订单列表|返回订单列表/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-structure.test.js
```

Expected: FAIL because the route and page components do not exist yet.

**Step 3: Write minimal implementation**

Create the new detail page and section components:

- independent back row
- progress bar matching Figma structure
- product list block
- receiver / reason / payment / order info sections
- desktop right sidebar
- mobile stacked info blocks and summary strip
- visual placeholder buttons only
- first-load skeleton state

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-structure.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/pages/account/components/AftersalesDetailProgress.vue app/pages/account/components/AftersalesDetailItems.vue app/pages/account/components/AftersalesDetailInfoSection.vue app/pages/account/components/AftersalesDetailSummary.vue app/pages/account/aftersales/[id].vue app/pages/account/aftersales/aftersales-detail-structure.test.js
git commit -m "feat: add aftersales detail page layout"
```

### Task 6: Verify the full aftersales detail flow

**Files:**
- Test: `app/pages/account/aftersales/aftersales-detail-api.test.js`
- Test: `app/pages/account/aftersales/aftersales-detail-transformer.test.js`
- Test: `app/pages/account/aftersales/aftersales-detail-composable.test.js`
- Test: `app/pages/account/aftersales/aftersales-card-navigation.test.js`
- Test: `app/pages/account/aftersales/aftersales-detail-structure.test.js`
- Test: `app/pages/account/aftersales/aftersales-page-structure.test.js`

**Step 1: Run the focused test suite**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-detail-api.test.js app/pages/account/aftersales/aftersales-detail-transformer.test.js app/pages/account/aftersales/aftersales-detail-composable.test.js app/pages/account/aftersales/aftersales-card-navigation.test.js app/pages/account/aftersales/aftersales-detail-structure.test.js app/pages/account/aftersales/aftersales-page-structure.test.js
```

Expected: PASS.

**Step 2: Run broader aftersales regression**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-api-alignment.test.js app/pages/account/aftersales/aftersales-page-structure.test.js app/pages/account/orders/orders-aftersales-status.test.js app/pages/account/orders/aftersales-panel-structure.test.js app/pages/account/orders/aftersales-submit-payload.test.js app/pages/account/orders/aftersales-reason-loading.test.js app/pages/account/orders/aftersales-entry-list-flow.test.js app/pages/account/orders/aftersales-entry-detail-flow.test.js
```

Expected: PASS without breaking current list / apply flows.

**Step 3: Optional lint**

Run:

```bash
pnpm exec eslint app/infrastructure/http/clients/AftersalesApiClient.ts app/infrastructure/transformers/aftersalesTransformer.ts app/types/api/aftersales.ts app/composables/useAftersalesDetail.ts app/pages/account/components/AftersalesDetailProgress.vue app/pages/account/components/AftersalesDetailItems.vue app/pages/account/components/AftersalesDetailInfoSection.vue app/pages/account/components/AftersalesDetailSummary.vue app/pages/account/components/AftersalesOrderCard.vue app/pages/account/aftersales/[id].vue
```

Expected: Either PASS, or the same existing repo-level eslint config failure already seen elsewhere. Do not treat the known config issue as a regression from this work.

**Step 4: Commit**

```bash
git add app/infrastructure/http/clients/AftersalesApiClient.ts app/infrastructure/transformers/aftersalesTransformer.ts app/types/api/aftersales.ts app/composables/useAftersalesDetail.ts app/pages/account/components/AftersalesDetailProgress.vue app/pages/account/components/AftersalesDetailItems.vue app/pages/account/components/AftersalesDetailInfoSection.vue app/pages/account/components/AftersalesDetailSummary.vue app/pages/account/components/AftersalesOrderCard.vue app/pages/account/aftersales/[id].vue app/pages/account/aftersales/*.test.js
git commit -m "feat: add aftersales detail page"
```
