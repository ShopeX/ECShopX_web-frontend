/**
 * 商品业务组合式函数（轻量级 DDD）
 * 
 * 职责：
 * - 管理商品列表和详情的状态和业务逻辑
 * - 封装商品相关的业务规则
 * - 提供统一的 API 给视图层
 * 
 * 特点：
 * - 扁平化结构，符合 Vue 3 最佳实践
 * - 合并列表和详情功能，减少文件数量
 * - 直接调用 HTTP Client，简化数据流
 * 
 * @example
 * ```vue
 * <script setup>
 * const { 
 *   // 列表相关
 *   products,
 *   loadProducts,
 *   loadMore,
 *   
 *   // 详情相关
 *   product,
 *   loadProduct
 * } = useProduct()
 * 
 * // 加载列表
 * await loadProducts({ page: '1', pageSize: '20' })
 * 
 * // 加载详情
 * await loadProduct({ id: '123' })
 * </script>
 * ```
 */

import type { IProduct } from '~/components/business/product/ProductCard/types'
import type { IItemListParams, IItemDetailParams, IProductListItem, IBrand } from '~/types/api/item'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { ProductTransformer } from '~/infrastructure/transformers/productTransformer'

/**
 * 商品业务组合式函数
 */
export function useProduct() {
  // ==================== 列表状态 ====================

  const products = ref<IProduct[]>([])
  const brands = ref<IBrand[]>([])
  const totalCount = ref(0)
  const listLoading = ref(false)
  const listError = ref<string | null>(null)

  // 列表计算属性
  const hasProducts = computed(() => products.value.length > 0)
  const isListEmpty = computed(() => !listLoading.value && products.value.length === 0)

  // ==================== 详情状态 ====================

  const product = ref<IProduct | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  // 详情计算属性
  const hasProduct = computed(() => product.value !== null)

  // ==================== 列表业务逻辑 ====================

  /**
   * 加载商品列表
   * 
   * @param params - 查询参数
   * @returns 加载结果
   */
  const loadProducts = async (params: IItemListParams): Promise<{
    success: boolean
    error?: string
  }> => {
    listLoading.value = true
    listError.value = null

    try {
      // 1. 使用 HTTP Client 获取数据（plugin 已自动解包）
      const data = await itemApiClient.getItemList(params)

      if (data?.list) {
        // 2. 使用 Transformer 转换为 UI 数据
        const uiList = ProductTransformer.toModelList(data.list)

        // 3. 更新状态
        products.value = uiList
        totalCount.value = data.total_count || 0
        brands.value = data.brand_list?.list || []

        return { success: true }
      }

      // 如果没有数据
      products.value = []
      totalCount.value = 0
      brands.value = []

      return { success: true }
    } catch (err: any) {
      console.error('Load products error:', err)
      listError.value = err.message || '加载商品列表失败'

      products.value = []
      totalCount.value = 0
      brands.value = []

      return { success: false, error: listError.value || undefined }
    } finally {
      listLoading.value = false
    }
  }

  /**
   * 加载更多商品（分页）
   * 
   * @param params - 查询参数
   * @returns 加载结果
   */
  const loadMore = async (params: IItemListParams): Promise<{
    success: boolean
    error?: string
  }> => {
    if (listLoading.value) {
      return { success: false, error: '正在加载中' }
    }

    listLoading.value = true
    listError.value = null

    try {
      const data = await itemApiClient.getItemList(params)

      if (data?.list) {
        const uiList = ProductTransformer.toModelList(data.list)

        // 追加到现有列表
        products.value = [...products.value, ...uiList]
        totalCount.value = data.total_count || 0

        return { success: true }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Load more products error:', err)
      listError.value = err.message || '加载更多商品失败'
      return { success: false, error: listError.value || undefined }
    } finally {
      listLoading.value = false
    }
  }

  /**
   * 重置列表状态
   */
  const resetList = () => {
    products.value = []
    brands.value = []
    totalCount.value = 0
    listLoading.value = false
    listError.value = null
  }

  // ==================== 详情业务逻辑 ====================

  /**
   * 加载商品详情
   * 
   * @param params - 查询参数
   * @returns 加载结果
   */
  const loadProduct = async (params: IItemDetailParams): Promise<{
    success: boolean
    error?: string
  }> => {
    detailLoading.value = true
    detailError.value = null

    try {
      // 1. 使用 HTTP Client 获取数据（plugin 已自动解包）
      const data = await itemApiClient.getItemDetail(params)

      if (data) {
        // 2. 使用 Transformer 转换为 UI 数据
        const uiProduct = ProductTransformer.toModel(data as IProductListItem)

        // 3. 更新状态
        product.value = uiProduct

        return { success: true }
      }

      // 如果没有数据
      product.value = null
      detailError.value = '商品不存在'

      return { success: false, error: detailError.value }
    } catch (err: any) {
      console.error('Load product error:', err)
      detailError.value = err.message || '加载商品详情失败'

      product.value = null

      return { success: false, error: detailError.value || undefined }
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 重置详情状态
   */
  const resetDetail = () => {
    product.value = null
    detailLoading.value = false
    detailError.value = null
  }

  /**
   * 重置所有状态
   */
  const reset = () => {
    resetList()
    resetDetail()
  }

  return {
    // ==================== 列表 ====================

    // 状态
    products: readonly(products),
    brands: readonly(brands),
    totalCount: readonly(totalCount),
    listLoading: readonly(listLoading),
    listError: readonly(listError),

    // 计算属性
    hasProducts,
    isListEmpty,

    // 方法
    loadProducts,
    loadMore,
    resetList,

    // ==================== 详情 ====================

    // 状态
    product: readonly(product),
    detailLoading: readonly(detailLoading),
    detailError: readonly(detailError),

    // 计算属性
    hasProduct,

    // 方法
    loadProduct,
    resetDetail,

    // ==================== 通用 ====================

    reset,
  }
}

