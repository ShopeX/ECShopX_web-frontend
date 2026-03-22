# 开发计划 — ECX-8174 申请售后组件

## 与 handbook 对齐

| 约束项 | 本次执行方式 |
|--------|------------|
| 组件命名 PascalCase | `AftersalesModal.vue` 放于 `app/pages/account/components/` |
| HTTP Client 命名 | `AftersalesApiClient.ts`，导出类 + 单例 `aftersalesApiClient` |
| i18n key 格式 | `{md5(filePath)[0:8]}.{md5(text)[0:6]}`，AftersalesModal 前缀 `0747dfee` |
| 测试选择器 | 全部使用 `data-testid`（Playwright `testIdAttribute: 'data-testid'`） |
| 样式 | 纯 Tailwind，`<script setup lang="ts">`，无 scoped style |
| 自动导入 | composables/components 不手写 import |

---

## Step 1：新建 `AftersalesApiClient.ts`

**文件**：`app/infrastructure/http/clients/AftersalesApiClient.ts`

- 定义 `ICreateAftersalesParams` 接口：
  ```ts
  export interface ICreateAftersalesParams {
    order_id: string
    item_id: string
    reason: string
    detail: string
    aftersales_type: 'ONLY_REFUND' | 'REFUND_GOODS' | 'EXCHANGING_GOODS'
    description: string
  }
  ```
- 实现 `AftersalesApiClient` 类，`submitAftersales()` 调用 `POST /wxapp/aftersales`（所有参数通过 query 传递）
- 导出单例 `aftersalesApiClient`

**同步修改**：`app/infrastructure/http/clients/index.ts` 追加导出 `AftersalesApiClient` 与 `aftersalesApiClient`

**验证**：文件存在，index.ts 导出正常，TypeScript 无报错

---

## Step 2：新建 `AftersalesModal.vue`

**文件**：`app/pages/account/components/AftersalesModal.vue`

**Props**：
| prop | 类型 | 说明 |
|------|------|------|
| `visible` | `boolean` | 控制显示/隐藏 |
| `orderId` | `string` | 订单号，提交时传入 |
| `itemId` | `string` | 商品 ID，提交时传入 |
| `itemDetail` | `string` | 商品名称+规格拼接，传入 `detail` 参数 |

**Emits**：`close`、`submitted`

**双端布局**（参考 `OrderReviewModal.vue`）：
- `<Teleport to="body">` + `<Transition name="fade">`
- 遮罩：`fixed inset-0 z-50 bg-[rgba(0,0,0,0.6)]`，点击遮罩触发 close
- PC（`lg:`）：`w-[600px]` 居中弹窗，`p-[32px]`，`bg-white`
- H5（默认）：`fixed inset-x-0 bottom-0 z-50`，`w-full bg-white px-[16px] py-[32px] rounded-t-[16px]`

**表单字段**（顺序与 Figma 一致）：

1. **商品数量 Stepper**（`quantity`，初始 1，最小 1）
   - `data-testid="btn-quantity-minus"` / `data-testid="quantity-display"` / `data-testid="btn-quantity-plus"`

2. **服务类型 Select**（`aftersalesType`，必填）
   - 选项：`ONLY_REFUND` → `t('0747dfee.6b8821')`、`REFUND_GOODS` → `t('0747dfee.cc0193')`、`EXCHANGING_GOODS` → `t('0747dfee.bb9cd5')`
   - `data-testid="select-aftersales-type"`

3. **退款理由 Select**（`reason`，必填）
   - 选项（硬编码）：`t('0747dfee.c440cd')` / `t('0747dfee.41eb24')` / `t('0747dfee.40cfa6')` / `t('0747dfee.78d83c')` / `t('0747dfee.0d98c7')`
   - `data-testid="select-reason"`

4. **退款说明 Textarea**（`description`，选填，maxlength 500）
   - `bg-[#f3f4f6] p-[12px] h-[80px] resize-none`，placeholder `t('0747dfee.ce7542')`
   - `data-testid="textarea-description"`

**按钮区**：
- 取消：`border border-[#0f0f10] h-[50px]`，PC `w-auto px-[32px]`，H5 `flex-1`，`data-testid="btn-cancel-aftersales"`
- 确定：`bg-[#0f0f10] text-white h-[50px]`，PC `w-auto px-[32px]`，H5 `flex-1`，`data-testid="btn-submit-aftersales"`

**关闭按钮**：右上角 `×`，`data-testid="btn-close-aftersales"`

**表单校验**：`aftersalesType` 和 `reason` 为必填，提交前校验，失败时显示行内提示

**提交逻辑**：
```ts
// 校验通过后
submitting.value = true
try {
  await aftersalesApiClient.submitAftersales({ order_id, item_id, reason, detail, aftersales_type, description })
  toast.show(t('0747dfee.06dc88')) // 售后申请已提交
  emit('submitted')
  emit('close')
} catch (e) {
  toast.show(e.message || '提交失败')
} finally {
  submitting.value = false
}
```

**验证**：组件文件存在，Nuxt 自动导入可用，双端布局与 Figma 节点 2848:4096（PC）/ 2952:6658（H5）视觉一致

---

## Step 3：i18n 新增 key

**文件**：`app/locales/zh-CN.json`、`en-US.json`、`ar.json`

| Key | zh-CN | en-US | ar |
|-----|-------|-------|----|
| `0747dfee.45eb0c` | 申请售后 | Apply for After-sales | طلب خدمة ما بعد البيع |
| `0747dfee.924f67` | 服务类型 | Service Type | نوع الخدمة |
| `0747dfee.1e2355` | 退款理由 | Reason | سبب الاسترداد |
| `0747dfee.f1c0db` | 退款说明 | Description | وصف الاسترداد |
| `0747dfee.ce7542` | 填写退款说明 | Enter description | أدخل الوصف |
| `0747dfee.6b8821` | 仅退款 | Refund Only | استرداد فقط |
| `0747dfee.cc0193` | 退货退款 | Return & Refund | إرجاع واسترداد |
| `0747dfee.bb9cd5` | 换货 | Exchange | استبدال |
| `0747dfee.c440cd` | 质量问题 | Quality Issue | مشكلة في الجودة |
| `0747dfee.41eb24` | 描述不符 | Description Mismatch | لا يطابق الوصف |
| `0747dfee.40cfa6` | 尺寸问题 | Size Issue | مشكلة في المقاس |
| `0747dfee.78d83c` | 不想要了 | Changed My Mind | غيرت رأيي |
| `0747dfee.0d98c7` | 其他 | Other | أخرى |
| `0747dfee.06612d` | 商品数量 | Quantity | الكمية |
| `0747dfee.06dc88` | 售后申请已提交 | After-sales request submitted | تم تقديم طلب خدمة ما بعد البيع |
| `0747dfee.e6d1c3` | 请选择服务类型 | Please select service type | الرجاء تحديد نوع الخدمة |
| `0747dfee.b42a2f` | 请选择退款理由 | Please select a reason | الرجاء تحديد السبب |
| `0747dfee.625fb2` | 取消 | Cancel | إلغاء |
| `0747dfee.38cf16` | 确定 | Confirm | تأكيد |

**验证**：三个 locale 文件均新增上述 key，无重复，JSON 格式合法

---

## Step 4：集成到订单详情页

**文件**：`app/pages/account/orders/[id].vue`

- 添加响应式状态：
  ```ts
  const aftersalesVisible = ref(false)
  const aftersalesItem = ref({ orderId: '', itemId: '', itemDetail: '' })
  ```
- 新增 `openAftersales()` 函数：取 `orderDetail.value.items[0]`，填充 aftersalesItem，设 `aftersalesVisible = true`
- 两处 `<OrderDetailActions>` 绑定 `@aftersales="openAftersales"`
- 模板末尾挂载：
  ```html
  <AftersalesModal
    :visible="aftersalesVisible"
    :order-id="aftersalesItem.orderId"
    :item-id="aftersalesItem.itemId"
    :item-detail="aftersalesItem.itemDetail"
    @close="aftersalesVisible = false"
    @submitted="fetchOrderDetail"
  />
  ```

**验证**：点击详情页"申请售后"按钮可打开弹窗，提交后触发详情刷新

---

## Step 5（可选）：集成到订单列表页

**文件**：`app/pages/account/orders/index.vue`

- 同 Step 4，`openAftersales(order)` 从订单对象取第一个 item 的 itemId
- `@submitted` 触发订单列表刷新

**验证**：列表页"申请售后"按钮可打开弹窗，提交后触发列表刷新

---

## 执行顺序

1. Step 1 — AftersalesApiClient
2. Step 2 — AftersalesModal.vue
3. Step 3 — i18n
4. Step 4 — 订单详情页集成
5. Step 5 — 订单列表页集成（可选）

## 测试用例映射

| 测试用例 | 对应步骤 |
|----------|---------|
| TC01 弹窗打开 | Step 4 |
| TC02/TC03 弹窗关闭 | Step 2 |
| TC04 服务类型下拉 | Step 2 |
| TC05 退款理由下拉 | Step 2 |
| TC06 退款说明填写 | Step 2 |
| TC07 数量 stepper | Step 2 |
| TC08/TC09 表单校验 | Step 2 |
| TC10 提交成功 | Step 1 + Step 2 |
| TC11 提交失败 | Step 1 + Step 2 |
