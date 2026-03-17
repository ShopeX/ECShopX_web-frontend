# 结算页开发计划（20260305-ECX-8074）

## 1. 概述

- **需求**：Web 端商城结算页（PC + 移动端 H5 响应式），双入口（购物车 / 立即购买），订单摘要、地址、优惠券、支付方式、提交订单。
- **现状**：`app/pages/checkout/index.vue` 与 `app/composables/useCheckout.ts` 已存在，且已对接地址、优惠券、订单计算、创建订单等逻辑；`OrderApiClient` 含 `getFreightFee`、`order_new`，`CouponApiClient` 含 `newGetCardList`，`AddressApiClient` 含 `addresslist`。
- **本计划重点**：补全 E2E 可测性（data-testid）、未勾选条款的拦截/提示、自提点（若有）、以及 E2E 与回归验证方式；不改变现有业务架构，仅做增强与对齐验收标准。

---

## 2. 与验收标准 / 测试用例的对应

| 验收项             | 对应测试用例        | 实现要点                                                                                                  |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- |
| 双入口进入结算页   | 入口与页面展示 2 条 | 购物车/商品详情已跳转 `/checkout`；为页面与区块补充 data-testid                                           |
| 订单摘要展示       | 订单摘要 1 条       | 已有摘要区；补充 data-testid，保证文案（商品总计/运费/优惠/总计）可被 E2E 识别                            |
| 地址选择/新增/编辑 | 收货地址 3 条       | 已有地址列表与 BCAddressModal；补充 data-testid，无地址时「请添加地址」或「暂无收货地址，请添加」可被断言 |
| 优惠券选择         | 优惠券 1 条         | 已有入口与 BCCouponSelector；补充 data-testid                                                             |
| 支付方式           | 支付方式 1 条       | 若有支付方式选择 UI，补充 data-testid；若无则仅保证「立即支付」可识别                                     |
| 未勾选条款拦截     | 提交拦截 1 条       | 保持 canSubmit 含 agreeTerms；若按钮为 disabled，E2E 可改为断言按钮 disabled                              |
| 提交订单成功/失败  | 提交订单 1 条       | 已有 createOrder；保证成功/失败有可见反馈（跳转或错误态），E2E 可断言                                     |
| PC/移动端响应式    | 响应式 2 条         | 已有 lg 双栏与移动端单栏/吸底；补充 data-testid 便于布局断言                                              |
| 门店自提（可选）   | 自提 1 条           | 若有自提点列表与省/市选择，补充 data-testid；若无则跳过或标记跳过                                         |

---

## 3. 具体改动清单

### 3.1 页面与容器：data-testid（必做）

**文件**：`app/pages/checkout/index.vue`

- 根容器：增加 `data-testid="checkout-page"`。
- 左侧表单区（配送信息 + 地址 + 优惠券 + 积分 + 发票）：增加 `data-testid="checkout-form"`。
- 右侧订单摘要区（PC）：增加 `data-testid="checkout-summary"`。
- 移动端订单摘要区块与底部支付栏：可复用 `checkout-summary` 或单独 `checkout-summary-mobile`，与现有 E2E 选择器一致即可。

**验证**：E2E「入口与页面展示」「订单摘要」用例可通过。

---

### 3.2 地址区域（必做）

**文件**：`app/pages/checkout/index.vue`

- 有地址时：地址列表容器 `data-testid="checkout-address-list"`；每个地址卡片 `data-testid="checkout-address-card"`，选中项增加 `data-selected="true"`（或用 class/aria 表示选中）。
- 无地址时：空状态容器或文案容器增加 `data-testid="checkout-address-empty"`，且保留「暂无收货地址，请添加」或增加「请添加地址」文案（与 ui-notes 一致或二选一，E2E 用 `getByText(/请添加地址|暂无收货地址/)`）。
- 「添加新地址」按钮：保证有 `data-testid="checkout-add-address"` 或 role+name（如 `getByRole('button', { name: /添加新地址|添加地址/ })`），与 test.spec 一致。

**验证**：E2E「无地址提示」「有地址列表与编辑」「添加新地址」用例可通过。

---

### 3.3 优惠券与支付（必做）

**文件**：`app/pages/checkout/index.vue`

- 优惠券入口（点击打开 BCCouponSelector 的区块）：`data-testid="checkout-coupon-entry"`。
- 若有支付方式选择区域：`data-testid="checkout-payment"`；若无，E2E 仅断言「立即支付」按钮存在即可。

**验证**：E2E「优惠券入口与选择」「支付方式」用例可通过。

---

### 3.4 协议与提交（必做）

**文件**：`app/pages/checkout/index.vue`

- 协议勾选框：保证可被 `getByRole('checkbox', { name: /隐私政策|销售条款|同意/ })` 匹配（当前已有文案与 ECCheckbox）。
- 「立即支付」按钮：`data-testid="checkout-pay-now"` 或保持 role+name。
- 逻辑：保持 `canSubmit` 包含 `agreeTerms`；未勾选时按钮为 disabled 或点击后展示错误提示均可。若当前为 disabled，则 E2E 中「未勾选条款」用例改为：断言「立即支付」按钮为 disabled，无需点击。

**验证**：E2E「未勾选条款拦截」「必填完整后提交」用例可通过。

---

### 3.5 门店自提（可选）

**文件**：`app/pages/checkout/index.vue`、`app/composables/useCheckout.ts`

- 若需求确定做自提：在「门店自提」选中态下，展示省/市选择、「查找附近门店」、自提点列表；自提点列表容器 `data-testid="pickup-location-list"`，自提点项可加 `data-testid="pickup-location-item"`。
- 若本期不做：E2E 自提用例可 `test.skip` 或标记为可选，plan 中注明「自提为可选，接口已就绪」。

**验证**：若实现自提，E2E「门店自提」用例可通过；否则跳过。

---

### 3.6 优惠券选择器与地址/发票弹窗（建议）

**文件**：`app/components/BCCouponSelector/BCCouponSelector.vue`、`app/components/BCAddressModal/BCAddressModal.vue`、`app/components/BCInvoiceModal/BCInvoiceModal.vue`

- BCCouponSelector：列表容器 `data-testid="coupon-list"`，单张券 `data-testid="coupon-item"`（与 test.spec 一致）。
- BCAddressModal：表单容器 `data-testid="address-form"`，或保证省/市/区可通过 `getByLabel` 匹配。
- 若有发票弹窗且 E2E 会用到，可给表单加 `data-testid="invoice-form"`；非必须。

**验证**：E2E「选择优惠券」「添加新地址（含省市区）」可稳定通过。

---

### 3.7 E2E 测试接入与路由（必做）

- **路由**：结算页已为 `/checkout`（`app/pages/checkout/index.vue`），与 test.spec 中 `CHECKOUT_PATH = '/checkout'` 一致，无需改路由。
- **测试文件位置**：用例已在 `.f2e-ai/requirements/20260305-ECX-8074/test.spec.ts`。可选两种方式：
  - **A**：在 `tests/e2e/` 下新增 `checkout.spec.ts`，从上述 test.spec 复制或 import 用例，保证 Playwright 默认只跑 `tests/e2e` 时能执行；
  - **B**：在 `playwright.config.ts` 中临时增加 `tests/e2e` 与 `.f2e-ai/requirements/**/test.spec.ts` 两个目录，或通过 `--grep` 只跑 checkout。
- **推荐**：采用 A，将 `.f2e-ai/requirements/20260305-ECX-8074/test.spec.ts` 内容复制到 `tests/e2e/checkout.spec.ts`，便于 CI 与日常 `pnpm exec playwright test`；需求目录内保留一份作为需求追溯。

**验证**：在项目根目录执行 `pnpm exec playwright test tests/e2e/checkout.spec.ts`（或等价命令）可运行全部 12 条用例；实现 data-testid 后逐条通过或按预期 skip。

---

### 3.8 文案与 i18n（按需）

- 无地址时：若设计稿要求红色「请添加地址」，且当前为「暂无收货地址，请添加」，可保留现有文案并在 E2E 中用正则同时匹配两种表述，或增加 i18n key（如 `checkout.pleaseAddAddress`）统一为「请添加地址」。
- 未勾选条款提示：若改为「点击后提示」而非仅 disabled，需在 i18n 中增加如 `checkout.agreeTermsRequired`，并在页面上展示该文案。

**验证**：E2E 无地址、条款相关断言通过；多语言下文案一致。

---

### 3.9 Bug 修复：结算页初始化时请求订单金额计算（必做）

**问题**：进入结算页时，`onMounted` 中只调用了 `loadCart()`、`loadAddresses()`、`loadCoupons()`，未调用 `calculateOrderAmount()`，导致首屏订单摘要（商品总计、运费、优惠、总计）不请求、不展示。

**文件**：`app/pages/checkout/index.vue`

**修改**：在 `onMounted` 中，在 `loadAddresses()` 与 `loadCoupons()` 完成后调用一次 `calculateOrderAmount()`，使初始化完成后即请求订单金额计算并更新 `calculateResult`，右侧/底部订单摘要能展示金额。若当前为快递配送且无选中地址，`useCheckout` 内 `calculateOrderAmount` 会直接 return，行为保持不变。

**验证**：从购物车或立即购买进入结算页，首屏应出现订单金额计算请求（Network 可见对应接口），且右侧/底部订单摘要展示商品总计、运费、总计等；无地址时仍不请求计算，符合现有逻辑。

---

## 4. 不修改或仅做最小改动的部分

- **业务逻辑**：`useCheckout` 中订单计算、创建订单、地址/优惠券加载与选择保持现状；仅当来自 api-notes 的接口路径与现有 client 不一致时，在 `OrderApiClient`/`AddressApiClient`/`CouponApiClient` 中做路径或参数对齐，并在 plan 中记录。
- **接口**：Apifox 文档中的 8 个接口，现有 client 已覆盖 addresslist、newGetCardList、getFreightFee、order_new；若缺少自提点接口，可在 `OrderApiClient` 或新建 `PickupApiClient` 中增加 `getPickupLocations`（GET `/distributor/pickuplocation`），仅在做自提时实现。
- **样式与响应式**：当前 PC 双栏与移动端布局已存在，本计划不调整布局结构，仅通过 data-testid 支持 E2E。

---

## 5. 执行与验证顺序建议

1. **Bug 修复（优先）**：按 3.9 在 `onMounted` 中补上 `calculateOrderAmount()` 调用，确认首屏进入结算页即请求订单金额并展示摘要。
2. **data-testid 与可选文案**：按 3.1～3.4、3.6 在 checkout 页与相关组件上补齐 data-testid 和必要文案。
3. **E2E 接入**：按 3.7 将用例落到 `tests/e2e/checkout.spec.ts`，运行并根据实际 DOM 微调选择器（如「请添加地址」与「暂无收货地址，请添加」）。
4. **未勾选条款**：若当前为 disabled，将 E2E 改为断言按钮 disabled；若产品要求点击后提示，则增加提示文案与 i18n。
5. **自提（可选）**：按 3.5 实现或明确 skip，并更新 E2E。
6. **回归**：跑完整 `tests/e2e`，确认无破坏其他页面；必要时跑一次 `pnpm lint`、`pnpm build`。

---

## 6. 产出与追溯

- **需求**：`.f2e-ai/requirements/20260305-ECX-8074/requirement.md`
- **测试**：`.f2e-ai/requirements/20260305-ECX-8074/test.spec.ts`，以及（推荐）`tests/e2e/checkout.spec.ts`
- **计划**：`.f2e-ai/requirements/20260305-ECX-8074/plan.md`（本文件）
- **UI/API**：同目录下 `ui-notes.md`、`api-notes.md`
