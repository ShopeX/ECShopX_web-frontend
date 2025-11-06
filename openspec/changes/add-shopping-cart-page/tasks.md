# Shopping Cart Implementation Tasks

购物车功能实现任务清单

## 1. 领域层实现 (Domain Layer)

- [x] 1.1 创建 `MoneyValueObject` 值对象 (`app/domain/shared/MoneyValueObject.ts`)
  - [x] 实现金额计算方法（add、subtract、multiply、divide）
  - [x] 实现金额格式化（display 属性）
  - [x] 实现金额比较方法（equals、isGreaterThan 等）
  - [ ] 添加单元测试

- [x] 1.2 创建 `QuantityValueObject` 值对象 (`app/domain/shared/QuantityValueObject.ts`)
  - [x] 实现数量验证逻辑（最小值、最大值）
  - [x] 实现数量计算方法（add、subtract）
  - [x] 实现数量比较方法
  - [ ] 添加单元测试

- [x] 1.3 创建 `CartItemEntity` 实体 (`app/domain/cart/CartItemEntity.ts`)
  - [x] 定义私有字段（id、productId、price、quantity、stock 等）
  - [x] 实现 getter 方法
  - [x] 实现业务方法（setQuantity、increaseQuantity、decreaseQuantity）
  - [x] 实现选中状态管理（toggleSelection、setSelected）
  - [x] 实现业务计算（calculateSubtotal、canBePurchased）
  - [x] 添加业务规则验证（数量范围、库存检查）
  - [ ] 添加单元测试

- [x] 1.4 创建 `Cart` 聚合根 (`app/domain/cart/Cart.ts`)
  - [x] 定义私有字段（id、items、events）
  - [x] 实现商品管理方法（addItem、removeItem、updateItemQuantity）
  - [x] 实现选择管理方法（toggleItemSelection、toggleAllSelection）
  - [x] 实现查询方法（getSelectedItems、getAvailableItems）
  - [x] 实现业务计算（calculateSelectedTotal、calculateTotalDiscount）
  - [x] 实现业务规则（canCheckout、validateCheckout）
  - [x] 实现领域事件（CartItemAddedEvent、CartItemRemovedEvent）
  - [ ] 添加单元测试

- [x] 1.5 创建 `CartPolicyService` 领域服务 (`app/domain/cart/CartPolicyService.ts`)
  - [x] 实现商品合并逻辑（mergeCartItem）
  - [x] 实现结算验证（validateCheckout）
  - [x] 实现优惠计算（calculatePromotions）
  - [ ] 添加单元测试

- [x] 1.6 定义 `ICartRepository` 仓储接口 (`app/domain/cart/ICartRepository.ts`)
  - [x] 定义 findById 方法签名
  - [x] 定义 save 方法签名
  - [x] 定义 delete 方法签名
  - [x] 添加 JSDoc 注释

- [x] 1.7 创建领域错误 (`app/domain/shared/DomainError.ts`)
  - [x] 定义 DomainError 类
  - [x] 定义错误类型枚举
  - [x] 实现错误消息格式化

- [x] 1.8 创建领域事件 (`app/domain/cart/`)
  - [x] 定义 DomainEvent 基类 (`app/domain/shared/DomainEvent.ts`)
  - [x] 定义 `CartItemAddedEvent.ts`
  - [x] 定义 `CartItemRemovedEvent.ts`
  - [x] 定义 `CartItemQuantityChangedEvent.ts`

## 2. 应用层实现 (Application Layer)

- [x] 2.1 创建 `CartApplicationService` 应用服务 (`app/application/cart/CartApplicationService.ts`)
  - [x] 实现 getCart 用例（获取购物车）
  - [x] 实现 addToCart 用例（添加商品）
  - [x] 实现 updateQuantity 用例（更新数量）
  - [x] 实现 removeItem 用例（删除商品）
  - [x] 实现 removeSelectedItems 用例（批量删除）
  - [x] 实现 toggleItemSelection 用例（切换选中）
  - [x] 实现 toggleAllSelection 用例（全选/取消全选）
  - [x] 实现 validateCheckout 用例（结算验证）
  - [ ] 添加事务管理
  - [ ] 添加领域事件处理
  - [ ] 添加集成测试

- [x] 2.2 定义 DTO (`app/application/cart/dto/`)
  - [x] 创建 AddToCartDto
  - [x] 创建 UpdateCartDto
  - [x] 创建 RemoveCartDto
  - [x] 添加类型注释

## 3. 基础设施层实现 (Infrastructure Layer)

- [x] 3.1 实现 `CartHttpRepository` 仓储 (`app/infrastructure/repositories/CartHttpRepository.ts`)
  - [x] 实现 findById 方法（API 调用 + 缓存）
  - [x] 实现 save 方法（API 调用 + 缓存更新）
  - [x] 实现 delete 方法（API 调用 + 缓存清除）
  - [x] 实现 DTO 到领域对象转换（toDomain）
  - [x] 实现领域对象到 DTO 转换（toDTO）
  - [x] 实现本地缓存管理（loadFromCache、saveToCache）
  - [x] 添加错误处理
  - [ ] 添加集成测试

- [ ] 3.2 完善 API 调用 (`app/api/cart.ts`)
  - [x] 实现 getCartList API 调用（已完成）
  - [x] 实现 addToCart API 调用（已完成）
  - [x] 实现 updateCartItem API 调用（已完成）
  - [x] 实现 removeCartItem API 调用（已完成）
  - [x] 实现 batchRemoveCartItems API 调用（已完成）
  - [x] 集成 class-transformer 数据转换（已完成）
  - [ ] 添加请求重试机制
  - [ ] 添加请求取消机制
  - [ ] 优化错误处理

- [ ] 3.3 完善实体类 (`app/entities/Cart.ts`)
  - [x] 定义 CartEntity 类（已完成）
  - [x] 定义 CartItemEntity 类（已完成）
  - [x] 实现 fromPlain 静态方法（已完成）
  - [x] 实现 toUIModel 方法（已完成）
  - [ ] 补充业务方法（与领域层对齐）
  - [ ] 添加数据验证装饰器
  - [ ] 添加单元测试

## 4. 表现层实现 (Presentation Layer)

- [x] 4.1 购物车页面 (`app/pages/cart/index.vue`)
  - [x] 创建页面组件（已完成）
  - [x] 迁移到 useCartDomain composable（已完成）
  - [x] 实现页面加载逻辑（已完成）
  - [x] 实现事件处理方法（已完成）
  - [x] 添加 SEO 元信息（已完成）
  - [x] 集成领域层业务逻辑（已完成）
  - [x] 实现结算验证（已完成）
  - [ ] 添加页面级测试

- [ ] 4.2 购物车列表组件 (`app/components/business/CartList.vue`)
  - [x] 创建组件结构（已完成）
  - [x] 实现表头（全选框、列标题）（已完成）
  - [x] 实现商品列表渲染（已完成）
  - [x] 实现空状态（已完成）
  - [ ] 优化样式（对齐设计图）
  - [ ] 添加加载骨架屏
  - [ ] 添加组件测试

- [ ] 4.3 购物车商品项组件 (`app/components/business/CartItem.vue`)
  - [x] 创建组件结构（已完成）
  - [x] 实现勾选框（已完成）
  - [x] 实现商品信息展示（图片、名称、规格）（已完成）
  - [x] 实现单价展示（现价、原价）（已完成）
  - [x] 实现数量调整器（已完成）
  - [x] 实现小计计算（已完成）
  - [x] 实现操作按钮（删除、收藏）（已完成）
  - [ ] 实现不可购买状态展示
  - [ ] 优化样式细节
  - [ ] 添加组件测试

- [ ] 4.4 数量调整器组件 (`app/components/ui/QuantityInput.vue`)
  - [x] 创建组件（已完成）
  - [x] 实现减少按钮（已完成）
  - [x] 实现输入框（已完成）
  - [x] 实现增加按钮（已完成）
  - [x] 实现边界验证（已完成）
  - [ ] 优化输入体验（聚焦、选中）
  - [ ] 添加防抖优化
  - [ ] 添加组件测试

- [ ] 4.5 购物车底部栏组件 (`app/components/business/CartFooter.vue`)
  - [x] 创建组件结构（已完成）
  - [x] 实现全选框（已完成）
  - [x] 实现批量操作按钮（删除、收藏）（已完成）
  - [x] 实现统计信息展示（选中数量、合计金额）（已完成）
  - [x] 实现结算按钮（已完成）
  - [ ] 优化样式（固定在底部）
  - [ ] 添加按钮禁用状态处理
  - [ ] 添加组件测试

- [x] 4.6 创建 `useCart` composable (`app/composables/useCart.ts`)
  - [x] 创建 composable（已完成）
  - [x] 集成 CartStore（已完成）
  - [x] 实现 init 方法（已完成）
  - [x] 实现 updateQuantity 方法（已完成）
  - [x] 实现 toggleItemSelection 方法（已完成）
  - [x] 实现 toggleAllSelection 方法（已完成）
  - [x] 实现 removeFromCart 方法（已完成）
  - [x] 实现 removeSelectedItems 方法（已完成）
  - [x] 创建 useCartDomain composable (使用 DDD 架构)
  - [x] 迁移页面使用 useCartDomain
  - [x] 实现数据适配层（领域层→表现层）
  - [ ] 优化错误处理
  - [ ] 添加单元测试

- [x] 4.7 购物车 Store 重构
  - [x] 识别业务逻辑冗余（已完成）
  - [x] 创建简化的 UI Store (`app/stores/cartUI.ts`)（已完成）
  - [x] 更新 useCartDomain 使用 UI Store（已完成）
  - [x] 标记旧 Store 为废弃（已完成）
  - [x] 创建重构对比文档（已完成）
  - [x] 迁移 SpHeaderBar 使用新架构（已完成）
  - [x] 删除旧 Store (`app/stores/cart.ts`)（已完成）
  - [x] 删除旧 composable (`app/composables/useCart.ts`)（已完成）
  - [ ] 添加 Store 测试

## 5. 类型定义 (Type Definitions)

- [ ] 5.1 API 类型 (`app/types/api/cart.ts`)
  - [x] 定义 ICartItem 接口（已完成）
  - [x] 定义 ICartListResponse 接口（已完成）
  - [x] 定义 IAddCartRequest 接口（已完成）
  - [x] 定义 IUpdateCartRequest 接口（已完成）
  - [x] 定义 IBatchRemoveCartRequest 接口（已完成）
  - [ ] 补充类型注释
  - [ ] 添加类型验证

- [ ] 5.2 领域类型 (`app/types/domain/cart.ts`)
  - [ ] 定义领域对象接口
  - [ ] 定义值对象类型
  - [ ] 定义领域事件类型

## 6. 功能增强 (Feature Enhancements)

- [ ] 6.1 收藏功能
  - [ ] 设计收藏 API 接口
  - [ ] 实现收藏单个商品
  - [ ] 实现批量收藏
  - [ ] 添加收藏后删除确认

- [ ] 6.2 结算功能
  - [ ] 实现结算验证逻辑
  - [ ] 创建订单结算页面
  - [ ] 实现商品信息传递
  - [ ] 添加库存实时验证

- [ ] 6.3 优惠券功能
  - [ ] 设计优惠券应用逻辑
  - [ ] 实现优惠券选择器
  - [ ] 实现优惠金额计算
  - [ ] 显示优惠信息

## 7. 性能优化 (Performance Optimization)

- [ ] 7.1 数量调整防抖
  - [ ] 实现输入防抖（300ms）
  - [ ] 优先更新本地状态
  - [ ] 延迟 API 调用

- [ ] 7.2 乐观更新
  - [ ] 立即更新 UI
  - [ ] 异步调用 API
  - [ ] 失败时回滚状态

- [ ] 7.3 本地缓存
  - [ ] 实现 localStorage 持久化
  - [ ] 页面刷新恢复数据
  - [ ] 多标签页同步

- [ ] 7.4 虚拟滚动（可选）
  - [ ] 评估是否需要
  - [ ] 实现虚拟列表
  - [ ] 优化大量商品渲染

## 8. 样式优化 (Style Refinement)

- [ ] 8.1 对齐设计图
  - [ ] 对比设计图调整间距
  - [ ] 调整字体大小和颜色
  - [ ] 调整按钮样式

- [ ] 8.2 响应式适配
  - [ ] 实现移动端布局
  - [ ] 测试不同屏幕尺寸
  - [ ] 优化触摸交互

- [ ] 8.3 动画效果
  - [ ] 添加商品删除动画
  - [ ] 添加数量变化动画
  - [ ] 优化加载动画

## 进度说明

- ✅ 已完成：
  - 表现层基础实现、Store、API调用、类型定义
  - DDD 架构核心实现（领域层、应用层、基础设施层）
  - 领域对象（值对象、实体、聚合根、领域服务）
  - 应用服务和 DTO
  - 仓储实现（HTTP + 本地缓存）
  - useCartDomain composable
  - 购物车页面迁移到 DDD 架构
  - 数据适配层实现（领域层→表现层）
  - 结算验证集成
  - **Store 架构优化**：
    - 识别业务逻辑冗余
    - 创建简化的 UI Store（只管理 UI 状态）
    - 标记旧 Store 为废弃
    - 创建重构对比文档
- 🚧 进行中：无
- 📋 待开始：单元测试、集成测试、功能增强（收藏、优惠券）、性能优化
