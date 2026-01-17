/**
 * 结算业务组合式函数
 * 
 * 职责：
 * - 管理结算页面状态和业务逻辑
 * - 封装订单计算、创建等业务规则
 * - 提供统一的 API 给视图层
 * 
 * 架构：方案 2（简化架构 - 无 Store）
 * - 不需要跨组件共享状态（结算页面是单页面流程）
 * - 不需要持久化（订单创建后跳转到支付页面）
 * - 有复杂的业务逻辑（需要 Composable）
 */

import { orderApiClient, addressApiClient, couponApiClient } from '~/infrastructure/http/clients'
import { OrderTransformer, type IOrderCalculateModel, type IAddressModel, type ICouponModel } from '~/infrastructure/transformers'
import { useCart } from './useCart'
import { MoneyValueObject } from '~/shared/value-objects'
import type { ICreateOrderRequest } from '~/infrastructure/http/clients/OrderApiClient'

export interface ICheckoutForm {
  // 配送方式
  receiptType: 'express' | 'ziti' | 'merchant'
  // 地址信息
  selectedAddressId?: string
  // 优惠券
  couponCode?: string
  notUseCoupon: boolean
  // 积分
  usePoint: boolean
  pointUse: number
  useFullPoint: boolean
  // 发票
  needInvoice: boolean
  invoiceType?: string
  invoiceContent?: any
}

export function useCheckout() {
  const { cartUI, items } = useCart()

  // 状态
  const loading = ref(false)
  const calculating = ref(false)
  const error = ref<string | null>(null)

  // 地址列表
  const addresses = ref<IAddressModel[]>([])
  const selectedAddress = ref<IAddressModel | null>(null)

  // 优惠券列表
  const coupons = ref<ICouponModel[]>([])
  const selectedCoupon = ref<ICouponModel | null>(null)

  // 订单计算结果
  const calculateResult = ref<IOrderCalculateModel | null>(null)

  // 表单数据
  const form = ref<ICheckoutForm>({
    receiptType: 'express',
    notUseCoupon: true,
    usePoint: false,
    pointUse: 0,
    useFullPoint: false,
    needInvoice: false,
  })

  /**
   * 加载地址列表
   */
  const loadAddresses = async () => {
    try {
      loading.value = true
      const response = await addressApiClient.getAddressList()
      addresses.value = OrderTransformer.toAddressModelList(response)

      // 自动选择默认地址
      const defaultAddress = addresses.value.find(addr => addr.isDefault)
      if (defaultAddress) {
        selectedAddress.value = defaultAddress
        form.value.selectedAddressId = defaultAddress.id
      } else if (addresses.value.length > 0) {
        const firstAddress = addresses.value[0] as IAddressModel
        selectedAddress.value = firstAddress
        form.value.selectedAddressId = firstAddress.id
      }
    } catch (err: any) {
      error.value = err.message || '加载地址列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 选择地址
   */
  const selectAddress = (addressId: string) => {
    const address = addresses.value.find(addr => addr.id === addressId)
    if (address) {
      selectedAddress.value = address
      form.value.selectedAddressId = addressId
      // 重新计算订单金额
      calculateOrderAmount()
    }
  }

  /**
   * 加载优惠券列表
   */
  const loadCoupons = async () => {
    try {
      // 如果有订单计算结果，使用订单总金额作为参数
      const totalFee = calculateResult.value?.totalFee || cartUI.value.selectedAmount
      const response = await couponApiClient.getCouponList({
        total_fee: Math.round(totalFee * 100), // 转为分
      })
      coupons.value = OrderTransformer.toCouponModelList(response)
    } catch (err: any) {
      console.error('加载优惠券列表失败:', err)
      // 优惠券加载失败不影响主流程
    }
  }

  /**
   * 选择优惠券
   */
  const selectCoupon = (coupon: ICouponModel) => {
    selectedCoupon.value = coupon
    form.value.couponCode = coupon.couponCode
    form.value.notUseCoupon = false
    // 重新计算订单金额
    calculateOrderAmount()
  }

  /**
   * 取消选择优惠券
   */
  const unselectCoupon = () => {
    selectedCoupon.value = null
    form.value.couponCode = undefined
    form.value.notUseCoupon = true
    // 重新计算订单金额
    calculateOrderAmount()
  }

  /**
   * 切换积分使用
   */
  const toggleUsePoint = () => {
    form.value.usePoint = !form.value.usePoint
    if (!form.value.usePoint) {
      form.value.pointUse = 0
      form.value.useFullPoint = false
    } else if (form.value.useFullPoint && calculateResult.value) {
      form.value.pointUse = calculateResult.value.maxPoint
    }
    calculateOrderAmount()
  }

  /**
   * 切换全额抵扣
   */
  const toggleUseFullPoint = () => {
    form.value.useFullPoint = !form.value.useFullPoint
    if (form.value.useFullPoint && calculateResult.value) {
      form.value.pointUse = calculateResult.value.maxPoint
    } else {
      form.value.pointUse = 0
    }
    calculateOrderAmount()
  }

  /**
   * 计算订单金额
   */
  const calculateOrderAmount = async () => {
    if (!selectedAddress.value && form.value.receiptType === 'express') {
      return
    }

    try {
      calculating.value = true
      error.value = null

      const selectedItems = items.value.filter(item => item.selected)
      if (selectedItems.length === 0) {
        return
      }

      // 构建计算参数
      const params: any = {
        distributor_id: '0', // TODO: 从配置或用户信息获取
        cart_type: 'normal',
        receipt_type: form.value.receiptType,
        not_use_coupon: form.value.notUseCoupon ? 1 : 0,
        point_use: form.value.usePoint ? form.value.pointUse : 0,
      }

      // 快递配送需要地址信息
      if (form.value.receiptType === 'express' && selectedAddress.value) {
        params.receiver_state = selectedAddress.value.province
        params.receiver_city = selectedAddress.value.city
        params.receiver_district = selectedAddress.value.district
        params.receiver_address = selectedAddress.value.detail
      }

      // 自提需要自提点信息
      if (form.value.receiptType === 'ziti') {
        // TODO: 需要选择自提点
      }

      // 优惠券
      if (!form.value.notUseCoupon && form.value.couponCode) {
        params.coupon_discount = form.value.couponCode
      }

      const response = await orderApiClient.calculateOrder(params)
      calculateResult.value = OrderTransformer.toCalculateModel(response)

      // 如果开启了积分抵扣，更新最大可用积分
      if (calculateResult.value.isOpenDeductPoint) {
        // 如果选择了全额抵扣，更新积分使用量
        if (form.value.useFullPoint) {
          form.value.pointUse = calculateResult.value.maxPoint
        }
      }
    } catch (err: any) {
      error.value = err.message || '计算订单金额失败'
      console.error('计算订单金额失败:', err)
    } finally {
      calculating.value = false
    }
  }

  /**
   * 创建订单
   */
  const createOrder = async (payType: string): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!selectedAddress.value && form.value.receiptType === 'express') {
      return { success: false, error: '请选择收货地址' }
    }

    try {
      loading.value = true
      error.value = null

      const selectedItems = items.value.filter(item => item.selected)
      if (selectedItems.length === 0) {
        return { success: false, error: '请选择要结算的商品' }
      }

      // 构建创建订单参数
      const params: ICreateOrderRequest = {
        distributor_id: '0', // TODO: 从配置或用户信息获取
        cart_type: 'normal',
        receipt_type: form.value.receiptType,
        pay_type: payType as any,
        not_use_coupon: form.value.notUseCoupon ? 1 : 0,
        point_use: form.value.usePoint ? form.value.pointUse : 0,
      }

      // 快递配送需要地址信息
      if (form.value.receiptType === 'express' && selectedAddress.value) {
        params.receiver_name = selectedAddress.value.name
        params.receiver_mobile = selectedAddress.value.phone
        params.receiver_state = selectedAddress.value.province
        params.receiver_city = selectedAddress.value.city
        params.receiver_district = selectedAddress.value.district
        params.receiver_address = selectedAddress.value.detail
      }

      // 自提需要自提点信息
      if (form.value.receiptType === 'ziti') {
        // TODO: 需要选择自提点
      }

      // 优惠券
      if (!form.value.notUseCoupon && form.value.couponCode) {
        params.coupon_discount = form.value.couponCode
      }

      // 发票
      if (form.value.needInvoice && form.value.invoiceType) {
        params.invoice_type = form.value.invoiceType
        params.invoice_content = form.value.invoiceContent
      }

      const response = await orderApiClient.createOrder(params)

      return {
        success: true,
        orderId: response.order_id || response.trade_info?.order_id,
      }
    } catch (err: any) {
      error.value = err.message || '创建订单失败'
      return { success: false, error: error.value || undefined }
    } finally {
      loading.value = false
    }
  }

  /**
   * 计算商品总价显示
   */
  const itemTotalDisplay = computed(() => {
    if (calculateResult.value) {
      return MoneyValueObject.of(calculateResult.value.itemFeeNew).display
    }
    return cartUI.value.selectedTotal
  })

  /**
   * 计算运费显示
   */
  const freightDisplay = computed(() => {
    if (calculateResult.value) {
      if (calculateResult.value.freightFee === 0) {
        return '免费'
      }
      return MoneyValueObject.of(calculateResult.value.freightFee).display
    }
    return '免费'
  })

  /**
   * 计算优惠显示
   */
  const discountDisplay = computed(() => {
    if (calculateResult.value) {
      return MoneyValueObject.of(calculateResult.value.discountFee).display
    }
    return '¥ 0.00'
  })

  /**
   * 计算总计显示
   */
  const totalDisplay = computed(() => {
    if (calculateResult.value) {
      return MoneyValueObject.of(calculateResult.value.totalFee).display
    }
    return cartUI.value.selectedTotal
  })

  /**
   * 计算商品数量
   */
  const itemCount = computed(() => {
    return items.value.filter(item => item.selected).length
  })

  /**
   * 计算商品总数量
   */
  const totalItemNum = computed(() => {
    if (calculateResult.value) {
      return calculateResult.value.totalItemNum
    }
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.quantity.value, 0)
  })

  return {
    // 状态
    loading: readonly(loading),
    calculating: readonly(calculating),
    error: readonly(error),

    // 数据
    addresses: readonly(addresses),
    selectedAddress: readonly(selectedAddress),
    coupons: readonly(coupons),
    selectedCoupon: readonly(selectedCoupon),
    calculateResult: readonly(calculateResult),
    form,

    // 计算属性
    itemTotalDisplay,
    freightDisplay,
    discountDisplay,
    totalDisplay,
    itemCount,
    totalItemNum,

    // 方法
    loadAddresses,
    selectAddress,
    loadCoupons,
    selectCoupon,
    unselectCoupon,
    toggleUsePoint,
    toggleUseFullPoint,
    calculateOrderAmount,
    createOrder,
  }
}

