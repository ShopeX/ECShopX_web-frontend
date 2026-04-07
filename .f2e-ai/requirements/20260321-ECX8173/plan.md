# 开发计划 — 20260321-ECX8173 发票组件

## 与 Handbook 对齐

| 约束 | 本计划的应用 |
|------|-------------|
| 页面与业务代码放在 `app/` | 所有实现仅改 `app/components/**`、`app/pages/**`、`app/composables/**`、`app/infrastructure/**`、`app/locales/**` |
| 组件命名 PascalCase | 复用并扩展 `BCInvoiceModal`，新增配套能力仍使用 PascalCase 命名 |
| HTTP 请求走 ApiClient | 发票保存请求放入 `infrastructure/http/clients`，页面不直接发请求 |
| 样式使用 Tailwind | PC/H5 设计还原全部走现有 Tailwind 体系 |
| i18n 为既有约束 | 新增或替换文案统一进入 locale，而不是把中文硬编码在组件里 |
| E2E 使用 `data-testid` | 弹层容器、切换项、输入框、按钮、错误态、摘要区补全稳定标识 |
| 格式与脚本约定 | 以 `git diff --check`、`pnpm exec prettier --check` 和需求相关测试作为验证基线 |

## 执行检查清单

- 是否只实现已确认范围：结算页 + 订单详情页
- 是否复用现有 `BCInvoiceModal`，而不是平行再造一套发票组件
- 是否把接口调用、表单映射、页面接入分层处理
- 是否补齐 PC/H5 双端形态和关键 `data-testid`
- 是否处理好设计稿与接口字段之间的差异，尤其是 `telephone`

## 文件改动清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `app/infrastructure/http/clients/InvoiceApiClient.ts` | 新增会员发票保存 API 封装 |
| `app/composables/useInvoiceForm.ts` | 抽离发票表单状态、校验、提交流程，供结算页和订单详情页复用 |
| `app/components/BCInvoiceModal/BCInvoiceModal.test.js` 或同类需求相关测试文件 | 覆盖字段切换、提交和错误态逻辑 |

### 修改文件

| 文件 | 改动内容 |
|------|---------|
| `app/components/BCInvoiceModal/BCInvoiceModal.vue` | 按新 Figma 重构 UI 和字段结构，支持 PC/H5 双端形态、个人/企业切换、错误态和 `data-testid` |
| `app/components/BCInvoiceModal/types.ts` | 重定义表单数据结构，对齐本次发票接口与设计稿字段 |
| `app/pages/checkout/index.vue` | 接入新的提交结果与摘要展示，复用同一套发票表单逻辑 |
| `app/composables/useCheckout.ts` | 调整结算页发票数据映射，兼容新的发票模型 |
| `app/composables/useOrderDetail.ts` | 将“申请发票”从占位 toast 改为真实打开弹层，并复用发票提交流程 |
| `app/pages/account/orders/[id].vue` | 挂接发票弹层与订单详情页发票摘要反馈 |
| `app/pages/account/components/OrderDetailActions.vue` | 仅在需要时补稳定测试标识，保持现有按钮结构 |
| `app/locales/zh-CN.json`、`app/locales/en-US.json`、`app/locales/ar.json` | 补充或调整发票弹层新文案 |
| 如有需要的 transformer / 页面展示辅助文件 | 用于把接口结果映射为页面摘要显示 |

## 详细步骤

### Step 1：收敛发票数据模型

- 重审现有 `IInvoiceFormData`
- 将旧模型中的 `content`、`email` 从主流程中剥离
- 定义本次真实需要的字段：
  - `type`
  - `title` 或 `companyName`
  - `taxNumber`
  - `businessAddress`
  - `bank`
  - `bankAccount`
  - `telephone` 的前端来源策略
- 明确页面展示摘要结构，保证 checkout 和 order detail 共用

验证：
- 新类型能覆盖个人 / 企业两种模式
- 不再混用旧版“发票内容 / 接收邮箱”字段

### Step 2：补齐发票 API Client

- 新增 `InvoiceApiClient.ts`
- 封装 `createInvoice(payload)`
- 请求对齐 `POST /wxapp/member/invoice`
- 按项目 HTTP 约定使用全局注入参数，不在业务层重复传 `company_id`、`country_code`

验证：
- 请求方式、路径、Body 结构对齐 Apifox
- 能支持表单方式提交
- 对 `telephone`、`is_def` 做最小必要映射，不擅自扩展范围

### Step 3：抽离复用的发票表单逻辑

- 新增 `useInvoiceForm.ts`
- 统一处理：
  - 打开 / 关闭
  - 默认值回填
  - 类型切换
  - 字段校验
  - 提交 loading
  - 成功 / 失败反馈
- 让 checkout 和 order detail 都消费同一套 composable，而不是各自写一遍提交逻辑

验证：
- 两个页面都能复用同一套提交与校验
- 失败时保留弹层并展示错误信息

### Step 4：重构 `BCInvoiceModal` 以对齐新设计

- 以现有组件为基础升级，而不是新建重复弹层
- PC 形态：
  - 居中弹窗
  - 顶部标题 + 关闭
  - 个人 / 企业切换
  - 个人单字段表单
  - 企业多字段表单
  - 底部取消 / 提交按钮
- H5 形态：
  - 移动端弹层或底部 sheet
  - 结构和字段顺序与 Figma 对齐
- 补齐 `data-testid`

验证：
- PC/H5 UI 均符合 Figma
- 类型切换时字段与错误态同步变化
- 取消和关闭行为一致

### Step 5：接入结算页

- 在 `checkout/index.vue` 中继续使用 `BCInvoiceModal`
- 将原先基于旧字段的展示摘要调整为新摘要
- 保证“需要发票”勾选、编辑发票、取消发票仍可用
- 必要时同步调整 `useCheckout.ts` 中提交订单时的发票数据组装逻辑

验证：
- 结算页可填写个人 / 企业发票
- 保存后页面摘要正确
- 不勾选发票时不会残留旧数据

### Step 6：接入订单详情页

- 在 `useOrderDetail.ts` 中将 `applyInvoice()` 从 toast 占位改为真实打开发票弹层
- 在 `orders/[id].vue` 中挂接同一套 `BCInvoiceModal`
- 提交成功后更新订单详情页的发票摘要展示或操作反馈

验证：
- 订单详情按钮能打开同一套发票组件
- 提交链路与 checkout 共用
- 页面反馈明确，不出现提交成功但页面无变化

### Step 7：补文案、测试标识和回归测试

- 补齐 locale 文案
- 为测试用例中的关键节点补齐 `data-testid`
- 增加需求相关测试，覆盖：
  - 个人 / 企业模式切换
  - checkout 提交
  - order detail 复用
  - 失败态与关闭态

验证：
- 测试文件能映射 `test.spec.ts`
- 新增文案不破坏现有 i18n 结构

## 验证计划

1. `git diff --check`
2. `pnpm exec prettier --check` 针对本需求改动文件
3. 运行需求相关 Node 测试
4. 如本地联调条件具备，补一轮页面级验证：
   - checkout 打开发票并提交个人发票
   - checkout 切换并提交企业发票
   - order detail 打开发票并提交
   - PC/H5 双端形态
   - 接口失败时错误反馈

## 风险与边界

- `telephone` 为接口必填，但设计稿无该输入项；实现阶段需优先从用户上下文或现有资料兜底，若代码里无可靠来源，需要在联调时及时暴露
- 本次不扩展到发票列表、编辑历史发票、默认发票管理
- 若订单详情页提交后缺少后端回查能力，页面反馈先以本地摘要更新为主，不扩大接口范围
- 若现有 `BCInvoiceModal` 与新设计差异过大，仍以“保留组件入口、重写内部结构”为原则，不平行再开第二套组件
