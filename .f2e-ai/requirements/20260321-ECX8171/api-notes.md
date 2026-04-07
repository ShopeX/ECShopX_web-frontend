# API Notes — 20260321-ECX8171 物流详情组件

> Apifox MCP 拉取成功，已获取 `/wxapp/trackerpull` 的接口定义。
> 接口 ref：`/paths/_wxapp_trackerpull.json`

---

## 接口概览

| 字段 | 内容 |
|------|------|
| 接口名称 | 物流查询 |
| 方法 | POST |
| 路径 | /wxapp/trackerpull |
| 接口 ID | 426273542 |
| operationId | `trackerpull` |
| 标签 | 订单 |
| 认证 | 需要 `Authorization` header |

---

## 请求参数

该接口当前在 Apifox 中定义为 **query 参数 + Authorization header**，未声明 request body。

### Query 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `order_type` | string | 是 | 订单类型 |
| `order_id` | string | 是 | 订单编号 |

### Header 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `Authorization` | string | 是 | JWT 验证 token |

> `order_type` 的可选值枚举在当前 OAS 片段中未给出，开发前需与后端或产品确认。

---

## 响应结构

### 200 成功响应

```typescript
interface TrackerPullResponse {
  data: Array<{
    AcceptTime: string
    AcceptStation: string
  }>
}
```

### 字段语义

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `data` | array | 物流轨迹数组 | - |
| `AcceptTime` | string | 物流时间 | `2021-01-27 14:58:29` |
| `AcceptStation` | string | 物流详情描述 | `暂无物流信息` |

### 默认错误响应

Apifox 标注默认错误结构为 `OrdersErrorRespones` 数组，但当前未进一步展开；前端实现时应沿用现有 HTTP 层错误处理策略。

---

## 与现有前端代码的关系

### 已有相关能力

| 文件 | 现状 |
|------|------|
| `app/pages/account/components/OrderDetailLogistics.vue` | 已有物流展示 UI，但数据来源当前偏向订单详情接口内嵌字段 |
| `app/composables/useOrderDetail.ts` | 已有订单详情状态管理，但尚未单独调用 `trackerpull` |
| `app/composables/useOrders.ts` | 已有 `viewLogistics(orderId)` 占位逻辑，尚未实现 |
| `app/infrastructure/transformers/orderTransformer.ts` | 已有 `toLogisticsTraces(raw)`，但当前适配的是 `logistics_traces` / `time` / `content` 结构 |
| `app/infrastructure/http/clients/OrderApiClient.ts` | 当前未提供 `trackerpull` 客户端方法 |

### 需要补齐的前端对接点

1. 在 HTTP Client 中新增物流查询方法
2. 为 `AcceptTime` / `AcceptStation` 转成前端统一轨迹结构
3. 在订单列表页与订单详情页复用同一套物流查询与展示逻辑
4. 处理空轨迹、接口失败、加载中等状态

---

## 前端数据转换建议

推荐新增独立的物流轨迹转换，而不是直接复用现有 `toLogisticsTraces(raw)`：

```typescript
interface LogisticsTrace {
  time: string
  content: string
}
```

映射关系：

| 接口字段 | 前端字段 |
|----------|----------|
| `AcceptTime` | `time` |
| `AcceptStation` | `content` |

这样可以兼容：

- 订单详情接口自带物流字段时的 `logistics_traces`
- 物流查询接口返回的 `AcceptTime` / `AcceptStation`

---

## 风险与待确认项

- `order_type` 的真实取值规则未在当前 OAS 中声明
- 接口仅返回轨迹数组，快递单号与物流公司是否完全来自订单详情接口，需在实现阶段统一口径
- 轨迹返回顺序是否保证“最新在前”未在文档中明确，前端是否需要排序需联调确认
- 当前 Apifox 中另有 `/wxapp/delivery/trackerpull` 相关接口，是否与本需求存在职责区分，需避免误接
