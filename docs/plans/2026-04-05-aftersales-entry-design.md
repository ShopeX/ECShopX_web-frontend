# Aftersales Entry Flow Design

**Date:** 2026-04-05

**Goal**

Unify the "apply aftersales" entry behavior between the order list page and the order detail page so both flows use the same data source rules:

- Order list page: fetch fresh order detail and aftersales reasons before opening the panel
- Order detail page: reuse the existing order detail data and only fetch aftersales reasons before opening the panel

**Current Problem**

Both entry points currently open `AftersalesPanel` directly from the in-memory `order.items` data on the page. The panel also hardcodes its reason options locally. That creates two issues:

- The order list entry does not refresh from the order detail API before opening
- The reason list is not sourced from `GET /aftersales/reason/list`

**Approved Approach**

Use a shared reason-loading path, but keep the order-source behavior different per page:

- In `app/pages/account/orders/index.vue`, clicking "申请售后" first requests:
  - `GET /wxapp/order/{order_id}`
  - `GET /aftersales/reason/list`
  Both requests complete before the panel opens.
- In `app/pages/account/orders/[id].vue`, clicking "申请售后" reuses the already loaded `order.value` data and only requests `GET /aftersales/reason/list` before opening.
- `AftersalesPanel.vue` no longer owns a hardcoded reason list. It receives normalized `reasonOptions` from its parent page.

**Latency Handling**

The list-page flow should still feel responsive even though the panel waits for data:

- Add a per-order opening state on the order list page
- While the request is in flight, disable the clicked aftersales trigger and show loading feedback on that trigger
- Cache the aftersales reason list so later openings usually only need the order detail request

This keeps the "request first, then open" requirement while avoiding a dead-click feeling.

**Reason List Handling**

Apifox currently documents `GET /aftersales/reason/list` only as `data: []` without a stable item schema. The frontend should therefore normalize defensively:

- Accept plain strings
- Accept common object fields such as `label`, `name`, `reason`, `text`, `value`
- Produce the existing `{ label, value }` shape required by `AftersalesFormContent.vue`

If the API returns an unrecognized item shape, filter that item out rather than rendering broken option text.

**Code Shape**

Recommended structure:

- Add `getAftersalesReasonList()` to `app/infrastructure/http/clients/AftersalesApiClient.ts`
- Add a small shared composable such as `app/composables/useAftersalesReasonOptions.ts`
  - owns cached normalized options
  - exposes `loadReasonOptions()`
- Extend `AftersalesPanel.vue` props to accept `reasonOptions`
- Keep item mapping close to page-level entry points so the list page can map from fresh detail API data and the detail page can map from current `order.value`

**Error Handling**

- If order detail fetch fails on the list page, do not open the panel; surface the existing toast error
- If reason list fetch fails on either page, do not open the panel; surface the existing toast error
- If the reason list returns empty, allow the panel to open only if the business confirms an empty list is valid; otherwise treat it as an error state during implementation review

**Testing Strategy**

Match the repo’s existing lightweight source-based tests:

- Verify the aftersales API client exposes `/aftersales/reason/list`
- Verify `AftersalesPanel.vue` consumes prop-driven reason options instead of local hardcoded computed data
- Verify order list entry loads order detail plus reasons before opening the panel
- Verify order detail entry reuses local detail data and only loads reasons before opening

**Files Expected To Change**

- Modify `app/infrastructure/http/clients/AftersalesApiClient.ts`
- Create `app/composables/useAftersalesReasonOptions.ts`
- Modify `app/pages/account/components/AftersalesPanel.vue`
- Modify `app/pages/account/orders/index.vue`
- Modify `app/pages/account/orders/[id].vue`
- Add or update tests under `app/pages/account/orders/*.test.js`
