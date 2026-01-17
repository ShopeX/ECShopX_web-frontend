# ECShopX DDD 开发指南（简化版）

本文档提供 DDD（领域驱动设计）在 ECShopX 项目中的实践指南。

## 何时使用 DDD

### ✅ 适合使用 DDD 的场景

- **复杂业务规则**：购物车、订单、结算流程
- **多实体协同**：订单包含订单项、地址、优惠券等
- **业务规则验证**：库存检查、价格计算、优惠券使用规则
- **状态机模型**：订单状态流转、支付状态变化

### ❌ 不适合使用 DDD 的场景

- **简单 CRUD**：商品列表、分类列表
- **纯展示页面**：关于我们、帮助中心
- **简单表单**：用户反馈、留言
- **配置管理**：系统设置、字典数据

## DDD 核心概念（快速理解）

### 1. 值对象 (Value Object)

**特点**：不可变、无 ID、通过值比较

**使用场景**：Money（金额）、Quantity（数量）、Address（地址）

**示例**：
```typescript
// app/domain/shared/MoneyValueObject.ts

export class Money {
  private readonly _amount: number
  
  private constructor(amount: number) {
    if (amount < 0) throw new Error('金额不能为负数')
    this._amount = Math.round(amount * 100) / 100
  }
  
  static of(amount: number): Money {
    return new Money(amount)
  }
  
  static zero(): Money {
    return new Money(0)
  }
  
  get amount(): number {
    return this._amount
  }
  
  get display(): string {
    return `¥${this._amount.toFixed(2)}`
  }
  
  // 不可变操作（返回新对象）
  add(other: Money): Money {
    return new Money(this._amount + other._amount)
  }
  
  multiply(factor: number): Money {
    return new Money(this._amount * factor)
  }
  
  equals(other: Money): boolean {
    return this._amount === other._amount
  }
}

// 使用
const price = Money.of(99.9)
const total = price.multiply(2)
console.log(total.display)  // "¥199.80"
```

### 2. 实体 (Entity)

**特点**：有唯一 ID、有业务行为、可变

**使用场景**：CartItem（购物车项）、OrderItem（订单项）

**示例**：
```typescript
// app/domain/cart/CartItemEntity.ts

export class CartItem {
  private _id: string
  private _productId: string
  private _quantity: number
  private _price: Money
  private _stock: number
  
  constructor(params: {
    id: string
    productId: string
    quantity: number
    price: number
    stock: number
  }) {
    this._id = params.id
    this._productId = params.productId
    this._price = Money.of(params.price)
    this._quantity = params.quantity
    this._stock = params.stock
    
    this.validate()
  }
  
  private validate(): void {
    if (this._quantity < 1) {
      throw new Error('数量必须大于0')
    }
    if (this._quantity > this._stock) {
      throw new Error('数量不能超过库存')
    }
  }
  
  // Getters
  get id(): string { return this._id }
  get productId(): string { return this._productId }
  get quantity(): number { return this._quantity }
  get price(): Money { return this._price }
  
  // 业务方法
  setQuantity(quantity: number): void {
    if (quantity < 1) throw new Error('数量不能小于1')
    if (quantity > this._stock) throw new Error('超过库存')
    this._quantity = quantity
  }
  
  increaseQuantity(amount: number = 1): void {
    this.setQuantity(this._quantity + amount)
  }
  
  decreaseQuantity(amount: number = 1): void {
    this.setQuantity(this._quantity - amount)
  }
  
  // 业务计算
  calculateSubtotal(): Money {
    return this._price.multiply(this._quantity)
  }
}
```

### 3. 聚合根 (Aggregate Root)

**特点**：聚合的入口、维护一致性、发布领域事件

**使用场景**：Cart（购物车）、Order（订单）

**示例**：
```typescript
// app/domain/cart/Cart.ts

export class CartAggregate {
  private _id: string
  private _items: Map<string, CartItem>
  
  constructor(id: string, items: CartItem[] = []) {
    this._id = id
    this._items = new Map(items.map(item => [item.id, item]))
  }
  
  get id(): string {
    return this._id
  }
  
  get items(): CartItem[] {
    return Array.from(this._items.values())
  }
  
  // 业务方法（命令）
  addItem(item: CartItem): void {
    if (this._items.has(item.id)) {
      throw new Error('商品已存在')
    }
    this._items.set(item.id, item)
  }
  
  removeItem(itemId: string): void {
    if (!this._items.has(itemId)) {
      throw new Error('商品不存在')
    }
    this._items.delete(itemId)
  }
  
  updateItemQuantity(itemId: string, quantity: number): void {
    const item = this._items.get(itemId)
    if (!item) throw new Error('商品不存在')
    
    // 委托给实体的业务方法
    item.setQuantity(quantity)
  }
  
  // 查询方法
  calculateTotal(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.calculateSubtotal()),
      Money.zero()
    )
  }
  
  canCheckout(): boolean {
    return this.items.length > 0
  }
}
```

### 4. 领域服务 (Domain Service)

**特点**：无状态、跨实体逻辑

**使用场景**：复杂验证、跨实体计算

**示例**：
```typescript
// app/domain/cart/CartPolicyService.ts

export class CartPolicyService {
  /**
   * 合并购物车商品
   * 如果商品已存在，则增加数量；否则添加新商品
   */
  mergeCartItem(cart: CartAggregate, newItem: CartItem): void {
    const existingItem = cart.items.find(
      item => item.productId === newItem.productId
    )
    
    if (existingItem) {
      existingItem.increaseQuantity(newItem.quantity)
    } else {
      cart.addItem(newItem)
    }
  }
  
  /**
   * 验证购物车是否可以结算
   */
  validateCheckout(cart: CartAggregate): string[] {
    const errors: string[] = []
    
    if (cart.items.length === 0) {
      errors.push('购物车为空')
    }
    
    return errors
  }
}
```

### 5. 应用服务 (Application Service)

**特点**：协调领域对象、管理事务、处理用例

**示例**：
```typescript
// app/application/cart/CartApplicationService.ts

export class CartApplicationService {
  constructor(
    private cartRepository: ICartRepository,
    private cartPolicyService: CartPolicyService
  ) {}
  
  /**
   * 用例：添加商品到购物车
   */
  async addToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    // 1. 获取聚合根
    let cart = await this.cartRepository.findById(userId)
    if (!cart) {
      cart = new CartAggregate(userId)
    }
    
    // 2. 创建实体
    const newItem = new CartItem({
      id: `item-${Date.now()}`,
      productId,
      quantity,
      price: 99.9,  // 应从商品服务获取
      stock: 999
    })
    
    // 3. 使用领域服务
    this.cartPolicyService.mergeCartItem(cart, newItem)
    
    // 4. 保存聚合根
    await this.cartRepository.save(cart)
  }
  
  /**
   * 用例：更新商品数量
   */
  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<void> {
    const cart = await this.cartRepository.findById(userId)
    if (!cart) throw new Error('购物车不存在')
    
    // 调用聚合根的业务方法
    cart.updateItemQuantity(itemId, quantity)
    
    await this.cartRepository.save(cart)
  }
}
```

## 简化实践指南

### 阶段 1：从值对象开始

**创建 Money 值对象**：
```typescript
// 1. 在 domain/shared 中创建
// 2. 在实体和聚合根中使用
// 3. 替换所有原始类型的金额
```

### 阶段 2：实体化

**将数据对象改造为实体**：
```typescript
// Before: 纯数据
interface CartItem {
  id: string
  quantity: number
  price: number
}

// After: 实体（有行为）
class CartItem {
  private _quantity: number
  
  setQuantity(value: number): void {
    if (value < 1) throw new Error('数量必须大于0')
    this._quantity = value
  }
  
  calculateSubtotal(): Money {
    return this._price.multiply(this._quantity)
  }
}
```

### 阶段 3：聚合根化

**封装业务不变性**：
```typescript
// Before: Store 直接操作
store.items.push(newItem)

// After: 通过聚合根
cart.addItem(newItem)  // 在这里验证业务规则
```

### 阶段 4：应用服务化

**协调用例**：
```typescript
// Before: Composable 包含所有逻辑
export function useCart() {
  async function addToCart(productId, quantity) {
    // 验证、调用 API、更新 Store...混在一起
  }
}

// After: 应用服务 + Composable
// 应用服务：业务协调
export class CartApplicationService {
  async addToCart(userId, productId, quantity) {
    // 获取聚合根、执行业务逻辑、保存
  }
}

// Composable：UI 逻辑
export function useCart() {
  const appService = new CartApplicationService(...)
  
  async function addToCart(productId, quantity) {
    try {
      await appService.addToCart(currentUserId, productId, quantity)
    } catch (e) {
      handleError(e)
    }
  }
}
```

## 实际案例：购物车模块

### 目录结构

```
app/
├── domain/cart/
│   ├── Cart.ts                    # 聚合根
│   ├── CartItemEntity.ts          # 实体
│   ├── CartPolicyService.ts       # 领域服务
│   └── ICartRepository.ts         # 仓储接口
│
├── application/cart/
│   └── CartApplicationService.ts  # 应用服务
│
├── infrastructure/repositories/
│   └── CartHttpRepository.ts      # 仓储实现
│
├── stores/
│   └── cart.ts                    # Store（简化为状态容器）
│
└── composables/
    └── useCart.ts                 # Composable（UI 逻辑）
```

### 数据流

```
UI 组件
  ↓ 调用
Composable (useCart)
  ↓ 调用
Store (useCartStore)
  ↓ 调用
Application Service (CartApplicationService)
  ↓ 使用
Domain Service (CartPolicyService)
  ↓ 操作
Aggregate Root (CartAggregate)
  ↓ 包含
Entity (CartItem)
  ↓ 使用
Value Object (Money)
```

## 常见问题

**Q: 是否所有模块都要使用 DDD？**
A: 不需要。只在复杂业务场景使用。简单 CRUD 用普通架构即可。

**Q: 值对象一定要用吗？**
A: 强烈推荐 Money。其他视情况而定。

**Q: Store 还有用吗？**
A: 有用，但职责变了：
- ✅ 管理 UI 状态（loading、error）
- ✅ 缓存聚合根
- ❌ 不再包含业务逻辑

**Q: 性能会受影响吗？**
A: 影响很小。类的实例化成本可忽略，换来的是更好的可维护性。

**Q: 如何测试？**
A: DDD 更容易测试：
- 值对象、实体、聚合根：纯函数测试
- 领域服务：单元测试
- 应用服务：Mock 仓储测试

## 开发检查清单

DDD 模块开发前确认：

- [ ] 创建值对象（Money 等）
- [ ] 创建实体（CartItem 等）
- [ ] 创建聚合根（Cart 等）
- [ ] 定义仓储接口（ICartRepository）
- [ ] 实现仓储（CartHttpRepository）
- [ ] 创建领域服务（如需要）
- [ ] 创建应用服务（CartApplicationService）
- [ ] 简化 Store（只保留状态管理）
- [ ] 更新 Composable（调用应用服务）
- [ ] 更新页面组件

## 总结

**DDD 的核心价值**：
1. 业务逻辑集中在领域层，易于理解和维护
2. 通过聚合根维护数据一致性
3. 通过值对象避免原始类型滥用
4. 通过领域服务封装跨实体逻辑

**记住**：
- 不要过度设计，从简单开始
- 只在复杂业务使用 DDD
- 渐进式引入，不要一次性重构所有代码

---

**完整 DDD 规范**：参考项目 `/docs/DDD-DEVELOPMENT-GUIDE.md`

**最后更新**：2025-01-11
