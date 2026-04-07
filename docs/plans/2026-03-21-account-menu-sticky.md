# Account Menu Sticky Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为个人中心 PC 左侧 `AccountMenu` 增加吸顶交互，并让菜单始终贴住全局 header 下缘。

**Architecture:** 使用 `position: sticky` 实现菜单吸顶，不引入滚动监听。全局 header 高度由默认布局测量后写入 CSS 变量，`AccountMenu` 只消费该变量作为 sticky `top` 偏移。

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Tailwind utilities, browser `ResizeObserver`

---

### Task 1: Add failing regression tests for sticky integration

**Files:**
- Create: `app/pages/account/components/AccountMenu.sticky.test.js`
- Modify: `app/pages/account/components/AccountMenu.vue`
- Modify: `app/layouts/default.vue`
- Test: `app/pages/account/components/AccountMenu.sticky.test.js`

**Step 1: Write the failing test**

Create assertions that verify:

- `AccountMenu.vue` contains sticky classes for PC only
- `AccountMenu.vue` uses `var(--layout-header-height)` as sticky offset
- `default.vue` defines a header ref and writes `--layout-header-height`

**Step 2: Run test to verify it fails**

Run: `node --test app/pages/account/components/AccountMenu.sticky.test.js`
Expected: FAIL because sticky styles and header height sync do not exist yet.

**Step 3: Write minimal implementation**

- Add sticky PC-only classes and top style to `AccountMenu.vue`
- Add header measurement logic to `default.vue`

**Step 4: Run test to verify it passes**

Run: `node --test app/pages/account/components/AccountMenu.sticky.test.js`
Expected: PASS

### Task 2: Keep layout behavior stable

**Files:**
- Modify: `app/pages/account/components/AccountMenu.vue`
- Modify: `app/layouts/default.vue`

**Step 1: Confirm sticky does not change width or stacking unexpectedly**

Check that:

- menu width remains `256px`
- menu z-index stays below header
- H5 paths are unaffected

**Step 2: Re-run source verification**

Run: `node --test app/pages/account/components/AccountMenu.sticky.test.js`
Expected: PASS

**Step 3: Run formatting verification**

Run: `pnpm exec prettier --check app/pages/account/components/AccountMenu.vue app/layouts/default.vue app/pages/account/components/AccountMenu.sticky.test.js`
Expected: PASS

### Task 3: Manual browser verification

**Files:**
- Modify: `app/pages/account/components/AccountMenu.vue`
- Modify: `app/layouts/default.vue`

**Step 1: Open a PC account page**

Use a real account page such as:

- `/account`
- `/account/orders`
- `/account/coupons`

**Step 2: Scroll and verify sticky**

Expected:

- menu remains in its column
- menu top edge aligns with header bottom edge
- menu returns to normal position near page top

**Step 3: Verify H5 is unchanged**

Open the same page in a narrow viewport and confirm no extra top offset appears.
