# 商品结算页

## 背景

商品结算页（`/checkout`）是购物流程的关键环节，用户在此确认配送方式、收货地址、优惠信息并完成支付。当前页面已有基础功能，本次优化目标是：**适配 Figma 设计稿 + H5 响应式 + i18n 国际化**。

## 设计参考

- **PC 端**：[Figma node-id=1914-270](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=1914-270)
- **H5 端**：[Figma node-id=2873-42846](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2873-42846)

## 用户故事

1. **作为**一个购物用户，**我想要**在结算页选择配送方式和收货地址，**以便**商品能送到正确的位置。

2. **作为**一个购物用户，**我想要**使用优惠券和积分，**以便**获得更优惠的价格。

3. **作为**一个购物用户，**我想要**在手机上也能流畅完成结算，**以便**随时随地下单。

## 验收标准（AC）

### AC1：页面布局

- [ ] PC 端：左右两栏布局（左侧信息区 + 右侧订单摘要）
- [ ] H5 端：单列布局，订单摘要在底部
- [ ] H5 端：底部固定支付栏（总计 + 立即支付按钮）

### AC2：配送信息

- [ ] 支持"快递配送"和"门店自提"两种方式
- [ ] 单选按钮样式符合设计稿

### AC3：收货地址

- [ ] PC 端：2 列网格展示地址卡片
- [ ] H5 端：单列展示地址卡片
- [ ] 显示"默认"标签
- [ ] 支持"编辑"和"添加新地址"操作
- [ ] 选中地址有边框高亮

### AC4：优惠券

- [ ] 显示当前选中的优惠券（如"满500减100"）
- [ ] 点击可打开优惠券选择抽屉

### AC5：积分抵扣

- [ ] 显示"用户可用积分"和"本单最大可用积分"
- [ ] 支持勾选"使用积分"
- [ ] 支持勾选"全额抵扣"或输入自定义积分数

### AC6：发票信息

- [ ] 支持勾选"需要电子发票"
- [ ] 勾选后弹出发票信息填写弹窗

### AC7：订单摘要

- [ ] 显示商品数量（如"1 件商品"）
- [ ] 显示商品列表（图片、名称、规格、数量、价格）
- [ ] 显示价格明细（商品总计、运费、优惠）
- [ ] 显示总计金额（大字体突出）

### AC8：i18n 国际化

- [ ] 所有文案使用 `$t()` 国际化
- [ ] 支持 zh-CN / en-US / ar 三种语言
- [ ] RTL 布局适配（阿拉伯语）

### AC9：异常处理

- [ ] 当计算运费或下单接口返回 422 状态码时（如商品无效、库存不足等），拦截错误。
- [ ] 弹出专用的错误提示弹窗（非 Toast）。
- [ ] 弹窗包含错误信息文案。
- [ ] 提供"去购物车"（主操作）和"继续购物"（次操作）按钮。
- [ ] "去购物车"跳转至 `/cart`，"继续购物"跳转至 `/`。

## 非目标（Non-goals）

- 支付方式选择（后续迭代）
- 门店自提的门店选择（后续迭代）
- 多包裹拆分配送（不做）

## 测试点

### Happy Path

1. 选择快递配送 → 选择地址 → 使用优惠券 → 使用积分 → 同意协议 → 立即支付
2. H5 端完成相同流程

### Edge Cases

1. 无收货地址 → 显示空状态，提示添加
2. 无可用优惠券 → 显示"暂无可用优惠券"
3. 积分不足 → 输入框限制最大值

### 响应式测试

1. PC 端（≥1024px）→ 左右两栏布局
2. H5 端（<1024px）→ 单列布局 + 底部固定支付栏

## i18n 文案 Keys

| Key | 中文 | English | العربية |
|-----|------|---------|---------|
| `checkout.title` | 结算 | Checkout | الدفع |
| `checkout.deliveryInfo` | 配送信息 | Delivery Info | معلومات التوصيل |
| `checkout.selectDelivery` | 请选择您的配送方式 | Select delivery method | اختر طريقة التوصيل |
| `checkout.express` | 快递配送 | Express Delivery | التوصيل السريع |
| `checkout.pickup` | 门店自提 | Store Pickup | الاستلام من المتجر |
| `checkout.address` | 收货地址 | Shipping Address | عنوان الشحن |
| `checkout.addAddress` | + 添加新地址 | + Add Address | + إضافة عنوان |
| `checkout.default` | 默认 | Default | افتراضي |
| `checkout.edit` | 编辑 | Edit | تعديل |
| `checkout.coupon` | 优惠券 | Coupon | قسيمة |
| `checkout.selectCoupon` | 选择优惠券 | Select Coupon | اختر قسيمة |
| `checkout.points` | 积分抵扣 | Points Deduction | خصم النقاط |
| `checkout.userPoints` | 用户可用积分 | Available Points | النقاط المتاحة |
| `checkout.maxPoints` | 本单最大可用积分 | Max Points for Order | الحد الأقصى للنقاط |
| `checkout.usePoints` | 使用积分 | Use Points | استخدام النقاط |
| `checkout.fullDeduction` | 全额抵扣 | Full Deduction | خصم كامل |
| `checkout.invoice` | 发票信息 | Invoice | الفاتورة |
| `checkout.needInvoice` | 需要电子发票 | Need E-Invoice | أحتاج فاتورة إلكترونية |
| `checkout.itemCount` | {count} 件商品 | {count} item(s) | {count} منتج |
| `checkout.subtotal` | 商品总计 | Subtotal | المجموع الفرعي |
| `checkout.freight` | 运费 | Shipping | الشحن |
| `checkout.freightFree` | 免费 | Free | مجاني |
| `checkout.discount` | 优惠 | Discount | الخصم |
| `checkout.total` | 总计 | Total | الإجمالي |
| `checkout.agreeTerms` | 我同意隐私政策以及销售条款 | I agree to Privacy Policy and Terms | أوافق على سياسة الخصوصية والشروط |
| `checkout.payNow` | 立即支付 | Pay Now | ادفع الآن |
| `checkout.noAddress` | 暂无收货地址，请添加 | No address, please add | لا يوجد عنوان، يرجى الإضافة |

## 技术备注

- **页面**：`app/pages/checkout/index.vue`
- **Composable**：`useCheckout`（已有）
- **组件**：`BCAddressModal`、`BCInvoiceModal`、`BCCouponSelector`（已有）
- **响应式断点**：`lg:` (1024px) 区分 PC/H5
- **RTL**：使用 `ms-` / `me-` / `ps-` / `pe-` 替代 `ml-` / `mr-` / `pl-` / `pr-`
