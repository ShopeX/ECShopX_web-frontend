# Favorites Collect Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 接通收藏页移除收藏，以及商品详情页收藏/取消收藏切换能力。

**Architecture:** 继续使用页面直接调用 `CollectApiClient` 的轻量模式，不引入新的全局 store。收藏页删除成功后本地移除列表项；商品详情页基于登录态初始化收藏状态，并根据当前状态调用新增或删除接口。

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Node `node:test`, existing HTTP plugin / `CollectApiClient`

---

### Task 1: Add failing source-structure tests

**Files:**

- Create: `app/infrastructure/http/clients/CollectApiClient.collect-actions.test.js`
- Create: `app/pages/account/favorites.collect-actions.test.js`
- Create: `app/pages/products/product-favorite-toggle.test.js`
- Test: `app/infrastructure/http/clients/CollectApiClient.collect-actions.test.js`
- Test: `app/pages/account/favorites.collect-actions.test.js`
- Test: `app/pages/products/product-favorite-toggle.test.js`

**Step 1: Write the failing test**

- Assert `CollectApiClient` contains `addCollectItem` and `removeCollectItems`.
- Assert favorites mobile card enables remove action and wires `@remove`.
- Assert product detail page no longer contains the favorite `TODO` and calls collect APIs.

**Step 2: Run test to verify it fails**

Run: `node --test app/infrastructure/http/clients/CollectApiClient.collect-actions.test.js app/pages/account/favorites.collect-actions.test.js app/pages/products/product-favorite-toggle.test.js`
Expected: FAIL because methods and page wiring do not exist yet.

**Step 3: Write minimal implementation**

- Add collect client methods.
- Update favorites page remove behavior.
- Update product detail page favorite toggle behavior.

**Step 4: Run test to verify it passes**

Run: `node --test app/infrastructure/http/clients/CollectApiClient.collect-actions.test.js app/pages/account/favorites.collect-actions.test.js app/pages/products/product-favorite-toggle.test.js`
Expected: PASS

### Task 2: Verify the integrated flow

**Files:**

- Modify: `app/pages/account/favorites.vue`
- Modify: `app/pages/products/[id].vue`
- Modify: `app/infrastructure/http/clients/CollectApiClient.ts`

**Step 1: Run targeted lint-like verification**

Run: `node --test app/infrastructure/http/clients/CollectApiClient.collect-actions.test.js app/pages/account/favorites.collect-actions.test.js app/pages/products/product-favorite-toggle.test.js`

**Step 2: Run broader sanity checks**

Run: `pnpm exec nuxi typecheck`
Expected: PASS, or capture existing unrelated failures separately.
