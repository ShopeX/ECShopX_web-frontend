# 优惠券列表 API 说明（ECX-8102）

## 与 requirement 对齐

- **需求范围**：S1 仅优惠券列表页（可用 + 不可用展示），不包含领取、使用、详情跳转等操作。
- **验收标准**：列表数据来自 `GET /wxapp/user/getUserCardList`；页面区分并展示「可用」与「不可用」优惠券列表。
- **接口约束**：以 Apifox 文档为准；本需求仅使用「我的优惠券列表」GET 接口。

## 接口来源与拉取说明

- **Apifox MCP**：当前未通过 Apifox MCP 拉取接口详情，以下根据需求澄清阶段用户提供的信息整理。
- **需求来源**：requirement.md 设计稿与接口小节；Apifox 接口 ID 426275932。
- 若需完整请求/响应体与参数说明，请到 Apifox 查看或后续通过 API 文档/MCP 补充。

## 接口概览

| 项目     | 说明 |
|----------|------|
| 接口名称 | 我的优惠券列表 |
| 方法     | GET |
| 路径     | `/wxapp/user/getUserCardList` |
| Apifox 接口 ID | 426275932 |
| Apifox 链接 | https://app.apifox.com/link/project/7908795/apis/api-426275932 |

## 请求

- **方法**：GET  
- **路径**：`/wxapp/user/getUserCardList`  
- **请求体**：无（GET 无 body）。

**Query 参数**（来源：`app/infrastructure/http/clients/CouponApiClient.ts` 中 `IGetUserCardListParams`，实际以 Apifox 为准）：

| 参数         | 类型   | 必填 | 说明 |
|--------------|--------|------|------|
| status       | string | 否   | 状态筛选 |
| cart_type    | string | 否   | 购物车/类型 |
| page         | number | 否   | 页码 |
| pageSize     | number | 否   | 每页条数 |
| scope_type   | string | 否   | 范围类型 |
| source_type  | string | 否   | 来源类型 |
| source_id    | number | 否   | 来源 ID |

## 响应

**响应结构**（根据 `app/infrastructure/transformers/userCardTransformer.ts` 对接口的消费方式整理；若 Apifox 文档与下表不一致，以 Apifox 为准）：

- 根为**数组**，或根对象下 **list** 字段为数组，列表项为优惠券/卡项。

**列表项字段（常见命名，前端 transformer 已做兼容）**：

| 字段（API 可能命名）     | 类型   | 说明 |
|-------------------------|--------|------|
| id / card_id            | string/number | 卡/券 ID |
| coupon_code / card_code| string | 券码 |
| discount / amount / deduct_money / price | number | 面额（**单位：分**，前端会 /100 转元） |
| min_fee / min_charge    | number | 最低消费门槛（**单位：分**，前端会 /100 转元并生成「满xxx可用」） |
| title / name            | string | 标题（如「满500减100」） |
| description / desc      | string | 描述（如「全场无门槛使用」） |
| expire_time / end_time  | string | 过期时间（用于生成「有效期至 yyyy-MM-dd」） |
| status                  | string | 状态：`1` 未使用（可用），其他为不可用；前端用此区分可用/不可用 Tab |

**前端模型**（`IUserCardModel`，transformer 输出）：`id`、`code`、`title`、`description`、`amount`（元）、`thresholdText`（如「满500可用」）、`expireText`（如「有效期至 2026-06-30」）、`usable`（boolean，用于可用/不可用分区）。

## 响应与前端使用建议

- 响应结构以 Apifox 文档为准。  
- 前端需支持（与 requirement 验收标准一致）：  
  1. 解析列表数据，用于「可用优惠券」与「不可用优惠券」两个 Tab，满足「页面区分并展示可用与不可用优惠券列表」。  
  2. 卡片展示字段建议与设计稿对齐：金额、门槛文案（如「满500可用」）、标题（如「满500减100」）、描述（如「全场无门槛使用」）、有效期（如「有效期至 2026-06-30」）。  
- 若接口返回中已有「可用/不可用」标识或状态码，前端按该字段分组；若无，需与后端确认规则或由前端根据有效期/使用状态等计算。  
- 本需求仅消费该接口做列表展示与分区，不涉及领取、使用、详情跳转等操作。

## 待补充（建议后续在 Apifox 或对接时确认）

- [x] 请求 Query 参数：已按 `CouponApiClient.IGetUserCardListParams` 整理，以 Apifox 为准校验。
- [x] 响应列表项字段：已按 `userCardTransformer` 消费方式整理，以 Apifox 为准校验。
- [ ] 错误码与错误信息约定
- [ ] 鉴权方式（如 Cookie、Token、Header）
