# 购物车 Store 重构说明

## 问题分析

原有的 `cart.ts` Store 包含了大量与领域层重复的业务逻辑，违反了 DDD 架构的职责分离原则。

## 冗余对比

### 1. 业务计算逻辑冗余

#### ❌ Store 中的实现（冗余）
```typescript
// app/stores/cart.ts (Lines 52-72)
getters: {
  cartCount: (state): number => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  },

  selectedTotal: (state): number => {
    return state.items
      .filter(item => item.selected && item.available)
      .reduce((total, item) => total + item.price * item.quantity, 0)
  },
}
```

#### ✅ 领域层的实现（正确）
```typescript
// app/domain/cart/Cart.ts
export class Cart {
  get totalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity.value, 0)
  }

  calculateSelectedTotal(): MoneyValueObject {
    return this.getSelectedItems().reduce(
      (total, item) => total.add(item.calculateSubtotal()),
      MoneyValueObject.zero()
    )
  }
}
```

**问题**：同样的业务计算在两个地方实现，维护困难，容易不一致。

---

### 2. 业务规则验证冗余

#### ❌ Store 中的验证（冗余）
```typescript
// app/stores/cart.ts (Line 283)
async updateQuantity(itemId: string, quantity: number) {
  if (quantity < 1) return { success: false, error: '数量不能小于1' }
  // ...
}
```

#### ✅ 领域层的验证（正确）
```typescript
// app/domain/shared/QuantityValueObject.ts
export class QuantityValueObject {
  private constructor(value: number, min: number = 1, max: number = 9999) {
    if (value < min) {
      throw new Error(`数量不能小于${min}`)
    }
    // ...
  }
}

// app/domain/cart/CartItemEntity.ts
setQuantity(quantity: number): void {
  const newQuantity = QuantityValueObject.of(quantity, 1, this._stock)
  // 自动验证数量范围
  this._quantity = newQuantity
}
```

**问题**：业务规则分散在多处，难以统一管理和测试。

---

### 3. 状态管理逻辑冗余

#### ❌ Store 中的选择逻辑（冗余）
```typescript
// app/stores/cart.ts (Lines 325-367)
async toggleItemSelection(itemId: string) {
  const item = this.items.find(i => i.id === itemId)
  if (!item) return { success: false, error: '商品不存在' }

  const newSelected = !item.selected
  item.selected = newSelected
  // ...
}

toggleAllSelection(selected: boolean) {
  this.items.forEach(item => {
    item.selected = selected
  })
}
```

#### ✅ 领域层的实现（正确）
```typescript
// app/domain/cart/Cart.ts
export class Cart {
  toggleItemSelection(itemId: string): void {
    const item = this._items.get(itemId)
    if (!item) {
      throw DomainError.notFound('购物车商品', itemId)
    }
    item.toggleSelection()
  }

  toggleAllSelection(): void {
    const availableItems = this.getAvailableItems()
    const allSelected = availableItems.every((item) => item.selected)
    availableItems.forEach((item) => {
      item.setSelected(!allSelected)
    })
  }
}
```

**问题**：Store 实现了与领域层相同的选择逻辑，包括验证和状态变更。

---

## 架构对比

### 当前架构（存在冗余）

```
┌─────────────────────────────────────────────────┐
│           表现层 (Presentation)                   │
│  - pages/cart/index.vue                          │
│  - useCartDomain                                 │
└──────────────┬──────────────────────────────────┘
               │
               ├─────────────┐
               │             │
               ▼             ▼
┌──────────────────┐  ┌─────────────────────┐
│   应用层          │  │   Store (冗余!)     │
│  CartAppService  │  │   - 业务计算         │
└────────┬─────────┘  │   - 业务验证         │
         │            │   - 状态管理         │
         ▼            └─────────────────────┘
┌──────────────────┐        ▲
│   领域层          │        │
│  - Cart          │        │ 重复的逻辑！
│  - CartItem      │        │
│  - MoneyVO       │        │
└────────┬─────────┘        │
         │                  │
         ▼                  │
┌──────────────────┐        │
│  基础设施层       │────────┘
│  CartHttpRepo    │
└──────────────────┘
```

### 重构后的架构（职责清晰）

```
┌─────────────────────────────────────────────────┐
│           表现层 (Presentation)                   │
│  - pages/cart/index.vue                          │
│  - useCartDomain                                 │
└──────────────┬──────────────────────────────────┘
               │
               ├──────────────┐
               │              │
               ▼              ▼
┌──────────────────┐  ┌──────────────┐
│   应用层          │  │ UI Store     │
│  CartAppService  │  │ (只管理UI)    │
└────────┬─────────┘  │ - loading    │
         │            │ - actions    │
         ▼            └──────────────┘
┌──────────────────┐
│   领域层          │  所有业务逻辑
│  - Cart          │  都在这里！
│  - CartItem      │
│  - MoneyVO       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  基础设施层       │
│  CartHttpRepo    │
└──────────────────┘
```

---

## 重构方案

### 1. 创建简化的 UI Store

**新文件**: `app/stores/cartUI.ts`

```typescript
/**
 * 购物车 UI 状态管理 Store (DDD 架构版本)
 * 
 * 职责：
 * - 管理 UI 加载状态 ✅
 * - 管理操作加载状态 ✅
 * - 不包含任何业务逻辑 ✅
 */
export const useCartUIStore = defineStore('cart-ui', {
  state: () => ({
    loading: false,           // 全局加载状态
    actionLoading: {},        // 操作加载状态
    lastUpdateTime: null,     // 最后更新时间
    initialized: false,       // 是否已初始化
  }),

  getters: {
    isLoading: (state) => state.loading,
    isActionLoading: (state) => (key: string) => state.actionLoading[key] || false,
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setActionLoading(key: string, loading: boolean) {
      if (loading) {
        this.actionLoading[key] = true
      } else {
        delete this.actionLoading[key]
      }
    },
  }
})
```

### 2. 职责划分

| 层级 | 职责 | 示例 |
|------|------|------|
| **表现层** | UI 渲染、用户交互 | `pages/cart/index.vue` |
| **UI Store** | UI 状态管理 | `cartUI.ts` - loading, actionLoading |
| **Composable** | 协调 UI 和业务 | `useCartDomain.ts` |
| **应用层** | 用例协调 | `CartApplicationService.ts` |
| **领域层** | 核心业务逻辑 | `Cart.ts`, `CartItemEntity.ts` |
| **基础设施层** | 数据访问、缓存 | `CartHttpRepository.ts` |

### 3. 迁移指南

#### 步骤 1: 使用新的 UI Store
```typescript
// ❌ 旧方式：使用包含业务逻辑的 Store
import { useCartStore } from '~/stores/cart'
const cartStore = useCartStore()
await cartStore.addToCart(params)  // Store 中有业务逻辑

// ✅ 新方式：UI Store + 领域层
import { useCartUIStore } from '~/stores/cartUI'
import { useCartDomain } from '~/composables/domain/cart/useCartDomain'

const uiStore = useCartUIStore()  // 只管理 UI 状态
const { addToCart } = useCartDomain()  // 业务逻辑在领域层
await addToCart(params)
```

#### 步骤 2: 移除 Store 中的业务逻辑
```typescript
// ❌ 移除：业务计算
getters: {
  cartCount: (state) => state.items.reduce(...)  // 删除
  selectedTotal: (state) => state.items.filter(...)  // 删除
}

// ✅ 保留：UI 状态
getters: {
  isLoading: (state) => state.loading  // 保留
  isActionLoading: (state) => (key) => state.actionLoading[key]  // 保留
}
```

#### 步骤 3: 从领域层获取数据
```typescript
// ❌ 旧方式：从 Store 计算
const total = computed(() => cartStore.selectedTotal)

// ✅ 新方式：从领域层获取
const { cartUIData } = useCartDomain()
const total = computed(() => cartUIData.value.selectedTotal)
```

---

## 重构收益

### 1. 单一职责
- ✅ UI Store 只管理 UI 状态
- ✅ 领域层只包含业务逻辑
- ✅ 职责清晰，易于维护

### 2. 消除重复
- ✅ 业务逻辑只在领域层实现一次
- ✅ 计算逻辑统一管理
- ✅ 验证规则集中定义

### 3. 更好的测试
- ✅ 领域层可独立测试（不依赖 Store）
- ✅ UI Store 测试简单（只测试状态）
- ✅ 测试覆盖率更高

### 4. 更容易维护
- ✅ 修改业务规则只需改领域层
- ✅ UI 状态变化不影响业务逻辑
- ✅ 清晰的依赖关系

---

## 代码量对比

### 重构前
- `cart.ts`: **422 行**（包含大量业务逻辑）
- 业务逻辑分散在 Store 和领域层

### 重构后
- `cartUI.ts`: **~120 行**（只管理 UI 状态）
- `Cart.ts` + `CartItemEntity.ts`: **~400 行**（集中的业务逻辑）
- 总体代码量相近，但职责更清晰

---

## 迁移计划

### 阶段 1: 创建新 Store ✅
- [x] 创建 `cartUI.ts`
- [x] 定义 UI 状态接口
- [x] 实现基本的 actions

### 阶段 2: 更新 useCartDomain ✅
- [x] 引入 `useCartUIStore`
- [x] 使用 UI Store 管理加载状态
- [x] 移除重复的状态管理

### 阶段 3: 标记旧 Store 为废弃 ✅
- [x] 在 `cart.ts` 添加 `@deprecated` 注释
- [x] 创建迁移文档
- [x] 通知团队成员

### 阶段 4: 逐步迁移 ✅
- [x] 迁移购物车页面
- [x] 迁移 SpHeaderBar 组件
- [x] 验证所有引用已清除

### 阶段 5: 清理 ✅
- [x] 删除旧的 `cart.ts` (2025-11-03)
- [x] 删除旧的 `useCart.ts` (2025-11-03)
- [x] 更新相关文档
- [ ] 添加单元测试

---

## 注意事项

### 1. 向后兼容
在过渡期间，保留旧的 `cart.ts` Store，使用 `@deprecated` 标记：

```typescript
/**
 * @deprecated 请使用 useCartDomain + useCartUIStore 替代
 * 
 * 这个 Store 包含了业务逻辑，违反了 DDD 架构原则。
 * 新代码请使用：
 * - useCartUIStore: UI 状态管理
 * - useCartDomain: 业务逻辑访问
 */
export const useCartStore = defineStore('cart', {
  // ...
})
```

### 2. 渐进式迁移
不要一次性修改所有代码，建议：
1. 新功能使用新架构
2. 修改现有功能时顺便重构
3. 定期清理废弃代码

### 3. 团队沟通
- 文档化迁移指南
- 代码评审时关注架构规范
- 定期同步迁移进度

---

## 参考资料

- [DDD-DEVELOPMENT-GUIDE.md](./DDD-DEVELOPMENT-GUIDE.md) - DDD 开发指南
- [DDD-QUICK-REFERENCE.md](./DDD-QUICK-REFERENCE.md) - DDD 快速参考
- [cart-page-ddd-migration.md](./cart-page-ddd-migration.md) - 页面迁移总结

---

**创建日期**: 2025-11-03  
**作者**: AI Assistant  
**状态**: 进行中

