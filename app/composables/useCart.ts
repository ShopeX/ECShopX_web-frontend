/**
 * 购物车业务组合式函数（轻量级 DDD）
 * 
 * 职责：
 * - 管理购物车状态和业务逻辑
 * - 封装业务规则和验证
 * - 提供统一的 API 给视图层
 * 
 * 特点：
 * - 使用值对象保证数据安全
 * - 直接操作简单对象，不使用复杂的领域模型
 * - 业务逻辑内聚在 Composable 中
 * 
 * @example
 * ```vue
 * <script setup>
 * const { 
 *   cart,
 *   loading,
 *   addToCart,
 *   updateQuantity
 * } = useCart()
 * 
 * onMounted(() => {
 *   loadCart()
 * })
 * </script>
 * ```
 */

import { MoneyValueObject, QuantityValueObject, DiscountValueObject } from '~/shared/value-objects'
import { BusinessError } from '~/shared/errors'
import { useCartUIStore } from '~/stores/cartUI'
import { cartApiClient } from '~/infrastructure/http/clients'
import { CartTransformer } from '~/infrastructure/transformers/cartTransformer'
import type { IAddCartRequest, IUpdateCartRequest } from '~/types/api/cart'
import { useMessage } from '~/composables/useMessage'

/**
 * 购物车商品模型（轻量级）
 */
export interface ICartItemModel {
  id: string
  productId: string
  productName: string
  productImage: string
  specId: string
  specName: string
  price: MoneyValueObject
  marketPrice: MoneyValueObject
  quantity: QuantityValueObject
  stock: number
  selected: boolean
}

/**
 * 购物车模型（轻量级）
 */
export interface ICartModel {
  items: ICartItemModel[]
  itemCount: number
  totalQuantity: number
}

/**
 * 购物车 UI 数据接口
 */
export interface ICartUI {
  /** 购物车商品列表 */
  items: {
    id: string
    productId: string
    productName: string
    productImage: string
    specId: string
    specName: string
    price: number
    priceDisplay: string
    marketPrice: number
    marketPriceDisplay: string
    quantity: number
    quantityMin: number
    quantityMax: number
    stock: number
    selected: boolean
    subtotal: number
    subtotalDisplay: string
    canBePurchased: boolean
    hasDiscount: boolean
    discountPercent: number
  }[]
  /** 合计金额显示 */
  total: string
  /** 合计金额数值 */
  totalAmount: number
  /** 选中商品合计显示 */
  selectedTotal: string
  /** 选中商品合计数值 */
  selectedAmount: number
  /** 商品总数 */
  itemCount: number
  /** 选中商品数量 */
  selectedCount: number
  /** 是否全选 */
  isAllSelected: boolean
  /** 是否有选中商品 */
  hasSelectedItems: boolean
  /** 是否可以结算 */
  canCheckout: boolean
  /** 购物车是否为空 */
  isEmpty: boolean
}

/**
 * 购物车业务组合式函数
 */
export function useCart() {
  // ✅ 现在 useMessage 已经是 SSR 安全的，可以直接调用
  const message = useMessage()

  // ✅ Pinia Store 完全支持 SSR，可以直接调用（@pinia/nuxt 已处理）
  const cartUIStore = useCartUIStore()

  // 购物车状态
  const cart = ref<ICartModel>({
    items: [] as ICartItemModel[],
    itemCount: 0,
    totalQuantity: 0
  })
  const error = ref<string | null>(null)
  const loading = computed(() => cartUIStore.loading)

  /**
   * 获取用户 ID（临时实现）
   */
  const getUserId = (): string => {
    // TODO: 从认证服务获取实际的用户 ID
    return 'current-user'
  }

  /**
   * 获取购物车商品列表（类型安全）
   */
  const getCartItems = (): ICartItemModel[] => {
    return cart.value.items as ICartItemModel[]
  }

  // ==================== 业务规则（内聚在 Composable 中） ====================

  /**
   * 验证商品是否可购买
   */
  const canItemBePurchased = (item: ICartItemModel): boolean => {
    return item.stock > 0 && item.quantity.value <= item.stock
  }

  /**
   * 计算商品小计
   */
  const calculateItemSubtotal = (item: ICartItemModel): MoneyValueObject => {
    return item.price.multiply(item.quantity.value)
  }

  /**
   * 计算总金额
   */
  const calculateTotal = (): MoneyValueObject => {
    return getCartItems().reduce<MoneyValueObject>(
      (total, item) => total.add(calculateItemSubtotal(item)),
      MoneyValueObject.zero()
    )
  }

  /**
   * 计算选中商品的总价
   */
  const calculateSelectedTotal = (): MoneyValueObject => {
    return getCartItems()
      .filter((item) => item.selected)
      .reduce<MoneyValueObject>((total, item) => total.add(calculateItemSubtotal(item)), MoneyValueObject.zero())
  }

  /**
   * 获取选中商品数量
   */
  const getSelectedCount = (): number => {
    return getCartItems().filter((item) => item.selected).length
  }

  /**
   * 判断是否全部选中
   */
  const isAllSelected = (): boolean => {
    const availableItems = getCartItems().filter((item) => canItemBePurchased(item))
    if (availableItems.length === 0) {
      return false
    }
    return availableItems.every((item) => item.selected)
  }

  /**
   * 判断是否有选中商品
   */
  const hasSelectedItems = (): boolean => {
    return getCartItems().some((item) => item.selected)
  }

  /**
   * 判断是否可以结算
   */
  const canCheckout = (): boolean => {
    const selectedItems = getCartItems().filter((item) => item.selected)
    if (selectedItems.length === 0) {
      return false
    }
    return selectedItems.every((item) => canItemBePurchased(item))
  }

  /**
   * 计算商品折扣
   * 
   * ✅ 使用 DiscountValueObject 封装折扣计算逻辑
   */
  const calculateDiscount = (item: ICartItemModel): DiscountValueObject => {
    return DiscountValueObject.fromPrices(item.price, item.marketPrice)
  }

  // ==================== UI 数据转换 ====================

  /**
   * 转换为 UI 数据
   */
  const cartUI = computed<ICartUI>(() => {
    if (cart.value.items.length === 0) {
      return {
        items: [],
        total: '¥0.00',
        totalAmount: 0,
        selectedTotal: '¥0.00',
        selectedAmount: 0,
        itemCount: 0,
        selectedCount: 0,
        isAllSelected: false,
        hasSelectedItems: false,
        canCheckout: false,
        isEmpty: true,
      }
    }

    const total = calculateTotal()
    const selectedTotal = calculateSelectedTotal()

    return {
      items: getCartItems().map((item) => {
        const subtotal = calculateItemSubtotal(item)
        const discount = calculateDiscount(item)

        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          specId: item.specId,
          specName: item.specName,
          price: item.price.amount,
          priceDisplay: item.price.display,
          marketPrice: item.marketPrice.amount,
          marketPriceDisplay: item.marketPrice.display,
          quantity: item.quantity.value,
          quantityMin: item.quantity.min,
          quantityMax: item.quantity.max,
          stock: item.stock,
          selected: item.selected,
          subtotal: subtotal.amount,
          subtotalDisplay: subtotal.display,
          canBePurchased: canItemBePurchased(item),
          hasDiscount: discount.hasDiscount(),
          discountPercent: discount.percent,
        }
      }),
      total: total.display,
      totalAmount: total.amount,
      selectedTotal: selectedTotal.display,
      selectedAmount: selectedTotal.amount,
      itemCount: cart.value.itemCount,
      selectedCount: getSelectedCount(),
      isAllSelected: isAllSelected(),
      hasSelectedItems: hasSelectedItems(),
      canCheckout: canCheckout(),
      isEmpty: cart.value.items.length === 0,
    }
  })

  // ==================== API 操作 ====================

  /**
   * 加载购物车
   */
  const loadCart = async () => {
    cartUIStore.setLoading(true)
    error.value = null
    try {
      // ✅ plugin 已自动解包 data，直接获得数据
      const data = await cartApiClient.getCartList()

      // ✅ 使用 Transformer 转换 API 数据为应用模型
      const items = CartTransformer.toModelList(data.items)

      cart.value = {
        items,
        itemCount: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity.value, 0),
      }

      cartUIStore.updateLastUpdateTime()
      cartUIStore.markAsInitialized()
    } catch (err: any) {
      error.value = err.message || '加载购物车失败'
      console.error('Failed to load cart:', err)
      throw err
    } finally {
      cartUIStore.setLoading(false)
    }
  }

  /**
   * 添加商品到购物车
   */
  const addToCart = async (params: {
    productId: string
    specId: string
    quantity: number
    productName?: string
    productImage?: string
    specName?: string
    price?: number
    marketPrice?: number
    stock?: number
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 业务验证
      if (params.quantity <= 0) {
        throw BusinessError.quantityInvalid(params.quantity)
      }

      if (params.stock !== undefined && params.quantity > params.stock) {
        throw BusinessError.insufficientStock(params.productName || '商品', params.stock)
      }

      // API 调用
      const request: IAddCartRequest = {
        product_id: params.productId,
        spec_id: params.specId,
        quantity: params.quantity,
      }

      await cartApiClient.addToCart(request)

      // 重新加载购物车
      await loadCart()

      message.success('已添加到购物车')
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '添加失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 更新商品数量
   */
  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 查找商品
      const item = cart.value.items.find((i) => i.id === itemId)
      if (!item) {
        throw BusinessError.notFound('商品', itemId)
      }

      // 业务验证
      if (quantity <= 0) {
        throw BusinessError.quantityInvalid(quantity)
      }

      if (quantity > item.stock) {
        throw BusinessError.insufficientStock(item.productName, item.stock)
      }

      // API 调用
      const request: IUpdateCartRequest = {
        quantity,
      }

      await cartApiClient.updateCartItem(itemId, request)

      // 重新加载购物车
      await loadCart()

      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '更新失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 删除商品
   */
  const removeItem = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartApiClient.removeCartItem(itemId)
      await loadCart()
      message.success('已删除商品')
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '删除失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 删除选中的商品
   */
  const removeSelectedItems = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 业务验证
      if (!hasSelectedItems()) {
        throw BusinessError.validation('请先选择要删除的商品')
      }

      await cartApiClient.removeSelectedItems()
      await loadCart()
      message.success('已删除选中商品')
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '删除失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 切换商品选中状态
   */
  const toggleItemSelection = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartApiClient.toggleItemSelection(itemId)
      await loadCart()
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '操作失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleAllSelection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const selected = !isAllSelected()
      await cartApiClient.toggleAllSelection(selected)
      await loadCart()
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '操作失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 清空购物车
   */
  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartApiClient.clearCart()
      await loadCart()
      message.success('已清空购物车')
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || '清空失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 验证结算
   */
  const validateCheckout = async (): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const errors: string[] = []

      if (cart.value.items.length === 0) {
        errors.push('购物车为空')
        return { valid: false, errors }
      }

      const selectedItems = cart.value.items.filter((item) => item.selected)
      if (selectedItems.length === 0) {
        errors.push('请选择要结算的商品')
        return { valid: false, errors }
      }

      // 验证每个选中商品
      for (const item of selectedItems as ICartItemModel[]) {
        if (!canItemBePurchased(item)) {
          errors.push(`商品 ${item.productName} 不可购买`)
        }
        if (item.quantity.value > item.stock) {
          errors.push(`商品 ${item.productName} 库存不足`)
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      }
    } catch (err: any) {
      return {
        valid: false,
        errors: [err.message || '验证失败'],
      }
    }
  }

  /**
   * 检查特定商品项的操作是否正在加载
   */
  const isItemLoading = (itemId: string, action: 'update' | 'remove'): boolean => {
    const key = `${action}-${itemId}`
    return cartUIStore.isActionLoading(key)
  }

  return {
    // 响应式状态
    cart: readonly(cart),
    cartUI,
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    removeSelectedItems,
    toggleItemSelection,
    toggleAllSelection,
    clearCart,
    validateCheckout,

    // UI 状态查询
    isItemLoading,
  }
}

