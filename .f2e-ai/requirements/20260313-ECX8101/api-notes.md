# API 说明：ECX-8101 我的订单页面

## 接口来源

- **Apifox 项目**：`7908795`
- **来源方式**：
  - 用户在对话中提供了 2 个接口链接
  - 通过 Apifox MCP 成功刷新并读取了当前 OpenAPI Spec
- **Apifox MCP 拉取结果**：成功

## MCP 拉取说明

- 已通过 Apifox MCP 成功读取以下路径定义：
  - `GET /wxapp/orders`
  - `POST /wxapp/order/cancel`
  - `POST /wxapp/order/confirmReceipt`
  - `GET /wxapp/aftersales`
  - `POST /wxapp/aftersales`
- 说明：
  - 其中前两个接口由用户直接提供。
  - 后两个接口是根据 Teambition 任务中明确提到的“确认收货”“申请售后”动作，在同一 Apifox 项目中进一步检索到的候选接口。
  - 当前前端代码中的部分路径与 Apifox 定义存在差异，实施前需统一校准。

---

## 1. 获取用户订单列表

| 项 | 值 |
| --- | --- |
| 方法 | `GET` |
| 路径 | `/wxapp/orders` |
| 接口 ID | `426273537` |
| 说明 | 获取用户订单列表 |
| 链接 | <https://app.apifox.com/link/project/7908795/apis/api-426273537> |

### 请求参数

| 位置 | 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Query | `status` | integer/string | 否 | 订单状态（0：全部，5：待付款，1：待收货，4：待自提，3：待评价） |
| Query | `page` | integer | 否 | 当前页，从 1 开始 |
| Query | `pageSize` | integer | 否 | 每页数量，最大 50 |
| Query | `order_id` | string | 否 | 订单号 |
| Query | `mobile` | string | 否 | 手机号 |
| Query | `time_start_begin` | string | 否 | 查询开始时间 |
| Query | `time_start_end` | string | 否 | 查询结束时间 |
| Query | `is_rate` | string | 否 | 是否评价 |

### 请求数据结构体

```ts
interface GetUserOrdersParams {
  status?: string | number
  page?: number
  pageSize?: number
  order_id?: string
  mobile?: string
  time_start_begin?: string
  time_start_end?: string
  is_rate?: string
}
```

### 响应数据结构体

```ts
interface UserOrderItem {
  order_id: string
  title: string
  total_fee: string
  order_status: string
  delivery_status?: string
  cancel_status?: string
  pay_status?: string
  create_time: string | number
  receiver_name?: string
  receiver_mobile?: string
  item_infos?: unknown[]
  [key: string]: unknown
}

interface GetUserOrdersResponse {
  data: {
    list: UserOrderItem[]
    total_count?: number
    page?: number
    pageSize?: number
  }
}
```

### 对接关注点

- Apifox 的订单状态字段是 `order_status`、`delivery_status`、`cancel_status`、`pay_status` 组合，不是当前前端 `pending_payment` 这类枚举。
- 现有 `useOrders.ts` 传给接口的参数是 `status`、`page`、`page_size`，与 Apifox 当前定义 **不一致**，需要统一转换规则。
- 任务中要求的“全部 / 待支付 / 待收货 / 售后 / 待评价”等前端筛选项，可能需要由多个后端字段组合映射。

---

## 2. 订单取消

| 项 | 值 |
| --- | --- |
| 方法 | `POST` |
| 路径 | `/wxapp/order/cancel` |
| 接口 ID | `426273544` |
| 说明 | 订单取消 |
| 链接 | <https://app.apifox.com/link/project/7908795/apis/api-426273544> |

### 请求参数

当前线程通过 OAS 成功确认到路径存在，但返回内容中未单独展开足够清晰的请求体描述。结合当前前端实现，调用侧大概率需要传 `order_id`。

```ts
interface CancelOrderRequest {
  order_id: string
}
```

### 响应数据结构体

```ts
interface CancelOrderResponse {
  data?: Record<string, unknown>
  [key: string]: unknown
}
```

### 对接关注点

- 当前前端 `OrderApiClient.cancelOrder()` 调的是 `/order/cancel`，而 Apifox 文档是 `/wxapp/order/cancel`。
- 需要确认 HTTP client 的 baseURL/path rewrite 规则，避免重复拼接或请求错地址。

---

## 3. 确认收货

| 项 | 值 |
| --- | --- |
| 方法 | `POST` |
| 路径 | `/wxapp/order/confirmReceipt` |
| 接口 ID | 未在当前线程单独提供 |
| 说明 | 买家确认收货 |

### 请求数据结构体

当前线程未单独展开该接口的请求参数定义；结合现有前端实现，可先按以下结构作为对接候选：

```ts
interface ConfirmReceiptRequest {
  order_id: string
}
```

### 响应数据结构体

```ts
interface ConfirmReceiptResponse {
  data?: Record<string, unknown>
  [key: string]: unknown
}
```

### 对接关注点

- 当前前端 `OrderApiClient.confirmReceipt()` 调的是 `/order/confirm`，与 Apifox 中的 `/wxapp/order/confirmReceipt` 不一致。
- 该差异必须在实施前统一，否则确认收货能力会落到错误路径。

---

## 4. 申请售后

| 项 | 值 |
| --- | --- |
| 方法 | `POST` |
| 路径 | `/wxapp/aftersales` |
| 接口 ID | 未在当前线程单独提供 |
| 说明 | 创建售后单 |

### 请求参数

| 位置 | 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Query | `order_id` | string | 是 | 订单号 |
| Query | `item_id` | string | 是 | 交易商品 ID |
| Query | `reason` | string | 是 | 申请售后原因 |
| Query | `detail` | string | 是 | 售后商品明细 |
| Query | `aftersales_type` | string | 是 | `ONLY_REFUND` / `REFUND_GOODS` / `EXCHANGING_GOODS` |
| Query | `description` | string | 是 | 申请描述 |

### 请求数据结构体

```ts
interface CreateAftersalesRequest {
  order_id: string
  item_id: string
  reason: string
  detail: string
  aftersales_type: 'ONLY_REFUND' | 'REFUND_GOODS' | 'EXCHANGING_GOODS'
  description: string
}
```

### 响应数据结构体

```ts
interface CreateAftersalesResponse {
  data: Record<string, unknown>
}
```

### 对接关注点

- 若订单页仅提供“申请售后”入口而不直接提交流程，可改为跳转售后页，而不是在订单列表页直接调 `POST /wxapp/aftersales`。
- 是否需要同时接 `GET /wxapp/aftersales` 来展示售后状态，需结合设计稿与产品流程确认。

---

## 5. 售后列表

| 项 | 值 |
| --- | --- |
| 方法 | `GET` |
| 路径 | `/wxapp/aftersales` |
| 说明 | 获取售后单列表 |

### 请求参数

| 位置 | 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Query | `page` | integer | 否 | 当前页 |
| Query | `pageSize` | integer | 否 | 每页数量 |
| Query | `aftersales_type` | string | 否 | 售后类型 |
| Query | `aftersales_status` | string | 否 | 售后状态 |
| Query | `order_id` | string | 否 | 订单号 |
| Header | `Authorization` | string | 是 | JWT token |

### 响应数据结构体

```ts
interface AftersalesListResponse {
  data: {
    total_count: number
    list: Record<string, unknown>[]
  }
}
```

### 对接关注点

- 如果“售后”是订单页内的一个状态 Tab，那么它可能不是直接复用订单列表接口，而是需要单独走售后列表接口。
- 任务原文只有“售后”字样，没有明确写明其行为是“展示售后单”还是“售后中的订单”，这部分仍需产品确认。

---

## 当前前端实现与文档差异

### 已存在的前端调用

- `app/infrastructure/http/clients/OrderApiClient.ts`
  - `getOrderList()` 当前调用 `/order/list`
  - `cancelOrder()` 当前调用 `/order/cancel`
  - `confirmReceipt()` 当前调用 `/order/confirm`
  - `deleteOrder()` 当前调用 `/order/delete`

### 差异结论

1. **订单列表路径不一致**
   - 文档：`/wxapp/orders`
   - 当前前端：`/order/list`

2. **确认收货路径不一致**
   - 文档：`/wxapp/order/confirmReceipt`
   - 当前前端：`/order/confirm`

3. **删除订单接口未核实**
   - 当前前端已有 `/order/delete` 调用
   - 本次 Apifox 拉取中未同步核实到对应路径，暂列为待确认

4. **支付链路已存在**
   - 当前 `useOrders.ts` 的“立即支付”是直接跳转 `/payment?orderId=...`
   - 支付页及支付相关 API 已在项目中存在，可优先复用

## 待补充项

- [ ] 删除订单的正式接口文档
- [ ] 待评价相关接口或状态字段说明
- [ ] “待字体”真实状态对应的接口字段映射
- [ ] 订单详情 / 物流 / 售后详情是否需要在本需求中同步接入
