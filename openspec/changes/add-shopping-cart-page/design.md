# Shopping Cart Design Document

购物车功能设计文档

## Context

购物车是电商系统的核心功能之一，涉及复杂的业务逻辑、状态管理和用户交互。当前项目已有部分实现，但缺少完整的DDD架构和规范文档。本设计文档旨在：

1. 规范化购物车功能的架构设计
2. 明确各层职责和交互方式
3. 定义数据转换和状态管理策略
4. 提供技术决策的理由和权衡

**背景信息**：

- 项目采用 Nuxt 4 + Vue 3 + TypeScript
- 遵循 DDD（领域驱动设计）架构
- 使用 class-transformer 进行数据转换
- API 通过 Apifox MCP 获取
- 已有基础实现，需要架构优化

**约束条件**：

- 必须符合项目的 DDD 开发规范
- 必须使用 Tailwind CSS，禁止自定义 CSS
- 必须支持本地存储持久化
- 必须支持 SSR 和 CSR 双模式

## Goals / Non-Goals

### Goals（目标）

1. **完整的购物车功能**
   - 商品增删改查
   - 选择状态管理
   - 数量调整和验证
   - 批量操作
   - 结算功能

2. **DDD 架构实现**
   - 清晰的分层架构
   - 业务逻辑在领域层
   - 依赖倒置原则
   - 单一职责原则

3. **良好的用户体验**
   - 快速响应（乐观更新）
   - 实时统计信息
   - 友好的错误提示
   - 流畅的交互动画

4. **高可维护性**
   - 清晰的代码结构
   - 完整的类型定义
   - 充分的单元测试
   - 详细的文档注释

### Non-Goals（非目标）

1. **不包含订单功能** - 订单创建在独立模块
2. **不包含支付功能** - 支付流程在支付模块
3. **不包含物流计算** - 运费计算在订单模块
4. **不包含商品推荐** - 推荐功能是独立的营销模块

## Decisions

### Decision 1: 采用 DDD 四层架构

**决策**：使用领域层、应用层、基础设施层、表现层的分层架构。

**理由**：

- ✅ 业务逻辑与技术实现解耦
- ✅ 易于测试和维护
- ✅ 符合项目开发规范
- ✅ 支持业务需求的快速迭代

**实现方式**：

```
app/
├── domain/                  # 领域层（核心业务逻辑）
│   ├── cart/
│   │   ├── Cart.ts                      # 聚合根
│   │   ├── CartItemEntity.ts            # 实体
│   │   ├── CartPolicyService.ts         # 领域服务
│   │   ├── CartItemAddedEvent.ts        # 领域事件
│   │   └── ICartRepository.ts           # 仓储接口
│   └── shared/
│       ├── MoneyValueObject.ts          # 值对象
│       ├── QuantityValueObject.ts       # 值对象
│       └── DomainError.ts               # 领域错误
├── application/             # 应用层（用例协调）
│   └── cart/
│       ├── CartApplicationService.ts
│       └── dto/
├── infrastructure/          # 基础设施层（技术实现）
│   └── repositories/
│       └── CartHttpRepository.ts        # 仓储实现
└── [pages/components/...]   # 表现层（UI）
```

**替代方案**：

- 传统 MVC 架构 - 不适合复杂业务逻辑
- 简单的 Service + Store - 业务逻辑分散，难以维护

### Decision 2: 使用 class-transformer 进行数据转换

**决策**：使用 class-transformer 库实现 API 响应到领域对象的自动转换。

**理由**：

- ✅ 类型安全的数据转换
- ✅ 支持嵌套对象转换
- ✅ 支持数据验证装饰器
- ✅ 减少手动转换代码

**实现方式**：

```typescript
// 定义实体类
export class Cart {
  @Type(() => CartItemEntity)
  items: CartItemEntity[] = []

  @Expose({ name: 'total_count' })
  totalCount: number = 0

  // 业务方法
  calculateTotal(): MoneyValueObject {
    // ...
  }

  // 转换方法
  static fromPlain(plain: any): Cart {
    return plainToInstance(Cart, plain)
  }

  toUIModel(): ICartUI {
    // ...
  }
}
```

**替代方案**：

- 手动转换函数 - 代码冗余，容易出错
- 简单的接口映射 - 无法实现业务方法

### Decision 3: 乐观更新 + 本地缓存策略

**决策**：用户操作立即更新 UI，异步调用 API，使用 localStorage 持久化。

**理由**：

- ✅ 提升用户体验（即时反馈）
- ✅ 减少加载等待时间
- ✅ 支持离线浏览
- ✅ 多标签页数据同步

**实现方式**：

```typescript
// 1. 立即更新本地状态
cartStore.updateItemQuantity(itemId, newQuantity)

// 2. 异步调用 API
try {
  await api.updateCartItem(itemId, { quantity: newQuantity })
  // 3. 保存到 localStorage
  saveToLocalStorage(cartStore.items)
} catch (error) {
  // 4. 失败时回滚
  cartStore.rollback()
  showError('更新失败，请重试')
}
```

**数据同步策略**：

- 页面加载：localStorage → 显示 → API → 更新
- 用户操作：立即更新 → API → localStorage
- 多标签页：监听 storage 事件同步

**替代方案**：

- 同步更新 - 响应慢，体验差
- 只用服务端数据 - 无法离线浏览

### Decision 4: Store 只管理 UI 状态，业务逻辑在领域层

**决策**：Pinia Store 只负责 UI 状态管理（loading、error），业务逻辑在领域层实现。

**理由**：

- ✅ 符合 DDD 单一职责原则
- ✅ 业务逻辑易于测试
- ✅ Store 变得简洁
- ✅ 避免业务逻辑分散

**职责划分**：

| 层级           | 职责           | 示例                         |
| -------------- | -------------- | ---------------------------- |
| **领域层**     | 业务规则、计算 | 总价计算、库存验证           |
| **应用层**     | 用例协调、事务 | 更新数量流程                 |
| **Store**      | UI 状态管理    | loading、error、initialized  |
| **Composable** | 组件逻辑封装   | 调用应用服务，返回响应式状态 |
| **Component**  | UI 渲染、交互  | 显示数据，触发事件           |

**Store 结构**：

```typescript
export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null as Cart | null, // 缓存聚合根
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    // 简单的状态派生,委托给聚合根
    itemCount: (state) => state.cart?.items.length ?? 0,
    selectedTotal: (state) => state.cart?.calculateSelectedTotal().display ?? '¥0.00',
  },

  actions: {
    // 只有 setter，不包含业务逻辑
    setCart(cart: Cart) {
      this.cart = cart
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
  },
})
```

### Decision 5: 组件通过 Composable 访问业务逻辑

**决策**：页面组件通过 `useCart` composable 访问业务功能，不直接调用 API 或 Store。

**理由**：

- ✅ 统一的业务逻辑入口
- ✅ 便于复用和测试
- ✅ 隐藏实现细节
- ✅ 支持组合式 API 自动导入

**数据流**：

```
Component → useCart → ApplicationService → Domain → Repository → API
          ← 响应式状态 ← 协调        ← 业务逻辑 ← 数据转换 ← 响应
```

**Composable 实现**：

```typescript
export function useCart() {
  const cartStore = useCartStore()

  // 初始化应用服务（单例）
  const appService = useState('cartAppService', () => {
    const repository = new CartHttpRepository()
    const policyService = new CartPolicyService()
    return new CartApplicationService(repository, policyService)
  })

  // 响应式状态
  const loading = computed(() => cartStore.loading)
  const cartUIData = computed(() => {
    // 将聚合根转换为 UI 数据
    return cartStore.cart?.toUIModel() ?? defaultUIData
  })

  // 业务方法
  const updateQuantity = async (itemId: string, quantity: number) => {
    cartStore.setLoading(true)
    try {
      await appService.value.updateQuantity('user-id', itemId, quantity)
      // 重新加载购物车
      const cart = await appService.value.getCart('user-id')
      cartStore.setCart(cart)
    } finally {
      cartStore.setLoading(false)
    }
  }

  return {
    loading,
    cartUIData,
    updateQuantity,
    // ...
  }
}
```

### Decision 6: 数量调整使用防抖优化

**决策**：数量输入框使用 300ms 防抖，减少 API 调用频率。

**理由**：

- ✅ 避免频繁请求
- ✅ 减轻服务器压力
- ✅ 提升用户体验

**实现方式**：

```typescript
// 使用 VueUse 的 useDebounceFn
const debouncedUpdate = useDebounceFn(async (itemId: string, quantity: number) => {
  await updateQuantity(itemId, quantity)
}, 300)

// 立即更新本地状态
function handleQuantityChange(itemId: string, quantity: number) {
  // 1. 立即更新 UI
  cartStore.updateLocalQuantity(itemId, quantity)
  // 2. 防抖调用 API
  debouncedUpdate(itemId, quantity)
}
```

### Decision 7: API 错误处理策略

**决策**：统一的错误处理和重试机制。

**错误处理原则**：

1. 网络错误：自动重试 3 次
2. 业务错误：显示具体错误信息
3. 系统错误：显示通用错误信息
4. 超时错误：提示用户重试

**实现方式**：

```typescript
// 在 useHttp composable 中统一处理
export function useHttpMethods() {
  return {
    async get<T>(url: string, options?: RequestOptions) {
      try {
        const response = await $fetch(url, {
          ...options,
          retry: 3, // 自动重试
          retryDelay: 500,
          timeout: 10000,
          onRequestError({ error }) {
            console.error('Request error:', error)
          },
          onResponseError({ response }) {
            // 根据错误码处理
            if (response.status === 401) {
              // 未登录，跳转登录页
              navigateTo('/login')
            } else if (response.status === 404) {
              // 资源不存在
              throw new Error('资源不存在')
            }
          },
        })
        return response
      } catch (error) {
        // 转换为友好的错误消息
        throw transformError(error)
      }
    },
  }
}
```

## Architecture Diagram

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        表现层 (Presentation)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pages      │  │  Components  │  │ Composables  │       │
│  │ cart/index   │→ │  CartList    │→ │   useCart    │       │
│  └──────────────┘  └──────────────┘  └──────┬───────┘       │
│                                               │               │
│                                               ↓               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Pinia Store (UI State)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│                        应用层 (Application)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         CartApplicationService (用例协调)             │   │
│  │  - getCart()                                          │   │
│  │  - addToCart()                                        │   │
│  │  - updateQuantity()                                   │   │
│  │  - removeItem()                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│                         领域层 (Domain)                       │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │ Cart (聚合根)  │    │CartPolicySvc   │                   │
│  │ - addItem()    │    │ - mergeItem()  │                   │
│  │ - removeItem() │    │ - validate()   │                   │
│  │ - calculate()  │    └────────────────┘                   │
│  └────────────────┘                                          │
│         │                                                    │
│         ↓                                                    │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │CartItemEntity  │    │MoneyValueObject│                   │
│  │ - setQuantity()│    │ - add()        │                   │
│  │ - calculate()  │    │ - multiply()   │                   │
│  └────────────────┘    └────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           ICartRepository (仓储接口)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                 ↑
                                 │ 实现
                                 │
┌─────────────────────────────────────────────────────────────┐
│                      基础设施层 (Infrastructure)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      CartHttpRepository (仓储实现)                    │   │
│  │  - findById() → API + Cache                          │   │
│  │  - save() → API + Cache                              │   │
│  │  - toDomain() / toDTO() (数据转换)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ↓                                  │
│  ┌─────────────┐    ┌──────────────┐   ┌──────────────┐    │
│  │  API Client │    │ localStorage │   │ class-trans  │    │
│  │  (Apifox)   │    │    Cache     │   │   former     │    │
│  └─────────────┘    └──────────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 数据转换流程

```
API Response (Plain Object)
        │
        │ plainToInstance()
        ↓
CartItemEntity (Domain Entity)
        │
        │ 业务方法调用
        ↓
Cart (Aggregate Root)
        │
        │ toUIModel()
        ↓
ICartUI (UI Data)
        │
        │ 模板渲染
        ↓
Component (UI)
```

## Risks / Trade-offs

### Risk 1: 本地缓存与服务端数据不一致

**风险描述**：

- 用户在多个设备上操作购物车
- 本地缓存数据过期
- 服务端数据被其他客户端修改

**缓解措施**：

1. 关键操作前重新拉取服务端数据
2. 使用版本号或时间戳检测冲突
3. 定期后台同步（如每 5 分钟）
4. 提供手动刷新按钮

**权衡**：

- ✅ 提升用户体验（快速响应）
- ⚠️ 可能出现数据不一致
- 🛡️ 通过同步策略降低风险

### Risk 2: DDD 架构增加了代码复杂度

**风险描述**：

- 新增了领域层、应用层等多个层级
- 代码量增加
- 学习成本提高

**缓解措施**：

1. 提供完整的开发文档和示例
2. 统一的代码模板和脚手架
3. Code Review 确保架构一致性
4. 定期技术分享和培训

**权衡**：

- ✅ 业务逻辑清晰，易于维护
- ✅ 支持复杂业务需求
- ⚠️ 初期开发成本较高
- 🎯 长期收益大于短期成本

### Risk 3: class-transformer 性能开销

**风险描述**：

- 大量数据转换可能影响性能
- 嵌套对象转换开销大

**缓解措施**：

1. 只在必要时转换（如 API 响应）
2. 缓存转换结果
3. 使用浅拷贝优化
4. 性能监控和优化

**权衡**：

- ✅ 类型安全，减少错误
- ✅ 代码简洁，易于维护
- ⚠️ 轻微的性能开销
- 🎯 开销可接受（<10ms）

## Migration Plan

### 阶段 1: 领域层实现（第 1-2 周）

**目标**：建立核心领域模型

**步骤**：

1. 创建 `MoneyValueObject` 值对象
2. 创建 `QuantityValueObject` 值对象
3. 创建 `CartItemEntity` 实体
4. 创建 `Cart` 聚合根
5. 创建 `CartPolicyService` 领域服务
6. 定义 `ICartRepository` 仓储接口
7. 定义 `CartItemAddedEvent` 领域事件
8. 编写单元测试

**验证标准**：

- 所有领域对象有完整的业务方法
- 单元测试覆盖率 >80%
- 业务规则在领域层实现

### 阶段 2: 应用层和仓储实现（第 3 周）

**目标**：实现用例协调和数据访问

**步骤**：

1. 创建 `CartApplicationService` 应用服务
2. 实现 `CartHttpRepository` 仓储
3. 集成 class-transformer 数据转换
4. 实现本地缓存逻辑
5. 编写集成测试

**验证标准**：

- 所有用例都有对应的应用服务方法
- 仓储正确实现接口契约
- 数据转换正确无误

### 阶段 3: 表现层重构（第 4 周）

**目标**：重构现有组件使用新架构

**步骤**：

1. 重构 `useCart` composable
2. 简化 Pinia Store
3. 更新页面组件
4. 优化样式和交互
5. 编写组件测试

**验证标准**：

- 组件通过 composable 访问业务逻辑
- Store 只管理 UI 状态
- 所有功能正常工作

### 阶段 4: 功能完善（第 5 周）

**目标**：补充缺失功能和优化

**步骤**：

1. 实现收藏功能
2. 实现结算验证
3. 性能优化（防抖、乐观更新）
4. 错误处理优化
5. E2E 测试

**验证标准**：

- 所有功能完整实现
- 性能指标达标
- 用户体验良好

### 回滚方案

如果新架构出现严重问题：

1. **立即回滚**：
   - 切换回旧版本代码
   - 使用 Git revert
   - 通知相关人员

2. **问题分析**：
   - 收集错误日志
   - 分析失败原因
   - 制定修复方案

3. **重新部署**：
   - 修复问题后重新测试
   - 灰度发布验证
   - 全量上线

## Open Questions

### Q1: 是否需要支持离线购物车？

**背景**：用户在无网络时也能浏览和修改购物车

**考虑因素**：

- PWA 支持需求
- 离线数据同步复杂度
- 用户场景频率

**待决定**：

- [ ] 评估用户需求
- [ ] 评估技术成本
- [ ] 制定实现方案

### Q2: 购物车数据的过期策略？

**背景**：本地缓存的购物车数据应该保留多久

**选项**：

- A. 永久保留（直到用户清除）
- B. 7 天后过期
- C. 根据商品状态动态判断

**待决定**：

- [ ] 评估业务需求
- [ ] 评估存储成本
- [ ] 确定过期策略

### Q3: 是否需要购物车分享功能？

**背景**：用户可能希望分享购物车给他人

**考虑因素**：

- 社交电商需求
- 实现复杂度
- 安全和隐私

**待决定**：

- [ ] 产品需求确认
- [ ] 技术方案设计
- [ ] 安全评审

## References

- [DDD Development Guide](../../docs/DDD-DEVELOPMENT-GUIDE.md)
- [Project Structure](../../docs/project-structure.md)
- [Apifox MCP API Guide](../../docs/api/使用指南.md)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [Nuxt 4 Documentation](https://nuxt.com)
- [Pinia Documentation](https://pinia.vuejs.org)
