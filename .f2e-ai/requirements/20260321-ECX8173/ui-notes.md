# UI 备注 - 20260321-ECX8173

## 1. 拉取结果

- Figma MCP 拉取状态：成功
- 文件 Key：`clySPKbja8yL0BQnFke6oi`

## 2. 设计稿节点

### 2.1 PC

- 个人发票：
  `2848:4039`
  `https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2848-4039&t=XCGAZqc3OpvqfI6Z-11`
- 企业发票：
  `2848:6341`
  `https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2848-6341&t=XCGAZqc3OpvqfI6Z-11`

### 2.2 H5

- 个人发票：
  `2952:3347`
  `https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2952-3347&t=XCGAZqc3OpvqfI6Z-11`
- 企业发票：
  `2952:5013`
  `https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2952-5013&t=XCGAZqc3OpvqfI6Z-11`

## 3. 视觉结构摘要

### 3.1 PC 个人发票

- 遮罩层 + 居中白色弹窗。
- 弹窗宽度约 `600px`。
- 顶部包含标题 `去开票` 与关闭按钮。
- 发票类型为单选组：
  `个人发票`、`企业发票`。
- 个人模式表单仅展示 `发票抬头*`。
- 底部按钮为 `取消`、`提交`。

### 3.2 PC 企业发票

- 保持与个人模式同一弹窗壳层。
- 企业模式字段包含：
  - `公司名称*`
  - `公司税号*`
  - `公司地址`
  - `开户银行`
  - `银行账号`
- 底部按钮样式与位置和个人模式一致。

### 3.3 H5 个人发票

- 深色遮罩 + 移动端白色弹层。
- 整体宽度约 `375px` 设计基准。
- 标题仍为 `去开票`，顶部右侧存在关闭操作。
- 保持发票类型切换与单字段表单布局。
- 底部为双按钮操作区。

### 3.4 H5 企业发票

- 与 H5 个人模式共用弹层框架。
- 企业模式内容更长，整体高度约 `500px`。
- 表单字段与 PC 企业模式一致。
- 底部按钮区与内容区有分隔感。

## 4. 交互要点

- 发票类型切换后，表单字段需要同步变化。
- 必填字段在视觉上有明显标识。
- `取消` 和关闭按钮都应退出弹层。
- `提交` 按钮位于主操作位。
- PC 与 H5 共用信息结构，但容器样式和排版密度不同。

## 5. 代码侧现有资产

- 已存在相关组件：
  `app/components/BCInvoiceModal/BCInvoiceModal.vue`
- 已存在相关类型定义：
  `app/components/BCInvoiceModal/types.ts`
- 已存在相关说明文档：
  `app/components/BCInvoiceModal/README.md`
- 已知接入页面：
  `app/pages/checkout/index.vue`

## 6. UI 实现建议

- 优先评估扩展现有 `BCInvoiceModal`，而不是并行新增一套完全重复的发票弹层。
- 将“弹层容器”“发票类型切换”“字段区块”“提交区块”拆成可复用结构，便于多页面复用。
- 需要检查当前组件是否已经具备双端表现，如果没有，则应在现有组件基础上补齐 PC / H5 视觉分支。
- 订单详情页、个人中心页是否作为本期复用落点，需在实现阶段结合代码现状确认。

## 7. 设计与接口差异提醒

- Figma 中未体现手机号字段，但接口要求 `telephone`，实现前需要确认是隐藏填充、复用用户手机号，还是补充输入项。
- Figma 中未体现默认发票开关，若接口 `is_def` 为必需业务能力，需要额外确认是否进入本期设计范围。
