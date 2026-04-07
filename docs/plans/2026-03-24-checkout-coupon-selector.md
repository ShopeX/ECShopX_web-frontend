# Checkout Coupon Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the checkout coupon selector to use the shared coupon card with a checkout-only selected-state variant and Figma-aligned selector interaction.

**Architecture:** Extend `BCCouponCard` with a checkout presentation mode rather than creating a second coupon-card implementation. Keep checkout state ownership in `BCCouponSelector`, then pass the confirmed selection back to `checkout/index.vue`.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, shared coupon transformer models, node:test source-level regression tests.

---

### Task 1: Lock the checkout coupon variant behavior

**Files:**
- Create: `app/components/BCCouponSelector.checkout.test.js`
- Modify: `app/components/BCCouponCard/BCCouponCard.vue`
- Modify: `app/components/BCCouponSelector/BCCouponSelector.vue`

**Step 1: Write the failing test**

Add a source-level regression test that asserts:
- `BCCouponCard` exposes a checkout variant prop.
- `BCCouponSelector` passes that variant to the shared card.
- `BCCouponSelector` renders a bottom confirm button instead of relying on per-card action buttons.

**Step 2: Run test to verify it fails**

Run: `node --test app/components/BCCouponSelector.checkout.test.js`
Expected: FAIL because the current source has no checkout variant or bottom confirm button.

### Task 2: Implement the shared checkout card variant

**Files:**
- Modify: `app/components/BCCouponCard/BCCouponCard.vue`

**Step 1: Write minimal implementation**

- Add a variant prop for checkout usage.
- Preserve the current default and account-page behavior.
- In checkout variant, render the card body without the existing bottom action area.
- Add Figma-aligned border, spacing, and selected-state icon treatment.

**Step 2: Run test to verify it passes**

Run: `node --test app/components/BCCouponSelector.checkout.test.js`
Expected: PASS for the new variant-related assertions.

### Task 3: Align the selector interaction with Figma

**Files:**
- Modify: `app/components/BCCouponSelector/BCCouponSelector.vue`

**Step 1: Write minimal implementation**

- Track a temporary selected coupon inside the selector.
- Render cards with the checkout variant and selected state.
- Remove the current per-card action workflow from the selector path.
- Add the bottom primary button for confirm selection.
- On confirm, emit the chosen coupon and close the selector.

**Step 2: Re-run test**

Run: `node --test app/components/BCCouponSelector.checkout.test.js`
Expected: PASS with selector confirmation behavior represented in source.

### Task 4: Hook checkout page to the updated selector

**Files:**
- Modify: `app/pages/checkout/index.vue`

**Step 1: Update integration**

- Keep the existing summary-row trigger.
- Pass any new selector props required by the checkout variant.
- Keep existing coupon business methods (`selectCoupon`, `unselectCoupon`) unchanged.

**Step 2: Verify affected tests**

Run: `node --test app/components/BCCouponSelector.checkout.test.js app/composables/usePayment.amount.test.js`
Expected: PASS.
