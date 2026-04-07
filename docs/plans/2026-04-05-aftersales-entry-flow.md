# Aftersales Entry Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the order list page fetch fresh order detail plus aftersales reasons before opening the aftersales panel, while the order detail page reuses its current detail data and only fetches aftersales reasons.

**Architecture:** Move aftersales reason loading into a shared composable with cache, keep order-detail fetching page-specific, and make the panel render reason options from parent-provided data instead of a hardcoded local list. Use per-entry loading state on the order list page so the click has immediate feedback even though the panel opens only after data is ready.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, existing API clients/composables, Node `node:test` source-assertion tests.

---

### Task 1: Add aftersales reason API and shared cached loader

**Files:**
- Modify: `app/infrastructure/http/clients/AftersalesApiClient.ts`
- Create: `app/composables/useAftersalesReasonOptions.ts`
- Test: `app/pages/account/orders/aftersales-reason-loading.test.js`

**Step 1: Write the failing test**

Add assertions that:

- `AftersalesApiClient.ts` exposes a method for `GET /aftersales/reason/list`
- the shared composable caches normalized reason options

Suggested assertions:

```js
assert.match(apiClientSource, /async getAftersalesReasonList\(/)
assert.match(apiClientSource, /\/aftersales\/reason\/list/)
assert.match(reasonComposableSource, /useState\('aftersales-reason-options'/)
assert.match(reasonComposableSource, /function normalizeReasonOption/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/orders/aftersales-reason-loading.test.js
```

Expected: FAIL because the API method and shared composable do not exist yet.

**Step 3: Write minimal implementation**

Implement:

- `getAftersalesReasonList()` in `AftersalesApiClient.ts`
- `useAftersalesReasonOptions()` composable with:
  - cached `reasonOptions`
  - `loading`
  - `loadReasonOptions()`
  - a defensive `normalizeReasonOption()` helper

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/orders/aftersales-reason-loading.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/infrastructure/http/clients/AftersalesApiClient.ts app/composables/useAftersalesReasonOptions.ts app/pages/account/orders/aftersales-reason-loading.test.js
git commit -m "feat: add shared aftersales reason loader"
```

### Task 2: Make AftersalesPanel consume external reason options

**Files:**
- Modify: `app/pages/account/components/AftersalesPanel.vue`
- Test: `app/pages/account/orders/aftersales-panel-structure.test.js`

**Step 1: Write the failing test**

Extend the panel test so it asserts:

- `AftersalesPanel.vue` defines a `reasonOptions` prop
- `AftersalesFormContent` receives `:reason-options="reasonOptions"`
- the old local hardcoded computed reason list is removed

Suggested assertions:

```js
assert.match(panelSource, /reasonOptions: \{\s*type: Array/)
assert.match(panelSource, /:reason-options="reasonOptions"/)
assert.doesNotMatch(panelSource, /const reasonOptions = computed/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/orders/aftersales-panel-structure.test.js
```

Expected: FAIL because the panel still owns hardcoded reasons.

**Step 3: Write minimal implementation**

Update `AftersalesPanel.vue` to:

- accept `reasonOptions` from props
- pass the prop through to `AftersalesFormContent`
- remove the local computed reason list

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/orders/aftersales-panel-structure.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/pages/account/components/AftersalesPanel.vue app/pages/account/orders/aftersales-panel-structure.test.js
git commit -m "refactor: make aftersales panel use external reasons"
```

### Task 3: Change order list aftersales entry to fetch detail plus reasons before opening

**Files:**
- Modify: `app/pages/account/orders/index.vue`
- Test: `app/pages/account/orders/aftersales-entry-list-flow.test.js`

**Step 1: Write the failing test**

Add assertions that the list page:

- imports `orderApiClient` or a detail fetch helper
- loads reason options before opening
- uses `Promise.all` or equivalent combined waiting
- tracks per-order aftersales opening state

Suggested assertions:

```js
assert.match(source, /const openingAftersalesOrderIds = ref/)
assert.match(source, /await Promise\.all\(\[/)
assert.match(source, /orderApiClient\.getOrderDetail\(order\.orderId\)/)
assert.match(source, /loadReasonOptions\(\)/)
assert.match(source, /aftersalesVisible\.value = true/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/orders/aftersales-entry-list-flow.test.js
```

Expected: FAIL because the page currently opens directly from `order.items`.

**Step 3: Write minimal implementation**

In `index.vue`:

- add per-order opening state
- fetch fresh order detail and reason options before opening
- map fresh detail API items into `AftersalesPanelItem[]`
- pass loaded reason options into `<AftersalesPanel ... />`
- wire button disabled/loading feedback for the active order

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/orders/aftersales-entry-list-flow.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/pages/account/orders/index.vue app/pages/account/orders/aftersales-entry-list-flow.test.js
git commit -m "feat: preload aftersales data from order list"
```

### Task 4: Change order detail aftersales entry to reuse detail data and fetch reasons only

**Files:**
- Modify: `app/pages/account/orders/[id].vue`
- Test: `app/pages/account/orders/aftersales-entry-detail-flow.test.js`

**Step 1: Write the failing test**

Add assertions that the detail page:

- loads reason options before opening
- does not call `fetchOrderDetail(orderId)` inside `openAftersales`
- still maps items from `order.value?.items`

Suggested assertions:

```js
assert.match(source, /loadReasonOptions\(\)/)
assert.match(source, /const items = \(order\.value\?\.items \?\? \[\]\)\.map/)
assert.doesNotMatch(source, /async function openAftersales\(\)[\s\S]*fetchOrderDetail\(orderId\)/)
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --test app/pages/account/orders/aftersales-entry-detail-flow.test.js
```

Expected: FAIL because the detail page does not load reasons yet.

**Step 3: Write minimal implementation**

In `[id].vue`:

- load reason options before opening the panel
- keep item mapping from current `order.value`
- pass loaded reason options into `<AftersalesPanel ... />`

**Step 4: Run test to verify it passes**

Run:

```bash
node --test app/pages/account/orders/aftersales-entry-detail-flow.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/pages/account/orders/[id].vue app/pages/account/orders/aftersales-entry-detail-flow.test.js
git commit -m "feat: preload aftersales reasons on order detail"
```

### Task 5: Verify the full aftersales source contract

**Files:**
- Test: `app/pages/account/orders/aftersales-panel-structure.test.js`
- Test: `app/pages/account/orders/aftersales-submit-payload.test.js`
- Test: `app/pages/account/orders/aftersales-reason-loading.test.js`
- Test: `app/pages/account/orders/aftersales-entry-list-flow.test.js`
- Test: `app/pages/account/orders/aftersales-entry-detail-flow.test.js`

**Step 1: Run the focused test suite**

Run:

```bash
node --test \
  app/pages/account/orders/aftersales-panel-structure.test.js \
  app/pages/account/orders/aftersales-submit-payload.test.js \
  app/pages/account/orders/aftersales-reason-loading.test.js \
  app/pages/account/orders/aftersales-entry-list-flow.test.js \
  app/pages/account/orders/aftersales-entry-detail-flow.test.js
```

Expected: all tests PASS.

**Step 2: Run lint on changed files if practical**

Run:

```bash
pnpm exec eslint app/infrastructure/http/clients/AftersalesApiClient.ts app/composables/useAftersalesReasonOptions.ts app/pages/account/components/AftersalesPanel.vue app/pages/account/orders/index.vue app/pages/account/orders/[id].vue
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add app/infrastructure/http/clients/AftersalesApiClient.ts app/composables/useAftersalesReasonOptions.ts app/pages/account/components/AftersalesPanel.vue app/pages/account/orders/index.vue app/pages/account/orders/[id].vue app/pages/account/orders/*.test.js
git commit -m "feat: unify aftersales entry loading flow"
```
