<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="detailLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="detailError" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ detailError }}</p>
        <button
          class="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          @click="$router.back()"
        >
          返回
        </button>
      </div>
    </div>

    <!-- 商品详情内容 -->
    <div v-else-if="rawProductData" class="flex items-start w-full bg-white px-24">
      <!-- Left Column: Thumbnail Navigation -->
      <div class="flex flex-col gap-4 items-center px-8 py-0 shrink-0">
        <!-- Up Arrow -->
        <button
          class="flex items-center justify-center shrink-0 transition-opacity"
          :class="canScrollUp ? 'opacity-100' : 'opacity-30 cursor-not-allowed'"
          :disabled="!canScrollUp"
          @click="scrollThumbnails('up')"
        >
          <UIcon name="i-heroicons-chevron-up" class="w-6 h-6 text-gray-900" />
        </button>

        <!-- Thumbnail List (最多显示5个) -->
        <div class="flex flex-col gap-4 overflow-hidden">
          <button
            v-for="(image, index) in visibleThumbnails"
            :key="thumbnailStartIndex + index"
            class="w-[100px] h-[100px] flex items-center justify-center overflow-hidden transition-opacity"
            :class="
              currentImageIndex === thumbnailStartIndex + index ? 'opacity-100' : 'opacity-50'
            "
            @click="selectImage(thumbnailStartIndex + index)"
          >
            <img :src="image" alt="Thumbnail" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Down Arrow -->
        <button
          class="flex items-center justify-center shrink-0 transition-opacity"
          :class="canScrollDown ? 'opacity-100' : 'opacity-30 cursor-not-allowed'"
          :disabled="!canScrollDown"
          @click="scrollThumbnails('down')"
        >
          <UIcon name="i-heroicons-chevron-down" class="w-6 h-6 text-gray-900" />
        </button>
      </div>

      <!-- Middle Column: Main Image Display -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- 当前选中的大图（带过渡动画） -->
        <div class="w-full aspect-square relative overflow-hidden bg-gray-100">
          <TransitionGroup :name="imageTransitionName">
            <div
              v-if="product.images[currentImageIndex]"
              :key="currentImageIndex"
              class="w-full h-full absolute inset-0"
            >
              <img
                :src="product.images[currentImageIndex]"
                :alt="`Product Image ${currentImageIndex + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- Right Column: Product Details -->
      <div class="flex-1 flex items-center justify-center bg-white sticky top-[88px] min-w-0">
        <div class="w-full max-w-[504px] flex flex-col gap-8 px-16 py-12">
          <!-- Title and Price -->
          <div class="flex items-start justify-between w-full">
            <div class="flex flex-col gap-2">
              <h1 class="text-2xl font-normal text-[#191a1d] leading-[1.2] tracking-[-0.48px]">
                {{ product.title }}
              </h1>
              <div class="text-2xl font-medium leading-9 text-[#191a1d]">
                ¥{{ product.price.toLocaleString() }}
              </div>
            </div>
            <button class="w-6 h-6 shrink-0" @click="toggleFavorite">
              <UIcon name="i-heroicons-heart" class="w-6 h-6 text-gray-900" />
            </button>
          </div>

          <!-- 动态规格选择器 -->
          <div v-if="product.specs.length > 0" class="flex flex-col gap-4 w-full max-w-[376px]">
            <template v-for="(spec, specIndex) in product.specs" :key="spec.spec_name">
              <div class="flex flex-col gap-6">
                <h3 class="text-sm font-normal leading-5 text-[#4a5565]">{{ spec.spec_name }}</h3>

                <!-- 如果有规格图片，显示图片样式选择器 -->
                <div
                  v-if="spec.spec_values.some((v) => v.spec_image_url)"
                  class="flex gap-2 flex-wrap"
                >
                  <button
                    v-for="specValue in spec.spec_values"
                    :key="specValue.spec_value_id"
                    class="w-20 h-20 border transition-all overflow-hidden"
                    :class="
                      isSpecValueSelected(spec.spec_name, specValue.spec_value_id)
                        ? 'border-[#191a1d]'
                        : 'border-transparent'
                    "
                    @click="selectSpecValue(spec.spec_name, specValue.spec_value_id)"
                  >
                    <img
                      v-if="specValue.spec_image_url"
                      :src="specValue.spec_image_url"
                      :alt="specValue.spec_value_name"
                      class="w-full h-full object-cover"
                    />
                  </button>
                </div>

                <!-- 如果没有规格图片，显示文字选择器 -->
                <div v-else class="grid grid-cols-2 border-l border-t border-[#e5e7eb]">
                  <button
                    v-for="specValue in spec.spec_values"
                    :key="specValue.spec_value_id"
                    class="h-[38.4px] px-4 border-r border-b border-[#e5e7eb] flex items-center justify-center text-sm leading-5 tracking-[-0.1504px] text-[#191a1d] transition-all"
                    :class="
                      isSpecValueSelected(spec.spec_name, specValue.spec_value_id)
                        ? 'bg-[#f3f4f6] border-[#0f0f10]'
                        : ''
                    "
                    @click="selectSpecValue(spec.spec_name, specValue.spec_value_id)"
                  >
                    {{ specValue.spec_custom_value_name || specValue.spec_value_name }}
                  </button>
                </div>
              </div>

              <!-- 分隔线（最后一个规格不显示） -->
              <div v-if="specIndex < product.specs.length - 1" class="h-px w-full" />
            </template>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-4">
            <button
              class="w-full px-0 py-4 text-sm font-medium leading-5 text-white bg-[#0f0f10] hover:bg-[#2a2a2a] transition-colors"
              @click="addToCart"
            >
              加入购物袋
            </button>
            <button
              class="w-full px-0 py-4 text-sm font-medium leading-5 text-[#191a1d] bg-white border border-[#0f0f10] hover:bg-gray-50 transition-colors"
              @click="buyNow"
            >
              立即购买
            </button>
          </div>

          <!-- Accordion Sections -->
          <div class="border-t border-white w-full max-w-[376px]">
            <div class="flex flex-col">
              <!-- Product Details Accordion -->
              <div class="border-b border-[#e5e7eb]">
                <button
                  class="w-full flex items-center justify-between py-4 text-sm leading-5 text-[#364153]"
                  @click="toggleAccordion('details')"
                >
                  <span>商品详情</span>
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="w-4 h-4 transition-transform"
                    :class="openAccordion === 'details' ? 'rotate-180' : ''"
                  />
                </button>
                <div v-if="openAccordion === 'details'" class="pb-4">
                  <div
                    class="product-description text-sm leading-5 text-[#364153]"
                    v-html="product.description"
                  />
                </div>
              </div>

              <!-- Additional Info Accordion 1 -->
              <div class="border-b border-[#e5e7eb]">
                <button
                  class="w-full flex items-center justify-between py-4 text-sm leading-5 text-[#364153]"
                  @click="toggleAccordion('info1')"
                >
                  <span>可配信息</span>
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="w-4 h-4 transition-transform"
                    :class="openAccordion === 'info1' ? 'rotate-180' : ''"
                  />
                </button>
              </div>

              <!-- Additional Info Accordion 2 -->
              <div class="border-b border-[#e5e7eb]">
                <button
                  class="w-full flex items-center justify-between py-4 text-sm leading-5 text-[#364153]"
                  @click="toggleAccordion('info2')"
                >
                  <span>可配信息</span>
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="w-4 h-4 transition-transform"
                    :class="openAccordion === 'info2' ? 'rotate-180' : ''"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐商品区域 -->
    <ProductRecommendations
      :recommended-products="recommendedProducts"
      :recent-products="recentProducts"
    />
  </div>
</template>

<script setup lang="ts">
import type { IItem } from '~/types/api/item'
import { logger } from '~/utils/log'

const route = useRoute()
const id = String((route.params as { id: string }).id || '')
const toast = useToastMessage()

// 使用 useProduct composable（符合架构规范：UI → Composable → API Client）
const { loadProductWithSSR } = useProduct()

// SSR 支持：通过 Composable 的 loadProductWithSSR 方法获取数据
const {
  data: rawProductData,
  pending: detailLoading,
  error: fetchError,
} = await loadProductWithSSR({ id })

// 错误处理
const detailError = computed(() => {
  if (fetchError.value) {
    return '加载商品详情失败'
  }
  if (!rawProductData.value && !detailLoading.value) {
    return '商品不存在'
  }
  return null
})

// 规格值类型定义
interface ISpecValue {
  spec_value_id: number
  spec_value_name: string
  spec_custom_value_name?: string
  spec_image_url?: string
}

// 规格类型定义
interface ISpec {
  spec_name: string
  spec_values: ISpecValue[]
}

// 状态管理
const quantity = ref(1)
const openAccordion = ref<string | null>('details')
const currentImageIndex = ref(0) // 当前显示的大图索引
const thumbnailStartIndex = ref(0) // 缩略图开始显示的索引
const imageTransitionName = ref<'slide-left' | 'slide-right'>('slide-right') // 图片切换动画方向

// 缩略图配置
const MAX_VISIBLE_THUMBNAILS = 5

// 选中的规格：key 是规格名称，value 是规格值 ID
const selectedSpecs = ref<Record<string, number>>({})

const cartUI = useCartUIStore()
const { requireAuth } = useAuthGuard()
const { addToCart: addToCartAction } = useCart()

// 计算可见的缩略图（最多5个）
const visibleThumbnails = computed(() => {
  const images = product.value.images
  return images.slice(thumbnailStartIndex.value, thumbnailStartIndex.value + MAX_VISIBLE_THUMBNAILS)
})

// 是否可以向上滚动（是否还有上一张图片）
const canScrollUp = computed(() => {
  return currentImageIndex.value > 0
})

// 是否可以向下滚动（是否还有下一张图片）
const canScrollDown = computed(() => {
  return currentImageIndex.value < product.value.images.length - 1
})

// 计算属性：适配页面展示的商品数据
const product = computed(() => {
  if (!rawProductData.value) {
    return {
      title: '',
      price: 0,
      description: '',
      images: [],
      specs: [] as ISpec[],
    }
  }

  const data = rawProductData.value

  // 处理规格信息
  let specs: ISpec[] = []

  // 解析规格数据（如果有）
  if (data.item_spec_desc) {
    try {
      const specDesc =
        typeof data.item_spec_desc === 'string'
          ? JSON.parse(data.item_spec_desc)
          : data.item_spec_desc

      // 将对象格式转换为数组格式
      // 从 { "颜色": { spec_name: "颜色", spec_values: [...] } }
      // 转换为 [{ spec_name: "颜色", spec_values: [...] }]
      if (specDesc && typeof specDesc === 'object') {
        specs = Object.values(specDesc).filter((spec: any) => spec && spec.spec_values) as ISpec[]
      }
    } catch (e) {
      console.error('解析规格描述失败:', e)
    }
  }

  return {
    title: data.itemName,
    price: data.price / 100, // 转换为元
    description: data.brief || (data as any).intro || '暂无商品描述',
    images: data.pics || [],
    specs,
  }
})

// 初始化选中的规格（选择每个规格的第一个值）
watch(
  () => product.value.specs,
  (specs) => {
    if (specs.length > 0 && Object.keys(selectedSpecs.value).length === 0) {
      const initialSpecs: Record<string, number> = {}
      specs.forEach((spec) => {
        const firstValue = spec.spec_values?.[0]
        if (firstValue && firstValue.spec_value_id) {
          initialSpecs[spec.spec_name] = firstValue.spec_value_id
        }
      })
      selectedSpecs.value = initialSpecs
    }
  },
  { immediate: true }
)

// 检查某个规格值是否被选中
const isSpecValueSelected = (specName: string, specValueId: number) => {
  return selectedSpecs.value[specName] === specValueId
}

// 选择规格值
const selectSpecValue = (specName: string, specValueId: number) => {
  selectedSpecs.value[specName] = specValueId
}

const toggleFavorite = async () => {
  // 使用 requireAuth 包装需要登录的操作
  await requireAuth(
    async () => {
      // TODO: 调用收藏 API
      toast.show('已添加到收藏')
    },
    {
      loginMessage: '请先登录后再收藏商品',
      redirectAfterLogin: true,
    }
  )
}

const toggleAccordion = (key: string) => {
  openAccordion.value = openAccordion.value === key ? null : key
}

// 滚动缩略图列表并切换图片
const scrollThumbnails = (direction: 'up' | 'down') => {
  const totalImages = product.value.images.length

  if (direction === 'up' && currentImageIndex.value > 0) {
    // 向上：选中上一张图片，新图片从左边滑入
    imageTransitionName.value = 'slide-left'
    currentImageIndex.value--

    // 如果当前图片在可见范围之外，滚动缩略图列表
    if (currentImageIndex.value < thumbnailStartIndex.value) {
      thumbnailStartIndex.value = currentImageIndex.value
    }
  } else if (direction === 'down' && currentImageIndex.value < totalImages - 1) {
    // 向下：选中下一张图片，新图片从右边滑入
    imageTransitionName.value = 'slide-right'
    currentImageIndex.value++

    // 如果当前图片在可见范围之外，滚动缩略图列表
    if (currentImageIndex.value >= thumbnailStartIndex.value + MAX_VISIBLE_THUMBNAILS) {
      thumbnailStartIndex.value = currentImageIndex.value - MAX_VISIBLE_THUMBNAILS + 1
    }
  }
}

// 选择图片（点击缩略图）
const selectImage = (imageIndex: number) => {
  // 根据点击的位置决定动画方向
  if (imageIndex > currentImageIndex.value) {
    imageTransitionName.value = 'slide-right' // 点击下方的图，从右边滑入
  } else if (imageIndex < currentImageIndex.value) {
    imageTransitionName.value = 'slide-left' // 点击上方的图，从左边滑入
  }
  currentImageIndex.value = imageIndex
}

// 计算当前选中的规格 ID（用于加购）
const currentSpecIdString = computed(() => {
  if (product.value.specs.length === 0) {
    return 'default'
  }

  // 按照规格顺序拼接规格值 ID，如 "1-2-3"
  const specValueIds = product.value.specs
    .map((spec) => selectedSpecs.value[spec.spec_name])
    .filter((id) => id !== undefined)

  return specValueIds.length > 0 ? specValueIds.join('-') : 'default'
})

// 根据选中的规格，计算真实的 item_id（如果是多规格商品，则是 SKU ID）
const realItemId = computed(() => {
  if (!rawProductData.value) return ''

  const data = rawProductData.value as any

  // 如果是无规格商品，直接返回商品 item_id
  if (data.nospec === 1 || !data.spec_items || data.spec_items.length === 0) {
    return String(data.item_id)
  }

  // 如果是有规格商品，查找匹配的 spec_item
  const matchedSpecItem = data.spec_items.find(
    (item: any) => item.custom_spec_id === currentSpecIdString.value
  )

  // 返回匹配的 SKU item_id，如果没有匹配则回退到主商品 ID
  return matchedSpecItem ? String(matchedSpecItem.item_id) : String(data.item_id)
})

// 计算当前库存
const currentStock = computed(() => {
  if (!rawProductData.value) return 0

  const data = rawProductData.value as any

  if (data.nospec === 1 || !data.spec_items || data.spec_items.length === 0) {
    return data.store || 0
  }

  const matchedSpecItem = data.spec_items.find(
    (item: any) => item.custom_spec_id === currentSpecIdString.value
  )

  return matchedSpecItem ? matchedSpecItem.store : data.store || 0
})

// 计算当前价格
const currentPrice = computed(() => {
  if (!rawProductData.value) return 0

  const data = rawProductData.value as any

  if (data.nospec === 1 || !data.spec_items || data.spec_items.length === 0) {
    return (data.activity_price || data.price) / 100
  }

  const matchedSpecItem = data.spec_items.find(
    (item: any) => item.custom_spec_id === currentSpecIdString.value
  )

  return matchedSpecItem
    ? (matchedSpecItem.activity_price || matchedSpecItem.price) / 100
    : data.price / 100
})

const addToCart = async () => {
  // 架构优化：通过 useCart composable 处理业务逻辑
  // UI层 → useCart (Composable) → cartApiClient (Infrastructure) → API
  await requireAuth(
    async () => {
      await addToCartAction({
        item_id: realItemId.value,
        num: quantity.value,
        distributor_id: String((rawProductData.value as any)?.distributor_id || '0'),
        productName: product.value.title,
        stock: currentStock.value,
      })
      // useCart 内部已经处理了：
      // - 业务验证（数量、库存检查）
      // - API 调用
      // - 错误处理
      // - 消息提示（成功/失败）
      // - 自动重新加载购物车数据
    },
    {
      loginMessage: '请先登录后再加入购物袋',
      redirectAfterLogin: true,
    }
  )
}

const buyNow = async () => {
  // 架构优化：通过 useCart composable 处理业务逻辑
  await requireAuth(
    async () => {
      const result = await addToCartAction({
        item_id: realItemId.value,
        num: quantity.value,
        distributor_id: String((rawProductData.value as any)?.distributor_id || '0'),
        cart_type: 'fastbuy', // 立即购买
        isAccumulate: false,
        productName: product.value.title,
        stock: currentStock.value,
      })

      // 立即购买：加入成功后直接打开购物车
      if (result.success) {
        cartUI.open()
      }
    },
    {
      loginMessage: '请先登录后再购买',
      redirectAfterLogin: true,
    }
  )
}

// Mock 推荐商品数据
const recommendedProducts = ref([
  {
    id: '1',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '4',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '5',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop',
  },
])

const recentProducts = ref([
  {
    id: '6',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '7',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1528148343865-51218c4a13e6?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '8',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '9',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '10',
    name: '明基大包套耳机',
    price: 1999.0,
    image:
      'https://images.unsplash.com/photo-1491927570842-0261e477d937?q=80&w=600&auto=format&fit=crop',
  },
])
</script>

<style scoped>
/* 向左滑动动画（新图片从左边推入，旧图片被推向右边） */
.slide-left-enter-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
}

.slide-left-leave-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-enter-to {
  transform: translateX(0);
}

.slide-left-leave-from {
  transform: translateX(0);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* 向右滑动动画（新图片从右边推入，旧图片被推向左边） */
.slide-right-enter-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
}

.slide-right-leave-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-enter-to {
  transform: translateX(0);
}

.slide-right-leave-from {
  transform: translateX(0);
}

.slide-right-leave-to {
  transform: translateX(-100%);
}

/* 商品描述富文本样式 */
.product-description {
  word-wrap: break-word;
}

.product-description :deep(p) {
  margin-bottom: 0.75rem;
}

.product-description :deep(p:last-child) {
  margin-bottom: 0;
}

.product-description :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.75rem 0;
}

.product-description :deep(ul),
.product-description :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.product-description :deep(li) {
  margin-bottom: 0.5rem;
}

.product-description :deep(h1),
.product-description :deep(h2),
.product-description :deep(h3),
.product-description :deep(h4),
.product-description :deep(h5),
.product-description :deep(h6) {
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.product-description :deep(strong) {
  font-weight: 600;
}

.product-description :deep(a) {
  color: #8253e6;
  text-decoration: underline;
}

.product-description :deep(a:hover) {
  color: #754bcf;
}
</style>
