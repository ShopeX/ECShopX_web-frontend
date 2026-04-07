# API Notes — 20260321-ECX8170 订单详情页

> Apifox 需登录认证，未通过 WebFetch 自动拉取完整 Schema。
> 以下结构体基于现有代码（`order.ts`、`orderTransformer.ts`）推导，开发前请核对：
> https://app.apifox.com/link/project/7908795/apis/api-426273535

---

## 接口概览

| 字段 | 内容 |
|------|------|
| 接口名称 | 获取订单详情 |
| 方法 | GET |
| 路径 | /wxapp/order/{order_id} |
| 接口 ID | 426273535 |
| 认证 | 需要 Authorization header（由 `http.ts` 统一注入） |

---

## 请求参数

### Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | string | 是 | 订单 ID |

### Query 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| company_id | string | 是 | 由 `http.ts` 全局注入 |
| country_code | string | 是 | 由 `http.ts` 全局注入 |

> 具体是否有其他 query 参数，请以 Apifox 文档为准。

---

## 响应数据结构（推导版）

基于现有 `IApiOrder` 类型及 `toOrderModel` 转换逻辑推导，**需以 Apifox 实际返回为准**：

```typescript
// 推导的订单详情 API 响应结构（待核实）
interface IApiOrderDetail {
  order_id: string              // 订单号
  create_time?: string | number // 下单时间
  order_time?: string           // 下单时间（兼容字段）

  // 状态字段（组合判断）
  pay_status?: string | number  // 支付状态：0=未支付
  delivery_status?: string | number // 发货状态：0=未发货 1=已发货 2=已完成
  cancel_status?: string | number   // 取消状态：非0=已取消
  status?: string               // 兼容旧接口直接返回状态字符串

  // 金额
  total_fee?: string | number   // 实付金额（分）
  total_amount?: number         // 实付金额（分，兼容字段）
  item_fee?: number             // 商品小计（分）
  freight_fee?: number          // 运费（分）
  discount_fee?: number         // 优惠金额（分）

  // 收货地址
  receiver_name?: string        // 收货人姓名
  receiver_mobile?: string      // 收货人电话
  shipping_address?: string     // 收货地址文本

  // 商品列表
  item_infos?: IApiOrderItem[]  // 商品项列表（主字段）
  items?: IApiOrderItem[]       // 商品项列表（兼容字段）

  // 物流（待 Apifox 确认）
  logistics_no?: string         // 运单号（待确认字段名）
  logistics_company?: string    // 物流公司（待确认字段名）
  logistics_traces?: Array<{    // 物流轨迹（待确认）
    time: string
    content: string
  }>

  [key: string]: any
}
```

### 商品项结构（`IApiOrderItem`，已有定义）

```typescript
interface IApiOrderItem {
  item_id: string
  item_name?: string        // 商品名称
  title?: string            // 商品名称（兼容）
  item_image?: string       // 商品图片
  item_pic?: string         // 商品图片（兼容）
  spec_name?: string        // 规格名称
  sku_no?: string           // 款号（已在 toOrderItemModel 中处理）
  spec_style?: string       // 款式
  spec_size?: string        // 尺寸
  quantity?: number         // 数量（多字段兼容）
  num?: number
  buy_num?: number
  goods_num?: number
  price: number             // 单价（分）
}
```

---

## 前端转换建议

订单详情复用现有 `OrderTransformer.toOrderModel()`，需额外补充：

1. **物流轨迹转换**：新增 `toLogisticsModel()` 方法，处理 `logistics_traces` 字段
2. **详细地址转换**：`shipping_address` 若为结构体需拆分，若为字符串直接展示
3. **金额明细**：详情页需展示 `item_fee`、`freight_fee`、`discount_fee` 明细，列表页只展示 `total_fee`

---

## 待确认项

- [ ] 物流信息的具体字段名（`logistics_no`、`logistics_traces` 等）
- [ ] 收货地址是字符串还是结构体对象
- [ ] 金额明细字段是否在详情接口中全部返回
- [ ] 是否有独立的物流查询接口，还是订单详情接口已包含物流轨迹
