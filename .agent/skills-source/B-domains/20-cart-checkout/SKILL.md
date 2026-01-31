---
name: Domain - Cart & Checkout
description: Management of shopping cart state, price calculation logic, and standardized checkout flow.
---

# 20-cart-checkout: 购物车与结算 Domain

本技能包涵盖购物车的状态维护、价格计算以及下单结算的业务全流程。要求必须遵循 `BC` 组件前缀规范及数据转换 (Transformer) 标准。

## 1. 核心流程与标准

### 1.1 组件标准化 (UI/UX)
- **命名规范**: 必须使用 `BC` 前缀。
- **结构规范**: 采用文件夹模式，包含 `index.ts` 用于导出。
- **关键组件**:
  - `BCCartItem`: 购物车行项，负责商品信息展示及单品操作。
  - `BCCartList`: 购物车主列表。
  - `BCMiniCart`: 侧边/顶部迷你购物车。
  - `BCAddressModal`: 地址管理/选择弹窗。
  - `BCOrderSummary`: 结算金额汇总面板。
  - `BCCouponSelector`: 优惠券选择器。

### 1.2 数据转换 (Transformer)
- **职责**: 隔离 API 定义与 UI 模型。
- **文件**: `app/infrastructure/transformers/cartTransformer.ts`。
- **强制性规则**: 
  - 所有 API 返回的 `snake_case` 数据必须转换为前端适配的 `camelCase`。
  - 在 `createOrder` 时使用逆向转换将数据格式化为 API 枚举/结构。

## 2. 标准作业程序 (SOP)

### 2.1 API 对接流程 (ApiFox Integration)
1. 使用 `get_project_oas` 查看 `Cart` 或 `Checkout` 模块的最新定义。
2. 在 `app/infrastructure/api/CartApiClient.ts` 中实现接口。
3. 在 `cartTransformer.ts` 中更新 `sanitizeCartItem` 和 `validateCartItem` 逻辑。

### 2.2 视觉还原流程 (Figma Mapping)
1. 定位 Figma 节点（如：购物车页 Node `1518:292`）。
2. 确保 `BCCartItem` 样式与 Figma 完全匹配。
3. 验证移动端响应式布局。

## 3. 核心业务逻辑

- **同步机制**: 
  - 登录用户：LocalStorage 与 Server 实时同步。
  - 游客：LocalStorage 存储，登录后合并。
- **价格核销**:
  - 实时计算 `Subtotal` -> `Coupon Discount` -> `Shipment` -> `Final Total`。
  - 精度处理：统一使用 `MoneyValueObject` 进行格式化展示，底层确保 integer 处理。

## 4. 验证与质量保障
- **TypeScript**: 运行 `npx vue-tsc --noEmit` 确保无类型报错。
- **测试**: 验证多优惠券叠加核销的逻辑正确性。
