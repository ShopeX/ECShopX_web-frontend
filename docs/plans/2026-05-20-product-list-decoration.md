# Product List Decoration Implementation Plan

**Goal:** Add decoration support to `/collections/[id]` while keeping the existing product filter, grid, loading, empty, error, and infinite-scroll behavior as a fixed business component.

**Architecture:** Store product-list decoration as one `product_list` page DSL, exactly like homepage/custom pages. The original product list is represented by one locked native section with the fixed id `product_list` and type `native-product-list`. Other decoration sections can be ordered before or after it in the same DSL order.

**Tech Stack:** Nuxt 4/Vue 3 on `ecshopx-web`, Vue 2/Element UI on `ecshopx-admin`, existing `DecorationRenderer` and postMessage preview pipeline.

---

### Task 1: Web Native Product-List Section Rendering

**Files:**
- Modify: `app/pages/collections/[id].vue`
- Modify: `app/decoration-engine/components/DecorationPreviewSelectionOverlay.vue`
- Modify: `app/decoration-engine/composables/useDecorationPreview.ts`
- Modify: `app/composables/useShopLayoutDecoration.ts`
- Test: `app/pages/product-list-native-section.test.js`

**Steps:**
1. Add a failing node test asserting collections fetches `product_list`, renders a single `DecorationRenderer`, and exposes the existing product list through the `#product_list` named slot.
2. Normalize missing/legacy product-list DSLs by injecting the locked native `product_list` section.
3. Keep the existing default banner only when no saved product-list decoration exists.
4. Ensure preview session keys and overlay page type accept `product_list`.
5. Prevent duplicate/remove actions for locked native sections in the preview overlay.

### Task 2: Admin Native Section Defaults And Locking

**Files:**
- Create: `src/components/sp-web-decoration/definitions/documents/product-list.js`
- Create: `src/components/sp-web-decoration/definitions/sections/native-product-list.js`
- Modify: `src/components/sp-web-decoration/definitions/registry.js`
- Modify: `src/components/sp-web-decoration/definitions/areas.js`
- Modify: `src/components/sp-web-decoration/utils/dsl.js`
- Modify: `src/components/sp-web-decoration/adapters/apiPersistence.js`
- Modify: `src/components/sp-web-decoration/components/ConfigPanel.vue`
- Modify: `src/components/sp-web-decoration/components/StructurePanel.vue`
- Modify: `src/store/modules/decoration.js`
- Test: `src/components/sp-web-decoration/product-list-native-section.test.mjs`

**Steps:**
1. Add a failing node test asserting product-list DSL defaults include `product_list` as a locked `native-product-list` section.
2. Register `native-product-list` as a known section definition but mark it `addable: false`.
3. Remove product-list top/bottom area aliases and placement editing.
4. Prevent locked native sections from being hidden, deleted, or duplicated.
5. Show a readonly notice in the config panel for the fixed business component.

### Task 3: Integration Verification

**Steps:**
1. Run the web decoration/product-list node tests.
2. Run the admin product-list native section node test.
3. Run broader type/lint checks where possible and document any pre-existing blockers separately.
4. Check `git diff --stat` and confirm no generated artifacts or unrelated files are included.
