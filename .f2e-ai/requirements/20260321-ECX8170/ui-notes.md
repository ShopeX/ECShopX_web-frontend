# UI Notes — 20260321-ECX8170 订单详情页

> Figma 设计稿未通过 MCP 自动拉取（Figma 需登录认证），以下分析基于需求描述 + 现有代码结构推导。
> 开发前请手动打开以下链接参考：
> - PC：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2297-2119
> - H5：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2945-3802

---

## 页面路由

| 端 | 路径建议 |
|----|---------|
| PC | `app/pages/account/orders/[id].vue` |
| H5 | 同上，响应式适配 |

与现有订单列表页 `app/pages/account/orders.vue` 保持目录一致性。

---

## 页面区块拆分

基于需求范围（订单详情 + 操作按钮 + 物流轨迹），页面分为以下区块：

### 区块 1：订单状态 Header
- 订单当前状态文字（如"待收货"）
- 状态图标或进度条（可选）

### 区块 2：收货地址
- 收货人姓名 + 电话
- 完整收货地址

### 区块 3：商品列表
- 每个商品：图片、名称、规格、款号、数量、单价
- 与订单列表已有的 `toOrderItemModel` 数据结构对齐

### 区块 4：金额明细
- 商品小计、运费、优惠折扣、实付金额

### 区块 5：订单信息
- 订单号、下单时间、支付方式（若有）

### 区块 6：物流轨迹
- 物流公司、运单号
- 时间线：时间 + 物流节点描述

### 区块 7：操作按钮栏
- 根据订单状态动态显示（取消、支付、确认收货、申请售后等）
- PC 端：底部右对齐
- H5 端：底部固定栏

---

## 组件拆分建议

### 新建组件

| 组件名 | 路径 | 说明 |
|--------|------|------|
| `OrderDetailStatus.vue` | `app/pages/account/components/` | 订单状态展示区块 |
| `OrderDetailAddress.vue` | `app/pages/account/components/` | 收货地址展示 |
| `OrderDetailItems.vue` | `app/pages/account/components/` | 商品列表（详情版） |
| `OrderDetailAmountSummary.vue` | `app/pages/account/components/` | 金额明细 |
| `OrderDetailInfo.vue` | `app/pages/account/components/` | 订单基本信息 |
| `OrderDetailLogistics.vue` | `app/pages/account/components/` | 物流轨迹时间线 |
| `OrderDetailActions.vue` | `app/pages/account/components/` | 操作按钮栏 |

### 可复用现有组件

| 组件 | 路径 | 复用场景 |
|------|------|---------|
| `AccountH5FilterBar.vue` | `app/pages/account/components/` | H5 端顶栏导航（含返回按钮） |
| `AccountMenu.vue` | `app/pages/account/components/` | PC 端左侧菜单 |

> `AccountH5FilterBar` 已支持 `showBack` prop，H5 订单详情页可直接传入 `showBack: true`。

---

## 新建 Composable

| 文件 | 说明 |
|------|------|
| `app/composables/useOrderDetail.ts` | 管理订单详情数据、物流信息、操作按钮逻辑 |

可参考现有 `useOrders.ts` 的结构，提供：
- `fetchOrderDetail(orderId)`
- `cancelOrder / confirmReceipt / applyAftersales`

---

## 状态与操作按钮映射

基于 `orderTransformer.ts` 中现有逻辑：

| 状态 | 可用按钮 |
|------|---------|
| `pending_payment` | 取消订单、立即支付 |
| `pending_shipment` | 申请售后 |
| `shipped` | 确认收货、申请售后、查看物流 |
| `completed` | 申请售后、评价（待评价时） |
| `cancelled` | 删除订单 |

---

## PC / H5 差异点

| 要素 | PC | H5 |
|------|----|----|
| 布局容器 | 左菜单 + 右内容区（与 orders.vue 一致） | 全屏单栏 |
| 顶栏 | 无 | `AccountH5FilterBar` 含返回按钮 |
| 操作按钮位置 | 页面底部右对齐 | 底部固定栏（fixed） |
| 物流时间线 | 左侧时间 + 右侧内容 | 竖向时间线 |
