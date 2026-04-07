# API 备注 - 20260321-ECX8173

## 1. 拉取结果

- Apifox MCP 拉取状态：成功
- 项目：`FrontApi`
- 接口名称：`添加发票信息`
- 接口路径：`POST /wxapp/member/invoice`
- 接口 ID：`426274573`

## 2. 接口概览

- 方法：`POST`
- 路径：`/wxapp/member/invoice`
- 鉴权：请求头需要 `Authorization`
- Content-Type：`application/x-www-form-urlencoded`
- operationId：`createInvoice`
- tags：`会员`

## 3. 请求参数

### 3.1 Header

- `Authorization`：`string`，必填

### 3.2 Body

接口文档定义为表单提交，字段如下：

- `invoices_type`
  类型：`string`
  说明：抬头类型
- `name`
  类型：`string`
  说明：名称
- `telephone`
  类型：`string`
  说明：手机
- `tax_number`
  类型：`string`
  说明：税号
- `business_address`
  类型：`string`
  说明：详细地址
- `bank`
  类型：`string`
  说明：银行
- `bank_account`
  类型：`string`
  说明：银行账号
- `is_def`
  类型：`boolean`
  说明：是否默认地址

### 3.3 文档声明的必填项

- `invoices_type`
- `name`
- `telephone`

## 4. 响应结构

Apifox 文档中 `200` 响应定义为 `data` 数组，元素字段包括：

- `invoices_id`
- `company_id`
- `user_id`
- `username`
- `telephone`
- `province`
- `city`
- `county`
- `adrdetail`
- `postalCode`
- `is_def`

## 5. 风险提示

- 响应结构与“添加发票信息”语义不完全一致，字段更接近地址或列表记录结构，联调时需确认真实返回。
- 文档要求 `telephone` 必填，但当前设计稿未提供手机号输入项，前端实现前必须确认字段来源。
- 文档中 `is_def` 描述为“是否默认地址”，字段命名和业务含义可能沿用旧模型，需避免直接按字面假设。

## 6. 代码侧接入线索

- 已有发票 UI 组件：
  `app/components/BCInvoiceModal/BCInvoiceModal.vue`
- 已有发票类型定义：
  `app/components/BCInvoiceModal/types.ts`
- 已有结算页接入：
  `app/pages/checkout/index.vue`

## 7. 前端实现建议

- 优先在现有发票组件能力上扩展 API 提交，而不是新增一套独立发票表单实现。
- 需要确认当前 HTTP 客户端是否已有会员发票相关封装，如无则应补充对应 client 方法。
- 由于接口为 `application/x-www-form-urlencoded`，实现时需要对齐项目现有 HTTP 封装对表单请求的处理方式。
- 需要明确 `telephone` 来源：
  用户显式输入、用户资料兜底、或页面上下文注入。

## 8. 联调关注点

- 校验接口是否允许个人发票不传 `tax_number`、`business_address`、`bank`、`bank_account`。
- 校验 `invoices_type` 的真实枚举值，避免仅凭展示文案推断。
- 校验接口成功后的返回值是否足以驱动前端展示，或是否还需要查询接口补全发票信息。
