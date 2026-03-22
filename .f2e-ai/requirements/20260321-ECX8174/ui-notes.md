# UI Notes — ECX-8174 申请售后组件

## Figma 来源

- PC 节点：`2848:4096`（fileKey: `clySPKbja8yL0BQnFke6oi`）
- H5 节点：`2952:6658`（fileKey: `clySPKbja8yL0BQnFke6oi`）
- MCP 拉取状态：✅ 成功

---

## 组件拆分分析

### 新建组件

| 组件名 | 路径 | 职责 |
|--------|------|------|
| `AftersalesModal.vue` | `app/pages/account/components/AftersalesModal.vue` | 售后申请弹窗，PC 居中 + H5 底部 Sheet，包含完整表单 |

### 可复用现有组件

| 现有组件 | 用途说明 |
|----------|---------|
| `ECModal.vue` | 不直接复用（ECModal 为通用确认弹窗），AftersalesModal 独立实现，参考 `OrderReviewModal.vue` 的双端弹窗模式 |
| `OrderDetailActions.vue` | 已有 `aftersales` emit，点击后触发 `AftersalesModal` |

---

## 布局规格

### PC 端（lg 断点）

- 触发方式：覆盖全屏遮罩 `fixed inset-0 z-50 bg-[rgba(0,0,0,0.6)]`
- 弹窗容器：`w-[600px]`，`bg-white`，`p-[32px]`，绝对居中（`items-center justify-center`）
- 标题行：`text-[20px] font-medium`，文字"申请售后"，右上角关闭按钮（`×`，`text-[20px]`）
- 字段间距：`gap-[24px]`（各字段行之间）
- 标签：`text-[12px] text-[#6b7280]`，宽度固定约 `w-[80px]`（标签列）
- 按钮区：`flex gap-[16px] pt-[16px]`，靠右对齐

### H5 端（默认）

- 触发方式：底部 Sheet，`fixed inset-x-0 bottom-0 z-50`，遮罩同 PC
- Sheet 容器：`w-full bg-white px-[16px] py-[32px]`，`rounded-t-[16px]`（建议加圆角）
- 内部布局结构与 PC 完全一致
- 按钮区：同 PC，取消 + 确定并排，各 `flex-1`

---

## 字段详情

### 1. 商品数量（Stepper）

- 布局：`flex items-center gap-[12px]`
- 减号按钮：`w-[32px] h-[32px] border border-[#e5e7eb]`，点击减 1（最小为 1）
- 数字显示：`w-[40px] text-center text-[14px]`
- 加号按钮：同减号按钮
- 初始值：`1`，上限由商品购买数量决定

### 2. 服务类型（Select / 下拉）

- 容器：`h-[40px] bg-[#f3f4f6] px-[12px] flex items-center justify-between`
- 选项（来自 API `aftersales_type`）：
  - `ONLY_REFUND` → 仅退款
  - `REFUND_GOODS` → 退货退款
  - `EXCHANGING_GOODS` → 换货
- 右侧箭头图标：`▼`（`text-[12px] text-[#6b7280]`）
- 实现方式：原生 `<select>` 或自定义下拉（与 ReviewModal 保持一致，用原生 select 包 Tailwind 样式）

### 3. 退款理由（Select / 下拉）

- 样式同服务类型
- 选项（硬编码，待后端确认）：
  - 质量问题
  - 描述不符
  - 尺寸问题
  - 不想要了
  - 其他

### 4. 退款说明（Textarea）

- 容器：`bg-[#f3f4f6] p-[12px]`
- 高度：`h-[80px]`，`resize-none`
- placeholder：`"填写退款说明"`，`text-[12px] text-[#9ca3af]`
- 最大字符数：500（建议添加）

### 按钮区

| 按钮 | 样式 |
|------|------|
| 取消 | `border border-[#0f0f10] text-[#191a1d] bg-white h-[50px]` |
| 确定 | `bg-[#0f0f10] text-white h-[50px]` |

- PC 端：按钮 `w-auto px-[32px]`，靠右对齐
- H5 端：按钮 `flex-1`，各占一半宽度

---

## 交互状态

| 状态 | 行为 |
|------|------|
| 打开弹窗 | 遮罩 + 弹窗淡入，H5 底部上滑 |
| 关闭弹窗 | 点击遮罩 / 点击 × / 点击取消，弹窗关闭 |
| 表单校验 | 服务类型、退款理由为必填；退款说明可选 |
| 提交中 | 确定按钮 `disabled` + loading 状态 |
| 提交成功 | toast 提示"售后申请已提交"，关闭弹窗，父组件刷新 |
| 提交失败 | toast 提示错误信息 |

---

## data-testid 约定

| 元素 | testid |
|------|--------|
| 弹窗根节点 | `aftersales-modal` |
| 关闭按钮 | `btn-close-aftersales` |
| 数量减按钮 | `btn-quantity-minus` |
| 数量加按钮 | `btn-quantity-plus` |
| 数量显示 | `quantity-display` |
| 服务类型下拉 | `select-aftersales-type` |
| 退款理由下拉 | `select-reason` |
| 退款说明文本框 | `textarea-description` |
| 取消按钮 | `btn-cancel-aftersales` |
| 确定按钮 | `btn-submit-aftersales` |

---

## 集成位置

- `app/pages/account/orders/[id].vue`（订单详情页）：`@aftersales="openAftersales"` → 挂载 `<AftersalesModal>`
- 可选：`app/pages/account/orders/index.vue`（订单列表页）同样集成
