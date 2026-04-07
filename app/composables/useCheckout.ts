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

import { orderApiClient, addressApiClient, couponApiClient, storeApiClient } from '~/infrastructure/http/clients'
import {
  OrderTransformer,
  type IOrderCalculateModel,
  type IAddressModel,
  type ICouponModel,
} from '~/infrastructure/transformers'
import { useCart } from './useCart'
import { MoneyValueObject } from '~/shared/value-objects'
import type { ICreateOrderRequest } from '~/infrastructure/http/clients/OrderApiClient'
import type { IStoreItem } from '~/infrastructure/http/clients/StoreApiClient'
import { HttpStatus } from '~/types/http'

export interface IPickupStore {
  id: string
  name: string
  address: string
  phone: string
}

export interface ICheckoutForm {
  // 配送方式
  receiptType: 'logistics' | 'express' | 'ziti' | 'merchant'
  // 地址信息
  selectedAddressId?: string
  // 自提信息
  pickupName: string
  pickupPhone: string
  pickupProvince: string
  pickupCity: string
  selectedStoreId?: string
  // 优惠券
  couponCode?: string
  notUseCoupon: boolean
  // 积分
  usePoint: boolean
  pointUse: number
  useFullPoint: boolean
  // 发票
  needInvoice: boolean
  invoiceType?: 'individual' | 'enterprise'
  invoiceContent?: any
}

export function useCheckout() {
  const { t } = useI18n()
  const route = useRoute()
  const { cartUI, items } = useCart()

  // 状态
  const loading = ref(false)
  const initialAddressesLoading = ref(true)
  const calculating = ref(false)
  const error = ref<string | null>(null)

  // 地址列表
  const addresses = ref<IAddressModel[]>([])
  const selectedAddress = ref<IAddressModel | null>(null)

  // 优惠券列表
  const coupons = ref<ICouponModel[]>([])
  const selectedCoupon = ref<ICouponModel | null>(null)

  // 门店/自提点
  const stores = ref<IPickupStore[]>([])
  const selectedStore = ref<IPickupStore | null>(null)
  const storesLoading = ref(false)

  // 订单计算结果
  const calculateResult = ref<IOrderCalculateModel | null>(null)
  // 结算错误
  const checkoutError = ref<{ code: number; message: string } | null>(null)

  // 表单数据
  const form = ref<ICheckoutForm>({
    receiptType: 'logistics',
    pickupName: '',
    pickupPhone: '',
    pickupProvince: '',
    pickupCity: '',
    notUseCoupon: true,
    usePoint: false,
    pointUse: 0,
    useFullPoint: false,
    needInvoice: false,
  })

  /*
   * 加载地址列表
   */
  const loadAddresses = async () => {
    try {
      loading.value = true
      initialAddressesLoading.value = true
      const response = await addressApiClient.getAddressList()
      addresses.value = OrderTransformer.toAddressModelList(response)

      // 自动选择默认地址
      const defaultAddress = addresses.value.find((addr) => addr.isDefault)
      if (defaultAddress) {
        selectedAddress.value = defaultAddress
        form.value.selectedAddressId = defaultAddress.id
      } else if (addresses.value.length > 0) {
        const firstAddress = addresses.value[0] as IAddressModel
        selectedAddress.value = firstAddress
        form.value.selectedAddressId = firstAddress.id
      }
    } catch (err: any) {
      error.value = err.message || t('ab027ee5.7d8904')
      throw err
    } finally {
      loading.value = false
      initialAddressesLoading.value = false
    }
  }

  /**
   * 选择地址
   */
  const selectAddress = (addressId: string) => {
    const address = addresses.value.find((addr) => addr.id === addressId)
    if (address) {
      selectedAddress.value = address
      form.value.selectedAddressId = addressId
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
   * 查询门店列表
   */
  const searchStores = async () => {
    try {
      storesLoading.value = true
      const response = await storeApiClient.getStoreList({
        province: form.value.pickupProvince || undefined,
        city: form.value.pickupCity || undefined,
      })

      const rawList = Array.isArray(response) ? response : (response?.list || response?.data || [])
      stores.value = rawList.map((item: IStoreItem) => ({
        id: item.store_id,
        name: item.store_name,
        address: item.address,
        phone: item.telephone,
      }))

      // 自动选中第一个
      if (stores.value.length > 0 && !selectedStore.value) {
        selectStore(stores.value[0]!.id)
      }
    } catch (err: any) {
      console.error('查询门店失败:', err)
      stores.value = []
    } finally {
      storesLoading.value = false
    }
  }

  /**
   * 选择门店
   */
  const selectStore = (storeId: string) => {
    const store = stores.value.find((s) => s.id === storeId)
    if (store) {
      selectedStore.value = store
      form.value.selectedStoreId = storeId
    }
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
    try {
      calculating.value = true
      error.value = null

      // 构建计算参数
      const mode = (route.query.mode as string) || 'cart'
      const params: any = {
        distributor_id: '0', // TODO: 从配置或用户信息获取
        cart_type: mode,
        order_type: 'normal',
        receipt_type: form.value.receiptType,
        not_use_coupon: form.value.notUseCoupon ? 1 : 0,
        point_use: form.value.usePoint ? form.value.pointUse : 0,
      }

      // 快递配送需要地址信息
      if (form.value.receiptType === 'logistics' && selectedAddress.value) {
        params.receiver_name = selectedAddress.value.name
        params.receiver_mobile = selectedAddress.value.phone
        params.receiver_state = selectedAddress.value.province
        params.receiver_city = selectedAddress.value.city
        params.receiver_district = selectedAddress.value.district
        params.receiver_address = selectedAddress.value.detail
      }

      // 自提需要自提点信息
      if (form.value.receiptType === 'ziti' && selectedStore.value) {
        params.pickup_location = selectedStore.value.id
        params.receiver_name = form.value.pickupName
        params.receiver_mobile = form.value.pickupPhone
      }

      // 优惠券
      if (!form.value.notUseCoupon && form.value.couponCode) {
        params.coupon_discount = form.value.couponCode
      }

      const response = await orderApiClient.calculateOrder(params, {
        skipErrorCodes: [HttpStatus.UNPROCESSABLE_ENTITY],
      })
      calculateResult.value = OrderTransformer.toCalculateModel(response)

      // 如果开启了积分抵扣，更新最大可用积分
      if (calculateResult.value.isOpenDeductPoint) {
        // 如果选择了全额抵扣，更新积分使用量
        if (form.value.useFullPoint) {
          form.value.pointUse = calculateResult.value.maxPoint
        }
      }
    } catch (err: any) {
      console.error('计算订单金额失败:', err)

      // 拦截 422 错误 (业务逻辑错误，如商品库存不足、无效商品等)
      if (isUnprocessableEntity(err)) {
        checkoutError.value = {
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: err.data?.message || err.message || t('ab027ee5.0d5a59'),
        }
      } else {
        error.value = err.message || t('ab027ee5.a4d7e0')
      }
    } finally {
      calculating.value = false
    }
  }

  /**
   * 创建订单
   */
  const createOrder = async (
    payType: string
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!selectedAddress.value && form.value.receiptType === 'logistics') {
      return { success: false, error: t('ab027ee5.4a0460') }
    }

    try {
      loading.value = true
      error.value = null
      checkoutError.value = null

      // 构建创建订单参数
      const mode = (route.query.mode as string) || 'cart'
      const params: ICreateOrderRequest = {
        distributor_id: '0', // TODO: 从配置或用户信息获取
        cart_type: mode as any,
        order_type: 'normal',
        receipt_type: form.value.receiptType,
        pay_type: payType as any,
        not_use_coupon: form.value.notUseCoupon ? 1 : 0,
        point_use: form.value.usePoint ? form.value.pointUse : 0,
      }

      // 快递配送需要地址信息
      if (form.value.receiptType === 'logistics' && selectedAddress.value) {
        params.receiver_name = selectedAddress.value.name
        params.receiver_mobile = selectedAddress.value.phone
        params.receiver_state = selectedAddress.value.province
        params.receiver_city = selectedAddress.value.city
        params.receiver_district = selectedAddress.value.district
        params.receiver_address = selectedAddress.value.detail
      }

      // 自提需要自提点信息
      if (form.value.receiptType === 'ziti' && selectedStore.value) {
        params.pickup_location = selectedStore.value.id
        params.receiver_name = form.value.pickupName
        params.receiver_mobile = form.value.pickupPhone
      }

      // 优惠券
      if (!form.value.notUseCoupon && form.value.couponCode) {
        params.coupon_discount = form.value.couponCode
      }

      // 发票（Apifox 请求参数 invoice_content 为 string，对象需序列化）
      if (form.value.needInvoice && form.value.invoiceType) {
        params.invoice_type = form.value.invoiceType
        const raw = form.value.invoiceContent
        params.invoice_content =
          typeof raw === 'string' ? raw : raw != null ? JSON.stringify(raw) : undefined
      }

      const response = await orderApiClient.createOrder(params, {
        skipErrorCodes: [HttpStatus.UNPROCESSABLE_ENTITY],
      })

      return {
        success: true,
        orderId: response.order_id || response.trade_info?.order_id,
      }
    } catch (err: any) {
      // 同样拦截 422
      if (isUnprocessableEntity(err)) {
        checkoutError.value = {
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: err.data?.message || err.message || t('ab027ee5.9d9cf9'),
        }
        return { success: false, error: checkoutError.value.message }
      }

      error.value = err.message || t('ab027ee5.04f73e')
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
    return '--'
  })

  /**
   * 计算运费显示
   */
  const freightDisplay = computed(() => {
    if (calculateResult.value) {
      if (calculateResult.value.freightFee === 0) {
        return t('ab027ee5.aa2c91')
      }
      return MoneyValueObject.of(calculateResult.value.freightFee).display
    }
    return '--'
  })

  /**
   * 计算优惠显示
   */
  const discountDisplay = computed(() => {
    if (calculateResult.value) {
      return MoneyValueObject.of(calculateResult.value.discountFee).display
    }
    return '--'
  })

  /**
   * 计算总计显示
   */
  const totalDisplay = computed(() => {
    if (calculateResult.value) {
      return MoneyValueObject.of(calculateResult.value.totalFee).display
    }
    return '--'
  })

  /**
   * 计算商品数量
   */
  const itemCount = computed(() => {
    return checkoutItems.value.length
  })

  /**
   * 计算商品总数量
   */
  const totalItemNum = computed(() => {
    if (calculateResult.value) {
      return calculateResult.value.totalItemNum
    }
    return 0
  })

  /**
   * 结算商品列表
   */
  const checkoutItems = computed(() => {
    return calculateResult.value?.items || []
  })

  return {
    // 状态
    loading: readonly(loading),
    initialAddressesLoading: readonly(initialAddressesLoading),
    calculating: readonly(calculating),
    error: readonly(error),
    checkoutError: readonly(checkoutError),
    storesLoading: readonly(storesLoading),

    // 数据
    addresses: readonly(addresses),
    selectedAddress: readonly(selectedAddress),
    coupons: readonly(coupons),
    selectedCoupon: readonly(selectedCoupon),
    stores: readonly(stores),
    selectedStore: readonly(selectedStore),
    calculateResult: readonly(calculateResult),
    checkoutItems,
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
    searchStores,
    selectStore,
    toggleUsePoint,
    toggleUseFullPoint,
    calculateOrderAmount,
    createOrder,
  }
}

/**
 * 判断是否为 422 错误
 */
function isUnprocessableEntity(err: any): boolean {
  // code: 业务错误码 (from createBusinessError)
  // status: HTTP 状态码 (from createHttpError)
  return (
    err.code === HttpStatus.UNPROCESSABLE_ENTITY || err.status === HttpStatus.UNPROCESSABLE_ENTITY
  )
}
