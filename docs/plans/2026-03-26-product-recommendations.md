# Product Detail Recommendations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace mocked product-detail recommendations with live `recommendlike` data and temporarily hide the recent tab.

**Architecture:** Keep fetching in the product detail page, add one HTTP client method for the new endpoint, and convert the API payload into the existing recommendation card shape with a small transformer. Update the recommendation component with a prop that lets callers suppress the recent tab without changing its base layout.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, existing `$api` HTTP client, Node test runner.

---

### Task 1: Recommendation Data Mapping

**Files:**
- Create: `app/infrastructure/transformers/recommendLikeTransformer.test.ts`
- Create: `app/infrastructure/transformers/recommendLikeTransformer.ts`

**Step 1: Write the failing test**

- Cover `goods_id/itemId`, `item_name/itemName`, `price`, and `pics`.
- Cover string and array image fallbacks.

**Step 2: Run test to verify it fails**

Run: `node --test app/infrastructure/transformers/recommendLikeTransformer.test.ts`
Expected: FAIL because the transformer does not exist yet.

**Step 3: Write minimal implementation**

- Export a transformer that maps `recommendlike` responses into `{ id, name, price, image }[]`.

**Step 4: Run test to verify it passes**

Run: `node --test app/infrastructure/transformers/recommendLikeTransformer.test.ts`
Expected: PASS

### Task 2: Recommendation Component Tab Control

**Files:**
- Create: `app/components/BCProductRecommendations/BCProductRecommendations.source.test.js`
- Modify: `app/components/BCProductRecommendations/BCProductRecommendations.vue`

**Step 1: Write the failing test**

- Assert the component exposes a prop for hiding the recent tab.
- Assert display logic falls back to recommended products when the recent tab is suppressed.

**Step 2: Run test to verify it fails**

Run: `node --test app/components/BCProductRecommendations/BCProductRecommendations.source.test.js`
Expected: FAIL

**Step 3: Write minimal implementation**

- Add `showRecentTab?: boolean` defaulting to `true`.
- Hide the recent tab and force recommended display when disabled.

**Step 4: Run test to verify it passes**

Run: `node --test app/components/BCProductRecommendations/BCProductRecommendations.source.test.js`
Expected: PASS

### Task 3: Product Detail Integration

**Files:**
- Create: `app/pages/products/product-detail-recommendations.source.test.js`
- Modify: `app/infrastructure/http/clients/ItemApiClient.ts`
- Modify: `app/pages/products/[id].vue`

**Step 1: Write the failing test**

- Assert the page calls the new recommendation API method.
- Assert it maps into `recommendedProducts`.
- Assert the page disables the recent tab.

**Step 2: Run test to verify it fails**

Run: `node --test app/pages/products/product-detail-recommendations.source.test.js`
Expected: FAIL

**Step 3: Write minimal implementation**

- Add `getRecommendLikeItems`.
- Replace mock `recommendedProducts`/`recentProducts`.
- Load recommendations on mount and degrade to empty list on failure.
- Pass `:show-recent-tab="false"` to `BCProductRecommendations`.

**Step 4: Run test to verify it passes**

Run: `node --test app/pages/products/product-detail-recommendations.source.test.js`
Expected: PASS

### Task 4: Regression Verification

**Files:**
- Modify: none

**Step 1: Run targeted tests**

Run:
- `node --test app/infrastructure/transformers/recommendLikeTransformer.test.ts`
- `node --test app/components/BCProductRecommendations/BCProductRecommendations.source.test.js`
- `node --test app/pages/products/product-detail-recommendations.source.test.js`

**Step 2: Re-run adjacent regression**

Run: `node --test app/composables/usePayment.amount.test.js`
Expected: PASS
