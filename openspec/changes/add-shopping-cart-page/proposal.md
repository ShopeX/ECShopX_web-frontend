# Shopping Cart Page Proposal

## Why

用户需要一个完整的购物车功能页面来管理购买的商品、调整数量、进行结算。当前虽然已有购物车相关代码实现，但缺少完整的规范文档和验收标准。本提案旨在规范化购物车功能，确保符合产品需求和DDD架构规范。

## What Changes

- 添加购物车页面功能规范（`/cart`路由）
- 定义购物车商品列表展示规范
- 定义商品选择和数量管理规范
- 定义批量操作规范（全选、批量删除、批量收藏）
- 定义结算功能规范
- 基于 Apifox MCP API 规范实现数据交互
- 遵循 DDD 架构规范（Domain、Application、Infrastructure 分层）
- 使用 class-transformer 实现数据转换
- 支持本地存储持久化

## Impact

- **新增 Spec**: `shopping-cart` - 购物车功能规范
- **新增文件**: 
  - `app/pages/cart/index.vue` - 购物车页面 (已实现)
  - `app/components/business/CartList.vue` - 购物车列表组件 (已实现)
  - `app/components/business/CartItem.vue` - 购物车商品项组件 (已实现)
  - `app/components/business/CartFooter.vue` - 购物车底部操作栏组件 (已实现)
  - `app/stores/cart.ts` - 购物车状态管理 (已实现)
  - `app/api/cart.ts` - 购物车 API 调用 (已实现)
  - `app/composables/useCart.ts` - 购物车组合式函数 (已实现)
  - `app/types/api/cart.ts` - 购物车 API 类型定义 (已实现)
  - `app/entities/Cart.ts` - 购物车实体类 (已实现)
  - `app/domain/cart/` - 购物车领域层 (待完善)
- **依赖**: 
  - Apifox MCP API - 购物车接口
  - class-transformer - 数据转换
  - Pinia - 状态管理
  - Tailwind CSS - 样式
- **影响范围**: 购物车功能模块、商品详情页添加购物车入口

## Design Decisions

### 架构设计

采用 DDD（领域驱动设计）架构：

1. **领域层 (Domain)**
   - `Cart` - 购物车聚合根
   - `CartItemEntity` - 购物车商品项实体
   - `MoneyValueObject` - 金额值对象
   - `CartPolicyService` - 购物车领域服务

2. **应用层 (Application)**
   - `CartApplicationService` - 购物车应用服务
   - 协调领域对象完成业务用例

3. **基础设施层 (Infrastructure)**
   - `CartHttpRepository` - 购物车仓储实现
   - 数据访问、缓存、API调用

4. **表现层 (Presentation)**
   - Pages - 页面组件
   - Components - UI组件
   - Composables - 组合式函数
   - Store - 状态管理

### 数据流

```
用户操作 → Page Component → Composable → Application Service → Domain → Repository → API
         ← UI 更新     ← 状态更新 ← 业务处理    ← 验证 ← 数据转换 ← 响应
```

### 数据转换

使用 class-transformer 实现：
- API 响应 → Entity (领域实体)
- Entity → UI Model (视图模型)
- 业务逻辑在 Entity 中实现

### 本地存储

- 使用 localStorage 持久化购物车数据
- 页面刷新后恢复数据
- 与服务端数据同步策略

### UI/UX 设计参考

参考提供的设计图：
- 表头：全选框、商品信息、单价、数量、合计、操作
- 商品项：勾选框、商品图片、名称、规格、单价、数量调整器、小计、操作按钮
- 底部栏：全选、批量删除、批量收藏、已选商品数量、合计金额、结算按钮
- 空状态：提示信息和引导按钮

## Risks & Mitigation

1. **库存同步问题**
   - 风险：用户操作时商品库存变化
   - 缓解：实时验证库存，提示用户

2. **数据一致性**
   - 风险：本地数据与服务端不一致
   - 缓解：定期同步，关键操作时重新拉取

3. **并发操作**
   - 风险：多标签页同时操作购物车
   - 缓解：使用 localStorage 事件监听同步

4. **性能问题**
   - 风险：大量商品时渲染性能
   - 缓解：虚拟滚动、分页加载

## Open Questions

- [ ] 是否需要支持多规格商品？（当前已支持 spec_id）
- [ ] 收藏功能的具体实现方式？（当前标记为 TODO）
- [ ] 结算流程的详细步骤？（订单创建、支付跳转）
- [ ] 是否需要支持优惠券功能？
- [ ] 是否需要支持购物车商品推荐？

