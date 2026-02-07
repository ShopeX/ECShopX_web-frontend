# 订单列表页

## 背景

订单列表页（`/account/orders`）是用户中心的核心功能,用户可以查看所有订单、筛选订单状态、查看订单详情。本次开发目标是:**完整实现订单列表页 + H5 响应式 + i18n 国际化**。

## 设计参考

- **PC 端**:待提供 Figma 设计稿
- **H5 端**:待提供 Figma 设计稿

## 用户故事

1. **作为**购物用户,**我想要**查看我的所有订单,**以便**了解订单状态和历史记录。

2. **作为**购物用户,**我想要**按状态筛选订单(全部/待付款/待发货/待收货/已完成),**以便**快速找到特定状态的订单。

3. **作为**购物用户,**我想要**查看订单详情,**以便**了解商品信息、价格、配送地址等。

4. **作为**购物用户,**我想要**对订单进行操作(取消订单/确认收货/申请售后),**以便**管理我的订单。

## 验收标准（AC）

### AC1:页面布局

- [ ] PC 端:左侧账户菜单 + 右侧订单列表
- [ ] H5 端:顶部 Tab 切换 + 订单列表
- [ ] 使用 AccountMenu 组件(已有)

### AC2:订单状态筛选

- [ ] 支持 Tab 切换:全部/待付款/待发货/待收货/已完成/已取消
- [ ] 默认显示"全部"订单
- [ ] 切换 Tab 时自动加载对应状态的订单

### AC3:订单卡片

- [ ] 显示订单号、下单时间、订单状态
- [ ] 显示商品列表(图片、名称、规格、数量、价格)
- [ ] 显示订单总金额
- [ ] 显示操作按钮(根据订单状态显示不同按钮)

### AC4:订单操作

- [ ] 待付款:显示"取消订单"和"立即支付"按钮
- [ ] 待发货:显示"提醒发货"按钮
- [ ] 待收货:显示"确认收货"和"查看物流"按钮
- [ ] 已完成:显示"再次购买"和"申请售后"按钮
- [ ] 已取消:显示"删除订单"按钮

### AC5:空状态

- [ ] 无订单时显示空状态提示
- [ ] 提供"去逛逛"按钮跳转到商品列表

### AC6:加载状态

- [ ] 首次加载显示骨架屏
- [ ] 下拉刷新支持(H5)
- [ ] 上拉加载更多

### AC7:i18n 国际化

- [ ] 所有文案使用 `$t()` 国际化
- [ ] 支持 zh-CN / en-US / ar 三种语言
- [ ] RTL 布局适配(阿拉伯语)

## 非目标(Non-goals)

- 订单详情页(后续迭代)
- 物流跟踪页(后续迭代)
- 售后申请页(后续迭代)

## 测试点

### Happy Path

1. 访问订单列表页 → 显示所有订单
2. 点击"待付款" Tab → 显示待付款订单
3. 点击"立即支付"按钮 → 跳转支付页面
4. 点击"确认收货"按钮 → 订单状态变为已完成
5. H5 端完成相同流程

### Edge Cases

1. 无订单 → 显示空状态
2. 网络错误 → 显示错误提示,支持重试
3. 取消订单 → 弹出确认对话框
4. 确认收货 → 弹出确认对话框

### 响应式测试

1. PC 端(≥1024px) → 左右两栏布局
2. H5 端(<1024px) → 单列布局 + 顶部 Tab

## i18n 文案 Keys

| Key | 中文 | English | العربية |
|-----|------|---------|---------|
| `orders.title` | 我的订单 | My Orders | طلباتي |
| `orders.all` | 全部 | All | الكل |
| `orders.pending_payment` | 待付款 | Pending Payment | في انتظار الدفع |
| `orders.pending_shipment` | 待发货 | Pending Shipment | في انتظار الشحن |
| `orders.shipped` | 待收货 | Shipped | تم الشحن |
| `orders.completed` | 已完成 | Completed | مكتمل |
| `orders.cancelled` | 已取消 | Cancelled | ملغى |
| `orders.order_no` | 订单号 | Order No. | رقم الطلب |
| `orders.order_time` | 下单时间 | Order Time | وقت الطلب |
| `orders.total` | 合计 | Total | الإجمالي |
| `orders.cancel` | 取消订单 | Cancel Order | إلغاء الطلب |
| `orders.pay_now` | 立即支付 | Pay Now | ادفع الآن |
| `orders.remind_ship` | 提醒发货 | Remind to Ship | تذكير بالشحن |
| `orders.confirm_receipt` | 确认收货 | Confirm Receipt | تأكيد الاستلام |
| `orders.view_logistics` | 查看物流 | View Logistics | عرض اللوجستيات |
| `orders.buy_again` | 再次购买 | Buy Again | اشترِ مرة أخرى |
| `orders.after_sales` | 申请售后 | After Sales | خدمة ما بعد البيع |
| `orders.delete` | 删除订单 | Delete Order | حذف الطلب |
| `orders.empty` | 暂无订单 | No orders yet | لا توجد طلبات بعد |
| `orders.go_shopping` | 去逛逛 | Go Shopping | اذهب للتسوق |
| `orders.loading` | 加载中... | Loading... | جاري التحميل... |
| `orders.load_error` | 加载失败 | Load Failed | فشل التحميل |
| `orders.retry` | 重试 | Retry | إعادة المحاولة |

## 技术备注

- **页面**:`app/pages/account/orders.vue`(新建)
- **Composable**:`useOrders`(新建)
- **API Client**:`orderApiClient`(新建)
- **Transformer**:`orderTransformer`(新建)
- **组件**:
  - `AccountMenu`(已有)
  - `BCOrderCard`(新建)
- **响应式断点**:`lg:` (1024px) 区分 PC/H5
- **RTL**:使用 `ms-` / `me-` / `ps-` / `pe-` 替代 `ml-` / `mr-` / `pl-` / `pr-`

## 数据结构

### 订单状态枚举

```typescript
enum OrderStatus {
  ALL = 'all',           // 全部
  PENDING_PAYMENT = 'pending_payment',  // 待付款
  PENDING_SHIPMENT = 'pending_shipment', // 待发货
  SHIPPED = 'shipped',   // 待收货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled'  // 已取消
}
```

### 订单数据结构

```typescript
interface IOrder {
  orderId: string         // 订单号
  orderTime: string       // 下单时间
  status: OrderStatus     // 订单状态
  items: IOrderItem[]     // 商品列表
  totalAmount: number     // 订单总金额
  shippingAddress?: string // 收货地址
}

interface IOrderItem {
  itemId: string          // 商品ID
  itemName: string        // 商品名称
  itemImage: string       // 商品图片
  specName: string        // 规格名称
  quantity: number        // 数量
  price: number           // 单价
}
```
