/**
 * 订单列表 Composable
 *
 * 职责:
 * - 管理订单列表状态
 * - 处理订单操作(取消、确认收货、删除)
 * - 提供分页和筛选功能
 */

import { ref, computed } from 'vue'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import { OrderTransformer } from '~/infrastructure/transformers/orderTransformer'
import { OrderStatus } from '~/types/api/order'

export function useOrders() {
  const toast = useToastMessage()
  const { confirm } = useModal()

  // 状态
  const orders = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentStatus = ref<OrderStatus>(OrderStatus.ALL)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 计算属性
  const hasMore = computed(() => {
    return currentPage.value * pageSize.value < total.value
  })

  const isEmpty = computed(() => {
    return !loading.value && orders.value.length === 0
  })

  /**
   * 加载订单列表
   */
  async function loadOrders(status: OrderStatus = OrderStatus.ALL, page: number = 1) {
    loading.value = true
    error.value = null

    // 将前端状态映射为后端接口参数
    // 0：全部，5：待付款，1：待收货，4：待自提，3：待评价
    let apiStatus: string | number = 0
    
    switch (status) {
      case OrderStatus.ALL:
        apiStatus = 0
        break
      case OrderStatus.PENDING_PAYMENT:
        apiStatus = 5
        break
      case OrderStatus.SHIPPED:
        apiStatus = 1
        break
      case OrderStatus.PENDING_PICKUP:
        apiStatus = 4
        break
      case OrderStatus.PENDING_REVIEW:
        apiStatus = 3
        break
      case OrderStatus.AFTER_SALES:
        apiStatus = 'AFTER_SALES' // 假设售后有单独的标记或单独接口
        break
      default:
        apiStatus = 0
    }

    try {
      const response = await orderApiClient.getOrderList({
        status: apiStatus,
        page,
        page_size: pageSize.value,
      })

      const result = OrderTransformer.toOrderListModel(response)

      if (page === 1) {
        orders.value = result.orders
      } else {
        orders.value = [...orders.value, ...result.orders]
      }

      total.value = result.total
      currentPage.value = page
      currentStatus.value = status
    } catch (err: any) {
      error.value = err.message || '加载订单失败'
      toast.show(error.value || '加载订单失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换订单状态
   */
  async function changeStatus(status: OrderStatus) {
    if (status === currentStatus.value) return
    await loadOrders(status, 1)
  }

  /**
   * 加载更多
   */
  async function loadMore() {
    if (!hasMore.value || loading.value) return
    await loadOrders(currentStatus.value, currentPage.value + 1)
  }

  /**
   * 刷新当前列表
   */
  async function refresh() {
    await loadOrders(currentStatus.value, 1)
  }

  /**
   * 取消订单
   */
  async function cancelOrder(orderId: string) {
    return new Promise<boolean>((resolve) => {
      confirm({
        title: '取消订单',
        content: '确定要取消这个订单吗?',
        onConfirm: async () => {
          try {
            await orderApiClient.cancelOrder(orderId)
            toast.show('订单已取消')
            await refresh()
            resolve(true)
          } catch (err: any) {
            toast.show(err.message || '取消订单失败')
            resolve(false)
          }
        },
        onCancel: () => {
          resolve(false)
        },
      })
    })
  }

  /**
   * 确认收货
   */
  async function confirmReceipt(orderId: string) {
    return new Promise<boolean>((resolve) => {
      confirm({
        title: '确认收货',
        content: '确定已收到商品吗?',
        onConfirm: async () => {
          try {
            await orderApiClient.confirmReceipt(orderId)
            toast.show('确认收货成功')
            await refresh()
            resolve(true)
          } catch (err: any) {
            toast.show(err.message || '确认收货失败')
            resolve(false)
          }
        },
        onCancel: () => {
          resolve(false)
        },
      })
    })
  }

  /**
   * 删除订单
   */
  async function deleteOrder(orderId: string) {
    return new Promise<boolean>((resolve) => {
      confirm({
        title: '删除订单',
        content: '确定要删除这个订单吗?删除后无法恢复。',
        onConfirm: async () => {
          try {
            await orderApiClient.deleteOrder(orderId)
            toast.show('订单已删除')
            await refresh()
            resolve(true)
          } catch (err: any) {
            toast.show(err.message || '删除订单失败')
            resolve(false)
          }
        },
        onCancel: () => {
          resolve(false)
        },
      })
    })
  }

  /**
   * 立即支付
   */
  function payNow(orderId: string) {
    // 跳转到支付页面
    navigateTo(`/payment?orderId=${orderId}`)
  }

  /**
   * 再次购买
   */
  function buyAgain(orderId: string) {
    // TODO: 实现再次购买逻辑
    toast.show('功能开发中')
  }

  /**
   * 查看物流
   */
  function viewLogistics(orderId: string) {
    // TODO: 实现查看物流逻辑
    toast.show('功能开发中')
  }

  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  return {
    // 状态
    orders,
    loading,
    error,
    currentStatus,
    currentPage,
    pageSize,
    total,
    totalPages,
    hasMore,
    isEmpty,

    // 方法
    loadOrders,
    changeStatus,
    loadMore,
    refresh,
    cancelOrder,
    confirmReceipt,
    deleteOrder,
    payNow,
    buyAgain,
    viewLogistics,
  }
}
