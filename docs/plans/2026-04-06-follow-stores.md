# Follow Stores Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the account "关注店铺" page with real follow-store list data, BBC-only menu visibility, and responsive PC/H5 layouts.

**Architecture:** Reuse the existing account page shell and menu patterns, add a dedicated follow-store data pipeline, and render store cards from a transformer-backed view model. Keep business-mode gating centralized around `getBusinessMode() === 'b2b'` so PC and H5 menu entries stay aligned.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript, existing `$api` HTTP client, node:test file-structure tests, existing account page components.

---

### Task 1: Define follow-store tests first

**Files:**
- Create: `app/pages/account/follow-stores/follow-stores-api.test.js`
- Create: `app/pages/account/follow-stores/follow-stores-transformer.test.js`
- Create: `app/pages/account/follow-stores/follow-stores-page-structure.test.js`
- Create: `app/pages/account/follow-stores/follow-stores-menu-gating.test.js`

**Step 1: Write the failing API client test**

Assert the source contains:

- `'/wxapp/member/collect/distribution'`
- `method: 'GET'`
- `method: 'DELETE'`

**Step 2: Run test to verify it fails**

Run: `node --test app/pages/account/follow-stores/follow-stores-api.test.js`

Expected: FAIL because the client file does not exist yet.

**Step 3: Write the failing transformer test**

Assert the source contains fallback parsing for:

- store id and distributor id
- store name and logo
- slogan/description
- `items.slice(0, 4)` or equivalent 4-item limit

**Step 4: Run test to verify it fails**

Run: `node --test app/pages/account/follow-stores/follow-stores-transformer.test.js`

Expected: FAIL because the transformer file does not exist yet.

**Step 5: Write the failing page-structure test**

Assert `app/pages/account/follow-stores.vue` contains:

- `data-testid="account-follow-stores-page"`
- `FollowedStoreCard`
- `AccountMenu`
- `AccountH5FilterBar`
- `loadFollowedStores`

**Step 6: Run test to verify it fails**

Run: `node --test app/pages/account/follow-stores/follow-stores-page-structure.test.js`

Expected: FAIL because the page file does not exist yet.

**Step 7: Write the failing BBC menu gating test**

Assert `AccountMenu.vue` and `AccountH5FilterBar.vue` use `getBusinessMode()` and include the `follow-stores` / `followStores` menu item only inside BBC gating logic.

**Step 8: Run test to verify it fails**

Run: `node --test app/pages/account/follow-stores/follow-stores-menu-gating.test.js`

Expected: FAIL because the gating logic does not exist yet.

### Task 2: Add the follow-store API client

**Files:**
- Create: `app/infrastructure/http/clients/CollectDistributionApiClient.ts`
- Modify: `app/infrastructure/http/clients/index.ts`
- Test: `app/pages/account/follow-stores/follow-stores-api.test.js`

**Step 1: Write minimal client implementation**

Add:

- `getCollectDistributionList(params?)`
- `removeCollectDistributions(distributionIds, isEmpty = false)`

Both should use the project `$api` client and target `/wxapp/member/collect/distribution`.

**Step 2: Export the client**

Update `app/infrastructure/http/clients/index.ts` to export the new client.

**Step 3: Run API test**

Run: `node --test app/pages/account/follow-stores/follow-stores-api.test.js`

Expected: PASS

**Step 4: Commit**

```bash
git add app/infrastructure/http/clients/CollectDistributionApiClient.ts app/infrastructure/http/clients/index.ts app/pages/account/follow-stores/follow-stores-api.test.js
git commit -m "feat: add follow store api client"
```

### Task 3: Add the follow-store transformer

**Files:**
- Create: `app/infrastructure/transformers/collectDistributionTransformer.ts`
- Modify: `app/infrastructure/transformers/index.ts`
- Test: `app/pages/account/follow-stores/follow-stores-transformer.test.js`

**Step 1: Implement the page model types**

Create `IFollowedStoreCard` and item subtypes in the transformer file.

**Step 2: Implement tolerant mapping**

Parse:

- store id: `distribution_id || distributor_id || id`
- store name: `store_name || shop_name || distributor_name || name`
- logo: `logo || store_logo || logo_image || shop_logo`
- slogan: `slogan || description || subtitle || intro`
- items: `items || item_infos || goods_list || list`

Limit preview items to 4.

**Step 3: Export the transformer**

Update `app/infrastructure/transformers/index.ts`.

**Step 4: Run transformer test**

Run: `node --test app/pages/account/follow-stores/follow-stores-transformer.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add app/infrastructure/transformers/collectDistributionTransformer.ts app/infrastructure/transformers/index.ts app/pages/account/follow-stores/follow-stores-transformer.test.js
git commit -m "feat: add follow store transformer"
```

### Task 4: Add the follow-store composable

**Files:**
- Create: `app/composables/useFollowedStores.ts`
- Modify: `app/pages/account/follow-stores/follow-stores-page-structure.test.js`

**Step 1: Implement the composable**

Expose:

- `stores`
- `loading`
- `hasLoaded`
- `isEmpty`
- `errorMessage`
- `loadFollowedStores()`

Use `collectDistributionApiClient` and `CollectDistributionTransformer`.

**Step 2: Keep behavior simple**

- Default first-page fetch
- Return empty list on failure
- Preserve a user-facing error string for the page

**Step 3: Update page-structure test if needed**

Ensure the test checks for `loadFollowedStores` usage from the page.

**Step 4: Run current tests**

Run: `node --test app/pages/account/follow-stores/follow-stores-api.test.js app/pages/account/follow-stores/follow-stores-transformer.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add app/composables/useFollowedStores.ts app/pages/account/follow-stores/follow-stores-page-structure.test.js
git commit -m "feat: add follow store composable"
```

### Task 5: Build the FollowedStoreCard component

**Files:**
- Create: `app/pages/account/components/FollowedStoreCard.vue`
- Modify: `app/pages/account/follow-stores/follow-stores-page-structure.test.js`

**Step 1: Implement the card layout**

PC:

- left store block
- right 4-item row

H5:

- stacked store block
- 2-column item grid

**Step 2: Wire actions**

- "进入店铺" should navigate using `localePath(`/shop/${distributorId}`)`
- "联系客服" should emit an event only

**Step 3: Add test ids**

Add:

- `follow-store-card`
- `follow-store-enter-button`
- `follow-store-contact-button`
- `follow-store-item`

**Step 4: Run page-structure test**

Run: `node --test app/pages/account/follow-stores/follow-stores-page-structure.test.js`

Expected: still FAIL until the page exists, but component-specific expectations should now be satisfiable.

**Step 5: Commit**

```bash
git add app/pages/account/components/FollowedStoreCard.vue app/pages/account/follow-stores/follow-stores-page-structure.test.js
git commit -m "feat: add followed store card"
```

### Task 6: Build the follow-stores page

**Files:**
- Create: `app/pages/account/follow-stores.vue`
- Test: `app/pages/account/follow-stores/follow-stores-page-structure.test.js`

**Step 1: Implement the page shell**

Follow existing account page structure:

- `layout: 'default'`
- PC `AccountMenu`
- H5 `AccountH5FilterBar`
- title `关注店铺`

**Step 2: Connect data state**

Use `useFollowedStores()` and render:

- loading skeleton
- empty state
- error text
- list of `FollowedStoreCard`

**Step 3: Add H5-specific adaptation**

Use the same page-level split as `favorites.vue` / `aftersales/index.vue`.

**Step 4: Run page test**

Run: `node --test app/pages/account/follow-stores/follow-stores-page-structure.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add app/pages/account/follow-stores.vue app/pages/account/follow-stores/follow-stores-page-structure.test.js
git commit -m "feat: add follow stores page"
```

### Task 7: Gate the menu item to BBC mode only

**Files:**
- Modify: `app/pages/account/components/AccountMenu.vue`
- Modify: `app/pages/account/components/AccountH5FilterBar.vue`
- Modify: `app/pages/account/favorites.vue`
- Modify: `app/pages/account/aftersales/index.vue`
- Modify: other account pages that define local `menuItems`
- Test: `app/pages/account/follow-stores/follow-stores-menu-gating.test.js`

**Step 1: Add a shared BBC condition**

Use `getBusinessMode() === 'b2b'`.

**Step 2: Append menu item conditionally**

Add:

- key: `followStores`
- label: `关注店铺`
- path: `localePath('/account/follow-stores')`

Only when BBC mode is active.

**Step 3: Keep active state aligned**

Ensure page `activeMenu` uses the same key as the menu entry.

**Step 4: Run gating test**

Run: `node --test app/pages/account/follow-stores/follow-stores-menu-gating.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add app/pages/account/components/AccountMenu.vue app/pages/account/components/AccountH5FilterBar.vue app/pages/account/favorites.vue app/pages/account/aftersales/index.vue app/pages/account/follow-stores/follow-stores-menu-gating.test.js
git commit -m "feat: gate follow stores menu for bbc mode"
```

### Task 8: Add i18n and finish verification

**Files:**
- Modify: `app/locales/zh-CN.json`
- Modify: `app/locales/en-US.json`
- Modify: `app/locales/ar.json`
- Test: `app/pages/account/follow-stores/follow-stores-api.test.js`
- Test: `app/pages/account/follow-stores/follow-stores-transformer.test.js`
- Test: `app/pages/account/follow-stores/follow-stores-page-structure.test.js`
- Test: `app/pages/account/follow-stores/follow-stores-menu-gating.test.js`

**Step 1: Add translations**

Add keys for:

- `account.followStores`
- `account.followStoresEmpty`
- `account.followStoresLoadFailed`
- `account.enterStore`
- `account.contactStore`

**Step 2: Replace hardcoded page strings where reasonable**

Use i18n in the new page and card component.

**Step 3: Run focused tests**

Run:

```bash
node --test app/pages/account/follow-stores/follow-stores-api.test.js app/pages/account/follow-stores/follow-stores-transformer.test.js app/pages/account/follow-stores/follow-stores-page-structure.test.js app/pages/account/follow-stores/follow-stores-menu-gating.test.js
```

Expected: all PASS

**Step 4: Run related regression tests**

Run:

```bash
node --test app/pages/account/aftersales/aftersales-page-structure.test.js app/pages/account/orders/orders-aftersales-status.test.js
```

Expected: PASS and no account menu regressions

**Step 5: Commit**

```bash
git add app/locales/zh-CN.json app/locales/en-US.json app/locales/ar.json app/pages/account/follow-stores app/pages/account/components app/composables/useFollowedStores.ts
git commit -m "feat: add followed stores account page"
```
