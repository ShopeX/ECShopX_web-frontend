# Checkout Coupon Design

**Goal:** Align the checkout coupon selector UI with the Figma PC/H5 designs while continuing to reuse the shared coupon card component.

**Scope:**
- Keep account coupon pages visually unchanged.
- Reuse `app/components/BCCouponCard/BCCouponCard.vue`.
- Add a checkout-only visual variant with selected/unselected states.
- Update `app/components/BCCouponSelector/BCCouponSelector.vue` to match the checkout Figma interaction model.

**Design Summary:**
- `BCCouponCard` remains the shared base component.
- A checkout variant adds the right-side radio/check affordance, border state, and spacing needed by the Figma selector list.
- `BCCouponSelector` uses that variant, removes per-card action buttons, maintains a temporary selection inside the drawer, and confirms the selection through a bottom primary button.
- `app/pages/checkout/index.vue` keeps the existing summary-row entry and passes `selectedCoupon`/`coupons` into the selector as before.

**Non-Goals:**
- Do not restyle account coupon pages.
- Do not change coupon calculation rules or checkout business logic.
