# 会员中心积分相关接口（ECX-8100）

**任务号**：ECX-8100  
**接口来源**：Apifox 项目 7908795（需求中提供）  
**文档链接**：[Apifox 项目 7908795](https://app.apifox.com/link/project/7908795)

---

## MCP 拉取说明

- **使用的 MCP**：`user-WEBSITE - API 文档`（当前为“FrontApi”模块，未配置项目 7908795）。
- **拉取结果**：**未通过 MCP 拉取** 项目 7908795 的 OpenAPI Spec，以下内容根据需求说明与既有 Apifox 文档整理，开发时请以 Apifox 项目 7908795 中接口 426274718、426274717 为准核对路径与字段。
- **路径约定**：项目中 HTTP 客户端使用 `runtimeConfig.public.apiBase` 作为 baseURL；若积分接口与现有接口同域，请求路径为相对 baseURL 的路径（如 `/wxapp/point/member/info`），具体以实际网关或后端路由为准。

---

## 1. 获取积分信息

| 项      | 值                                                                       |
| ------- | ------------------------------------------------------------------------ |
| 说明    | 展示会员当前剩余总积分及相关基础信息                                     |
| 方法    | GET                                                                      |
| 路径    | `/wxapp/point/member/info`                                               |
| 接口 ID | 426274718                                                                |
| 链接    | [Apifox](https://app.apifox.com/link/project/7908795/apis/api-426274718) |

### 请求

| 位置   | 参数名          | 类型   | 必填 | 说明               |
| ------ | --------------- | ------ | ---- | ------------------ |
| Header | `Authorization` | string | 是   | JWT / Bearer Token |

- **Query**：无（若项目已约定全局注入 `company_id`、`country_code`，由 HTTP 插件自动携带）。
- **Body**：无。

### 请求数据类型

```ts
/** 获取积分信息 - 仅需 Header，company_id / country_code 由 HTTP 插件全局注入 */
// 调用时无需显式传 Query，需保证已登录（带上 Authorization）
```

### 响应数据结构体

- **200**：`application/json`，根级为对象，包含字段 `data`。

```ts
/** 积分信息项（与 Apifox 一致） */
interface PointMemberInfoItem {
  user_id: string // 会员ID
  company_id: string // 企业ID
  point: string // 现有积分数（注意：接口为 string，前端展示或计算时需按需转数字）
}

/** 获取积分信息 - 200 响应 */
interface GetPointMemberInfoResponse {
  data: PointMemberInfoItem
}
```

- **说明**：`point` 在接口中为 string，前端使用前建议做安全转换（如 `Number(point)` 或保留两位小数展示）。

---

## 2. 积分列表（积分流水）

| 项      | 值                                                                       |
| ------- | ------------------------------------------------------------------------ |
| 说明    | 展示会员历史积分变动明细（收入/支出流水），支持分页与类型筛选            |
| 方法    | GET                                                                      |
| 路径    | `/wxapp/point/member`                                                    |
| 接口 ID | 426274717                                                                |
| 链接    | [Apifox](https://app.apifox.com/link/project/7908795/apis/api-426274717) |

### 请求

| 位置  | 参数名       | 类型   | 必填 | 说明/示例                            |
| ----- | ------------ | ------ | ---- | ------------------------------------ |
| Query | `page_no`    | number | 否   | 页码，默认 1                         |
| Query | `page_size`  | number | 否   | 每页条数，默认 10                    |
| Query | `outin_type` | string | 否   | 类型：`income` 收入 / `outcome` 支出 |

- **Header**：`Authorization`（同上）。
- **Body**：无。

### 请求数据类型

```ts
/** 积分列表 - 请求 Query */
interface GetPointMemberListParams {
  page_no?: number // 默认 1
  page_size?: number // 默认 10
  outin_type?: 'income' | 'outcome'
}
```

### 响应数据结构体

- **200**：`application/json`，根级为对象，包含字段 `data`（内含 `total_count` 与 `list`）。

```ts
/** 积分流水单项 */
interface PointMemberListItem {
  company_id: string
  id: string
  user_id: string
  income: number // 收入
  outcome: number // 支出
  point: number // 本条变动积分数（增/减）
  journal_type: number // 积分交易类型，见下表
  outin_type: string // 'in' 收入 | 'out' 支出
  point_desc: string // 积分描述（页面可直接展示）
  order_id?: string // 订单编号
  created: string // 创建时间（时间戳字符串，需格式化）
  updated: string // 更新时间
}

/** journal_type 枚举（与 Apifox 一致） */
// 1:注册送积分 2:推荐送分 3:充值返积分 4:推广注册返积分 5:积分换购 6:储值兑换积分
// 7:订单返积分 8:会员等级返佣 9:取消订单处理积分 10:售后处理积分 11:大转盘抽奖送积分 12:管理员手动调整积分

/** 积分列表 - 200 响应 */
interface GetPointMemberListResponse {
  data: {
    total_count: number
    list: PointMemberListItem[]
  }
}
```

---

## 数据对接注意事项

1. **分页**：列表接口使用 `page_no`、`page_size`，总条数为 `data.total_count`，前端可据此做分页或滚动加载。
2. **收支展示**：可通过 `outin_type`（`in` / `out`）或 `income` / `outcome` 区分收入与支出，用于红绿色、`+`/`-` 等展示。
3. **时间展示**：`created` 为时间戳字符串，需格式化为页面所需文案（如“yyyy-MM-dd HH:mm”）。
4. **积分信息类型**：获取积分信息接口返回的 `point` 为 string，展示与计算时需按需转为数字并做空值/异常处理。
5. **全局参数**：若项目已在 HTTP 插件中统一注入 `company_id`、`country_code`，GET 请求会自动带在 Query 中，无需在 ApiClient 中重复传。
