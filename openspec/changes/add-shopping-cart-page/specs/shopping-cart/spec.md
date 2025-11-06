# Shopping Cart Specification

购物车功能规范文档

## ADDED Requirements

### Requirement: 购物车页面展示

系统 MUST 提供一个完整的购物车页面，展示用户添加的所有商品，并支持商品管理和结算功能。

#### Scenario: 购物车列表加载成功

- **WHEN** 用户访问 `/cart` 路由
- **THEN** 系统应从 Apifox MCP API 获取购物车数据
- **AND** 显示表头（全选框、商品信息、单价、数量、合计、操作）
- **AND** 显示所有购物车商品列表
- **AND** 显示底部操作栏（全选、批量操作、合计金额、结算按钮）

#### Scenario: 购物车为空

- **WHEN** 用户访问购物车页面
- **AND** 购物车中没有商品
- **THEN** 显示空状态提示信息
- **AND** 显示"购物车是空的"文字
- **AND** 提供"去逛逛"按钮，点击后跳转到商品列表页

#### Scenario: 购物车加载失败

- **WHEN** API 请求失败或超时
- **THEN** 显示错误提示信息
- **AND** 提供重试按钮
- **AND** 可选择从本地缓存加载数据

### Requirement: 商品项展示

每个购物车商品项 MUST 完整展示商品信息和操作按钮，符合UI设计规范。

#### Scenario: 正常商品展示

- **WHEN** 商品可购买（available = true，库存充足）
- **THEN** 显示商品勾选框（可点击）
- **AND** 显示商品图片（80x80像素）
- **AND** 显示商品名称和规格信息
- **AND** 显示单价（现价，删除线显示原价）
- **AND** 显示数量调整器（减少、输入框、增加按钮）
- **AND** 显示小计金额（单价 × 数量）
- **AND** 显示删除和收藏按钮

#### Scenario: 不可购买商品展示

- **WHEN** 商品不可购买（available = false 或库存不足）
- **THEN** 商品项显示为灰色禁用状态
- **AND** 勾选框不可点击
- **AND** 显示"已下架"或"库存不足"标签
- **AND** 数量调整器禁用
- **AND** 不计入选中商品总价

#### Scenario: 商品折扣显示

- **WHEN** 商品有原价（original_price > price）
- **THEN** 单价显示为：现价（红色）+ 原价（删除线，灰色）
- **AND** 小计按现价计算

### Requirement: 商品选择管理

系统 MUST 支持单选、全选、部分选中等选择状态管理。

#### Scenario: 单个商品选中切换

- **WHEN** 用户点击商品项的勾选框
- **THEN** 切换该商品的选中状态（selected: true/false）
- **AND** 调用 API 更新选中状态
- **AND** 实时更新底部栏的选中数量和总价
- **AND** 更新全选框状态（全选、部分选中、未选中）

#### Scenario: 全选功能

- **WHEN** 用户点击表头的全选框
- **AND** 当前未全选
- **THEN** 选中所有可购买的商品
- **AND** 调用 API 批量更新选中状态
- **AND** 更新底部栏统计信息

#### Scenario: 取消全选

- **WHEN** 用户点击表头的全选框
- **AND** 当前已全选
- **THEN** 取消选中所有商品
- **AND** 调用 API 批量更新选中状态
- **AND** 清空底部栏选中统计

#### Scenario: 部分选中状态

- **WHEN** 部分商品被选中（不是全部也不是全不选）
- **THEN** 全选框显示为中间状态（indeterminate）
- **AND** 点击全选框时，选中所有商品

### Requirement: 数量调整

系统 MUST 支持商品数量的增加、减少和直接输入，并进行库存验证。

#### Scenario: 增加数量

- **WHEN** 用户点击数量调整器的"+"按钮
- **AND** 当前数量 < 库存
- **THEN** 数量增加 1
- **AND** 调用 API 更新数量
- **AND** 实时更新小计和总价
- **AND** 更新本地缓存

#### Scenario: 减少数量

- **WHEN** 用户点击数量调整器的"-"按钮
- **AND** 当前数量 > 1
- **THEN** 数量减少 1
- **AND** 调用 API 更新数量
- **AND** 实时更新小计和总价

#### Scenario: 数量达到最小值

- **WHEN** 商品数量为 1
- **THEN** "-"按钮禁用
- **AND** 用户无法继续减少数量

#### Scenario: 数量达到库存上限

- **WHEN** 商品数量等于库存
- **THEN** "+"按钮禁用
- **AND** 显示"已达库存上限"提示
- **AND** 用户无法继续增加数量

#### Scenario: 直接输入数量

- **WHEN** 用户在数量输入框中输入数字
- **AND** 输入的数量在 1 到库存之间
- **THEN** 更新商品数量
- **AND** 调用 API 更新数量

#### Scenario: 输入无效数量

- **WHEN** 用户输入的数量 < 1
- **THEN** 自动修正为 1
- **WHEN** 用户输入的数量 > 库存
- **THEN** 自动修正为库存数量
- **AND** 显示提示信息"最多可购买 X 件"

### Requirement: 删除商品

系统 MUST 支持删除单个商品和批量删除选中商品。

#### Scenario: 删除单个商品

- **WHEN** 用户点击商品项的"删除"按钮
- **THEN** 弹出确认对话框"确定要删除该商品吗？"
- **AND** 用户确认后，调用 API 删除商品
- **AND** 从列表中移除该商品
- **AND** 显示成功提示"商品已删除"
- **AND** 更新购物车统计信息

#### Scenario: 批量删除选中商品

- **WHEN** 用户点击底部栏的"删除"按钮
- **AND** 至少有一个商品被选中
- **THEN** 弹出确认对话框"确定要删除选中的 X 件商品吗？"
- **AND** 用户确认后，调用 API 批量删除
- **AND** 从列表中移除所有选中商品
- **AND** 显示成功提示"已删除选中的商品"

#### Scenario: 批量删除时未选中商品

- **WHEN** 用户点击底部栏的"删除"按钮
- **AND** 没有商品被选中
- **THEN** 显示警告提示"请先选择要删除的商品"
- **AND** 不执行删除操作

### Requirement: 收藏功能

系统 SHALL 支持将购物车商品添加到收藏列表（待实现）。

#### Scenario: 收藏单个商品

- **WHEN** 用户点击商品项的"收藏"按钮
- **THEN** 调用收藏 API 将商品添加到收藏列表
- **AND** 显示成功提示"已添加到收藏"
- **AND** 可选择是否同时从购物车删除

#### Scenario: 批量收藏

- **WHEN** 用户点击底部栏的"收藏"按钮
- **AND** 至少有一个商品被选中
- **THEN** 批量添加选中商品到收藏列表
- **AND** 显示成功提示"已收藏 X 件商品"

### Requirement: 结算功能

系统 MUST 支持结算功能，验证选中商品并跳转到订单页面。

#### Scenario: 结算验证通过

- **WHEN** 用户点击底部栏的"结算"按钮
- **AND** 至少有一个可购买商品被选中
- **AND** 所有选中商品库存充足
- **THEN** 跳转到订单结算页面 `/orders/checkout`
- **AND** 携带选中商品信息

#### Scenario: 结算验证失败 - 未选中商品

- **WHEN** 用户点击"结算"按钮
- **AND** 没有商品被选中
- **THEN** 显示警告提示"请先选择要结算的商品"
- **AND** 不执行跳转

#### Scenario: 结算验证失败 - 商品不可购买

- **WHEN** 用户点击"结算"按钮
- **AND** 选中的商品包含不可购买的商品
- **THEN** 显示错误提示"选中的商品中有 X 件不可购买"
- **AND** 高亮显示不可购买的商品
- **AND** 不执行跳转

#### Scenario: 结算按钮状态

- **WHEN** 没有选中商品
- **THEN** 结算按钮显示为禁用状态
- **AND** 按钮文字为"请选择商品"
- **WHEN** 有选中商品
- **THEN** 结算按钮为可点击状态
- **AND** 按钮文字为"结算(X)"，X 为选中商品数量

### Requirement: 统计信息实时更新

系统 MUST 实时计算并显示购物车统计信息。

#### Scenario: 底部栏统计信息

- **WHEN** 购物车数据或选中状态发生变化
- **THEN** 实时更新以下信息：
  - 已选商品数量："已选商品 X 件"
  - 选中商品合计金额："合计：¥X.XX"
  - 结算按钮状态和文字

#### Scenario: 金额计算规则

- **WHEN** 计算选中商品总价
- **THEN** 只计算 selected = true 且 available = true 的商品
- **AND** 小计 = 单价 × 数量
- **AND** 合计 = 所有选中商品的小计之和
- **AND** 金额保留两位小数

### Requirement: 本地存储持久化

系统 MUST 支持购物车数据的本地存储，页面刷新后恢复数据。

#### Scenario: 数据持久化

- **WHEN** 购物车数据发生变化（增删改）
- **THEN** 将数据保存到 localStorage
- **AND** 使用 key: `ecshopx_cart_items`
- **AND** 数据格式为 JSON 字符串

#### Scenario: 数据恢复

- **WHEN** 用户刷新页面或重新打开页面
- **THEN** 从 localStorage 读取购物车数据
- **AND** 优先使用本地数据展示
- **AND** 异步调用 API 获取最新数据
- **AND** 服务端数据覆盖本地数据

#### Scenario: 多标签页同步

- **WHEN** 用户在多个标签页同时打开购物车
- **AND** 在一个标签页修改了购物车
- **THEN** 通过 localStorage 事件同步到其他标签页
- **AND** 所有标签页显示一致的购物车状态

### Requirement: DDD 架构实现

系统 MUST 遵循 DDD（领域驱动设计）架构规范，清晰分层。

#### Scenario: 领域层实现

- **WHEN** 实现购物车业务逻辑
- **THEN** 必须创建以下领域对象：
  - `Cart` 聚合根 - 管理购物车生命周期
  - `CartItem` 实体 - 购物车商品项
  - `Money` 值对象 - 金额计算
  - `CartDomainService` 领域服务 - 跨实体业务逻辑
  - `ICartRepository` 仓储接口 - 数据访问契约

#### Scenario: 应用层实现

- **WHEN** 协调业务用例
- **THEN** 必须创建 `CartApplicationService`
- **AND** 方法包括：getCart、addToCart、updateQuantity、removeItem、checkout
- **AND** 不包含业务规则（业务规则在领域层）

#### Scenario: 基础设施层实现

- **WHEN** 实现数据访问
- **THEN** 创建 `CartRepository` 实现 `ICartRepository`
- **AND** 负责 API 调用和数据转换
- **AND** 负责本地存储管理

#### Scenario: 表现层实现

- **WHEN** 实现 UI 组件
- **THEN** 创建以下组件：
  - `pages/cart/index.vue` - 页面组件
  - `components/business/CartList.vue` - 列表组件
  - `components/business/CartItem.vue` - 商品项组件
  - `components/business/CartFooter.vue` - 底部栏组件
- **AND** 创建 `useCart` composable 封装业务逻辑
- **AND** 使用 Pinia Store 管理 UI 状态

### Requirement: class-transformer 数据转换

系统 MUST 使用 class-transformer 实现 API 数据到领域模型的转换。

#### Scenario: API 响应转换为实体

- **WHEN** 从 API 获取购物车数据
- **THEN** 使用 `CartEntity.fromPlain()` 转换为实体
- **AND** 实体包含业务方法（如 calculateTotal、canCheckout）
- **AND** 验证数据完整性和业务规则

#### Scenario: 实体转换为 UI 模型

- **WHEN** 实体需要展示到 UI
- **THEN** 调用 `entity.toUIModel()` 转换为 UI 数据
- **AND** UI 数据包含格式化字段（如 priceDisplay、totalDisplay）
- **AND** UI 数据包含派生字段（如 canCheckout、checkoutButtonText）

### Requirement: Apifox MCP API 集成

系统 MUST 通过 Apifox MCP 获取购物车 API，实现标准化的接口调用。

#### Scenario: 获取购物车列表 API

- **WHEN** 调用 `GET /api/cart`
- **THEN** 返回购物车商品列表和统计信息
- **AND** 响应格式符合 `ICartListResponse` 接口

#### Scenario: 添加商品到购物车 API

- **WHEN** 调用 `POST /api/cart` 携带 `IAddCartRequest`
- **THEN** 添加商品到购物车
- **AND** 返回新的购物车项 ID 和商品总数

#### Scenario: 更新购物车商品 API

- **WHEN** 调用 `PUT /api/cart/:id` 携带 `IUpdateCartRequest`
- **THEN** 更新商品数量或选中状态
- **AND** 返回成功状态

#### Scenario: 删除购物车商品 API

- **WHEN** 调用 `DELETE /api/cart/:id`
- **THEN** 删除指定商品
- **AND** 返回成功状态

#### Scenario: 批量删除 API

- **WHEN** 调用 `POST /api/cart/batch-remove` 携带商品 ID 数组
- **THEN** 批量删除选中商品
- **AND** 返回成功状态

### Requirement: 响应式设计

购物车页面 MUST 支持桌面端和移动端的响应式适配。

#### Scenario: 桌面端显示

- **WHEN** 屏幕宽度 >= 768px
- **THEN** 显示完整的表格布局
- **AND** 表头固定显示
- **AND** 所有字段横向排列

#### Scenario: 移动端适配

- **WHEN** 屏幕宽度 < 768px
- **THEN** 切换为卡片式布局
- **AND** 商品信息纵向排列
- **AND** 底部操作栏固定在底部

### Requirement: 性能优化

系统 MUST 确保购物车页面的良好性能和用户体验。

#### Scenario: 防抖优化

- **WHEN** 用户频繁调整数量
- **THEN** 使用防抖（debounce）延迟 API 调用
- **AND** 延迟时间为 300ms
- **AND** 先更新本地状态，再同步到服务端

#### Scenario: 乐观更新

- **WHEN** 用户执行操作（选中、数量调整）
- **THEN** 立即更新 UI 显示
- **AND** 异步调用 API
- **AND** API 失败时回滚 UI 状态并提示用户

#### Scenario: 加载状态

- **WHEN** 执行异步操作
- **THEN** 显示加载动画或禁用操作按钮
- **AND** 防止重复提交
- **AND** 操作完成后恢复正常状态
