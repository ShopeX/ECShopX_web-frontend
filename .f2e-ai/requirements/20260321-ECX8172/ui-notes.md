# UI Notes — 20260321-ECX8172 订单评价组件

> Figma 拉取状态：**成功**
> - PC 节点：2641:2672（右侧抽屉式面板）
> - H5 节点：2955:13633（底部 Sheet）

---

## 设计概览

### PC 端

- 整体为右侧抽屉（Drawer），宽度 `560px`，背景遮罩 `rgba(0,0,0,0.6)`
- 内容区 `p-[32px]`，内部 `gap-[32px]` 竖排各区块
- 底部"提交评价"按钮固定在底部，黑色全宽，`py-[16px]`

### H5 端

- 整体为底部 Sheet，高度 `500px`，全宽，顶部阴影
- 内容区 `px-[16px] py-[32px]`，内部 `gap-[32px]`
- 底部按钮区独立固定栏（border-top `#e5e7eb`），`px-[16px] py-[32px]`
- 当前设计稿底部按钮文案为"关闭"，实际实现应为"提交评价"（与 PC 一致）

---

## 区块结构（PC / H5 一致）

### 1. 头部
- 标题"评价商品"：`text-[20px] font-medium text-[#191a1d]`
- 右侧关闭按钮：X icon，`size-[24px]`，点击关闭

### 2. 商品信息
- 商品图片：`96x96`，`object-cover bg-[#f9fafb]`
- 商品名称：`text-[14px] font-medium text-[#101828]`
- 规格信息（款号/款式/尺寸）：`text-[12px] text-[#364153]`，`gap-[2px]` 竖排

### 3. 商品评分
- Label："商品评分"，`text-[14px] font-medium text-[#101828]`
- 5 颗星，每颗 `size-[24px]`，`gap-[8px]`，星星颜色金黄色（实心/空心状态）
- 旁边满意度文字：`text-[14px] text-[#4a5565]`
  - 1星：非常不满意 / 2星：不满意 / 3星：一般 / 4星：满意 / 5星：非常满意

### 4. 评价内容
- Label："评价内容"，`text-[14px] font-medium text-[#101828]`
- 文本域：`bg-[#f3f3f5]`，`h-[120px]`，`px-[12px] py-[8px]`，无边框
- placeholder：`text-[#99a1af]`，"分享您的使用体验，帮助其他买家了解这件商品..."
- 右下角字数：`text-[12px] text-[#6a7282]`，格式 `0/500`

### 5. 上传图片（选填）
- Label："上传图片（选填）"，`text-[14px] font-medium text-[#191a1d]`
- 上传按钮：`size-[80px]`，`border border-[#d1d5dc] rounded-[4px]`，内有相机 icon `size-[20px]`
- 已上传图片：在上传按钮左侧依次展示缩略图，最多 5 张，可删除
- 提示文字：`text-[12px] text-[#6a7282]`，"最多上传5张图片，每张不超过5MB"

### 6. 提交按钮
- `bg-[#0f0f10]`，全宽，`py-[16px]`，`text-[14px] font-medium text-white`
- 文案："提交评价"

---

## 组件拆分建议

### 可复用现有组件
| 现有组件 | 使用场景 |
|----------|----------|
| `ECModal.vue` / `useModal.ts` | 不直接复用（ECModal 是居中弹窗），评价组件需要独立抽屉/Sheet 容器 |
| 商品图片+名称+规格展示（OrderDetailItems.vue 中已有同结构） | 可参考样式，但评价场景更简单，建议 inline 实现 |

### 需新建组件

#### `OrderReviewModal.vue`（核心组件）
- 路径：`app/pages/account/components/OrderReviewModal.vue`
- 职责：完整评价表单，包含 PC 抽屉 / H5 底部 Sheet 两种容器
- Props：
  - `visible: boolean` — 是否显示
  - `orderId: string` — 订单 ID
  - `item: OrderItem` — 当前评价商品信息（含 itemId、itemName、itemImage、skuNo、style、size）
- Emits：
  - `close` — 关闭
  - `submitted` — 提交成功，父组件可刷新订单状态

#### `ReviewStarRating.vue`（可复用）
- 路径：`app/pages/account/components/ReviewStarRating.vue`
- 职责：5 星评分交互组件
- Props：`modelValue: number`（1-5，默认 5）
- Emits：`update:modelValue`
- 显示满意度文字（非常不满意/不满意/一般/满意/非常满意）

---

## 布局差异：PC vs H5

| | PC | H5 |
|--|--|--|
| 容器形态 | 右侧抽屉，`w-[560px]`，从右滑入 | 底部 Sheet，全宽，`h-[500px]`，从下滑入 |
| 内边距 | `p-[32px]` | `px-[16px] py-[32px]` |
| 提交按钮 | 在内容区底部 | 独立固定底栏（`border-t`） |
| 实现方式 | `lg:` 类控制 | 默认（mobile-first） |
