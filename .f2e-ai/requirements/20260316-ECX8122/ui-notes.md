# UI 说明：ECX-8122 收货地址列表页

## Figma 设计稿来源

- **Figma MCP 拉取结果**：成功。已通过 Figma MCP `get_design_context` 拉取两个节点的设计上下文与截图描述。
- **文件**：ECshopex-demo-PC端，fileKey `clySPKbja8yL0BQnFke6oi`
- **节点一**（PC 端收货地址页）：`node-id=2507-5039`  
  - [链接](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2507-5039)
  - 布局：左侧「我的账户」导航（个人中心、我的订单、优惠券、收货地址等），右侧主区标题「收货地址」、右上「+添加新地址」、地址卡片两列网格，每卡片含姓名、编辑、电话、详细地址。
- **节点二**（H5 收货地址页）：`node-id=2979-3505`  
  - [链接](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2979-3505)
  - 布局：顶部 GenstoreHeader(375px) → FilterBar（「收货地址」+ 箭头）→ 标题行「收货地址」+「+ 添加新地址」→ 地址卡片单列列表；第一张卡片有「默认」标签 + 姓名 + 编辑 + 电话 + 地址，其余卡片无「默认」标签，仅姓名 + 编辑 + 电话 + 地址；卡片边框默认地址为 `#191a1d`，非默认为 `#e5e7eb`。

## 设计稿要点（与需求一致）

- **字体**：Noto Sans SC（Medium 16/14/12，Regular 14/12），Inter 用于 LOGO/价格等。
- **颜色**：主文 `#191a1d`，次要文 `#4a5565`，边框浅灰 `#e5e7eb`，默认标签背景 `#f3f4f6`。
- **本需求目标端为仅 H5**：实现时以节点二（H5-收货地址）为主；节点一可作为后续 PC 或响应式参考。

## 组件拆分结果

| 区域 | 组成 | 说明 |
|------|------|------|
| H5 顶栏 | 头部（LOGO + 图标区） | 与设计稿 GenstoreHeader 一致，宽度 375px |
| 筛选/导航条 | 「收货地址」文案 + 左箭头 | FilterBar，可返回上一级 |
| 标题区 | 「收货地址」标题 + 「+ 添加新地址」按钮 | 与现有 address 页标题区一致，按钮触发新增 |
| 地址列表 | 单列地址卡片 | 每项：可选「默认」标签、姓名、编辑、电话、详细地址；需求还含删除、设为默认 |
| 单张地址卡片 | 默认标签（可选）+ 姓名 + 编辑（+ 删除/设为默认） + 电话 + 详细地址 | 默认地址卡片边框加深 |

## 可复用组件建议

- **AddressCard**（`app/pages/account/components/AddressCard.vue`）  
  - 当前已有：姓名、gender、电话、fullAddress、编辑。  
  - 建议扩展：`isDefault` 展示「默认」标签；支持 `@delete`、设为默认操作（或由列表页传入回调）；H5 下为单列、样式与设计稿对齐（边框、内边距 17px、gap 16px）。
- **BCAddressModal**（`app/components/BCAddressModal/BCAddressModal.vue`）  
  - 已用于 checkout 的新增/编辑地址，可直接复用于本页「添加新地址」与「编辑」弹窗，需对接本需求 5 个接口（列表、详情、新增、修改、删除）。
- **AccountMenu**  
  - 本需求为仅 H5，H5 设计稿中无左侧账户菜单，为顶部 Header + FilterBar + 内容区；若 H5 从「个人中心」等入口进入，可用路由或全局导航，无需在地址页内嵌 AccountMenu。
- **头部**  
  - 若项目已有 H5 通用头部（如带返回、标题），可复用并配置标题为「收货地址」；否则按设计稿 GenstoreHeader 实现。

## 需要新建或改造的组件/页面

1. **H5 收货地址页面**  
   - 路径建议仍为 `/account/address`，通过响应式或路由区分 H5 布局。  
   - H5 布局：顶部 Header → FilterBar（返回 + 「收货地址」）→ 标题行 + 「+ 添加新地址」→ 单列地址列表（使用扩展后的 AddressCard）；空状态「暂无收货地址」。  
   - 对接：GET 地址列表、删除、设为默认（若接口支持）；新增/编辑用 BCAddressModal + 对应接口。

2. **AddressCard 增强**  
   - 新增 `isDefault` 展示「默认」标签（样式：背景 `#f3f4f6`、12px Medium）；  
   - 新增删除入口（及确认）与设为默认入口（若接口支持）；  
   - H5 单列时卡片宽度 100%，边框与内边距按设计稿。

3. **新增/编辑流程**  
   - 使用 BCAddressModal，打开时新增用 POST、编辑用 GET 详情 + PUT；保存后刷新列表。

4. **设为默认**  
   - 若后端在「修改地址」或单独接口中支持设为默认，需在卡片或弹窗中提供入口并与设计稿一致。

## 与现有实现的差异（供实现参考）

- 现有 `app/pages/account/address.vue` 为 PC 布局（左侧菜单 + 右侧两列地址卡片），且为模拟数据、无接口对接。  
- 本需求需：改为/增加 H5 布局、对接 5 个地址接口、AddressCard 支持默认标签与删除/设为默认、新增编辑与列表联动。
