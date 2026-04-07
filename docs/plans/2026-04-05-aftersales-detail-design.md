# Aftersales Detail Page Design

**Date:** 2026-04-05

**Goal**

Add an independent aftersales detail page that matches the provided Figma PC and H5 nodes, opens from the aftersales list page, and loads real detail data from `GET /wxapp/aftersales/info`.

**Figma References**

- PC: `https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=3648-4707`
- H5: `https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=3655-8500`

**Current Problem**

The account aftersales area currently only has the list page at `app/pages/account/aftersales/index.vue`. Clicking a card does not enter a dedicated aftersales detail route, and there is no page that renders the aftersales progress, reason, payment block, and order information block shown in Figma.

**Approved Approach**

Implement a new standalone route for aftersales detail instead of reusing the account-center shell or the existing order detail page:

- New route: `app/pages/account/aftersales/[id].vue`
- The list card navigates to `/account/aftersales/[aftersalesId]`
- The detail page requests `GET /wxapp/aftersales/info`
- The page layout is independent, like the existing order detail page, and does not include the account center left menu
- PC uses a two-column layout; H5 uses a single-column stacked layout plus a bottom summary strip
- Action buttons shown in Figma are rendered as visual placeholders only and do not trigger real business behavior

**API Contract Notes**

Apifox documents `GET /wxapp/aftersales/info` with:

- query `aftersales_bn` required
- query `item_id` required

The route parameter should therefore be the aftersales number / identifier used in the list page model. The page should derive the `item_id` from the detail payload when possible, or from the selected record context if the API requires it on first load. Because this contract is awkward for a route-level page, implementation should isolate it inside the aftersales detail composable / client path instead of leaking it into the page template.

The existing list response already proves these fields are relevant to the detail page:

- `aftersales_bn`
- `aftersales_status`
- `progress`
- `reason`
- `description`
- `evidence_pic`
- `detail[]`
- `refund_fee`
- `contact`
- `mobile`
- `aftersales_address`
- `distributor_info`
- `order_id`
- `create_time`

**Layout Structure**

Shared visual sections:

- Back navigation row
- Status / progress header
- Product list block
- Receiver information block
- Aftersales reason block
- Payment information block
- Order information block

PC-only structure:

- Main product column on the left
- Info sidebar on the right
- Desktop summary and placeholder actions below the product list

H5-only structure:

- Single-column stacked cards
- Summary strip fixed to the flow bottom like the Figma node
- No desktop action row

**Component Shape**

Recommended structure:

- `app/pages/account/aftersales/[id].vue`
- `app/composables/useAftersalesDetail.ts`
- `app/pages/account/components/AftersalesDetailProgress.vue`
- `app/pages/account/components/AftersalesDetailItems.vue`
- `app/pages/account/components/AftersalesDetailInfoSection.vue`
- `app/pages/account/components/AftersalesDetailSummary.vue`

Existing reuse points:

- Reuse the existing money formatting approach used by aftersales list / order pages
- Reuse `OrderTransformer.toOrderItemModel()` where possible for `detail[]`
- Reuse the current visual conventions already used in `app/pages/account/orders/[id].vue` for skeletons and spacing rhythm when not in conflict with Figma

**Data Mapping**

Detail model should expose page-friendly fields instead of passing raw API data through the template:

- `aftersalesId`
- `orderId`
- `status`
- `statusText`
- `progressSteps`
- `storeName`
- `items`
- `itemCount`
- `refundAmount`
- `receiverName`
- `receiverMobile`
- `receiverAddress`
- `reason`
- `description`
- `evidencePics`
- `paymentMethod`
- `payTime`
- `orderTime`
- `goodsAmount`
- `freightAmount`
- `discountAmount`
- `pointDeductionAmount`
- `paidAmount`

Where the live API does not provide one of the Figma sample fields, render an empty string or omit that row rather than fabricating business data.

**Progress Mapping**

The Figma sample shows a three-step progress line:

- 提交申请
- 等待审核
- 等待寄回

Implementation should derive a visual step state from `aftersales_status` and `progress`. The exact visual mapping should live in the transformer / composable, not inline in the template.

**Interaction Rules**

- Clicking an aftersales order card opens the detail route
- Clicking the page back affordance returns to the aftersales list
- Copy order number is allowed and should use browser clipboard only
- Placeholder buttons have no business API binding in this iteration

**Loading and Error Handling**

- Show page-level loading skeletons on first entry
- Show toast plus an empty/error state if the detail fetch fails
- Do not render misleading placeholder business values during load failure

**Testing Strategy**

Keep the repo’s current lightweight source-based and API-alignment testing style:

- Verify the list card links to the new detail route
- Verify the aftersales client exposes detail loading for `/wxapp/aftersales/info`
- Verify the transformer/composable maps detail payload into the dedicated detail model
- Verify the detail page structure includes the major Figma sections for PC/H5

**Files Expected To Change**

- Modify `app/infrastructure/http/clients/AftersalesApiClient.ts`
- Modify `app/infrastructure/transformers/aftersalesTransformer.ts`
- Modify `app/types/api/aftersales.ts`
- Modify `app/pages/account/components/AftersalesOrderCard.vue`
- Create `app/composables/useAftersalesDetail.ts`
- Create `app/pages/account/aftersales/[id].vue`
- Create detail display components under `app/pages/account/components/`
- Add tests under `app/pages/account/aftersales/*.test.js`
