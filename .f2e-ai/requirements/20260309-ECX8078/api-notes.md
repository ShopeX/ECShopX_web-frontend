# 支付页面相关接口（ECX-8078）

**任务号**：ECX-8078  
**接口来源**：Apifox 项目 6771549（需求澄清时提供）  
**文档链接**：[Apifox 项目 6771549](https://app.apifox.com/link/project/6771549)

---

## MCP 拉取说明（更新于 2026-03-11）

- **使用的 MCP**：`user-WEBSITE - API 文档`（读取“默认模块”的 OpenAPI Spec，已执行 `refresh_project_oas` 拉取最新）。
- **拉取结果**：当前默认模块 **已包含** 以下 3 个支付相关接口，本文档请求/响应与类型定义均以此次 MCP 拉取为准：
  - 获取支付方式（GET `/api/h5app/wxapp/trade/payment/list`）
  - 查询订单信息（GET `/api/h5app/wxapp/order_new/{orderId}`）
  - 查询订单支付信息（POST `/api/h5app/wxapp/payment`）
- **说明**：OAS 中「查询订单信息」路径示例为 `/api/h5app/wxapp/order_new/5181717000120064`，实际 Path 参数为 `orderId`。

---

## 1. 获取支付方式

| 项      | 值                                                                       |
| ------- | ------------------------------------------------------------------------ |
| 说明    | 支付页加载时获取可选支付方式列表                                         |
| 方法    | GET                                                                      |
| 路径    | `/api/h5app/wxapp/trade/payment/list`                                    |
| 接口 ID | 424998999                                                                |
| 链接    | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-424998999) |

### 请求

| 位置   | 参数名          | 类型   | 必填 | 说明/示例     |
| ------ | --------------- | ------ | ---- | ------------- |
| Query  | `platform`      | string | 是   | 示例：`pc`    |
| Query  | `company_id`    | string | 是   | 示例：`38`    |
| Query  | `country_code`  | string | 是   | 示例：`zh-CN` |
| Header | `Authorization` | string | 是   | Bearer Token  |

- **Body**：无。

### 请求数据类型

```ts
/** 获取支付方式 - 请求（Query + Header，由调用方拼装） */
interface GetPaymentListRequest {
  platform: string // 如 "pc"
  company_id: string // 如 "38"
  country_code: string // 如 "zh-CN"
  // Header: Authorization: Bearer <token>
}
```

### 响应数据结构体（来自 MCP）

- **200**：`application/json`，根级为对象，包含字段 `data`（数组）。

```ts
/** 支付方式项（与 Apifox/OAS 一致） */
interface PaymentMethodItem {
  pay_type_code: string // 支付方式编码，如 wxpaypc、alipay，用于「查询订单支付信息」的 pay_type
  pay_type_name: string // 展示名，如「微信支付」「支付宝」
}

/** 获取支付方式 - 200 响应 */
interface GetPaymentListResponse {
  data: PaymentMethodItem[]
}
```

- **示例**：`{ "data": [ { "pay_type_code": "wxpaypc", "pay_type_name": "微信支付" }, { "pay_type_code": "alipay", "pay_type_name": "支付宝" } ] }`

---

## 2. 查询订单信息

| 项      | 值                                                                         |
| ------- | -------------------------------------------------------------------------- |
| 说明    | 根据订单号查询订单详情，用于支付页展示订单金额、剩余支付时间及轮询支付结果 |
| 方法    | GET                                                                        |
| 路径    | `/api/h5app/wxapp/order_new/{orderId}`                                     |
| 接口 ID | 425004766                                                                  |
| 链接    | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-425004766)   |

### 请求

| 位置   | 参数名          | 类型   | 必填 | 说明/示例       |
| ------ | --------------- | ------ | ---- | --------------- |
| Path   | `orderId`       | string | 是   | 订单 ID         |
| Query  | `pay_type`      | string | 是   | 示例：`wxpaypc` |
| Query  | `company_id`    | string | 是   | 示例：`38`      |
| Query  | `country_code`  | string | 是   | 示例：`zh-CN`   |
| Header | `Authorization` | string | 是   | Bearer Token    |

- **Body**：无。

### 请求数据类型

```ts
/** 查询订单信息 - 请求（Path + Query + Header） */
interface GetOrderInfoRequest {
  orderId: string // Path
  pay_type: string // Query，支付方式编码
  company_id: string // Query
  country_code: string // Query
  // Header: Authorization: Bearer <token>
}
```

### 响应数据结构体（来自 MCP）

- **200**：`application/json`，根级为对象，包含字段 `data`（对象）。支付页主要使用：`data.total_fee`（订单金额，OAS 类型为 string，单位以后端为准）、`data.payStatus`（支付状态，用于轮询是否支付成功）、`data.orderInfo`（内含 `order_status`、`total_fee`、`auto_cancel_time`、`auto_cancel_seconds` 等）。

```ts
/** 查询订单信息 - data 顶层（支付页常用字段） */
interface GetOrderInfoResponseData {
  order_id: string
  user_id?: string
  order_type?: string
  pay_type?: string
  total_fee: string // 订单金额（OAS 为 string）
  create_time?: number
  payDate?: string
  tradeId?: string
  payStatus?: string // 支付状态，用于轮询判断是否支付成功
  orderInfo?: {
    order_id?: string
    order_status?: string
    total_fee?: string
    create_time?: number
    update_time?: number
    auto_cancel_time?: string
    auto_cancel_seconds?: number
    [key: string]: any
  }
  [key: string]: any
}

/** 查询订单信息 - 200 响应 */
interface GetOrderInfoResponse {
  data: GetOrderInfoResponseData
}
```

---

## 3. 查询订单支付信息

| 项      | 值                                                                       |
| ------- | ------------------------------------------------------------------------ |
| 说明    | 用户选择支付方式并点击「去支付」后调用，用于获取支付码（如二维码 URL）   |
| 方法    | POST                                                                     |
| 路径    | `/api/h5app/wxapp/payment`                                               |
| 接口 ID | 425006040                                                                |
| 链接    | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-425006040) |

### 请求

- **Content-Type**：`application/x-www-form-urlencoded`
- **Header**：`Authorization`（必填，Bearer Token）、`Content-Type`（必填）

| 参数名         | 类型   | 必填 | 说明/示例                                                                    |
| -------------- | ------ | ---- | ---------------------------------------------------------------------------- |
| `order_id`     | string | 是   | 订单 ID，示例：`5181717000120064`                                            |
| `pay_type`     | string | 是   | 支付方式编码，与「获取支付方式」返回的 `pay_type_code` 一致，示例：`wxpaypc` |
| `return_url`   | string | 是   | 支付完成跳转 URL，示例：`https://demo-yd-pc.shopex123.com`                   |
| `pay_channel`  | string | 是   | 支付渠道，示例：`wxpaypc`                                                    |
| `company_id`   | string | 是   | 示例：`38`                                                                   |
| `country_code` | string | 是   | 示例：`zh-CN`                                                                |

### 请求数据类型

```ts
/** 查询订单支付信息 - Body（application/x-www-form-urlencoded） */
interface PostOrderPaymentInfoRequest {
  order_id: string
  pay_type: string
  return_url: string
  pay_channel: string
  company_id: string
  country_code: string
}
```

### 响应数据结构体（来自 MCP）

- **200**：`application/json`，根级为对象，包含字段 `data`（对象）。支付码展示使用 `data.code_url`（二维码 URL 或内容）。另含 JSAPI 相关字段（appId、timeStamp、nonceStr、package、signType、paySign）及 `trade_info`、`order_info` 等。

```ts
/** 查询订单支付信息 - data（支付页主要用 code_url） */
interface PostOrderPaymentInfoResponseData {
  code_url?: string // 支付码/二维码 URL 或内容，用于展示
  appId?: string
  timeStamp?: string
  nonceStr?: string
  package?: string
  signType?: string
  paySign?: string
  order_id?: string
  team_id?: string | null
  trade_info?: {
    order_id: string
    trade_id: string
    trade_source_type: string
  }
  order_info?: Record<string, any>
  [key: string]: any
}

/** 查询订单支付信息 - 200 响应 */
interface PostOrderPaymentInfoResponse {
  data: PostOrderPaymentInfoResponseData
}
```

---

## 用途与流程简述

- **获取支付方式**：支付页进入后调用，渲染「请选择以下支付方式」列表；选中项的 `pay_type_code` 用于「查询订单支付信息」的 `pay_type`。
- **查询订单信息**：进入支付页时用 `orderId` + Query（pay_type、company_id、country_code）拉取订单摘要（金额、剩余时间）；轮询支付结果时再次调用，根据 `data.payStatus` 或 `data.orderInfo?.order_status` 判断是否支付成功；金额用 `data.total_fee`（OAS 为 string）。
- **查询订单支付信息**：用户点击「去支付」后携带 Body（order_id、pay_type、return_url、pay_channel、company_id、country_code）调用，用返回的 `data.code_url` 展示支付码区域。

---

## 项目内对齐

- 前端已使用 **`PaymentApiClient`** 封装上述 3 个接口，路径相对 baseURL 为：`/trade/payment/list`、`/order_new/{orderId}`、`/payment`；若 baseURL 未包含 `api/h5app/wxapp`，需在环境或 Client 中与 Apifox 路径对齐。
- **请求**：OAS 要求 3 个接口均带 Query/Header（platform 或 pay_type、company_id、country_code、Authorization）；「查询订单支付信息」Body 需 order_id、pay_type、return_url、pay_channel、company_id、country_code（均为必填）。项目内需在 Client 或请求拦截器中统一注入 company_id、country_code、platform 等（若后端支持从登录态或环境读取则可简化）。
- **响应**：获取支付方式返回 `data: PaymentMethodItem[]`，项为 `pay_type_code`、`pay_type_name`（项目内若沿用 `code`/`name` 需做字段映射）。查询订单信息返回 `data.total_fee`（string）、`data.payStatus`、`data.orderInfo`。查询订单支付信息返回 `data.code_url`（支付码）。类型定义以本文档为准；与 `app/infrastructure/http/clients/PaymentApiClient.ts`、`app/composables/usePayment.ts` 不一致时以接口文档为准并同步修改。
