# Footer Block Layout MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the footer section so it only supports menu, image, and text blocks, while allowing blocks to span the full width of the footer grid.

**Architecture:** Keep the footer as a dedicated section-level layout container and move all content into block types. Add a simple 12-column layout contract with a per-block column span so any block can occupy the full row when needed. Preserve the existing preview/edit handshake and selection behavior, but update the admin panel, DSL defaults, and web footer renderer to use the new block set.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, existing decoration DSL/admin panels, Tailwind CSS, Node test runner.

---

### Task 1: Define the footer block contract

**Files:**
- Modify: `src/components/sp-web-decoration/definitions/sections/footer.js`
- Modify: `src/components/sp-web-decoration/definitions/default-settings.js`
- Modify: `src/components/sp-web-decoration/definitions/registry.js`
- Modify: `src/components/sp-web-decoration/definitions/documents/footer.js`
- Modify: `src/components/sp-web-decoration/definitions/documents/template.js`
- Modify: `src/components/sp-web-decoration/definitions/areas/footer.js`

**Step 1: Update the footer section definition**

- Replace the current single `footer-link` assumption with a footer section that allows only `footer-menu`, `footer-image`, and `footer-text` blocks.
- Keep the section fixed to the footer area.

**Step 2: Add default settings for the new block types**

- `footer-menu`: title, menu source, menu items, and `column_span`.
- `footer-image`: image, link, alt text, and `column_span`.
- `footer-text`: title, rich text content, and `column_span`.
- Keep `footer` section settings for layout/background/spacing only.

**Step 3: Update the footer DSL seed data**

- Seed the default footer document with a simple mix of the three supported blocks.
- Ensure the footer document still serializes into the same global preview bundle shape.

**Step 4: Run the section/DSL tests or contract checks**

Run: `node --test app/decoration-engine/components/decoration-section-contracts.test.js`
Expected: PASS after the new footer block types are registered.

### Task 2: Add admin panels for the footer blocks

**Files:**
- Create: `src/components/sp-web-decoration/panels/FooterMenuBlockPanel.vue`
- Create: `src/components/sp-web-decoration/panels/FooterImageBlockPanel.vue`
- Create: `src/components/sp-web-decoration/panels/FooterTextBlockPanel.vue`
- Modify: `src/components/sp-web-decoration/components/ConfigPanel.vue`
- Modify: `src/components/sp-web-decoration/panels/FooterPanel.vue`
- Modify: `src/components/sp-web-decoration/panels/FooterLinkBlockPanel.vue` or remove if unused

**Step 1: Write the footer block editors**

- Menu block: title + menu data + column span.
- Image block: image picker + link + column span.
- Text block: title + rich text content + column span.

**Step 2: Wire the panel map**

- Register the three new block panels in `ConfigPanel.vue`.
- Keep the section panel limited to layout-level footer settings.

**Step 3: Clean up obsolete footer-link UI**

- Remove `footer-link` from the footer section flow if it is no longer part of the MVP.
- Keep only the new three blocks in the add-block menu.

**Step 4: Run admin lint on touched files**

Run:
- `npx eslint --ext .js,.vue --ignore-path .eslintignore src/components/sp-web-decoration/panels/FooterMenuBlockPanel.vue src/components/sp-web-decoration/panels/FooterImageBlockPanel.vue src/components/sp-web-decoration/panels/FooterTextBlockPanel.vue src/components/sp-web-decoration/components/ConfigPanel.vue src/components/sp-web-decoration/panels/FooterPanel.vue`

Expected: PASS

### Task 3: Render footer blocks with span support in web

**Files:**
- Modify: `app/decoration-engine/components/sections/DecorationFooterSection.vue`
- Modify: `app/decoration-engine/components/DecorationPreviewSelectionOverlay.vue`
- Modify: `app/decoration-engine/composables/useDecorationPreview.ts`
- Modify: `app/layouts/default.vue` if footer bundle wiring needs adjustment

**Step 1: Teach the footer renderer the new block types**

- Render `footer-menu`, `footer-image`, and `footer-text` differently.
- Read `column_span` from block settings and map it to Tailwind `col-span-*` classes.
- Allow `column_span: 12` to occupy a full row.

**Step 2: Keep block selection working**

- Make sure the preview overlay and messenger still identify footer blocks correctly after the type split.

**Step 3: Ensure the footer area still hydrates from the preview bundle**

- Preserve the `footerDsl` split/merge logic so admin preview and web renderer stay in sync.

**Step 4: Run the footer component contract tests**

Run: `node --test app/decoration-engine/components/decoration-section-contracts.test.js`
Expected: PASS

### Task 4: Verify layout behavior and empty states

**Files:**
- Modify: any touched footer files if verification reveals issues

**Step 1: Check the footer with a full-width block**

- Confirm one block can span the full row without breaking selection frames.
- Confirm mixed spans still line up in the same grid.

**Step 2: Check the footer with only one supported block type**

- Confirm the section does not leave stray empty slots.
- Confirm missing optional data falls back to placeholders instead of crashing.

**Step 3: Run the relevant regression tests**

Run:
- `node --test app/decoration-engine/components/decoration-core.test.js app/decoration-engine/components/decoration-preview-labels.test.js app/decoration-engine/components/decoration-section-contracts.test.js`

Expected: PASS
