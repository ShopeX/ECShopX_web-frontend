# 📋 ECSHOPX Web 开发规范（DDD + 多主题架构）

> **版本**: v2.0  
> **更新日期**: 2025-01-09  
> **适用项目**: ECSHOPX Web (Nuxt 4 + DDD)  
> **技术栈**: Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS

---

## 📑 目录

1. [架构原则](#1-架构原则)
2. [目录结构规范](#2-目录结构规范)
3. [领域层开发规范](#3-领域层开发规范)
4. [应用层开发规范](#4-应用层开发规范)
5. [基础设施层开发规范](#5-基础设施层开发规范)
6. [表现层开发规范](#6-表现层开发规范)
7. [主题系统开发规范](#7-主题系统开发规范)
8. [Composable 开发规范](#8-composable-开发规范)
9. [Store 开发规范](#9-store-开发规范)
10. [命名规范](#10-命名规范)
11. [代码风格规范](#11-代码风格规范)
12. [测试规范](#12-测试规范)
13. [最佳实践](#13-最佳实践)
14. [禁止事项](#14-禁止事项)

---

## 1. 架构原则

### 1.1 核心原则

#### ✅ **依赖倒置原则 (DIP)**

```
表现层 → 应用层 → 领域层 ← 基础设施层
       ↓                    ↑
       └──── 仓储接口 ────┘
```

- 领域层不依赖任何外层
- 应用层依赖领域层
- 基础设施层实现领域层定义的接口
- 表现层依赖应用层

#### ✅ **关注点分离 (SoC)**

| 层级           | 职责                        | 禁止                                |
| -------------- | --------------------------- | ----------------------------------- |
| **领域层**     | 核心业务逻辑、业务规则验证  | ❌ HTTP请求、UI逻辑、直接访问数据库 |
| **应用层**     | 用例协调、事务管理、DTO转换 | ❌ 业务规则定义、UI逻辑             |
| **基础设施层** | 技术实现、数据访问、缓存    | ❌ 业务逻辑                         |
| **表现层**     | UI渲染、用户交互、主题切换  | ❌ 业务规则、直接调用仓储           |

#### ✅ **单一职责原则 (SRP)**

- 每个类/函数只负责一件事
- 业务逻辑在领域层，UI逻辑在表现层
- Store 只管理状态，不包含业务逻辑
- 一个聚合根管理一个业务边界

### 1.2 DDD 核心概念

- **聚合根 (Aggregate Root)**: 聚合的入口点，维护一致性边界
- **实体 (Entity)**: 有唯一标识（ID）的领域对象
- **值对象 (Value Object)**: 不可变的、通过值比较的对象（如 Money）
- **领域服务 (Domain Service)**: 跨实体的业务逻辑
- **仓储接口 (Repository Interface)**: 定义数据访问契约
- **应用服务 (Application Service)**: 协调领域对象完成用例
- **领域事件 (Domain Event)**: 领域内发生的重要事情

---

## 2. 目录结构规范

### 2.1 标准目录结构

```
app/
├── domain/                          # 🎯 领域层（核心业务逻辑）
│   ├── cart/                        # 购物车领域
│   │   ├── Cart.ts                  # 聚合根
│   │   ├── CartItemEntity.ts        # 实体
│   │   ├── CartPolicyService.ts     # 领域服务
│   │   ├── CartItemAddedEvent.ts    # 领域事件
│   │   └── ICartRepository.ts       # 仓储接口
│   ├── product/                     # 商品领域
│   ├── order/                       # 订单领域
│   └── shared/                      # 共享内核
│       ├── MoneyValueObject.ts      # Money值对象
│       ├── QuantityValueObject.ts   # Quantity值对象
│       ├── DomainError.ts           # 领域错误
│       └── DomainEvent.ts           # 领域事件基类
│
├── application/                     # 🎯 应用层（用例协调）
│   ├── cart/
│   │   ├── CartApplicationService.ts
│   │   └── dto/
│   │       ├── AddToCartDto.ts
│   │       └── UpdateCartDto.ts
│   ├── product/
│   └── order/
│
├── infrastructure/                  # 🎯 基础设施层（技术实现）
│   ├── repositories/
│   │   ├── CartHttpRepository.ts
│   │   ├── ProductHttpRepository.ts
│   │   └── OrderHttpRepository.ts
│   └── cache/
│       └── LocalStorageCache.ts
│
├── pages/                           # ✅ Nuxt约定：页面
│   ├── index.vue
│   ├── cart/
│   │   └── index.vue
│   ├── products/
│   │   ├── index.vue
│   │   └── [id].vue
│   └── orders/
│
├── components/                      # ✅ Nuxt约定：组件
│   ├── base/                        # 基础组件（跨主题）
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   └── Modal.vue
│   ├── theme/                       # 主题组件
│   │   ├── default/
│   │   │   ├── cart/
│   │   │   │   ├── ThemeCartItem.vue
│   │   │   │   └── ThemeCartList.vue
│   │   │   ├── product/
│   │   │   └── layout/
│   │   └── minimalist/
│   └── business/                    # 业务容器组件
│
├── composables/                     # ✅ Nuxt约定：组合式函数（自动导入）
│   ├── domain/                      # 领域逻辑
│   │   ├── cart/
│   │   │   └── useCartDomain.ts
│   │   ├── product/
│   │   └── order/
│   └── ui/                          # UI逻辑
│       ├── useTheme.ts
│       └── useMessage.ts
│
├── stores/                          # ✅ Nuxt约定：Pinia Store
│   ├── cart.ts
│   ├── product.ts
│   ├── theme.ts
│   └── user.ts
│
├── utils/                           # ✅ Nuxt约定：工具函数（自动导入）
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── api/                             # API调用
│   ├── cart.ts
│   ├── product.ts
│   └── http.ts
│
├── types/                           # ✅ Nuxt约定：类型定义
│   ├── domain/
│   │   ├── cart.ts
│   │   └── product.ts
│   ├── api/
│   └── theme.ts
│
├── config/                          # 配置文件
│   ├── themes/
│   │   ├── default.ts
│   │   └── minimalist.ts
│   └── domain.ts
│
├── layouts/                         # ✅ Nuxt约定：布局
├── middleware/                      # ✅ Nuxt约定：中间件
├── plugins/                         # ✅ Nuxt约定：插件
└── assets/                          # ✅ Nuxt约定：资源文件
```

### 2.2 文件命名规范

| 类型           | 命名规范                        | 示例                                                |
| -------------- | ------------------------------- | --------------------------------------------------- |
| **聚合根**     | `{Domain}.ts` (PascalCase)      | `Cart.ts`, `Product.ts`, `Order.ts`                 |
| **实体**       | `{Name}Entity.ts`               | `CartItemEntity.ts`, `OrderItemEntity.ts`           |
| **值对象**     | `{Name}ValueObject.ts`          | `MoneyValueObject.ts`, `QuantityValueObject.ts`     |
| **领域服务**   | `{Domain}PolicyService.ts`      | `CartPolicyService.ts`, `OrderPolicyService.ts`     |
| **领域事件**   | `{Domain}{Action}Event.ts`      | `CartItemAddedEvent.ts`, `OrderCreatedEvent.ts`     |
| **仓储接口**   | `I{Domain}Repository.ts`        | `ICartRepository.ts`, `IProductRepository.ts`       |
| **仓储实现**   | `{Domain}HttpRepository.ts`     | `CartHttpRepository.ts`, `ProductHttpRepository.ts` |
| **应用服务**   | `{Domain}ApplicationService.ts` | `CartApplicationService.ts`                         |
| **Composable** | `use{Name}.ts` (camelCase)      | `useCartDomain.ts`, `useTheme.ts`                   |
| **Store**      | `{domain}.ts` (kebab-case)      | `cart.ts`, `product.ts`                             |
| **组件**       | `{Name}.vue` (PascalCase)       | `CartItem.vue`, `Button.vue`                        |
| **主题组件**   | `Theme{Name}.vue`               | `ThemeCartItem.vue`                                 |
| **页面**       | `{name}.vue` (kebab-case)       | `index.vue`, `[id].vue`                             |
| **类型**       | `{name}.ts` (kebab-case)        | `cart.ts`, `product.ts`                             |
| **工具函数**   | `{name}.ts` (kebab-case)        | `formatters.ts`, `helpers.ts`                       |

---

## 3. 领域层开发规范

### 3.1 聚合根 (Aggregate Root)

#### ✅ **定义规范**

```typescript
// app/domain/cart/Cart.ts

/**
 * 🛒 购物车聚合根 (Aggregate Root)
 *
 * 职责：
 * - 管理购物车项的生命周期
 * - 维护购物车的业务不变性
 * - 发布领域事件
 * - 作为聚合的入口点
 *
 * 业务规则：
 * - 商品不能重复添加
 * - 数量必须 >= 1
 * - 数量不能超过库存
 */
export class CartAggregate {
  private _id: string
  private _items: Map<string, CartItem>
  private _events: DomainEvent[] = []

  constructor(id: string, items: CartItem[] = []) {
    this._id = id
    this._items = new Map(items.map((item) => [item.id, item]))
  }

  // ==================== Getters ====================

  get id(): string {
    return this._id
  }

  get items(): CartItem[] {
    return Array.from(this._items.values())
  }

  get events(): DomainEvent[] {
    return this._events
  }

  // ==================== 业务方法（命令） ====================

  /**
   * 添加商品项
   *
   * 业务规则：
   * - 商品不能重复添加
   *
   * @throws DomainError 商品已存在
   */
  addItem(item: CartItem): void {
    if (this._items.has(item.id)) {
      throw new DomainError('商品已存在购物车中')
    }

    this._items.set(item.id, item)

    // 发布领域事件
    this._events.push(new CartItemAddedEvent(this._id, item.id, item.quantity))
  }

  /**
   * 移除商品项
   */
  removeItem(itemId: string): void {
    const item = this._items.get(itemId)
    if (!item) {
      throw new DomainError('商品不存在')
    }

    this._items.delete(itemId)
    this._events.push(new CartItemRemovedEvent(this._id, itemId))
  }

  /**
   * 更新商品数量
   *
   * 业务规则委托给 CartItem 实体
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    const item = this._items.get(itemId)
    if (!item) {
      throw new DomainError('商品不存在')
    }

    item.setQuantity(quantity) // 委托给实体
  }

  // ==================== 查询方法 ====================

  /**
   * 获取选中的商品项
   */
  getSelectedItems(): CartItem[] {
    return this.items.filter((item) => item.selected)
  }

  /**
   * 计算选中商品总价
   */
  calculateSelectedTotal(): Money {
    return this.getSelectedItems()
      .filter((item) => item.canBePurchased())
      .reduce((total, item) => total.add(item.calculateSubtotal()), Money.zero())
  }

  /**
   * 是否可以结算
   */
  canCheckout(): boolean {
    const selectedAvailableItems = this.getSelectedItems().filter((item) => item.canBePurchased())
    return selectedAvailableItems.length > 0
  }

  /**
   * 清空领域事件
   */
  clearEvents(): void {
    this._events = []
  }
}
```

#### 📋 **聚合根开发清单**

- [ ] 有唯一标识（`_id`）
- [ ] 使用 private 字段，通过 getter 暴露
- [ ] 所有修改通过方法进行，不直接修改字段
- [ ] 维护业务不变性（通过验证）
- [ ] 发布领域事件（重要业务变更）
- [ ] 提供清晰的业务方法（命令和查询）
- [ ] 包含完整的 JSDoc 注释
- [ ] 业务规则在方法中实现

### 3.2 实体 (Entity)

#### ✅ **定义规范**

```typescript
// app/domain/cart/CartItemEntity.ts

/**
 * 📦 购物车项实体 (Entity)
 *
 * 职责：
 * - 购物车项的业务行为
 * - 维护购物车项的业务规则
 *
 * 业务规则：
 * - 数量必须 >= 1
 * - 数量不能超过库存
 */
export class CartItem {
  private _id: string
  private _productId: string
  private _productName: string
  private _price: Money
  private _quantity: number
  private _stock: number
  private _selected: boolean
  private _available: boolean

  constructor(params: {
    id: string
    productId: string
    productName: string
    price: number
    quantity: number
    stock: number
    selected?: boolean
    available?: boolean
  }) {
    this._id = params.id
    this._productId = params.productId
    this._productName = params.productName
    this._price = Money.of(params.price)
    this._quantity = params.quantity
    this._stock = params.stock
    this._selected = params.selected ?? true
    this._available = params.available ?? true

    this.validate()
  }

  private validate(): void {
    if (this._quantity < 1) {
      throw new DomainError('商品数量必须大于0')
    }
    if (this._quantity > this._stock) {
      throw new DomainError('商品数量不能超过库存')
    }
  }

  // ==================== Getters ====================

  get id(): string {
    return this._id
  }
  get productId(): string {
    return this._productId
  }
  get productName(): string {
    return this._productName
  }
  get price(): Money {
    return this._price
  }
  get quantity(): number {
    return this._quantity
  }
  get stock(): number {
    return this._stock
  }
  get selected(): boolean {
    return this._selected
  }
  get available(): boolean {
    return this._available
  }

  // ==================== 业务方法 ====================

  /**
   * 设置数量
   *
   * 业务规则：
   * - 数量必须 >= 1
   * - 数量不能超过库存
   */
  setQuantity(quantity: number): void {
    if (quantity < 1) {
      throw new DomainError('数量不能小于1')
    }
    if (quantity > this._stock) {
      throw new DomainError(`超过库存数量 (${this._stock})`)
    }
    this._quantity = quantity
  }

  /**
   * 增加数量
   */
  increaseQuantity(amount: number = 1): void {
    this.setQuantity(this._quantity + amount)
  }

  /**
   * 减少数量
   */
  decreaseQuantity(amount: number = 1): void {
    this.setQuantity(this._quantity - amount)
  }

  /**
   * 切换选中状态
   */
  toggleSelection(): void {
    this._selected = !this._selected
  }

  /**
   * 设置选中状态
   */
  setSelected(selected: boolean): void {
    this._selected = selected
  }

  // ==================== 业务计算 ====================

  /**
   * 计算小计金额
   */
  calculateSubtotal(): Money {
    return this._price.multiply(this._quantity)
  }

  /**
   * 是否可购买
   */
  canBePurchased(): boolean {
    return this._available && this._stock >= this._quantity
  }
}
```

#### 📋 **实体开发清单**

- [ ] 有唯一标识（`_id`）
- [ ] 使用 private 字段
- [ ] 构造函数中进行验证（`validate()`）
- [ ] 业务方法包含业务规则验证
- [ ] 提供业务计算方法
- [ ] 不暴露 setter，通过业务方法修改
- [ ] 完整的 JSDoc 注释

### 3.3 值对象 (Value Object)

#### ✅ **定义规范**

````typescript
// app/domain/shared/MoneyValueObject.ts

/**
 * 💰 Money 值对象 (Value Object)
 *
 * 职责：
 * - 封装金额计算逻辑
 * - 确保金额的不可变性
 * - 提供金额格式化
 *
 * 特点：
 * - 不可变（Immutable）
 * - 无 ID（通过值比较）
 * - 可替换
 *
 * @example
 * ```ts
 * const price = Money.of(99.9)
 * const total = price.multiply(2)  // Money.of(199.8)
 * console.log(total.display)       // "¥199.80"
 * ```
 */
export class Money {
  private readonly _amount: number

  private constructor(amount: number) {
    if (amount < 0) {
      throw new Error('金额不能为负数')
    }
    // 保留两位小数，避免浮点数精度问题
    this._amount = Math.round(amount * 100) / 100
  }

  // ==================== 工厂方法 ====================

  static of(amount: number): Money {
    return new Money(amount)
  }

  static zero(): Money {
    return new Money(0)
  }

  // ==================== Getters ====================

  get amount(): number {
    return this._amount
  }

  get display(): string {
    return `¥${this._amount.toFixed(2)}`
  }

  // ==================== 不可变操作（返回新对象） ====================

  add(other: Money): Money {
    return new Money(this._amount + other._amount)
  }

  subtract(other: Money): Money {
    return new Money(this._amount - other._amount)
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor)
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('除数不能为0')
    }
    return new Money(this._amount / divisor)
  }

  // ==================== 比较方法 ====================

  equals(other: Money): boolean {
    return this._amount === other._amount
  }

  isGreaterThan(other: Money): boolean {
    return this._amount > other._amount
  }

  isLessThan(other: Money): boolean {
    return this._amount < other._amount
  }

  isZero(): boolean {
    return this._amount === 0
  }
}
````

#### 📋 **值对象开发清单**

- [ ] 使用 `private readonly` 字段
- [ ] private 构造函数 + 静态工厂方法
- [ ] 不可变（所有操作返回新对象）
- [ ] 实现 `equals()` 方法
- [ ] 提供工厂方法（`of()`, `zero()` 等）
- [ ] 包含业务相关的计算方法
- [ ] 完整的 JSDoc 和示例

### 3.4 领域服务 (Domain Service)

#### ✅ **定义规范**

```typescript
// app/domain/cart/CartPolicyService.ts

/**
 * 🎯 购物车领域服务 (Domain Service)
 *
 * 职责：
 * - 处理跨实体的业务逻辑
 * - 实现复杂的领域规则
 *
 * 注意：
 * - 领域服务是无状态的
 * - 不包含数据访问逻辑（由仓储负责）
 */
export class CartPolicyService {
  /**
   * 合并购物车商品
   *
   * 如果商品已存在，则增加数量；否则添加新商品
   *
   * @param cart - 购物车聚合根
   * @param newItem - 新商品项
   */
  mergeCartItem(cart: CartAggregate, newItem: CartItem): void {
    const existingItem = cart.items.find((item) => item.productId === newItem.productId)

    if (existingItem) {
      // 商品已存在，增加数量
      existingItem.increaseQuantity(newItem.quantity)
    } else {
      // 新商品，直接添加
      cart.addItem(newItem)
    }
  }

  /**
   * 验证购物车是否可以结算
   *
   * @returns 错误信息数组，为空表示验证通过
   */
  validateCheckout(cart: CartAggregate): string[] {
    const errors: string[] = []

    if (cart.items.length === 0) {
      errors.push('购物车为空')
      return errors
    }

    const selectedItems = cart.getSelectedItems()
    if (selectedItems.length === 0) {
      errors.push('请选择要购买的商品')
      return errors
    }

    const unavailableItems = selectedItems.filter((item) => !item.canBePurchased())
    if (unavailableItems.length > 0) {
      errors.push(`有${unavailableItems.length}件商品不可购买`)
    }

    return errors
  }

  /**
   * 计算购物车优惠信息
   */
  calculatePromotions(cart: CartAggregate): {
    totalDiscount: Money
    promotionText: string
  } {
    // 这里可以实现复杂的优惠计算逻辑
    // 例如：满减、折扣、优惠券等

    const total = cart.calculateSelectedTotal()
    let discount = Money.zero()

    // 示例：满300减50
    if (total.isGreaterThan(Money.of(300))) {
      discount = Money.of(50)
    }

    return {
      totalDiscount: discount,
      promotionText: discount.isZero() ? '' : `已优惠 ${discount.display}`,
    }
  }
}
```

#### 📋 **领域服务开发清单**

- [ ] 无状态（不保存数据）
- [ ] 处理跨实体的业务逻辑
- [ ] 方法参数包含所需的领域对象
- [ ] 不包含数据访问逻辑
- [ ] 完整的 JSDoc 注释
- [ ] 清晰的业务规则说明

### 3.5 仓储接口 (Repository Interface)

#### ✅ **定义规范**

```typescript
// app/domain/cart/ICartRepository.ts

import type { CartAggregate } from './Cart'

/**
 * 🗄️ 购物车仓储接口
 *
 * 职责：
 * - 定义数据访问的契约
 * - 隐藏数据访问的技术细节
 *
 * 注意：
 * - 接口在领域层（依赖倒置）
 * - 实现在基础设施层
 * - 以聚合根为单位操作
 */
export interface ICartRepository {
  /**
   * 根据ID查找购物车聚合根
   *
   * @param cartId - 购物车ID
   * @returns 购物车聚合根，不存在时返回 null
   */
  findById(cartId: string): Promise<CartAggregate | null>

  /**
   * 保存购物车聚合根
   *
   * @param cart - 购物车聚合根
   */
  save(cart: CartAggregate): Promise<void>

  /**
   * 删除购物车
   *
   * @param cartId - 购物车ID
   */
  delete(cartId: string): Promise<void>
}
```

#### 📋 **仓储接口开发清单**

- [ ] 定义在领域层
- [ ] 以聚合根为单位操作
- [ ] 方法返回领域对象（不是 DTO）
- [ ] 不暴露技术细节
- [ ] 完整的 JSDoc 注释

---

## 4. 应用层开发规范

### 4.1 应用服务 (Application Service)

#### ✅ **定义规范**

```typescript
// app/application/cart/CartApplicationService.ts

import type { ICartRepository } from '~/domain/cart/ICartRepository'
import { CartPolicyService } from '~/domain/cart/CartPolicyService'
import { CartAggregate } from '~/domain/cart/Cart'
import { CartItemEntity } from '~/domain/cart/CartItemEntity'
import { MoneyValueObject } from '~/domain/shared/MoneyValueObject'

/**
 * 🎯 购物车应用服务
 *
 * 职责：
 * - 协调领域对象完成业务用例
 * - 管理事务边界
 * - 处理领域事件
 * - DTO 与领域对象的转换
 *
 * 注意：
 * - 不包含业务逻辑（业务逻辑在领域层）
 * - 是"薄"的一层，主要做协调
 */
export class CartApplicationService {
  constructor(
    private cartRepository: ICartRepository,
    private cartPolicyService: CartPolicyService
  ) {}

  /**
   * 获取购物车
   *
   * 用例：用户查看购物车
   */
  async getCart(userId: string): Promise<CartAggregate> {
    let cart = await this.cartRepository.findById(userId)

    if (!cart) {
      cart = new CartAggregate(userId)
    }

    return cart
  }

  /**
   * 添加商品到购物车
   *
   * 用例：用户添加商品到购物车
   *
   * @param userId - 用户ID
   * @param productId - 商品ID
   * @param quantity - 数量
   */
  async addToCart(userId: string, productId: string, quantity: number): Promise<void> {
    // 1. 获取购物车聚合根
    let cart = await this.cartRepository.findById(userId)
    if (!cart) {
      cart = new CartAggregate(userId)
    }

    // 2. 创建购物车项实体
    // TODO: 应该从商品服务获取商品信息
    const newItem = new CartItem({
      id: `item-${Date.now()}`,
      productId,
      productName: '商品名称', // 应从商品服务获取
      price: 99.9, // 应从商品服务获取
      quantity,
      stock: 999, // 应从商品服务获取
    })

    // 3. 使用领域服务合并商品
    this.cartPolicyService.mergeCartItem(cart, newItem)

    // 4. 保存购物车
    await this.cartRepository.save(cart)

    // 5. 发布领域事件
    // await this.eventBus.publish(cart.events)
    cart.clearEvents()
  }

  /**
   * 更新商品数量
   *
   * 用例：用户修改商品数量
   */
  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<void> {
    // 1. 获取购物车聚合根
    const cart = await this.cartRepository.findById(userId)
    if (!cart) {
      throw new Error('购物车不存在')
    }

    // 2. 调用聚合根的业务方法
    // 🎯 业务规则在这里验证！
    cart.updateItemQuantity(itemId, quantity)

    // 3. 保存购物车
    await this.cartRepository.save(cart)
  }

  /**
   * 移除商品
   *
   * 用例：用户删除购物车商品
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const cart = await this.cartRepository.findById(userId)
    if (!cart) {
      throw new Error('购物车不存在')
    }

    cart.removeItem(itemId)
    await this.cartRepository.save(cart)
  }

  /**
   * 结算前验证
   *
   * 用例：用户点击结算按钮
   */
  async validateCheckout(userId: string): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const cart = await this.cartRepository.findById(userId)
    if (!cart) {
      return { valid: false, errors: ['购物车不存在'] }
    }

    // 使用领域服务验证
    const errors = this.cartPolicyService.validateCheckout(cart)

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
```

#### 📋 **应用服务开发清单**

- [ ] 每个方法代表一个用例
- [ ] 方法名使用业务术语
- [ ] 协调领域对象，不包含业务逻辑
- [ ] 管理事务边界（一个方法一个事务）
- [ ] 处理领域事件
- [ ] 完整的 JSDoc，说明用例场景
- [ ] 参数验证（基本验证，不是业务规则）

### 4.2 DTO (Data Transfer Object)

#### ✅ **定义规范**

```typescript
// app/application/cart/dto/AddToCartDto.ts

/**
 * 添加到购物车 DTO
 *
 * 用于从表现层传递数据到应用层
 */
export interface AddToCartDto {
  /** 商品ID */
  productId: string

  /** 数量 */
  quantity: number

  /** 规格ID（可选） */
  specId?: string
}

/**
 * 更新购物车项 DTO
 */
export interface UpdateCartDto {
  /** 购物车项ID */
  itemId: string

  /** 新数量 */
  quantity: number

  /** 是否选中（可选） */
  selected?: boolean
}
```

#### 📋 **DTO 开发清单**

- [ ] 使用 interface（不是 class）
- [ ] 只包含数据字段，不包含方法
- [ ] 清晰的字段注释
- [ ] 可选字段使用 `?`
- [ ] 与 API 响应类型分离

---

## 5. 基础设施层开发规范

### 5.1 仓储实现 (Repository Implementation)

#### ✅ **定义规范**

```typescript
// app/infrastructure/repositories/CartHttpRepository.ts

import type { ICartRepository } from '~/domain/cart/ICartRepository'
import { CartAggregate } from '~/domain/cart/Cart'
import { CartItemEntity } from '~/domain/cart/CartItemEntity'
import { MoneyValueObject } from '~/domain/shared/MoneyValueObject'

/**
 * 💾 购物车仓储实现 (Repository Implementation)
 *
 * 职责：
 * - 实现 ICartRepository 接口
 * - 调用 API 获取/保存数据
 * - DTO ↔ 领域对象转换
 * - 本地缓存管理
 */
export class CartHttpRepository implements ICartRepository {
  private cacheKey = 'cart_cache'

  async findById(cartId: string): Promise<CartAggregate | null> {
    try {
      // 1. 先从缓存读取
      const cached = this.loadFromCache(cartId)
      if (cached) return cached

      // 2. 调用 API
      const response = await $fetch<any>('/api/cart')

      if (!response.data) {
        return null
      }

      // 3. 🔄 DTO → 领域对象转换
      const cart = this.toDomain(cartId, response.data)

      // 4. 缓存聚合根
      this.saveToCache(cartId, cart)

      return cart
    } catch (error) {
      console.error('Failed to load cart:', error)
      return null
    }
  }

  async save(cart: CartAggregate): Promise<void> {
    // 1. 🔄 领域对象 → DTO 转换
    const dto = this.toDTO(cart)

    // 2. 调用 API
    await $fetch('/api/cart', {
      method: 'PUT',
      body: dto,
    })

    // 3. 更新缓存
    this.saveToCache(cart.id, cart)
  }

  async delete(cartId: string): Promise<void> {
    await $fetch('/api/cart', { method: 'DELETE' })
    this.removeFromCache(cartId)
  }

  // ==================== 私有方法：转换 ====================

  /**
   * DTO → 领域对象
   */
  private toDomain(cartId: string, dto: any): CartAggregate {
    const items = dto.items.map(
      (itemDto: any) =>
        new CartItem({
          id: itemDto.id,
          productId: itemDto.product_id,
          productName: itemDto.product_name,
          price: itemDto.price,
          quantity: itemDto.quantity,
          stock: itemDto.stock,
          selected: itemDto.selected,
          available: itemDto.available,
        })
    )

    return new CartAggregate(cartId, items)
  }

  /**
   * 领域对象 → DTO
   */
  private toDTO(cart: CartAggregate): any {
    return {
      items: cart.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        selected: item.selected,
      })),
    }
  }

  // ==================== 私有方法：缓存 ====================

  private loadFromCache(cartId: string): CartAggregate | null {
    if (process.client) {
      const data = localStorage.getItem(`${this.cacheKey}_${cartId}`)
      if (data) {
        const parsed = JSON.parse(data)
        return this.toDomain(cartId, parsed)
      }
    }
    return null
  }

  private saveToCache(cartId: string, cart: CartAggregate): void {
    if (process.client) {
      localStorage.setItem(`${this.cacheKey}_${cartId}`, JSON.stringify(this.toDTO(cart)))
    }
  }

  private removeFromCache(cartId: string): void {
    if (process.client) {
      localStorage.removeItem(`${this.cacheKey}_${cartId}`)
    }
  }
}
```

#### 📋 **仓储实现开发清单**

- [ ] 实现仓储接口
- [ ] 不暴露给外部（export 类，不 export 实例）
- [ ] DTO ↔ 领域对象转换方法为 private
- [ ] 处理缓存逻辑
- [ ] 处理错误（不抛出技术异常给领域层）
- [ ] 完整的注释

---

## 6. 表现层开发规范

### 6.1 页面组件 (Page Component)

#### ✅ **定义规范**

```vue
<!-- app/pages/cart/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <h1 class="text-2xl font-bold mb-6">购物车</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>

    <!-- 购物车内容 -->
    <template v-else>
      <!-- 使用主题组件 -->
      <component
        :is="ThemeCartList"
        :items="cartUIData.items"
        :is-all-selected="cartUIData.isAllSelected"
        @update-quantity="handleUpdateQuantity"
        @toggle-selection="handleToggleSelection"
        @remove="handleRemove"
      />

      <!-- 底部栏 -->
      <component
        :is="ThemeCartFooter"
        v-if="cartUIData.items.length > 0"
        :selected-total="cartUIData.selectedTotal"
        :can-checkout="cartUIData.canCheckout"
        class="mt-6"
        @checkout="handleCheckout"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 购物车页面
 *
 * 职责：
 * - UI 渲染
 * - 用户交互处理
 * - 调用 domain composable
 */

// 🎯 使用领域 Composable（自动导入）
const { loading, cartUIData, loadCart, updateQuantity, toggleItemSelection, removeItem } =
  useCartDomain()

// 🎨 使用主题 Composable
const { currentTheme } = useTheme()

// 动态加载主题组件
const ThemeCartList = resolveComponent(`Theme${currentTheme.value}CartList`)
const ThemeCartFooter = resolveComponent(`Theme${currentTheme.value}CartFooter`)

// 消息提示
const message = useMessage()

// ==================== 生命周期 ====================

onMounted(async () => {
  await loadCart()
})

// ==================== 事件处理 ====================

const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  try {
    await updateQuantity(itemId, quantity)
  } catch (error: any) {
    message.error(error.message)
  }
}

const handleToggleSelection = async (itemId: string) => {
  try {
    await toggleItemSelection(itemId)
  } catch (error: any) {
    message.error(error.message)
  }
}

const handleRemove = async (itemId: string) => {
  if (!confirm('确定要删除吗？')) return

  try {
    await removeItem(itemId)
    message.success('删除成功')
  } catch (error: any) {
    message.error(error.message)
  }
}

const handleCheckout = () => {
  if (!cartUIData.value.canCheckout) {
    message.warning('请选择要购买的商品')
    return
  }

  navigateTo('/orders/checkout')
}

// ==================== SEO ====================

useHead({
  title: '购物车',
  meta: [
    {
      name: 'description',
      content: 'ECSHOPX 购物车 - 管理您的商品，随时结算',
    },
  ],
})
</script>
```

#### 📋 **页面组件开发清单**

- [ ] 使用 `<script setup>` 语法
- [ ] 调用 domain composable，不直接调用应用服务
- [ ] 使用主题组件（动态加载）
- [ ] 事件处理方法以 `handle` 开头
- [ ] 包含错误处理和用户提示
- [ ] 设置 SEO（`useHead`）
- [ ] 清晰的代码分组注释

### 6.2 业务容器组件 (Business Container)

```vue
<!-- app/components/business/CartContainer.vue -->
<template>
  <div>
    <!-- 使用主题组件 -->
    <component
      :is="ThemeCartList"
      :items="cartUIData.items"
      v-bind="$attrs"
      @update-quantity="handleUpdateQuantity"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 购物车容器组件
 *
 * 职责：
 * - 封装购物车业务逻辑
 * - 桥接主题组件和领域逻辑
 * - 与主题无关的业务处理
 */

const { currentTheme } = useTheme()
const { cartUIData, updateQuantity } = useCartDomain()

const ThemeCartList = resolveComponent(`Theme${currentTheme.value}CartList`)

const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  try {
    await updateQuantity(itemId, quantity)
  } catch (error: any) {
    useMessage().error(error.message)
  }
}
</script>
```

---

## 7. 主题系统开发规范

### 7.1 主题组件 (Theme Component)

#### ✅ **定义规范**

```vue
<!-- app/components/theme/default/cart/ThemeCartItem.vue -->
<template>
  <div class="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
    <!-- 选择框 -->
    <input
      type="checkbox"
      :checked="item.selected"
      :disabled="!item.canBePurchased"
      class="w-5 h-5 text-primary cursor-pointer"
      @change="$emit('toggle-selection', item.id)"
    />

    <!-- 商品图片 -->
    <img :src="item.productImage" :alt="item.productName" class="w-20 h-20 rounded object-cover" />

    <!-- 商品信息 -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-gray-900 truncate">
        {{ item.productName }}
      </h4>
      <p class="text-sm text-gray-600 mt-1">
        {{ item.priceDisplay }}
      </p>
    </div>

    <!-- 数量调整器 -->
    <QuantityInput
      :model-value="item.quantity"
      :max="item.stock"
      @update:model-value="$emit('update-quantity', item.id, $event)"
    />

    <!-- 小计 -->
    <div class="w-24 text-right">
      <span class="text-lg font-semibold text-primary">
        {{ item.subtotalDisplay }}
      </span>
    </div>

    <!-- 删除按钮 -->
    <button
      class="text-gray-400 hover:text-red-500 transition-colors"
      @click="$emit('remove', item.id)"
    >
      <Icon name="i-heroicons-trash" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 默认主题 - 购物车项组件
 *
 * 职责：
 * - 只负责视觉呈现
 * - 接收 UI 数据，不包含业务逻辑
 * - 发出事件让父组件处理
 */

interface Props {
  item: {
    id: string
    productName: string
    productImage: string
    priceDisplay: string
    quantity: number
    stock: number
    selected: boolean
    subtotalDisplay: string
    canBePurchased: boolean
  }
}

const props = defineProps<Props>()

defineEmits<{
  'toggle-selection': [id: string]
  'update-quantity': [id: string, quantity: number]
  remove: [id: string]
}>()
</script>
```

#### 📋 **主题组件开发清单**

- [ ] 文件名以 `Theme` 开头
- [ ] 只负责视觉呈现，不包含业务逻辑
- [ ] Props 接收 UI 数据（已格式化）
- [ ] 使用 Tailwind CSS（不使用 `<style>`）
- [ ] 发出事件让父组件处理
- [ ] 完整的 Props 和 Emits 类型定义

### 7.2 主题配置 (Theme Config)

```typescript
// app/config/themes/default.ts

/**
 * 默认主题配置
 */
export const defaultThemeConfig = {
  name: 'default',
  displayName: '默认主题',

  // 设计令牌
  tokens: {
    colors: {
      primary: '#1a73e8',
      secondary: '#34a853',
      background: '#ffffff',
      text: '#202124',
      border: '#dadce0',
    },

    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },

    fontSize: {
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
    },

    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
  },

  // 组件样式配置
  components: {
    button: {
      base: 'px-4 py-2 rounded-lg font-medium transition-colors',
      variants: {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark',
        outline: 'border border-primary text-primary hover:bg-primary-light',
      },
    },

    card: {
      base: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
      hover: 'hover:shadow-md transition-shadow',
    },
  },
}

export type ThemeConfig = typeof defaultThemeConfig
```

---

## 8. Composable 开发规范

### 8.1 领域 Composable

```typescript
// app/composables/domain/cart/useCartDomain.ts

import { CartApplicationService } from '~/application/cart/CartApplicationService'
import { CartHttpRepository } from '~/infrastructure/repositories/CartHttpRepository'
import { CartPolicyService } from '~/domain/cart/CartPolicyService'
import type { CartAggregate } from '~/domain/cart/Cart'

/**
 * 🛒 购物车领域逻辑 Composable
 *
 * 职责：
 * - 封装购物车的所有业务操作
 * - 提供响应式状态
 * - UI 数据转换
 *
 * 注意：
 * - 自动导入，可在任何组件中使用
 * - 使用 useState 确保单例
 */
export function useCartDomain() {
  const cartStore = useCartStore()

  // 初始化应用服务（单例）
  const appService = useState('cartAppService', () => {
    const repository = new CartHttpRepository()
    const policyService = new CartPolicyService()
    return new CartApplicationService(repository, policyService)
  })

  // ==================== 响应式状态 ====================

  const cart = computed<CartAggregate | null>(() => cartStore.cart)
  const loading = computed(() => cartStore.loading)
  const error = computed(() => cartStore.error)

  // ==================== 业务方法 ====================

  /**
   * 加载购物车
   */
  const loadCart = async () => {
    cartStore.setLoading(true)
    try {
      const cartData = await appService.value.getCart('current-user')
      cartStore.setCart(cartData)
    } catch (err: any) {
      cartStore.setError(err.message)
      throw err
    } finally {
      cartStore.setLoading(false)
    }
  }

  /**
   * 添加商品到购物车
   */
  const addToCart = async (productId: string, quantity: number) => {
    await appService.value.addToCart('current-user', productId, quantity)
    await loadCart()
  }

  /**
   * 更新商品数量
   */
  const updateQuantity = async (itemId: string, quantity: number) => {
    await appService.value.updateQuantity('current-user', itemId, quantity)
    await loadCart()
  }

  /**
   * 删除商品
   */
  const removeItem = async (itemId: string) => {
    await appService.value.removeItem('current-user', itemId)
    await loadCart()
  }

  /**
   * 切换选中状态
   */
  const toggleItemSelection = async (itemId: string) => {
    const currentCart = cart.value
    if (!currentCart) return

    currentCart.toggleItemSelection(itemId)
    await appService.value.save(currentCart)
  }

  // ==================== UI 数据转换 ====================

  /**
   * 转换为 UI 数据
   */
  const cartUIData = computed(() => {
    if (!cart.value) {
      return {
        items: [],
        selectedTotal: '¥0.00',
        canCheckout: false,
        isAllSelected: false,
        isEmpty: true,
      }
    }

    return {
      items: cart.value.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage || '/images/placeholder.png',
        priceDisplay: item.price.display,
        quantity: item.quantity,
        stock: item.stock,
        selected: item.selected,
        subtotalDisplay: item.calculateSubtotal().display,
        canBePurchased: item.canBePurchased(),
      })),
      selectedTotal: cart.value.calculateSelectedTotal().display,
      canCheckout: cart.value.canCheckout(),
      isAllSelected: cart.value.isAllSelected(),
      isEmpty: cart.value.items.length === 0,
    }
  })

  return {
    // 状态
    cart,
    loading,
    error,
    cartUIData,

    // 方法
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    toggleItemSelection,
  }
}
```

#### 📋 **Composable 开发清单**

- [ ] 文件名以 `use` 开头
- [ ] 使用 `export function` 导出
- [ ] 使用 `useState` 确保单例（如需要）
- [ ] 返回响应式状态和方法
- [ ] 完整的 JSDoc 注释
- [ ] UI 数据转换在这里完成

---

## 9. Store 开发规范

### 9.1 简化的 Store

```typescript
// app/stores/cart.ts

import { defineStore } from 'pinia'
import type { CartAggregate } from '~/domain/cart/Cart'

/**
 * 🗄️ 购物车 Store
 *
 * 职责：
 * - 管理 UI 状态（loading, error）
 * - 缓存聚合根
 * - ❌ 不包含业务逻辑（业务逻辑在领域层）
 *
 * 注意：
 * - Store 是"薄"的一层
 * - 只做状态管理，不做业务计算
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    /** 购物车聚合根 */
    cart: null as CartAggregate | null,

    /** 加载状态 */
    loading: false,

    /** 错误信息 */
    error: null as string | null,
  }),

  getters: {
    /**
     * 商品数量
     *
     * 注意：只做简单的状态转换，不包含业务逻辑
     */
    itemCount: (state) => state.cart?.items.length ?? 0,

    /**
     * 选中商品总价
     *
     * 🎯 业务计算委托给聚合根
     */
    selectedTotal: (state) => state.cart?.calculateSelectedTotal().display ?? '¥0.00',

    /**
     * 是否可以结算
     *
     * 🎯 业务规则委托给聚合根
     */
    canCheckout: (state) => state.cart?.canCheckout() ?? false,
  },

  actions: {
    /**
     * 设置购物车聚合根
     */
    setCart(cart: CartAggregate) {
      this.cart = cart
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * 设置错误
     */
    setError(error: string | null) {
      this.error = error
    },

    /**
     * 清空购物车
     */
    clear() {
      this.cart = null
      this.error = null
    },
  },
})
```

#### 📋 **Store 开发清单**

- [ ] 只包含 UI 状态（loading, error 等）
- [ ] 缓存领域对象（聚合根）
- [ ] Getter 委托给领域对象计算
- [ ] ❌ 不包含业务逻辑
- [ ] ❌ 不调用 API（由 Composable 调用）
- [ ] 完整的 JSDoc 注释

---

## 10. 命名规范

### 10.1 领域层命名

| 类型     | 规范                           | 示例                                                            |
| -------- | ------------------------------ | --------------------------------------------------------------- |
| 聚合根   | `{Domain}`                     | `Cart`, `Order`, `Product`                                      |
| 实体     | `{Name}Entity`                 | `CartItemEntity`, `OrderItemEntity`                             |
| 值对象   | `{Name}ValueObject`            | `MoneyValueObject`, `QuantityValueObject`, `AddressValueObject` |
| 领域服务 | `{Domain}PolicyService`        | `CartPolicyService`, `OrderPolicyService`                       |
| 仓储接口 | `I{Domain}Repository`          | `ICartRepository`, `IOrderRepository`                           |
| 领域事件 | `{Domain}{Action}Event`        | `CartItemAddedEvent`, `OrderCreatedEvent`                       |
| 领域错误 | `{Name}Error` 或 `DomainError` | `DomainError`, `ValidationError`                                |

### 10.2 应用层命名

| 类型      | 规范                         | 示例                             |
| --------- | ---------------------------- | -------------------------------- |
| 应用服务  | `{Domain}ApplicationService` | `CartApplicationService`         |
| DTO       | `{Action}{Domain}Dto`        | `AddToCartDto`, `CreateOrderDto` |
| ViewModel | `{Domain}ViewModel`          | `CartViewModel` (如使用)         |

### 10.3 基础设施层命名

| 类型       | 规范                     | 示例                                          |
| ---------- | ------------------------ | --------------------------------------------- |
| 仓储实现   | `{Domain}HttpRepository` | `CartHttpRepository`, `ProductHttpRepository` |
| API 适配器 | `{Domain}ApiAdapter`     | `CartApiAdapter`                              |
| 缓存       | `{Name}Cache`            | `LocalStorageCache`                           |

### 10.4 表现层命名

| 类型       | 规范                      | 示例                              |
| ---------- | ------------------------- | --------------------------------- |
| 页面       | `{name}.vue` (kebab-case) | `index.vue`, `[id].vue`           |
| 主题组件   | `Theme{Name}.vue`         | `ThemeCartItem.vue`               |
| 基础组件   | `{Name}.vue`              | `Button.vue`, `Modal.vue`         |
| 业务容器   | `{Name}Container.vue`     | `CartContainer.vue`               |
| Composable | `use{Name}.ts`            | `useCartDomain.ts`, `useTheme.ts` |
| Store      | `{domain}.ts`             | `cart.ts`, `product.ts`           |

### 10.5 方法命名

| 类型     | 规范                                         | 示例                                            |
| -------- | -------------------------------------------- | ----------------------------------------------- |
| 查询方法 | `get{Name}`, `find{Name}`, `calculate{Name}` | `getCart()`, `findById()`, `calculateTotal()`   |
| 命令方法 | `{动词}{名词}`                               | `addItem()`, `removeItem()`, `updateQuantity()` |
| 验证方法 | `validate{Name}`, `can{Action}`              | `validateCheckout()`, `canBePurchased()`        |
| 判断方法 | `is{State}`, `has{State}`                    | `isEmpty()`, `hasDiscount()`                    |
| 事件处理 | `handle{Action}`                             | `handleClick()`, `handleSubmit()`               |

---

## 11. 代码风格规范

### 11.1 TypeScript 规范

```typescript
// ✅ 好的示例

// 1. 使用明确的类型注解
function calculateTotal(items: CartItem[]): Money {
  return items.reduce((total, item) => total.add(item.calculateSubtotal()), Money.zero())
}

// 2. 使用 interface 而不是 type（对外暴露的类型）
export interface ICartRepository {
  findById(id: string): Promise<CartAggregate | null>
  save(cart: CartAggregate): Promise<void>
}

// 3. 使用 readonly 保护不可变数据
class Money {
  private readonly _amount: number
  // ...
}

// 4. 使用可选链和空值合并
const total = cart?.calculateTotal() ?? Money.zero()

// 5. 使用泛型提高复用性
function findById<T>(id: string, items: T[]): T | undefined {
  return items.find((item) => item.id === id)
}

// ❌ 不好的示例

// 1. 使用 any
function process(data: any) {
  // ❌ 应该定义明确类型
  // ...
}

// 2. 使用 as 强制转换（除非必要）
const item = data as CartItem // ❌ 应该使用类型守卫

// 3. 不使用 readonly
class Money {
  private _amount: number // ❌ 应该使用 readonly
}
```

### 11.2 Vue 组件规范

```vue
<!-- ✅ 好的示例 -->
<template>
  <div class="cart-item">
    <!-- 使用 v-if 控制渲染 -->
    <div v-if="item.hasDiscount" class="discount-badge">折扣</div>

    <!-- 使用计算属性 -->
    <span>{{ formattedPrice }}</span>

    <!-- 事件名使用 kebab-case -->
    <button @click="$emit('update-quantity', quantity + 1)">+</button>
  </div>
</template>

<script setup lang="ts">
// 1. Props 定义
interface Props {
  item: CartItemUIData
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// 2. Emits 定义
defineEmits<{
  'update-quantity': [quantity: number]
  remove: [id: string]
}>()

// 3. 使用 computed
const formattedPrice = computed(() => {
  return `¥${props.item.price.toFixed(2)}`
})

// 4. 使用 ref/reactive
const quantity = ref(1)

// 5. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<!-- ❌ 不好的示例 -->
<template>
  <!-- 不要在模板中写复杂逻辑 -->
  <span>{{ item.price * item.quantity }}</span>
  <!-- ❌ 应该使用 computed -->

  <!-- 不要使用内联样式 -->
  <div style="color: red"><!-- ❌ 应该使用 Tailwind class --></div>
</template>

<script setup lang="ts">
// 不要使用 any
const props = defineProps<{ item: any }>() // ❌

// 不要在 setup 中使用 this
// this.xxx  // ❌ setup 中没有 this
</script>
```

### 11.3 注释规范

````typescript
/**
 * 购物车聚合根
 *
 * 职责：
 * - 管理购物车项的生命周期
 * - 维护购物车的业务不变性
 * - 发布领域事件
 *
 * 业务规则：
 * - 商品不能重复添加
 * - 数量必须 >= 1
 * - 数量不能超过库存
 *
 * @example
 * ```ts
 * const cart = new CartAggregate('user-123')
 * cart.addItem(new CartItem({ ... }))
 * const total = cart.calculateTotal()
 * ```
 */
export class CartAggregate {
  /**
   * 添加商品项
   *
   * 业务规则：
   * - 商品不能重复添加
   *
   * @param item - 购物车项实体
   * @throws DomainError 商品已存在
   *
   * @example
   * ```ts
   * const item = new CartItem({ id: '1', ... })
   * cart.addItem(item)
   * ```
   */
  addItem(item: CartItem): void {
    // 实现
  }
}
````

---

## 12. 测试规范

### 12.1 领域层测试

```typescript
// tests/domain/cart/Cart.test.ts

import { describe, it, expect } from 'vitest'
import { CartAggregate, CartItem } from '~/domain/cart/Cart'
import { Money } from '~/domain/shared/Money'
import { DomainError } from '~/domain/shared/DomainError'

describe('CartAggregate', () => {
  describe('addItem', () => {
    it('应该成功添加商品', () => {
      // Arrange
      const cart = new CartAggregate('cart-1')
      const item = new CartItem({
        id: 'item-1',
        productId: 'product-1',
        productName: '商品A',
        price: 99.9,
        quantity: 1,
        stock: 10,
      })

      // Act
      cart.addItem(item)

      // Assert
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0].id).toBe('item-1')
    })

    it('应该抛出错误当商品已存在', () => {
      // Arrange
      const cart = new CartAggregate('cart-1')
      const item = new CartItem({
        id: 'item-1',
        productId: 'product-1',
        productName: '商品A',
        price: 99.9,
        quantity: 1,
        stock: 10,
      })
      cart.addItem(item)

      // Act & Assert
      expect(() => {
        cart.addItem(item)
      }).toThrow(DomainError)
    })
  })

  describe('calculateSelectedTotal', () => {
    it('应该正确计算选中商品总价', () => {
      // Arrange
      const cart = new CartAggregate('cart-1')
      const item1 = new CartItem({
        id: 'item-1',
        productId: 'product-1',
        productName: '商品A',
        price: 99.9,
        quantity: 2,
        stock: 10,
        selected: true,
      })
      const item2 = new CartItem({
        id: 'item-2',
        productId: 'product-2',
        productName: '商品B',
        price: 50,
        quantity: 1,
        stock: 10,
        selected: false,
      })
      cart.addItem(item1)
      cart.addItem(item2)

      // Act
      const total = cart.calculateSelectedTotal()

      // Assert
      expect(total.amount).toBe(199.8) // 99.9 * 2
    })
  })
})
```

### 12.2 应用层测试

```typescript
// tests/application/cart/CartApplicationService.test.ts

import { describe, it, expect, vi } from 'vitest'
import { CartApplicationService } from '~/application/cart/CartApplicationService'
import type { ICartRepository } from '~/domain/cart/ICartRepository'
import { CartPolicyService } from '~/domain/cart/CartPolicyService'
import { CartAggregate } from '~/domain/cart/Cart'

describe('CartApplicationService', () => {
  it('应该成功更新商品数量', async () => {
    // Arrange
    const mockRepository: ICartRepository = {
      findById: vi.fn().mockResolvedValue(
        new CartAggregate('cart-1', [
          /* items */
        ])
      ),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
    }
    const policyService = new CartPolicyService()
    const service = new CartApplicationService(mockRepository, policyService)

    // Act
    await service.updateQuantity('user-1', 'item-1', 3)

    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith('user-1')
    expect(mockRepository.save).toHaveBeenCalled()
  })
})
```

---

## 13. 最佳实践

### 13.1 领域层最佳实践

#### ✅ DO（推荐）

1. **业务逻辑放在领域层**

   ```typescript
   // ✅ 好的
   class CartItem {
     setQuantity(quantity: number): void {
       if (quantity < 1) throw new Error('数量不能小于1')
       if (quantity > this._stock) throw new Error('超过库存')
       this._quantity = quantity
     }
   }
   ```

2. **使用值对象封装业务概念**

   ```typescript
   // ✅ 好的
   const price = Money.of(99.9)
   const total = price.multiply(2)

   // ❌ 不好的
   const price = 99.9
   const total = price * 2
   ```

3. **聚合根维护一致性**

   ```typescript
   // ✅ 好的
   class CartAggregate {
     updateItemQuantity(itemId: string, quantity: number): void {
       const item = this._items.get(itemId)
       item.setQuantity(quantity) // 委托给实体
     }
   }
   ```

4. **使用领域事件解耦**
   ```typescript
   // ✅ 好的
   class CartAggregate {
     addItem(item: CartItem): void {
       this._items.set(item.id, item)
       this._events.push(new CartItemAddedEvent(this.id, item.id))
     }
   }
   ```

#### ❌ DON'T（禁止）

1. **不要在领域层调用 API**

   ```typescript
   // ❌ 错误
   class CartAggregate {
     async addItem(item: CartItem): Promise<void> {
       await $fetch('/api/cart') // ❌ 不要在领域层调用 API
     }
   }
   ```

2. **不要让实体依赖外部服务**

   ```typescript
   // ❌ 错误
   class CartItem {
     constructor(private productService: ProductService) {} // ❌
   }
   ```

3. **不要在领域层处理 UI 逻辑**
   ```typescript
   // ❌ 错误
   class Money {
     get displayWithCurrency(): string {
       // ❌ UI逻辑应该在表现层
       return `CNY ${this._amount}`
     }
   }
   ```

### 13.2 应用层最佳实践

#### ✅ DO（推荐）

1. **一个方法一个用例**

   ```typescript
   // ✅ 好的
   class CartApplicationService {
     // 用例：添加商品到购物车
     async addToCart(userId: string, productId: string): Promise<void>

     // 用例：更新商品数量
     async updateQuantity(userId: string, itemId: string, quantity: number): Promise<void>
   }
   ```

2. **管理事务边界**

   ```typescript
   // ✅ 好的
   async updateQuantity(userId: string, itemId: string, quantity: number): Promise<void> {
     // 整个方法是一个事务
     const cart = await this.repository.findById(userId)
     cart.updateItemQuantity(itemId, quantity)
     await this.repository.save(cart)
     // 事务结束
   }
   ```

3. **处理领域事件**

   ```typescript
   // ✅ 好的
   async addToCart(userId: string, productId: string): Promise<void> {
     const cart = await this.repository.findById(userId)
     cart.addItem(newItem)
     await this.repository.save(cart)

     // 发布领域事件
     await this.eventBus.publish(cart.events)
     cart.clearEvents()
   }
   ```

#### ❌ DON'T（禁止）

1. **不要在应用服务中写业务逻辑**

   ```typescript
   // ❌ 错误
   async updateQuantity(userId: string, itemId: string, quantity: number): Promise<void> {
     const cart = await this.repository.findById(userId)
     const item = cart.items.find(i => i.id === itemId)

     // ❌ 业务规则应该在领域层
     if (quantity < 1) throw new Error('数量不能小于1')
     if (quantity > item.stock) throw new Error('超过库存')

     item.quantity = quantity  // ❌ 直接修改
     await this.repository.save(cart)
   }
   ```

### 13.3 表现层最佳实践

#### ✅ DO（推荐）

1. **使用 Composable 封装逻辑**

   ```typescript
   // ✅ 好的
   // pages/cart/index.vue
   const { cartUIData, updateQuantity } = useCartDomain()
   ```

2. **主题组件只负责视觉**

   ```vue
   <!-- ✅ 好的 -->
   <template>
     <div class="cart-item">
       <span>{{ item.priceDisplay }}</span>
       <button @click="$emit('update-quantity', item.id, quantity)">更新</button>
     </div>
   </template>
   ```

3. **错误处理在页面层**
   ```typescript
   // ✅ 好的
   const handleUpdateQuantity = async (itemId: string, quantity: number) => {
     try {
       await updateQuantity(itemId, quantity)
     } catch (error: any) {
       useMessage().error(error.message)
     }
   }
   ```

#### ❌ DON'T（禁止）

1. **不要在组件中直接调用应用服务**

   ```typescript
   // ❌ 错误
   import { CartApplicationService } from '~/application/cart/CartApplicationService'

   const service = new CartApplicationService(...)  // ❌ 应该使用 Composable
   await service.updateQuantity(...)
   ```

2. **不要在主题组件中写业务逻辑**
   ```vue
   <!-- ❌ 错误 -->
   <script setup>
   const handleClick = () => {
     // ❌ 业务逻辑不应该在主题组件中
     if (item.quantity > item.stock) {
       alert('超过库存')
       return
     }
     // ...
   }
   </script>
   ```

---

## 14. 禁止事项

### 14.1 架构违反

| 禁止事项                   | 说明             | 正确做法           |
| -------------------------- | ---------------- | ------------------ |
| ❌ 领域层调用 API          | 破坏依赖倒置原则 | 通过仓储接口       |
| ❌ 表现层直接调用仓储      | 绕过应用层       | 通过 Composable    |
| ❌ Store 包含业务逻辑      | 职责混乱         | 业务逻辑在领域层   |
| ❌ 组件直接修改 Store 状态 | 绕过封装         | 通过 Store actions |
| ❌ 在聚合外修改实体        | 破坏封装         | 通过聚合根方法     |

### 14.2 代码质量违反

| 禁止事项           | 说明         | 正确做法     |
| ------------------ | ------------ | ------------ |
| ❌ 使用 `any` 类型 | 失去类型安全 | 定义明确类型 |
| ❌ 使用 `as` 强转  | 绕过类型检查 | 使用类型守卫 |
| ❌ 不写注释        | 代码难以理解 | 完整的 JSDoc |
| ❌ 魔法数字        | 代码不易维护 | 使用常量     |
| ❌ 过长的方法      | 违反单一职责 | 拆分方法     |

### 14.3 样式违反

| 禁止事项          | 说明           | 正确做法            |
| ----------------- | -------------- | ------------------- |
| ❌ 使用 `<style>` | 不符合项目规范 | 使用 Tailwind CSS   |
| ❌ 使用内联样式   | 难以维护       | 使用 Tailwind class |
| ❌ 自定义 CSS 类  | 不一致         | 使用 `sp-` 前缀类   |

---

## 15. 迁移指南

### 15.1 从当前架构迁移到 DDD

#### 阶段 1: 准备工作（1天）

1. 创建新目录结构
2. 安装依赖（如需要）
3. 学习 DDD 概念

#### 阶段 2: 值对象层（2天）

1. 创建 `MoneyValueObject` 值对象
2. 创建 `QuantityValueObject` 值对象
3. 在现有代码中使用

#### 阶段 3: 实体层（3天）

1. 重构 `CartItemEntity` 为真正的实体
2. 添加业务方法
3. 业务规则验证移到实体

#### 阶段 4: 聚合根层（3天）

1. 创建 `Cart` 聚合根
2. 将购物车逻辑移到聚合根
3. 确保通过聚合根操作

#### 阶段 5: 领域服务层（2天）

1. 创建 `CartPolicyService`
2. 迁移跨实体逻辑

#### 阶段 6: 仓储层（3天）

1. 定义 `ICartRepository` 接口
2. 实现 `CartHttpRepository`
3. 替换 Store 的 API 调用

#### 阶段 7: 应用服务层（3天）

1. 创建 `CartApplicationService`
2. 迁移用例逻辑
3. Store 调用应用服务

#### 阶段 8: Composable 层（2天）

1. 创建 `useCartDomain`
2. 页面使用 Composable

#### 阶段 9: 简化 Store（1天）

1. 移除 Store 业务逻辑
2. 只保留状态管理

#### 阶段 10: 测试和优化（3天）

1. 单元测试
2. 集成测试
3. 性能优化

---

## 16. 常见问题 FAQ

### Q1: 什么时候用聚合根，什么时候用实体？

**A**:

- **聚合根**: 是聚合的入口点，对外暴露，维护聚合内部一致性
- **实体**: 聚合内部的对象，通过聚合根访问

示例：`Cart` 是聚合根，`CartItemEntity` 是实体

### Q2: Store 还需要吗？

**A**: 需要，但职责变了：

- ✅ 管理 UI 状态（loading, error）
- ✅ 缓存领域对象
- ❌ 不包含业务逻辑

### Q3: 值对象一定要用吗？

**A**: 强烈推荐，但可以渐进：

- 优先级高：`MoneyValueObject`（金额计算复杂）
- 优先级中：`QuantityValueObject`（有业务规则）
- 优先级低：简单的值类型

### Q4: 每个领域都要完整实现 DDD 吗？

**A**: 不需要，根据复杂度决定：

- **复杂领域**（如购物车、订单）：完整 DDD
- **简单领域**（如字典、配置）：简化版

### Q5: 如何处理跨领域的业务？

**A**:

1. 通过应用服务协调
2. 通过领域事件通信
3. 通过共享内核（谨慎使用）

### Q6: 主题切换会影响性能吗？

**A**: 不会，因为：

- 组件动态加载（按需）
- Nuxt 自动代码分割
- 主题资源懒加载

---

## 17. 参考资源

### 17.1 推荐阅读

- **《领域驱动设计》** - Eric Evans
- **《实现领域驱动设计》** - Vaughn Vernon
- **Nuxt 3/4 官方文档** - https://nuxt.com
- **Vue 3 官方文档** - https://vuejs.org

### 17.2 项目文档

- [DDD 架构提案](./architecture/ddd-architecture-proposal.md)
- [购物车实现总结](./shopping-cart-implementation-summary.md)
- [数据获取最佳实践](./数据获取最佳实践指南.md)

---

## 📋 开发清单模板

使用以下清单确保代码质量：

### 新增聚合根清单

- [ ] 定义聚合根类
- [ ] 使用 private 字段
- [ ] 实现业务方法
- [ ] 实现查询方法
- [ ] 发布领域事件
- [ ] 编写单元测试
- [ ] 完整的 JSDoc 注释
- [ ] 定义仓储接口
- [ ] 实现仓储
- [ ] 创建应用服务
- [ ] 创建 Composable
- [ ] 更新 Store
- [ ] 创建主题组件

---

**版本历史**

- v2.0 (2025-01-09): 完整的 DDD + 多主题架构规范
- v1.0 (2025-01-08): 初始版本

---

**维护者**: ECSHOPX Team  
**最后更新**: 2025-01-09
