# 开发计划 — 20260321-ECX8172 订单评价组件

## 与 Handbook 对齐

| 约束项 | 本次执行策略 |
|--------|------------|
| 组件命名 | PascalCase：`OrderReviewModal.vue`、`ReviewStarRating.vue` |
| 组件目录 | `app/pages/account/components/` |
| 脚本风格 | `<script setup lang="ts">`，`defineProps<Props>()` |
| 样式 | Tailwind utility class，mobile-first，`lg:` 控制 PC 端差异 |
| 可测试性 | 所有可交互/可断言元素加 `data-testid` |
| HTTP 客户端 | 新建 `RateApiClient.ts`，沿用现有 HTTP plugin 注入模式 |
| I18n | 新增评价相关 key 到 `zh-CN.json / en-US.json / ar.json` |
| 测试入口 | `test.spec.ts` 位于 `.f2e-ai/requirements/20260321-ECX8172/` |

---

## Step 1：新建 RateApiClient

**文件**：`app/infrastructure/http/clients/RateApiClient.ts`

**职责**：
- 封装 `POST /wxapp/order/rate/create`
- 将 `rates` 数组展开为 indexed query params 格式：
  `rates[0][item_id]`、`rates[0][content]`、`rates[0][star]`、`rates[0][pics][0]` 等
- 使用 `useNuxtApp().$http` 或注入的 HTTP 实例

**接口类型**：

```ts
interface RateItem {
  item_id: string
  content: string
  star: string  // "1" | "2" | "3" | "4" | "5"
  pics?: string[]
}

interface CreateRateParams {
  order_id: string
  anonymous?: string  // "0" | "1"
  rates: RateItem[]
}
```

**验证**：TypeScript 无报错，调用链路与现有 `OrderApiClient` 风格一致。

---

## Step 2：新建 ReviewStarRating.vue

**文件**：`app/pages/account/components/ReviewStarRating.vue`

**Props**：
```ts
interface Props {
  modelValue: number  // 1-5，默认 5
}
```

**Emits**：`update:modelValue`

**功能要求**：
- 渲染 5 颗星，每颗 `size-[24px]`，`gap-[8px]`
- 实心星（已选）：金黄色；空心星（未选）：灰色
- 旁边满意度文字（`data-testid="review-satisfaction-text"`）：
  - 1星：非常不满意 / 2星：不满意 / 3星：一般 / 4星：满意 / 5星：非常满意
- 每颗星加 `data-testid="star-{n}"`（n=1~5）
- 点击可更新评分

**验证**：TC-04 通过。

---

## Step 3：新建 OrderReviewModal.vue

**文件**：`app/pages/account/components/OrderReviewModal.vue`

**Props**：
```ts
interface Props {
  visible: boolean
  orderId: string
  item: {
    itemId: string
    itemName: string
    itemImage: string
    skuNo?: string
    style?: string
    size?: string
    specName?: string
  }
}
```

**Emits**：`close`、`submitted`

**容器结构（双端）**：

| | PC（`lg:`） | H5（默认） |
|--|--|--|
| 形态 | 右侧抽屉，`w-[560px]` | 底部 Sheet，全宽，`h-[500px]` |
| 内边距 | `p-[32px]` | `px-[16px] py-[32px]` |
| 提交按钮位置 | 内容区底部 | 独立固定底栏（`border-t`） |
| 动画 | 从右滑入 | 从下滑入 |

**区块内容**：
1. 头部：标题"评价商品"（`data-testid="review-modal-title"`）+ 关闭按钮（`data-testid="btn-close-review"`）
2. 商品信息：图片（`data-testid="review-item-image"`，96×96）、名称（`data-testid="review-item-name"`）、规格（`data-testid="review-item-spec"`）
3. 评分：引用 `ReviewStarRating.vue`，Label "商品评分"
4. 评价内容：文本域（`data-testid="review-content"`），`h-[120px]`，`bg-[#f3f3f5]`，placeholder，右下角字数统计（`data-testid="review-content-count"`），最多 500 字
5. 图片上传（选填）：
   - 上传按钮（`data-testid="btn-upload-image"`，`size-[80px]`）
   - 隐藏 file input（`data-testid="review-image-input"`，`accept="image/*"`，`multiple`）
   - 缩略图（`data-testid="uploaded-image-{n}"`）+ 删除按钮（`data-testid="delete-image-{n}"`）
   - 最多 5 张，达上限后隐藏上传按钮
   - 提示文字"最多上传5张图片，每张不超过5MB"
6. 提交按钮（`data-testid="btn-submit-review"`）：`bg-[#0f0f10]`，全宽，`py-[16px]`，文案"提交评价"

**表单逻辑**：
- `content` 非空校验：为空时提示并阻止提交（TC-10）
- 图片处理：当前阶段图片作为 File 对象暂存，提交时若项目有上传接口则先上传获取 URL，否则跳过 pics 字段（待确认项，见 api-notes.md）
- 提交：调用 `RateApiClient.submitRate()`，成功 → emit `submitted` + `close`；失败 → Toast 错误提示，弹窗保持打开

**验证**：TC-01 ~ TC-10 全部通过。

---

## Step 4：订单详情页集成

**文件**：`app/pages/account/orders/[id].vue`

**改动**：
- 导入并注册 `OrderReviewModal`
- 添加 `reviewVisible` 响应式变量和 `reviewItem` 数据
- `OrderDetailActions` 的 `@review` 事件中设置 `reviewVisible = true`，传入当前商品数据
- `@submitted` 事件中调用 `refresh()` 刷新订单详情
- 模板中加入 `<OrderReviewModal>` 组件

**验证**：订单详情页"评价"按钮可打开弹窗，提交成功后详情刷新。

---

## Step 5：订单列表页集成

**文件**：`app/pages/account/orders/index.vue`

**改动**：
- 为 `order.canReview` 为 `true` 的订单渲染"评价"按钮（`data-testid="btn-review"`，`@click.stop`）
- 导入并注册 `OrderReviewModal`
- 维护 `reviewVisible`、`reviewOrderId`、`reviewItem` 响应式状态
- `@submitted` 后刷新订单列表

**验证**：TC-01、TC-02 中 `btn-review` 可触发弹窗。

---

## Step 6：补充 OrderTransformer

**文件**：`app/infrastructure/transformers/orderTransformer.ts`

**改动**：
- 在 `toOrderModel()` 返回值中添加：
  ```ts
  canReview: status === 'pending_review',
  ```

**验证**：TypeScript 无报错，`pending_review` 状态订单 `canReview` 为 `true`。

---

## Step 7：补充 OrderDetailActions.vue

**文件**：`app/pages/account/components/OrderDetailActions.vue`

**改动**：
- 添加 `review` emit
- 为 `actions.includes('review')` 渲染"评价"按钮（`data-testid="btn-review"`）

---

## Step 8：I18n 补充

**文件**：`app/locales/zh-CN.json`、`en-US.json`、`ar.json`

**新增 key**：

| Key | zh-CN | en-US | ar |
|-----|-------|-------|-----|
| `orders.review` | 评价 | Review | تقييم |
| `orders.review_modal_title` | 评价商品 | Review Product | تقييم المنتج |
| `orders.review_content_placeholder` | 分享您的使用体验，帮助其他买家了解这件商品... | Share your experience... | شارك تجربتك... |
| `orders.review_upload_hint` | 最多上传5张图片，每张不超过5MB | Up to 5 images, max 5MB each | حتى 5 صور، 5 ميغابايت لكل صورة |
| `orders.review_satisfaction_1` | 非常不满意 | Very Dissatisfied | غير راضٍ جداً |
| `orders.review_satisfaction_2` | 不满意 | Dissatisfied | غير راضٍ |
| `orders.review_satisfaction_3` | 一般 | Average | عادي |
| `orders.review_satisfaction_4` | 满意 | Satisfied | راضٍ |
| `orders.review_satisfaction_5` | 非常满意 | Very Satisfied | راضٍ جداً |

---

## 执行顺序

1. Step 1 — RateApiClient
2. Step 2 — ReviewStarRating.vue
3. Step 3 — OrderReviewModal.vue
4. Step 6 — OrderTransformer（canReview）
5. Step 7 — OrderDetailActions.vue
6. Step 4 — 订单详情页集成
7. Step 5 — 订单列表页集成
8. Step 8 — I18n

---

## 验收标准映射

| 验收项 | 对应 Step | 对应 TC |
|--------|-----------|---------|
| PC 端右侧抽屉 560px | Step 3 | TC-01 |
| H5 端底部 Sheet | Step 3 | TC-02 |
| 商品信息展示 | Step 3 | TC-03 |
| 5星评分 + 满意度文字 | Step 2 | TC-04 |
| 文字输入 + 字数统计 | Step 3 | TC-05 |
| 图片上传最多5张 | Step 3 | TC-06 |
| 提交成功关闭弹窗 | Step 1+3 | TC-07 |
| 提交失败保持打开 | Step 3 | TC-08 |
| 关闭按钮 | Step 3 | TC-09 |
| 内容必填前端校验 | Step 3 | TC-10 |
