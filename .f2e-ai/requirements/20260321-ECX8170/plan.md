# 开发计划 — 20260321-ECX8170 订单详情页

## 与 Handbook 对齐

| 约束 | 本计划的应用 |
|------|-------------|
| 页面使用文件系统路由 | 新建 `app/pages/account/orders/[id].vue` |
| 组件命名 PascalCase，页面子组件放 `account/components/` | 所有新建组件均放该目录 |
| Composable 命名 `useXxx.ts` | 新建 `useOrderDetail.ts` |
| HTTP 层通过 ApiClient，不直接用 axios | 扩展 `OrderApiClient` 添加 `getOrderDetail` |
| 数据转换在 transformer | 扩展 `orderTransformer.ts` |
| 类型集中在 `app/types/api/` | 扩展 `app/types/api/order.ts` |
| Tailwind + `<script setup lang="ts">` | 全部遵循 |
| `data-testid` 作为 E2E 选择器 | 所有关键区块和按钮均添加 |

---

## 文件改动清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `app/pages/account/orders/[id].vue` | 订单详情页（PC + H5 响应式） |
| `app/composables/useOrderDetail.ts` | 订单详情数据管理、操作按钮逻辑 |
| `app/pages/account/components/OrderDetailStatus.vue` | 订单状态 Header |
| `app/pages/account/components/OrderDetailAddress.vue` | 收货地址区块 |
| `app/pages/account/components/OrderDetailItems.vue` | 商品列表区块 |
| `app/pages/account/components/OrderDetailAmountSummary.vue` | 金额明细区块 |
| `app/pages/account/components/OrderDetailInfo.vue` | 订单基本信息（订单号、时间等） |
| `app/pages/account/components/OrderDetailLogistics.vue` | 物流轨迹时间线 |
| `app/pages/account/components/OrderDetailActions.vue` | 操作按钮栏（PC 右对齐 / H5 fixed） |

### 修改文件

| 文件 | 改动内容 |
|------|---------|
| `app/infrastructure/http/clients/OrderApiClient.ts` | 新增 `getOrderDetail(orderId: string)` 方法，调用 `GET /wxapp/order/{order_id}` |
| `app/infrastructure/transformers/orderTransformer.ts` | 新增 `toOrderDetailModel()`，补充 `toLogisticsModel()` |
| `app/types/api/order.ts` | 新增 `IApiOrderDetail`、`IOrderDetailModel`、`ILogisticsTrace` 类型 |
| `app/pages/account/orders.vue` | 订单行添加 `data-testid="order-item"`、`data-status`，点击跳转详情页 |

---

## 各步骤详细说明

### Step 1：类型扩展

**文件**：`app/types/api/order.ts`

新增：

```ts
// 订单详情 API 响应（对齐 api-notes 推导结构，以 Apifox 实际返回为准）
interface IApiOrderDetail extends IApiOrder {
  receiver_name?: string
  receiver_mobile?: string
  shipping_address?: string
  item_fee?: number
  freight_fee?: number
  discount_fee?: number
  logistics_no?: string
  logistics_company?: string
  logistics_traces?: Array<{ time: string; content: string }>
}

// 物流轨迹前端模型
interface ILogisticsTrace {
  time: string
  content: string
}

// 订单详情前端展示模型
interface IOrderDetailModel extends IOrderModel {
  receiverName: string
  receiverMobile: string
  shippingAddress: string
  itemFee: string        // 已格式化为元
  freightFee: string
  discountFee: string
  logisticsNo: string
  logisticsCompany: string
  logisticsTraces: ILogisticsTrace[]
}
```

**验证**：`vue-tsc` 无类型报错

---

### Step 2：HTTP 层

**文件**：`app/infrastructure/http/clients/OrderApiClient.ts`

在现有 `OrderApiClient` 类中添加方法：

```ts
async getOrderDetail(orderId: string): Promise<IApiOrderDetail> {
  const { data } = await this.http.get(`/wxapp/order/${orderId}`)
  return data
}
```

- `company_id` / `country_code` 由 `http.ts` 全局注入，无需重复传
- 导出时保持与现有单例模式一致

**验证**：在浏览器 Network 面板确认请求路径与参数正确

---

### Step 3：Transformer 扩展

**文件**：`app/infrastructure/transformers/orderTransformer.ts`

新增两个函数：

```ts
// 物流轨迹转换
function toLogisticsModel(raw: IApiOrderDetail): ILogisticsTrace[] {
  return (raw.logistics_traces ?? []).map((t) => ({
    time: t.time,
    content: t.content,
  }))
}

// 订单详情模型转换（复用 toOrderModel 的金额/状态逻辑）
function toOrderDetailModel(raw: IApiOrderDetail): IOrderDetailModel {
  const base = toOrderModel(raw)
  return {
    ...base,
    receiverName: raw.receiver_name ?? '',
    receiverMobile: raw.receiver_mobile ?? '',
    shippingAddress: raw.shipping_address ?? '',
    itemFee: formatFen(raw.item_fee ?? 0),
    freightFee: formatFen(raw.freight_fee ?? 0),
    discountFee: formatFen(raw.discount_fee ?? 0),
    logisticsNo: raw.logistics_no ?? '',
    logisticsCompany: raw.logistics_company ?? '',
    logisticsTraces: toLogisticsModel(raw),
  }
}
```

**验证**：单独调用转换函数，确认金额格式化与状态映射正确

---

### Step 4：Composable

**文件**：`app/composables/useOrderDetail.ts`

```ts
export function useOrderDetail() {
  const order = ref<IOrderDetailModel | null>(null)
  const loading = ref(false)

  async function fetchOrderDetail(orderId: string) {
    loading.value = true
    try {
      const raw = await orderApiClient.getOrderDetail(orderId)
      order.value = toOrderDetailModel(raw)
    } finally {
      loading.value = false
    }
  }

  // 操作按钮映射（对齐 ui-notes 状态表）
  const availableActions = computed<string[]>(() => {
    if (!order.value) return []
    switch (order.value.status) {
      case 'pending_payment': return ['cancel', 'pay']
      case 'pending_shipment': return ['aftersales']
      case 'shipped':         return ['confirm_receipt', 'aftersales', 'logistics']
      case 'completed':       return ['aftersales']
      case 'cancelled':       return ['delete']
      default:                return []
    }
  })

  async function cancelOrder() { /* 调用取消接口，成功后刷新详情 */ }
  async function confirmReceipt() { /* 调用确认收货接口，成功后刷新详情 */ }
  function applyAftersales() { /* 跳转售后页或弹窗 */ }

  return { order, loading, fetchOrderDetail, availableActions, cancelOrder, confirmReceipt, applyAftersales }
}
```

**验证**：在详情页使用后，确认 `availableActions` 随不同状态订单正确变化

---

### Step 5：子组件（共 7 个）

所有组件遵循：`<script setup lang="ts">` + `defineProps<Props>()` + Tailwind + `data-testid`

#### OrderDetailStatus.vue
- Props：`status: string`
- 展示状态图标 + 文字（如"待发货"）
- `data-testid="order-detail-status"`

#### OrderDetailAddress.vue
- Props：`name: string; mobile: string; address: string`
- 三行展示
- `data-testid="order-detail-address"`，子元素分别加 `receiver-name`、`receiver-mobile`、`shipping-address`

#### OrderDetailItems.vue
- Props：`items: IOrderItemModel[]`
- 列表渲染，复用 `toOrderItemModel` 已有字段
- `data-testid="order-detail-items"`，每行 `data-testid="order-item-row"`
- 子元素：`item-name`、`item-quantity`、`item-price`

#### OrderDetailAmountSummary.vue
- Props：`itemFee: string; freightFee: string; discountFee: string; totalFee: string`
- 表格或列表展示金额行
- `data-testid="order-detail-amount"`，实付金额行加 `data-testid="total-fee"`

#### OrderDetailInfo.vue
- Props：`orderId: string; createTime: string; paymentMethod?: string`
- `data-testid="order-detail-info"`，子元素：`order-id`、`order-create-time`

#### OrderDetailLogistics.vue
- Props：`company: string; trackingNo: string; traces: ILogisticsTrace[]`
- 竖向时间线：PC 左时间右内容，H5 单列
- `data-testid="order-detail-logistics"`，每条轨迹 `data-testid="logistics-trace-item"`

#### OrderDetailActions.vue
- Props：`actions: string[]`
- Emits：`cancel`、`pay`、`confirmReceipt`、`aftersales`、`delete`
- PC 端：`flex justify-end gap-3`
- H5 端：`fixed bottom-0 left-0 right-0 z-10 flex gap-2 p-4 bg-white border-t`
- `data-testid="order-detail-actions"`，各按钮：`btn-cancel-order`、`btn-pay-now`、`btn-confirm-receipt`、`btn-apply-aftersales`

**验证**：Storybook 或在详情页内逐一检查各组件渲染与 data-testid 存在性

---

### Step 6：订单详情页

**文件**：`app/pages/account/orders/[id].vue`

结构：

```vue
<script setup lang="ts">
const route = useRoute()
const orderId = route.params.id as string
const { order, loading, fetchOrderDetail, availableActions, cancelOrder, confirmReceipt, applyAftersales } = useOrderDetail()
onMounted(() => fetchOrderDetail(orderId))
</script>

<template>
  <!-- PC 布局：左菜单 + 右内容（与 orders.vue 一致） -->
  <!-- H5 布局：顶栏 AccountH5FilterBar（showBack: true）+ 内容区 pb-20 -->
  <div data-testid="order-detail-page">
    <OrderDetailStatus :status="order?.status" />
    <OrderDetailAddress ... />
    <OrderDetailItems ... />
    <OrderDetailAmountSummary ... />
    <OrderDetailInfo ... />
    <OrderDetailLogistics ... />
    <OrderDetailActions :actions="availableActions" @cancel="cancelOrder" ... />
  </div>
</template>
```

- H5 内容区底部加 `pb-20` 避免 fixed 按钮栏遮挡
- Loading 状态显示骨架屏或 ECLoading 组件

**验证**：PC 宽度 1280px + H5 宽度 375px 分别截图对比 Figma

---

### Step 7：订单列表页补充入口

**文件**：`app/pages/account/orders.vue`

- 每个订单行添加 `data-testid="order-item"` 和 `:data-status="order.status"`
- 点击行跳转：`navigateTo('/account/orders/' + order.id)`

**验证**：点击列表行确认路由跳转正确

---

## 验证方式

1. 本地 `pnpm dev` 启动，手动验证 PC（1280px）和 H5（375px）渲染
2. 对照 Figma 设计稿验收还原度：
   - PC：node-id `2297-2119`
   - H5：node-id `2945-3802`
3. 执行 `pnpm playwright test .f2e-ai/requirements/20260321-ECX8170/test.spec.ts` 运行 TC-01～TC-10
4. 确认 `vue-tsc` 无类型报错

---

## 待确认项（开发前需核实）

- [ ] 物流信息字段名（`logistics_no`、`logistics_traces`）以 Apifox 实际返回为准
- [ ] 收货地址是字符串还是结构体
- [ ] 金额明细字段（`item_fee`、`freight_fee`、`discount_fee`）是否在详情接口中返回
- [ ] 操作接口（取消、确认收货）的路径与参数（可参考现有 `useOrders.ts`）
