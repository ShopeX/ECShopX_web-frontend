# 支付页面开发计划（20260309-ECX-8078）

## 1. 概述

- **需求**：Web 支付页（PC + H5），双入口（结算页提交成功后跳转、订单列表/详情「去支付」），支付方式列表、去支付展示支付码、轮询结果、成功/失败/超时与重试/返回。
- **现状**：结算页 `createOrder` 成功后已跳转 `/payment?orderId=xxx`（`checkout/index.vue` 已实现）；`useOrders.payNow(orderId)` 已实现 `navigateTo(/payment?orderId=...)`。项目中**无** `app/pages/payment` 页面；订单列表/详情为 `/account/orders` 或 `/member/orders`，当前 `app/pages/account` 下无 `orders` 页面，需在计划中说明入口处理方式。接口层需新增 3 个支付相关接口封装。
- **本计划**：新增支付页与 3 个接口封装、composable、支付页 UI 与 data-testid；订单列表/详情若已有则接「去支付」跳转，若无则 E2E 订单入口用例 skip；结算跳转已存在可不改。

---

## 2. 与验收标准 / 测试用例的对应

| 验收项                         | 测试用例      | 实现要点                                                                                  |
| ------------------------------ | ------------- | ----------------------------------------------------------------------------------------- |
| 结算页提交后跳转支付页带订单号 | 入口 1 条     | 已实现，无需改；E2E 断言 URL `/payment` 或 `/pay` 且带 orderId                            |
| 支付页容器与订单/支付信息      | 入口 1 条     | 新建支付页，根节点 `payment-page`，订单/金额区 `payment-summary` 或文案                   |
| 订单列表/详情「去支付」跳转    | 订单入口 2 条 | 若有订单页则「去支付」跳 `/payment?orderId=xxx`；若无则 E2E skip                          |
| 支付方式列表与选择             | 支付方式 1 条 | 调用支付方式列表接口，`payment-method-list` / `payment-method-item`，选中 `data-selected` |
| 去支付后展示支付码             | 去支付 1 条   | 调用查询订单支付信息接口，展示 `payment-qrcode` 或 `payment-code`                         |
| 轮询结果、成功态/跳转          | 支付结果 1 条 | 轮询支付结果（间隔/超时与后端或产品约定），成功展示 `payment-success` 或跳转              |
| 超时/失败提示与重试/返回       | 支付结果 1 条 | 失败/超时展示提示，提供重试、返回入口（含 `payment-error`）                               |
| PC/H5 响应式                   | 响应式 2 条   | 支付页布局适配，关键区块带 testid                                                         |

---

## 3. 具体改动清单

### 3.1 路由约定

- 支付页路径：**`/payment`**（新建 `app/pages/payment/index.vue` 或 `payment.vue`），query 必带 **`orderId`**。
- 订单列表/详情：项目中链接为 `/account/orders` 或 `/member/orders`，当前无 `account/orders` 页面。若实现时仍无订单列表/详情页，则 E2E 中「从订单列表/详情去支付」两条用例 **test.skip** 并注明「待订单页实现后启用」；若已有订单页，则「去支付」使用 `useOrders.payNow(orderId)` 或等价跳转即可。

### 3.2 接口层（必做）

**新建或扩展 Client**（与现有 `OrderApiClient` 的 baseURL/路径风格对齐）：

- **获取支付方式**：GET `/api/h5app/wxapp/trade/payment/list`（或项目内等价路径）
- **查询订单信息**：GET `/api/h5app/wxapp/order_new/{orderId}`（或等价路径）
- **查询订单支付信息**：POST `/api/h5app/wxapp/payment`（请求体以 Apifox 为准）

可新建 **`app/infrastructure/http/clients/PaymentApiClient.ts`**，或在 **`OrderApiClient`** 中新增上述 3 个方法（视项目 baseURL 是否已包含 `h5app/wxapp` 而定）。为 3 个接口定义请求/响应 TS 类型（可先按 api-notes 手写，后续与 Apifox 对齐）。

**验证**：在支付页或单独脚本能成功调用 3 个接口（可 Mock 或联调）。

### 3.3 支付页与 composable（必做）

**新建**：

- **`app/pages/payment/index.vue`**（或 `app/pages/payment.vue`）
  - 从 `route.query.orderId` 取订单号，无则提示或跳转（如回结算/订单列表）。
  - 布局与状态：支付方式选择区、去支付按钮、支付码展示区、成功态、失败/超时态、重试/返回。
  - 按 ui-notes 的 5 个 Figma 节点做 PC + H5 响应式。
  - **data-testid**：`payment-page`、`payment-summary`（可选）、`payment-method-list`、`payment-method-item`、`payment-pay-now`、`payment-qrcode` 或 `payment-code`、`payment-success`、`payment-error`。

- **`app/composables/usePayment.ts`**（或等价逻辑放在页面内）
  - 加载支付方式列表、当前订单信息（调用「查询订单信息」）。
  - 点击「去支付」后调用「查询订单支付信息」并展示支付码。
  - 轮询支付结果（间隔与超时与后端/产品约定），成功置成功态或跳转，失败/超时置错误态并暴露重试/返回。
  - 错误与加载态在页面上有展示。

**验证**：手动从 `/payment?orderId=xxx` 进入，能选支付方式、点去支付看到支付码、成功/失败有对应展示；E2E 入口、支付方式、去支付、响应式用例可跑（依赖 Mock 或真实环境）。

### 3.4 结算页跳转（无需改）

**文件**：`app/pages/checkout/index.vue`

- 当前已在 `createOrder` 成功且返回 `orderId` 时执行 `router.push(\`/payment?orderId=${result.orderId}\`)`，**无需修改**。

**验证**：E2E「从结算页提交订单成功后应跳转至支付页且 URL 带订单号」通过。

### 3.5 订单列表/详情「去支付」（按现有页面情况）

- 若存在订单列表/详情页（如 `account/orders`、`order` 等）：在「去支付」按钮/链接上使用 `useOrders.payNow(orderId)` 或 `navigateTo(\`/payment?orderId=${orderId}\`)`。
- 若不存在：不在本需求内新建订单页；E2E 中「从订单列表/详情去支付」两条用例 **test.skip**，并注明「待订单页实现后启用」。

### 3.6 E2E 测试接入（必做）

- **测试文件**：将 `.f2e-ai/requirements/20260309-ECX-8078/test.spec.ts` 复制或迁移到 **`tests/e2e/payment.spec.ts`**，路径与选择器与实现一致（`/payment`、上述 data-testid）。
- 依赖订单号的用例可使用固定测试订单号或 fixture；订单列表/详情入口若暂无页面则 skip。
- 轮询/成功/失败的用例若依赖真实支付结果，可先 Mock 或放宽超时/断言，后续再收紧。

**验证**：`pnpm exec playwright test tests/e2e/payment.spec.ts` 在本地或 CI 可跑通（允许部分 skip）。

### 3.7 可选与后续

- **i18n**：支付页文案放入多语言 key，与项目 i18n 规范一致。
- **轮询间隔/超时**：与后端或产品确认后写入 usePayment 或配置。
- **支付成功跳转目标**：确认后写死或配置（如订单详情/订单列表）。

---

## 4. 实施顺序建议

1. 接口层：PaymentApiClient（或 OrderApiClient 扩展）+ 3 个接口与类型。
2. usePayment：支付方式列表、订单信息、去支付、轮询与状态。
3. 支付页：`app/pages/payment/index.vue`，接 usePayment，加 data-testid，按 Figma 做 UI 与响应式。
4. 结算页：已实现跳转，无需改。
5. 订单列表/详情：若有则确保「去支付」跳转；若无则 E2E skip。
6. E2E：`tests/e2e/payment.spec.ts` 对齐并跑通。

---

## 5. 风险与待确认

- 订单列表/详情是否存在、路径以实际项目为准；计划按「有则接、无则 skip」处理。
- 轮询间隔与超时、支付成功跳转目标、支付码展示形式以产品/后端为准，实现时补全并可在 requirement 待确认项中更新。

---

## 6. 产出与追溯

- **需求**：`.f2e-ai/requirements/20260309-ECX-8078/requirement.md`
- **测试**：`.f2e-ai/requirements/20260309-ECX-8078/test.spec.ts`，以及 `tests/e2e/payment.spec.ts`
- **计划**：`.f2e-ai/requirements/20260309-ECX-8078/plan.md`（本文件）
- **UI/API**：同目录下 `ui-notes.md`、`api-notes.md`
