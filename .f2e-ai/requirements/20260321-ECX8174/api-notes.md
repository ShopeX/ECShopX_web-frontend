# API Notes — ECX-8174 申请售后组件

## 接口来源

- 平台：Apifox（project-id: 7908795）
- MCP 拉取状态：✅ 成功

---

## 接口清单

### 提交售后申请

| 字段 | 值 |
|------|----|
| 接口 ID | 426277652 |
| 路径 | `POST /wxapp/aftersales` |
| operationId | `apply` |
| 认证 | JWT Token（`Authorization` Header） |

---

## 请求数据结构

### Query Parameters（全部为 query 位置）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `order_id` | string | ✅ | 订单号 |
| `item_id` | string | ✅ | 交易商品 ID |
| `reason` | string | ✅ | 申请售后原因（退款理由下拉选项） |
| `detail` | string | ✅ | 售后商品明细（通常为商品名称/规格） |
| `aftersales_type` | string | ✅ | 售后类型枚举（见下方） |
| `description` | string | ✅ | 申请描述（退款说明 textarea 内容） |

### Headers

| Header | 必填 | 说明 |
|--------|------|------|
| `Authorization` | ✅ | JWT Token，由 HTTP 客户端统一注入 |

### `aftersales_type` 枚举值

| 枚举值 | 含义 |
|--------|------|
| `ONLY_REFUND` | 仅退款 |
| `REFUND_GOODS` | 退货退款 |
| `EXCHANGING_GOODS` | 换货 |

---

## 响应数据结构

接口响应格式待后端确认。按项目惯例，成功响应 HTTP 200，失败响应 4xx/5xx 并带 `message` 字段。

---

## 字段映射关系（表单 → API）

| 表单字段 | API 参数 | 说明 |
|----------|----------|------|
| 商品数量（stepper） | 暂无对应参数 | 当前接口不含数量，传 detail 时可拼入 |
| 服务类型（select） | `aftersales_type` | 枚举值见上方 |
| 退款理由（select） | `reason` | 文字字符串 |
| 退款说明（textarea） | `description` | 自由文本 |
| `order_id` | `order_id` | 由父组件传入 |
| `item_id` | `item_id` | 由父组件传入（订单商品 ID） |
| `detail` | `detail` | 建议拼接商品名称+规格，由父组件传入 |

---

## HTTP 客户端实现建议

新建 `app/infrastructure/http/clients/AftersalesApiClient.ts`，命名遵循项目 `XxxApiClient.ts` 约定：

```ts
export interface ICreateAftersalesParams {
  order_id: string
  item_id: string
  reason: string
  detail: string
  aftersales_type: 'ONLY_REFUND' | 'REFUND_GOODS' | 'EXCHANGING_GOODS'
  description: string
}

export class AftersalesApiClient {
  async submitAftersales(params: ICreateAftersalesParams): Promise<any> {
    return this.http('/wxapp/aftersales', {
      method: 'POST',
      query: { ...params },
    })
  }
}

export const aftersalesApiClient = new AftersalesApiClient()
```

注：`this.http` 为继承或组合的 HTTP 实例（参考 `RateApiClient.ts`）。

---

## 待确认项

1. **商品数量**：`POST /wxapp/aftersales` 当前接口参数中无 `quantity` 字段；若后端支持部分退货，需补充该参数。
2. **退款理由枚举**：当前 `reason` 为自由文本，建议与后端确认是否有枚举约束。
3. **图片上传**：接口当前无图片相关参数（需求文档标注"图片可上传并预览"为选填）；若需图片，需确认是否有独立上传接口返回 URL，再随表单提交 URL 列表。
4. **响应结构**：成功/失败字段格式需对齐项目现有 error handling 模式。
