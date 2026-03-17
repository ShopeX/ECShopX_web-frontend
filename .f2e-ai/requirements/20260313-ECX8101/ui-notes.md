# UI 分析记录：ECX-8101 我的订单页面

## MCP 拉取说明

- **Figma 信息来源**：用户在对话中提供了 3 个设计稿链接，并确认 H5 设计稿也已补充。
- **Figma MCP 拉取结果**：失败。当前会话未接入 Figma MCP，因此**未直接拉取节点结构、尺寸、间距、颜色与组件层级**。
- **处理方式**：先记录用户提供的链接与当前项目可复用结构，后续若接入 Figma MCP，可再补充精确的节点分析。

## 已提供的设计稿链接

- PC 节点 1：<https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2111-763&t=vjIrBx0RYWcMGVkB-4>
- PC 节点 2：<https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2888-9962&t=vjIrBx0RYWcMGVkB-4>
- PC 节点 3：<https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2896-3528&t=vjIrBx0RYWcMGVkB-4>

## 当前项目结构观察

### 已有账号中心骨架

- 现有个人中心首页位于 `app/pages/account/index.vue`。
- 页面采用 **左侧账号菜单 + 右侧内容区** 的 PC 结构。
- 左侧菜单组件位于 `app/pages/account/components/AccountMenu.vue`，已包含“我的订单”入口，路径为 `/account/orders`。
- 当前仓库中还**没有** `app/pages/account/orders.vue`，说明订单页本体尚未落地。

### 已有响应式基础

- 当前项目已有支付页 `app/pages/payment/index.vue`，能看出项目在一个页面内同时兼顾 PC 和 H5 的响应式布局。
- 用户已明确说明“当前 web 系统是响应式的”，因此我的订单页面不应拆成两套完全独立路由，而应优先沿用响应式实现思路。

### 已有交互/数据基础

- `app/composables/useOrders.ts` 已具备订单列表、取消订单、确认收货、删除订单、立即支付等方法定义。
- 这说明页面开发不仅是新增视图，也包含对既有订单能力的接线与校准。

## 组件拆分建议

以下拆分基于当前项目结构和需求范围整理，**不是对 Figma 结构的直接还原**。

1. `AccountMenu`
   - 直接复用现有账号中心左侧菜单。
   - 页面进入“我的订单”时激活 `orders` 菜单项。

2. `AccountOrdersPageShell`
   - 负责账号中心页面整体布局。
   - PC 保持左侧菜单 + 右侧内容区。
   - H5 保持单列响应式布局。

3. `OrderStatusTabs`
   - 负责状态切换入口。
   - 状态项至少包含：全部订单、待支付、待收货、待字体、售后、待评价。
   - “待字体”文案待确认后再固定。

4. `OrderList`
   - 负责订单列表容器、空态、加载态、分页/加载更多状态。

5. `OrderCard`
   - 负责单条订单卡片展示。
   - 应承载订单基础信息、商品列表、金额、当前状态与操作按钮区域。

6. `OrderActionGroup`
   - 负责根据订单状态切换操作按钮：
   - 待支付：取消订单、立即支付
   - 待收货：申请售后、确认收货
   - 已取消：删除订单

## 可复用组件建议

- 复用 `AccountMenu` 作为账号中心导航。
- 复用现有支付页跳转能力，`useOrders.ts` 已有 `payNow(orderId)` 跳转逻辑。
- 若项目已有通用分页、按钮、弹窗、空态组件，应优先接入而不是在订单页重造。

## 需要新建或补齐的部分

- `app/pages/account/orders.vue`
- 订单页专用的状态筛选区块
- 订单卡片/订单商品项展示组件
- 针对 H5 的列表折叠、按钮排布、状态栏布局适配

## 现阶段不能下结论的内容

由于未通过 Figma MCP 拉取设计稿，以下内容暂不做硬性结论：

- 精确的字号、间距、边框、卡片层级
- PC 与 H5 的具体版式差异
- 是否存在特殊状态角标、订单时间轴、物流信息块等视觉细节
- “待评价”“售后”入口是页面 Tab、筛选项还是跳转入口

## 建议的后续补充

- 接入 Figma MCP 后，补充节点级别的结构拆解与尺寸说明。
- 把 H5 设计稿具体链接或节点号补到本文件，避免后续只按 PC 稿推断响应式细节。
