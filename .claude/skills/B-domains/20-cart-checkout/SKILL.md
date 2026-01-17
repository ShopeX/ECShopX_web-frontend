# 20-cart-checkout: 购物车与结算 Domain

本技能包涵盖购物车的状态维护、价格计算以及下单结算的业务全流程。

## 1. 购物车逻辑 (Cart Management)

- **同步机制**: 
  - 登录用户：LocalStorage 与 Server 实时同步。
  - 游客：纯 LocalStorage 存储，登录后触发表单合并。
- **失效处理**: 实时核对库存与上下架状态，标记失效商品。
- **价格汇总**: 实时计算 `Item Total` -> `Discounts` -> `Final Total`。

## 2. 结算页流程 (Checkout Flow)

- **地址管理**: 
  - 默认地址优先加载。
  - 地址簿弹窗选择及新增校验。
- **价格核销**:
  - 在线核对优惠券可用性。
  - 预估运费计算。
- **提交订单**: 
  - 所有必填项校验（地址、支付方式）。
  - 下单成功后的支付跳转及轮询确认。

## 3. UI 组件与 Store

- **关键组件**: 
  - `CartItem.vue`: 购物车行项。
  - `AddressSelector.vue`: 地址选择器。
  - `CheckoutSummary.vue`: 结算明细面板。
- **关键 Store**:
  - `useCartStore`: 购物车加减选全及汇总逻辑。

## 4. 转换逻辑测试 (Unit Testing)
- 重点测试价格计算的精度问题（避免 js 浮点数误差，使用分或 BigInt 转换）。
- 验证多优惠券叠加核销的逻辑正确性。
