# 🚀 DDD 开发快速参考

> 快速查阅版本，详细规范请看 [DDD-DEVELOPMENT-GUIDE.md](./DDD-DEVELOPMENT-GUIDE.md)

---

## 📐 目录结构速查

```
app/
├── domain/              # 领域层 - 核心业务逻辑
│   ├── {domain}/
│   │   ├── {Domain}.ts                    # 聚合根
│   │   ├── {Name}Entity.ts                # 实体
│   │   ├── {Domain}PolicyService.ts       # 领域服务
│   │   ├── {Domain}{Action}Event.ts       # 领域事件
│   │   └── I{Domain}Repository.ts         # 仓储接口
│   └── shared/          # 共享内核
│       ├── {Name}ValueObject.ts           # 值对象
│       └── DomainError.ts                 # 领域错误
│
├── application/         # 应用层 - 用例协调
│   └── {domain}/
│       ├── {Domain}ApplicationService.ts
│       └── dto/
│
├── infrastructure/      # 基础设施层 - 技术实现
│   └── repositories/
│       └── {Domain}HttpRepository.ts
│
├── composables/         # Composable（自动导入）
│   ├── domain/         # 领域逻辑
│   │   └── {domain}/
│   │       └── use{Domain}Domain.ts
│   └── ui/             # UI逻辑
│
├── stores/             # Pinia Store（只管理UI状态）
├── components/         # 组件
│   ├── base/          # 基础组件
│   ├── theme/         # 主题组件
│   └── business/      # 业务容器
└── pages/             # 页面
```

---

## 🎯 分层职责速查

| 层级           | 职责               | 禁止                            |
| -------------- | ------------------ | ------------------------------- |
| **领域层**     | 业务逻辑、业务规则 | ❌ HTTP请求、UI逻辑、数据库操作 |
| **应用层**     | 用例协调、事务管理 | ❌ 业务规则、UI逻辑             |
| **基础设施层** | 数据访问、技术实现 | ❌ 业务逻辑                     |
| **表现层**     | UI渲染、用户交互   | ❌ 业务规则、直接调用仓储       |

---

## 📝 命名速查表

| 类型           | 命名规范                     | 示例                        |
| -------------- | ---------------------------- | --------------------------- |
| **聚合根**     | `{Domain}.ts`                | `Cart.ts`, `Order.ts`       |
| **实体**       | `{Name}Entity.ts`            | `CartItemEntity.ts`         |
| **值对象**     | `{Name}ValueObject.ts`       | `MoneyValueObject.ts`       |
| **领域服务**   | `{Domain}PolicyService.ts`   | `CartPolicyService.ts`      |
| **领域事件**   | `{Domain}{Action}Event.ts`   | `CartItemAddedEvent.ts`     |
| **仓储接口**   | `I{Domain}Repository.ts`     | `ICartRepository.ts`        |
| **仓储实现**   | `{Domain}HttpRepository.ts`  | `CartHttpRepository.ts`     |
| **应用服务**   | `{Domain}ApplicationService` | `CartApplicationService.ts` |
| **Composable** | `use{Name}.ts`               | `useCartDomain.ts`          |
| **Store**      | `{domain}.ts`                | `cart.ts`                   |
| **主题组件**   | `Theme{Name}.vue`            | `ThemeCartItem.vue`         |

---

## 🔧 常用代码模板

### 1. 聚合根模板

```typescript
// app/domain/cart/Cart.ts
export class Cart {
  private _id: string
  private _items: Map<string, CartItem>
  private _events: DomainEvent[] = []

  constructor(id: string, items: CartItem[] = []) {
    this._id = id
    this._items = new Map(items.map((item) => [item.id, item]))
  }

  get id(): string {
    return this._id
  }
  get items(): CartItem[] {
    return Array.from(this._items.values())
  }
  get events(): DomainEvent[] {
    return this._events
  }

  // 业务方法
  addItem(item: CartItem): void {
    if (this._items.has(item.id)) {
      throw new DomainError('商品已存在')
    }
    this._items.set(item.id, item)
    this._events.push(new CartItemAddedEvent(this._id, item.id))
  }

  // 查询方法
  calculateTotal(): Money {
    return this.items.reduce((total, item) => total.add(item.calculateSubtotal()), Money.zero())
  }

  clearEvents(): void {
    this._events = []
  }
}
```

### 2. 实体模板

```typescript
// app/domain/cart/CartItemEntity.ts
export class CartItemEntity {
  private _id: string
  private _quantity: number
  private _price: Money

  constructor(params: { id: string; quantity: number; price: number }) {
    this._id = params.id
    this._quantity = params.quantity
    this._price = Money.of(params.price)
    this.validate()
  }

  private validate(): void {
    if (this._quantity < 1) {
      throw new DomainError('数量不能小于1')
    }
  }

  get id(): string {
    return this._id
  }
  get quantity(): number {
    return this._quantity
  }
  get price(): Money {
    return this._price
  }

  setQuantity(quantity: number): void {
    if (quantity < 1) throw new DomainError('数量不能小于1')
    this._quantity = quantity
  }

  calculateSubtotal(): Money {
    return this._price.multiply(this._quantity)
  }
}
```

### 3. 值对象模板

```typescript
// app/domain/shared/MoneyValueObject.ts
export class MoneyValueObject {
  private readonly _amount: number

  private constructor(amount: number) {
    if (amount < 0) throw new Error('金额不能为负数')
    this._amount = Math.round(amount * 100) / 100
  }

  static of(amount: number): MoneyValueObject {
    return new MoneyValueObject(amount)
  }

  static zero(): MoneyValueObject {
    return new MoneyValueObject(0)
  }

  get amount(): number {
    return this._amount
  }
  get display(): string {
    return `¥${this._amount.toFixed(2)}`
  }

  add(other: MoneyValueObject): MoneyValueObject {
    return new MoneyValueObject(this._amount + other._amount)
  }

  multiply(factor: number): MoneyValueObject {
    return new MoneyValueObject(this._amount * factor)
  }
}
```

### 4. 仓储接口模板

```typescript
// app/domain/cart/ICartRepository.ts
import type { Cart } from './Cart'

export interface ICartRepository {
  findById(cartId: string): Promise<Cart | null>
  save(cart: Cart): Promise<void>
  delete(cartId: string): Promise<void>
}
```

### 5. 仓储实现模板

```typescript
// app/infrastructure/repositories/CartHttpRepository.ts
export class CartHttpRepository implements ICartRepository {
  async findById(cartId: string): Promise<Cart | null> {
    const cached = this.loadFromCache(cartId)
    if (cached) return cached

    const response = await $fetch('/api/cart')
    const cart = this.toDomain(cartId, response.data)
    this.saveToCache(cartId, cart)
    return cart
  }

  async save(cart: Cart): Promise<void> {
    const dto = this.toDTO(cart)
    await $fetch('/api/cart', { method: 'PUT', body: dto })
    this.saveToCache(cart.id, cart)
  }

  private toDomain(cartId: string, dto: any): Cart {
    const items = dto.items.map(
      (item: any) => new CartItemEntity({ id: item.id, quantity: item.quantity, price: item.price })
    )
    return new Cart(cartId, items)
  }

  private toDTO(cart: Cart): any {
    return {
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    }
  }
}
```

### 6. 应用服务模板

```typescript
// app/application/cart/CartApplicationService.ts
export class CartApplicationService {
  constructor(
    private cartRepository: ICartRepository,
    private cartPolicyService: CartPolicyService
  ) {}

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<void> {
    // 1. 获取聚合根
    const cart = await this.cartRepository.findById(userId)
    if (!cart) throw new Error('购物车不存在')

    // 2. 调用业务方法（业务规则在这里验证）
    cart.updateItemQuantity(itemId, quantity)

    // 3. 保存
    await this.cartRepository.save(cart)

    // 4. 发布事件
    await this.eventBus.publish(cart.events)
    cart.clearEvents()
  }
}
```

### 7. Composable 模板

```typescript
// app/composables/domain/cart/useCartDomain.ts
export function useCartDomain() {
  const cartStore = useCartStore()

  const appService = useState('cartAppService', () => {
    const repository = new CartHttpRepository()
    const policyService = new CartPolicyService()
    return new CartApplicationService(repository, policyService)
  })

  const cart = computed(() => cartStore.cart)
  const loading = computed(() => cartStore.loading)

  const loadCart = async () => {
    cartStore.setLoading(true)
    try {
      const cartData = await appService.value.getCart('current-user')
      cartStore.setCart(cartData)
    } catch (err: any) {
      cartStore.setError(err.message)
    } finally {
      cartStore.setLoading(false)
    }
  }

  const cartUIData = computed(() => {
    if (!cart.value) return { items: [], total: '¥0.00' }

    return {
      items: cart.value.items.map((item) => ({
        id: item.id,
        name: item.productName,
        priceDisplay: item.price.display,
        quantity: item.quantity,
      })),
      total: cart.value.calculateTotal().display,
    }
  })

  return {
    cart,
    loading,
    cartUIData,
    loadCart,
  }
}
```

### 8. Store 模板（简化版）

```typescript
// app/stores/cart.ts
export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null as Cart | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // 简单的状态转换，委托给聚合根
    total: (state) => state.cart?.calculateTotal().display ?? '¥0.00',
  },

  actions: {
    setCart(cart: Cart) {
      this.cart = cart
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
  },
})
```

### 9. 页面模板

```vue
<!-- app/pages/cart/index.vue -->
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <component
      v-else
      :is="ThemeCartList"
      :items="cartUIData.items"
      @update-quantity="handleUpdateQuantity"
    />
  </div>
</template>

<script setup lang="ts">
const { loading, cartUIData, loadCart, updateQuantity } = useCartDomain()
const { currentTheme } = useTheme()

const ThemeCartList = resolveComponent(`Theme${currentTheme.value}CartList`)

onMounted(() => loadCart())

const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  try {
    await updateQuantity(itemId, quantity)
  } catch (error: any) {
    useMessage().error(error.message)
  }
}
</script>
```

### 10. 主题组件模板

```vue
<!-- app/components/theme/default/cart/ThemeCartItem.vue -->
<template>
  <div class="flex items-center gap-4 p-4 border-b">
    <img :src="item.image" class="w-20 h-20 rounded" />
    <div class="flex-1">
      <h4 class="font-semibold">{{ item.name }}</h4>
      <p class="text-gray-600">{{ item.priceDisplay }}</p>
    </div>
    <button @click="$emit('update-quantity', item.id, item.quantity + 1)">+</button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: {
    id: string
    name: string
    image: string
    priceDisplay: string
    quantity: number
  }
}

defineProps<Props>()

defineEmits<{
  'update-quantity': [id: string, quantity: number]
}>()
</script>
```

---

## ✅ 开发流程速查

### 新增功能流程

1. **领域层** → 定义聚合根 (`{Domain}.ts`)、实体 (`{Name}Entity.ts`)、值对象 (`{Name}ValueObject.ts`)
2. **领域层** → 实现业务方法和规则
3. **领域层** → 定义仓储接口 (`I{Domain}Repository.ts`)
4. **领域层** → 创建领域服务 (`{Domain}PolicyService.ts`) 和领域事件 (`{Domain}{Action}Event.ts`)
5. **基础设施层** → 实现仓储 (`{Domain}HttpRepository.ts`)
6. **应用层** → 创建应用服务 (`{Domain}ApplicationService.ts`)
7. **Composable** → 创建 domain composable (`use{Name}Domain.ts`)
8. **Store** → 添加状态管理（如需要，只管理 UI 状态）
9. **主题组件** → 创建主题组件 (`Theme{Name}.vue`)
10. **页面** → 使用 composable 和主题组件
11. **测试** → 编写单元测试

### 修改功能流程

1. **确定位置** → 找到对应的领域对象
2. **修改业务逻辑** → 在领域层修改
3. **更新应用服务** → 如需要
4. **更新 Composable** → 如需要
5. **更新 UI** → 修改主题组件或页面
6. **测试** → 更新测试用例

---

## 🚫 常见错误速查

| 错误                        | 说明                           | 正确做法                                |
| --------------------------- | ------------------------------ | --------------------------------------- |
| ❌ 在领域层调用 API         | `await $fetch()`               | 通过仓储接口 (`ICartRepository`)        |
| ❌ 在组件中直接调用应用服务 | `new CartApplicationService()` | 使用 Composable (`useCartDomain`)       |
| ❌ Store 包含业务逻辑       | `if (quantity > stock)`        | 领域层验证 (实体或聚合根)               |
| ❌ 直接修改实体字段         | `item.quantity = 10`           | `item.setQuantity(10)`                  |
| ❌ 主题组件包含业务逻辑     | 验证、计算等                   | 只负责渲染                              |
| ❌ 使用 `any`               | `data: any`                    | 定义类型                                |
| ❌ 使用 `<style>`           | 自定义CSS                      | Tailwind CSS                            |
| ❌ 错误的文件命名           | `CartAggregate.ts`             | `Cart.ts` (聚合根)                      |
| ❌ 错误的服务命名           | `CartDomainService.ts`         | `CartPolicyService.ts` (领域服务)       |
| ❌ 错误的仓储命名           | `CartRepository.ts`            | `CartHttpRepository.ts` (HTTP 仓储实现) |

---

## 📋 每日开发清单

### 编码前

- [ ] 确认功能属于哪个领域
- [ ] 确认是新增还是修改
- [ ] 查看相关的领域对象

### 编码中

- [ ] 业务逻辑在领域层
- [ ] 使用值对象（如 Money）
- [ ] 通过聚合根修改实体
- [ ] 完整的类型定义
- [ ] 完整的 JSDoc 注释

### 编码后

- [ ] 运行 `pnpm lint:fix`
- [ ] 运行类型检查
- [ ] 编写/更新测试
- [ ] 检查是否有架构违反

---

## 🔍 问题排查速查

### 问题：业务逻辑应该放在哪里？

```
1. 单个实体的规则 → 实体方法
2. 聚合内的规则 → 聚合根方法
3. 跨聚合的规则 → 领域服务
4. 用例协调 → 应用服务
5. UI 逻辑 → Composable/页面
```

### 问题：数据流转路径是什么？

```
读取：
页面 → Composable → 应用服务 → 仓储 → API

写入：
页面 → Composable → 应用服务 → 聚合根(验证) → 仓储 → API
```

### 问题：如何切换主题？

```
1. 主题组件以 Theme 开头
2. 页面动态加载：resolveComponent(`Theme${currentTheme}CartList`)
3. 主题配置在 config/themes/
4. 使用 useTheme() 切换
```

---

## 📞 获取帮助

- **详细规范**: [DDD-DEVELOPMENT-GUIDE.md](./DDD-DEVELOPMENT-GUIDE.md)
- **架构设计**: [architecture/ddd-architecture-proposal.md](./architecture/ddd-architecture-proposal.md)
- **示例代码**: `app/domain/cart/`, `app/pages/cart/`

---

**提示**: 将此文档保存为书签，随时查阅！
