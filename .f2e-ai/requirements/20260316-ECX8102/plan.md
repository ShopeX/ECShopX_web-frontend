# ECX-8102 优惠券列表页面 开发计划

## 与 handbook 对齐

- **技术栈**：Nuxt 4 + Vue 3 + TypeScript，Tailwind，`~/` 别名，页面在 `app/pages/`，组件在 `app/components/` 或 `app/pages/account/components/`。
- **HTTP**：仅通过 `app/infrastructure/http/clients` 的 ApiClient 发请求；数据转换用 `app/infrastructure/transformers`；全局参数 `company_id` / `country_code` 由 `plugins/http.ts` 自动注入，不在业务中重复传。
- **E2E**：Playwright，`testIdAttribute: 'data-testid'`；关键容器、Tab、列表、卡片、空状态需设置 `data-testid`，与 `test.spec.ts` 一致。
- **命名**：composables 为 `useXxx.ts`，ApiClient 为 `XxxApiClient.ts`，transformers 为 `xxxTransformer.ts`；页面用 `<script setup lang="ts">`，Props 小驼峰。
- **样式**：Tailwind 优先，颜色/间距与 `ui-notes.md`、Figma 规范一致（#191a1d、#4a5565、#99a1af、#e5e7eb、#f3f4f6 等）。
- **UI 还原**：执行 UI 时**必须通过 Figma MCP 方式精准还原**（如 `get_design_context` 等），以设计稿节点为准获取尺寸、间距、字体、颜色，避免凭记忆或文字描述实现；验收依据为 Figma H5 节点 `2956:17534`。

---

## 1. 目标与范围

- 实现 **H5 端**优惠券列表页：路由 `/account/coupons`，仅移动端布局（本需求不要求 PC 端改造）。
- 能力：展示「可用优惠券」「不可用优惠券」两个 Tab；列表数据来自 `GET /wxapp/user/getUserCardList`；卡片展示金额、门槛、标题、描述、有效期；空状态展示。
- 验收：与 `.f2e-ai/requirements/20260316-ECX8102/test.spec.ts` 及 `requirement.md` 验收标准一致。

---

## 2. 接口与数据

### 2.1 接口

- **需求约定**：`GET /wxapp/user/getUserCardList`（见 `api-notes.md`）。  
- **现状**：`CouponApiClient` 当前为 `getCouponList` 调用 `/wxapp/user/newGetCardList`。  
- **动作**：  
  - 在 `app/infrastructure/http/clients/CouponApiClient.ts` 中新增方法（如 `getUserCardList()`），请求 `GET /wxapp/user/getUserCardList`；或与后端确认是否统一为 `getUserCardList` 后替换现有路径。  
  - 若接口有分页/筛选参数，按 Apifox 文档在方法签名中体现，本需求先实现首屏列表即可。

### 2.2 响应与转换

- **说明**：`api-notes.md` 未拉取到响应体，需与 Apifox/后端确认列表项字段及「可用/不可用」含义（如状态码或布尔字段）。  
- **动作**：  
  - 在 `app/infrastructure/transformers` 中新增或复用转换：将 `getUserCardList` 的列表转为前端模型，至少包含：金额、门槛文案（满xxx可用）、标题、描述、有效期、可用/不可用标识。  
  - 若现有 `ICouponModel`（orderTransformer）字段足够，可复用并扩展（如增加 `usable: boolean`、`thresholdText`、`expireText`）；若接口结构差异大，可新增 `IUserCardModel` 及对应 `userCardTransformer`，避免与结算场景的 coupon 模型混淆。

---

## 3. 页面与布局（H5）

**UI 还原约定**：本节所有布局与样式实现时，**须通过 Figma MCP 精准还原**（调用 Figma MCP 获取 H5 节点 `2956:17534` 的设计上下文、截图、标注），按设计稿的尺寸、间距、字体、颜色落码，不以文字描述代替量值。

### 3.1 页面文件

- **文件**：`app/pages/account/coupons.vue`。  
- **动作**：  
  - 增加 H5 专用布局：在移动端 viewport（如 max-width 或媒体查询 375px 逻辑宽度）下，不展示左侧 `AccountMenu` 或改为抽屉/顶部返回，主区域为单列：FilterBar（标题「优惠券」+ 箭头）+ Tab（可用/不可用）+ 列表/空状态。布局与间距以 **Figma MCP 拉取的设计上下文**为准。  
  - 可通过 `useMediaQuery` 或 class 控制：大屏保留现有 PC 布局，小屏（如 `<768px`）使用 H5 布局；或本需求仅做 H5 布局，PC 保持现状。  
  - 根容器增加 `data-testid="coupons-page"`。

### 3.2 FilterBar

- 标题「优惠券」+ 下拉箭头（若设计稿有）；区域 padding 16px。**通过 Figma MCP 核对** FilterBar 节点（如 2956:17728）的尺寸与样式，确保精准还原。

### 3.3 Tab（可用 / 不可用）

- 两个 Tab：「可用优惠券(n)」「不可用优惠券(n)」，n 为数量，来自接口分组后的 length。  
- 选中态：底部 2px 黑色下划线、文案色 #191a1d；未选中 #4a5565，数量色 #99a1af。**字体、颜色、下划线等以 Figma MCP 获取的 Tab 节点（如 3375:4415）为准，实现时通过 MCP 精准还原。**  
- 为 E2E 与无障碍：每个 Tab 按钮设置 `data-testid="coupons-tab-available"`、`data-testid="coupons-tab-unavailable"`，并设置 `aria-selected`（或可被测试识别的选中态属性）。  
- 切换 Tab 时仅切换下方列表数据来源（可用列表 / 不可用列表），不发起新请求（数据在首屏拉取后分组）。

### 3.4 列表与空状态

- 列表容器：`data-testid="coupons-list"`（或按 Tab 拆为 `coupons-list-available` / `coupons-list-unavailable`，与 test 约定一致）；单列，卡片间距 16px（**以 Figma MCP 设计稿为准**）。  
- 空状态：当当前 Tab 下无数据时展示，容器 `data-testid="coupons-empty"`，文案如「暂无优惠券」或与现有 account 空状态统一。

---

## 4. 优惠券卡片

**UI 还原约定**：卡片样式与结构**须通过 Figma MCP 精准还原**（拉取卡片节点如 3375:4422 的设计上下文），按设计稿的左右分区、字号、颜色、圆角、边框落码。

### 4.1 复用与扩展

- **现状**：`app/pages/account/components/CouponCard.vue` 有 `amount`、`title`、`description`，无门槛、有效期。  
- **动作**：  
  - 扩展 Props：增加 `thresholdText`（如「满500可用」）、`expireText`（如「有效期至 2026-06-30」），可选；样式与 `ui-notes.md` 一致：左侧灰色块（#f3f4f6）金额+门槛，右侧标题+描述+有效期（12px #99a1af，可选时钟图标）。**实现时必须通过 Figma MCP 获取该卡片节点的精确尺寸、字体、颜色与间距，做到 1:1 还原。**  
  - 每张卡片根元素设置 `data-testid="coupon-card"`。  
- 若选用 `BCCouponCard`：评估其 Props/事件是否满足「仅展示、无领取/使用」；若满足且样式可配置，可复用并加 `data-testid`，否则以扩展后的 `CouponCard` 为主。

---

## 5. 数据流与 composable（可选）

- 在页面内直接使用 `couponApiClient.getUserCardList()`（或新方法）+ transformer 亦可。  
- 若希望与订单页一致，可新增 `app/composables/useUserCoupons.ts`：封装拉取 `getUserCardList`、转换为可用/不可用分组、返回 `availableList`、`unavailableList`、`loading`、`error`；页面调用该 composable 并绑定到 Tab 与列表。  
- 不强制 composable，以「页面可读、易测」为准。

---

## 6. 验证与测试

- **E2E**：在 H5 viewport（375×667）下运行 `.f2e-ai/requirements/20260316-ECX8102/test.spec.ts`，所有用例通过。  
- **手工**：H5 下访问 `/account/coupons`，对照 Figma H5 设计稿（建议通过 Figma MCP 截图对比）确认 Tab 切换、列表/空状态、卡片信息与设计稿一致；UI 实现阶段应以 Figma MCP 方式精准还原后再验收。  
- **接口**：确认实际请求为 `GET /wxapp/user/getUserCardList`（或与后端约定路径），响应字段与 transformer 假设一致。

---

## 7. 文件改动清单

| 文件 | 动作 |
|------|------|
| `app/infrastructure/http/clients/CouponApiClient.ts` | 新增 `getUserCardList()`（或替换为约定路径） |
| `app/infrastructure/transformers` | 新增或扩展：将 getUserCardList 响应转为带可用/不可用、门槛、有效期的列表模型 |
| `app/pages/account/coupons.vue` | H5 布局、Tab、列表/空状态、data-testid；调用接口与 transformer |
| `app/pages/account/components/CouponCard.vue` | 扩展 thresholdText、expireText，左侧金额块+右侧文案区样式，data-testid="coupon-card" |
| 可选 | `app/composables/useUserCoupons.ts` 封装拉取与分组 |

---

## 8. 依赖与风险

- 依赖后端 `getUserCardList` 的响应结构；若与当前假设不符，需调整 transformer 与字段映射。  
- Tab 的「可用/不可用」若接口无明确字段，需与后端约定或前端根据有效期/状态推导。
