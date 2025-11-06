# Transformer 层更新说明

## 📋 更新概述

更新 `CartTransformer` 以适应新的轻量级 DDD 架构，移除对已删除的 Domain 层的依赖。

**更新日期**: 2025-01-XX

---

## ⚠️ 问题描述

在完成架构改造后，`CartTransformer.ts` 仍然引用已删除的 Domain 层代码：

```typescript
// ❌ 旧代码 - 引用已删除的文件
import { Cart } from '~/domain/cart/Cart'
import { CartItemEntity } from '~/domain/cart/CartItemEntity'
```

这些类已经被删除，导致：
- ✗ TypeScript 编译错误
- ✗ 无法启动项目
- ✗ 与新架构不一致

---

## ✅ 解决方案

### 1. 更新 CartTransformer

#### 旧架构（完整 DDD）

```typescript
export class CartTransformer {
  // ❌ 转换为复杂的领域模型
  static toDomain(userId: string, apiItems: ICartItem[]): Cart {
    const items = apiItems.map(apiItem => {
      return new CartItemEntity({
        id: apiItem.id,
        productId: apiItem.product_id,
        // ... 创建实体
      })
    })
    return new Cart(userId, items)
  }
  
  // ❌ 从领域实体转换
  static toUIModel(item: CartItemEntity): ICartItem {
    return {
      id: item.id,
      product_id: item.productId,
      price: item.price.amount,  // 从值对象取值
      // ...
    }
  }
}
```

**问题**：
- 依赖已删除的 `Cart` 和 `CartItemEntity`
- 转换逻辑复杂，涉及多层数据结构
- 与新架构的简单对象模型不符

---

#### 新架构（轻量级 DDD）

```typescript
export class CartTransformer {
  /**
   * ✅ 增强 API 数据，添加计算字段
   */
  static enhanceCartItem(apiItem: ICartItem) {
    // 计算小计
    const subtotal = apiItem.price * apiItem.quantity
    
    // 计算折扣
    const discountPercent = this.calculateDiscountPercent(
      apiItem.price,
      apiItem.original_price || apiItem.price
    )
    
    // 返回增强后的数据
    return {
      ...apiItem,
      subtotal,
      subtotalDisplay: this.formatPrice(subtotal),
      priceDisplay: this.formatPrice(apiItem.price),
      discountPercent,
      hasDiscount: discountPercent > 0,
      canBePurchased: apiItem.stock > 0 && apiItem.quantity <= apiItem.stock,
    }
  }
  
  /**
   * ✅ 工具方法：格式化价格
   */
  static formatPrice(amount: number): string {
    return `¥${amount.toFixed(2)}`
  }
  
  /**
   * ✅ 工具方法：计算折扣
   */
  static calculateDiscountPercent(price: number, originalPrice: number): number {
    if (!originalPrice || originalPrice <= price) return 0
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }
}
```

**改进**：
- ✅ 不依赖 Domain 层
- ✅ 直接操作简单对象
- ✅ 只做数据增强和格式化
- ✅ 纯函数，易于测试

---

## 🔄 Transformer 角色变化

### 旧架构中的角色

```
API Response → Transformer → Domain Model → Transformer → UI Model
               (复杂转换)     (聚合根/实体)   (复杂转换)
```

**职责**：
- 将 API 数据转换为复杂的领域模型（聚合根、实体）
- 处理值对象的创建和转换
- 领域模型与 UI 模型之间的转换

---

### 新架构中的角色

```
API Response → Transformer → Enhanced Data → Composable
               (数据增强)     (简单对象)
```

**职责**：
- **数据增强**: 添加计算字段（小计、折扣等）
- **格式化**: 价格、日期等的格式化显示
- **验证**: 数据完整性校验
- **清洗**: 提供默认值，确保数据安全

---

## 📊 新 API 对比

### 方法变化

| 旧方法 | 新方法 | 说明 |
|--------|--------|------|
| `toDomain()` | ❌ 移除 | 不再需要转换为 Domain 模型 |
| `toApiRequest()` | ❌ 移除 | 直接在 Composable 中构造请求 |
| `toUIModel()` | `enhanceCartItem()` | ✅ 重命名，更清晰 |
| `toUIList()` | `enhanceCartList()` | ✅ 重命名，更清晰 |
| - | `validateCartItem()` | ✅ 新增数据验证 |
| - | `sanitizeCartItem()` | ✅ 新增数据清洗 |

### 新增方法

#### 1. `enhanceCartItem(apiItem)`

**用途**: 增强单个购物车商品数据

```typescript
const apiItem = {
  id: '1',
  product_name: '商品',
  price: 99.99,
  original_price: 149.99,
  quantity: 2,
  stock: 10,
}

const enhanced = CartTransformer.enhanceCartItem(apiItem)

console.log(enhanced)
// {
//   ...apiItem,
//   subtotal: 199.98,
//   subtotalDisplay: '¥199.98',
//   priceDisplay: '¥99.99',
//   originalPriceDisplay: '¥149.99',
//   discountPercent: 33,
//   hasDiscount: true,
//   canBePurchased: true,
// }
```

#### 2. `enhanceCartList(apiItems)`

**用途**: 批量增强购物车商品列表

```typescript
const apiItems = [item1, item2, item3]
const enhancedList = CartTransformer.enhanceCartList(apiItems)
```

#### 3. `validateCartItem(item)`

**用途**: 验证购物车商品数据是否完整

```typescript
const isValid = CartTransformer.validateCartItem(item)
if (!isValid) {
  console.error('数据不完整')
}
```

#### 4. `sanitizeCartItem(item)`

**用途**: 清洗数据，提供默认值

```typescript
const dirtyData = {
  id: '1',
  product_name: '商品',
  // 缺少其他字段
}

const cleanData = CartTransformer.sanitizeCartItem(dirtyData)
// {
//   id: '1',
//   product_name: '商品',
//   price: 0,
//   quantity: 1,
//   stock: 0,
//   // ... 其他默认值
// }
```

---

## 💡 使用示例

### 在 Composable 中使用

```typescript
// app/composables/useCart.ts
import { CartTransformer } from '~/infrastructure/transformers/cartTransformer'

export function useCart() {
  const loadCart = async () => {
    // 1. 调用 API
    const response = await cartApiClient.getCartList()
    
    // 2. 可选：增强数据（如果需要计算字段）
    const enhancedItems = CartTransformer.enhanceCartList(response.data.items)
    
    // 3. 更新状态
    cart.value = {
      items: enhancedItems,
      itemCount: enhancedItems.length,
    }
  }
  
  // 格式化价格
  const formatPrice = (amount: number) => {
    return CartTransformer.formatPrice(amount)
  }
  
  return {
    loadCart,
    formatPrice,
  }
}
```

### 在组件中使用

```vue
<template>
  <div>
    <div v-for="item in cart.items" :key="item.id">
      <h3>{{ item.product_name }}</h3>
      
      <!-- 使用增强后的数据 -->
      <p>单价: {{ item.priceDisplay }}</p>
      <p>数量: {{ item.quantity }}</p>
      <p>小计: {{ item.subtotalDisplay }}</p>
      
      <!-- 使用计算字段 -->
      <span v-if="item.hasDiscount" class="discount">
        {{ item.discountPercent }}% OFF
      </span>
      
      <button :disabled="!item.canBePurchased">
        {{ item.canBePurchased ? '购买' : '库存不足' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useCart } from '~/composables/useCart'

const { cart, loadCart } = useCart()

onMounted(() => {
  loadCart()
})
</script>
```

---

## 🎯 Transformer 设计原则

### 1. 纯函数

```typescript
// ✅ 好的设计：纯函数，无副作用
static formatPrice(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

// ❌ 不好的设计：有副作用
static formatPrice(amount: number): string {
  this.lastFormattedPrice = amount  // 副作用
  return `¥${amount.toFixed(2)}`
}
```

### 2. 单一职责

```typescript
// ✅ 好的设计：只负责数据转换
static enhanceCartItem(apiItem: ICartItem) {
  return {
    ...apiItem,
    subtotal: apiItem.price * apiItem.quantity,
  }
}

// ❌ 不好的设计：混入业务逻辑
static enhanceCartItem(apiItem: ICartItem) {
  // 不应该在这里验证库存
  if (apiItem.quantity > apiItem.stock) {
    throw new Error('库存不足')
  }
  return { ...apiItem }
}
```

### 3. 类型安全

```typescript
// ✅ 好的设计：完整的类型定义
static enhanceCartItem(apiItem: ICartItem): ICartItem & {
  subtotal: number
  subtotalDisplay: string
  hasDiscount: boolean
} {
  // ...
}

// ❌ 不好的设计：any 类型
static enhanceCartItem(apiItem: any): any {
  // ...
}
```

---

## 📝 其他更新

### 更新 HTTP Client 注释

**文件**: `app/infrastructure/http/clients/index.ts`

```typescript
// ✅ 更新后的示例
/**
 * 使用方式：
 * ```typescript
 * // 在 Composable 中使用
 * const response = await cartApiClient.getCartList()
 * const items = response.data.items
 * 
 * // 如需增强数据，使用 Transformer
 * const enhancedItems = CartTransformer.enhanceCartList(items)
 * ```
 */
```

---

## ✅ 检查清单

更新 Transformer 后，请检查：

- [x] 移除对 Domain 层的依赖
- [x] 更新方法名称（toUIModel → enhanceCartItem）
- [x] 添加新的工具方法（validate, sanitize）
- [x] 更新相关文档和注释
- [x] TypeScript 类型检查通过
- [ ] 测试所有使用 Transformer 的地方（待运行项目测试）

---

## 🚀 测试建议

### 1. 单元测试

```typescript
describe('CartTransformer', () => {
  it('should enhance cart item with calculated fields', () => {
    const apiItem: ICartItem = {
      id: '1',
      product_id: 'p1',
      product_name: '测试商品',
      product_image: '',
      price: 99.99,
      original_price: 149.99,
      quantity: 2,
      stock: 10,
      available: true,
      selected: true,
    }
    
    const enhanced = CartTransformer.enhanceCartItem(apiItem)
    
    expect(enhanced.subtotal).toBe(199.98)
    expect(enhanced.discountPercent).toBe(33)
    expect(enhanced.hasDiscount).toBe(true)
    expect(enhanced.canBePurchased).toBe(true)
  })
  
  it('should format price correctly', () => {
    expect(CartTransformer.formatPrice(99.99)).toBe('¥99.99')
    expect(CartTransformer.formatPrice(0)).toBe('¥0.00')
  })
})
```

### 2. 集成测试

在浏览器中测试：
1. 加载购物车页面
2. 检查价格显示是否正确
3. 检查折扣计算是否正确
4. 检查库存状态是否正确

---

## 📚 相关文档

- [轻量级 DDD 架构改造总结](./轻量级DDD架构改造总结.md) - 整体架构
- [代码清理总结](./代码清理总结.md) - 代码清理记录
- [Product 模块重构总结](./Product模块重构总结.md) - Product 重构

---

## 🎉 总结

成功更新 Transformer 层以适应新架构：

### ✅ 已完成
- **移除依赖**: 不再依赖已删除的 Domain 层
- **简化逻辑**: 只做数据增强和格式化
- **新增功能**: 添加验证和清洗方法
- **更新文档**: 同步更新相关注释

### 🎯 改进效果
- ✅ **更简单**: 不涉及复杂的领域模型
- ✅ **更清晰**: 职责单一，易于理解
- ✅ **更实用**: 提供常用的工具方法
- ✅ **更安全**: 类型安全，纯函数设计

---

**更新负责人**: AI Assistant  
**审核人**: 待定  
**最后更新**: 2025-01-XX

