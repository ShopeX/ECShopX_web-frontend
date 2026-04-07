# API Notes — 20260321-ECX8172 订单评价组件

> Apifox MCP 拉取状态：**成功**（通过 OAS ref `/paths/_wxapp_order_rate_create.json`）
> Apifox ID：426273556

---

## 接口：提交评价

- **路径**：`POST /wxapp/order/rate/create`
- **operationId**：`addRate`
- **认证**：Header `Authorization: <JWT Token>`

---

## 请求参数（Query Params）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `order_id` | string | ✅ | 订单编号 |
| `anonymous` | string | ❌ | 是否匿名（"0" 否 / "1" 是） |
| `rates[0][item_id]` | string | ✅ | 商品 ID（支持多商品，下标从 0 递增） |
| `rates[0][content]` | string | ✅ | 评价内容文字 |
| `rates[0][star]` | string | ✅ | 评分星级（"1"~"5"） |
| `rates[0][pics][0]` | string | ✅ | 评价图片 URL（支持多图，下标从 0 递增） |

> **注意**：`rates` 为数组结构，支持一次提交多个商品的评价（多商品订单）。当前 Figma 只展示单商品评价表单，如需多商品同时评价，需要确认交互方案。

---

## 请求数据结构（TypeScript）

```ts
interface RateItem {
  item_id: string
  content: string
  star: string  // "1" | "2" | "3" | "4" | "5"
  pics?: string[]  // 图片 URL 数组，选填
}

interface CreateRateParams {
  order_id: string
  anonymous?: string  // "0" | "1"
  rates: RateItem[]
}
```

实际发送时需将 `rates` 展开为 query params 的 indexed 格式：
```
rates[0][item_id]=xxx
rates[0][content]=xxx
rates[0][star]=5
rates[0][pics][0]=https://...
rates[0][pics][1]=https://...
```

---

## 响应数据结构

```ts
interface RateResponse {
  rate_id: string        // 评价 ID
  item_id: string        // 商品 ID
  goods_id: string       // 产品 ID
  order_id: string       // 订单号
  user_id: string        // 用户 ID
  content: string        // 评价内容
  star: string           // 评分星级
  rate_pic: string       // 评价图片（逗号分隔 URL）
  rate_pic_num: number   // 评价图片数量
  anonymous: string      // 是否匿名 "0" | "1"
  is_reply: number       // 是否有回复 0 | 1
  disabled: number       // 是否删除 0 | 1
  item_spec_desc: string // 商品规格描述
  created: number        // 创建时间戳
  updated: number        // 更新时间戳
}

// 完整响应: { data: RateResponse[] }
```

---

## 待确认项

1. **图片上传接口**：`rates[0][pics][0]` 接收的是图片 URL，说明需要先将图片上传到 OSS/CDN 获取 URL，再传给评价接口。项目中是否有现成的图片上传接口？（Apifox 中需要进一步确认）

2. **多商品评价**：一笔订单若有多个商品，是否需要同时展示多个商品的评价表单，还是逐个评价？

3. **评价内容必填**：接口标注 `content` 为必填，是否需要前端也做必填校验？Figma 未明确体现。
