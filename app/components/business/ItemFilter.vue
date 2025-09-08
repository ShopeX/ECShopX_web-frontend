<template>
  <div class="bg-white border-b border-gray-200">
    <!-- 主筛选区域 - 一行布局 -->
    <div class="flex items-center gap-4 px-4 py-3">
      <!-- 排序选项 -->
      <div class="flex items-center gap-2">
        <UButton
          v-for="sort in sortOptions"
          :key="sort.value"
          variant="ghost"
          color="neutral"
          size="sm"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
          @click="updateFilter('sort', sort.value)"
        >
          <span :class="modelValue.sort === sort.value ? 'text-red-500' : 'text-gray-500'">
            {{ sort.label }}
          </span>
          <UIcon 
            name="i-lucide-arrow-down" 
            :class="modelValue.sort === sort.value ? 'text-red-500' : 'text-gray-500'" 
            class="ml-1" 
          />
        </UButton>
      </div>

      <!-- 价格排序（切换选项） -->
      <div class="flex items-center gap-2">
        <div class="flex items-center">
          <UButton 
            variant="ghost"
            color="neutral"
            size="sm"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
            @click="togglePriceSort"
          >
            <span :class="isPriceSortActive ? 'text-red-500' : 'text-gray-500'">
              价格
            </span>
            <div class="ml-1 flex flex-col">
              <UIcon 
                name="heroicons:chevron-up" 
                :class="isPriceSortActive && priceSortDirection === 'asc' ? 'text-red-500' : 'text-gray-500'"
                class="h-2 w-2 -mb-1" 
              />
              <UIcon 
                name="heroicons:chevron-down" 
                :class="isPriceSortActive && priceSortDirection === 'desc' ? 'text-red-500' : 'text-gray-500'"
                class="h-2 w-2" 
              />
            </div>
          </UButton>
        </div>
      </div>

      <!-- 价格区间 -->
      <div class="flex items-center gap-2">
        <UPopover v-model:open="showPriceInputs">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
          >
            <span :class="showPriceInputs ? 'text-red-500' : 'text-gray-500'">
              价格区间
            </span>
            <UIcon 
              name="i-lucide-chevron-down" 
              :class="showPriceInputs ? 'text-red-500' : 'text-gray-500'" 
              class="ml-1 h-3 w-3" 
            />
          </UButton>
          
          <template #content>
            <div class="w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
              <!-- 标题和关闭按钮 -->
              <div class="flex items-center justify-between mb-4">
                <h4 class="m-0 text-base font-semibold text-gray-900">请输入价格区间</h4>
                <button 
                  @click="showPriceInputs = false"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <UIcon name="i-lucide-x" class="h-4 w-4" />
                </button>
              </div>
              
              <!-- 自定义价格输入 -->
              <div class="mb-4">
                <div class="flex items-center gap-3">
                  <div class="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                    <span class="px-3 py-2 bg-gray-50 text-gray-500 font-medium border-r border-gray-300">¥</span>
                    <UInput
                      v-model="priceRange.start"
                      type="number"
                      placeholder="最低价"
                      size="sm"
                      class="border-none outline-none px-3 py-2 min-w-20 focus:shadow-none"
                      @blur="handlePriceInputBlur"
                    />
                  </div>
                  <span class="text-gray-500 font-medium">-</span>
                  <div class="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                    <span class="px-3 py-2 bg-gray-50 text-gray-500 font-medium border-r border-gray-300">¥</span>
                    <UInput
                      v-model="priceRange.end"
                      type="number"
                      placeholder="最高价"
                      size="sm"
                      class="border-none outline-none px-3 py-2 min-w-20 focus:shadow-none"
                      @blur="handlePriceInputBlur"
                    />
                  </div>
                </div>
              </div>
              
              <!-- 快捷价格区间选项 -->
              <div class="mb-4">
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="option in priceRangeOptions"
                    :key="option.label"
                    :class="[
                      'p-3 rounded-md border text-left transition-colors duration-200',
                      isPriceRangeSelected(option) 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    ]"
                    @click="selectPriceRange(option)"
                  >
                    <div class="font-semibold text-sm">{{ option.label }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ option.percentage }}%的选择</div>
                  </button>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex justify-end gap-2">
                <UButton
                  variant="outline"
                  size="sm"
                  @click="resetPriceRange"
                >
                  重置
                </UButton>
                <UButton
                  color="primary"
                  size="sm"
                  @click="confirmPriceRange"
                >
                  确定
                </UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </div>

      <!-- 品牌筛选 -->
      <div v-if="brands.length > 0" class="flex items-center gap-2">
        <UPopover v-model:open="showBrandList">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
          >
            <span :class="showBrandList ? 'text-red-500' : 'text-gray-500'">
              品牌
            </span>
            <UIcon 
              name="i-lucide-chevron-down" 
              :class="showBrandList ? 'text-red-500' : 'text-gray-500'" 
              class="ml-1 h-3 w-3" 
            />
          </UButton>
          
          <template #content>
            <div class="w-72 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
              <div class="mb-4">
                <h4 class="m-0 text-base font-semibold text-gray-900">选择品牌</h4>
              </div>
              <div class="mb-4 max-h-72 overflow-y-auto">
                <div class="flex flex-col gap-2">
                  <UCheckbox
                    v-for="brand in brands" 
                    :key="brand.attribute_id"
                    v-model="selectedBrands"
                    :value="brand.attribute_id"
                    :label="brand.attribute_name"
                    class="px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-50"
               
                  />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <UButton
                  variant="outline"
                  size="sm"
                  @click="clearBrands"
                >
                  清空
                </UButton>
                <UButton
                  color="primary"
                  size="sm"
                  @click="confirmBrands"
                >
                  确定
                </UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { IBrand } from '~/types/api/item'

// Props
interface IFilterValue {
  brandId: string | number | (string | number)[]
  sort: string
  startPrice?: number
  endPrice?: number
}

const props = defineProps<{
  modelValue: IFilterValue
  brands: IBrand[]
}>()
console.log('brands', props.brands)
// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: IFilterValue): void
  (e: 'change'): void
}>()

// 响应式数据
const selectedBrands = ref<(string | number)[]>([])
const priceRange = ref({
  start: '',
  end: ''
})

// 显示状态
const showPriceInputs = ref(false)
const showBrandList = ref(false)

// 排序选项
const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '销量', value: 'sales_desc' },
  { label: '评论数', value: 'rating_desc' },
]

// 价格排序状态
const priceSortDirection = ref<'asc' | 'desc'>('asc')

// 计算属性：价格排序是否激活
const isPriceSortActive = computed(() => {
  return props.modelValue.sort === 'price_asc' || props.modelValue.sort === 'price_desc'
})

// 价格区间选项
const priceRangeOptions = [
  { label: '0 - 128', min: 0, max: 128, percentage: 9 },
  { label: '128 - 258', min: 128, max: 258, percentage: 32 },
  { label: '258 - 3898', min: 258, max: 3898, percentage: 40 },
  { label: '3898 - 5198', min: 3898, max: 5198, percentage: 14 },
]

// 检查价格区间是否被选中
const isPriceRangeSelected = (option: any) => {
  const isSelected = priceRange.value.start === option.min.toString() && 
                     priceRange.value.end === option.max.toString()
  
  return isSelected
}

// 选择价格区间
const selectPriceRange = (option: any) => {
  console.log('选择价格区间:', option)
  
  priceRange.value = {
    start: option.min.toString(),
    end: option.max.toString()
  }
  
  console.log('设置后的价格区间:', priceRange.value)
  
  updatePriceFilter()
}

// 初始化数据同步
const initDataSync = () => {
  if (Array.isArray(props.modelValue.brandId)) {
    selectedBrands.value = props.modelValue.brandId
  } else if (props.modelValue.brandId) {
    selectedBrands.value = [props.modelValue.brandId]
  }
  
  priceRange.value = {
    start: props.modelValue.startPrice?.toString() || '',
    end: props.modelValue.endPrice?.toString() || ''
  }

  // 同步价格排序方向
  if (props.modelValue.sort === 'price_asc') {
    priceSortDirection.value = 'asc'
  } else if (props.modelValue.sort === 'price_desc') {
    priceSortDirection.value = 'desc'
  }
}

// 监听props变化，同步到本地状态
watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue.brandId)) {
    selectedBrands.value = newValue.brandId
  } else if (newValue.brandId) {
    selectedBrands.value = [newValue.brandId]
  }
  
  priceRange.value = {
    start: newValue.startPrice?.toString() || '',
    end: newValue.endPrice?.toString() || ''
  }

  // 同步价格排序方向
  if (newValue.sort === 'price_asc') {
    priceSortDirection.value = 'asc'
  } else if (newValue.sort === 'price_desc') {
    priceSortDirection.value = 'desc'
  }
}, { immediate: true, deep: true })

// 组件挂载后初始化
onMounted(() => {
  initDataSync()
})

// 更新筛选条件
const updateFilter = (key: keyof IFilterValue, value: any) => {
  const newValue = {
    ...props.modelValue,
    [key]: value
  }
  emit('update:modelValue', newValue)
  emit('change')
}

// 切换价格排序
const togglePriceSort = () => {
  if (isPriceSortActive.value) {
    // 如果当前是价格排序，切换方向
    priceSortDirection.value = priceSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 如果当前不是价格排序，设置为升序
    priceSortDirection.value = 'asc'
  }
  
  const sortValue = priceSortDirection.value === 'asc' ? 'price_asc' : 'price_desc'
  updateFilter('sort', sortValue)
}

// 处理价格输入失焦
const handlePriceInputBlur = () => {
  console.log('价格输入失焦:', priceRange.value)
  updatePriceFilter()
}

// 更新价格筛选
const updatePriceFilter = () => {
  console.log('更新价格筛选:', priceRange.value)
  
  const startPrice = priceRange.value.start ? Number(priceRange.value.start) : undefined
  const endPrice = priceRange.value.end ? Number(priceRange.value.end) : undefined
  
  console.log('解析后的价格:', { startPrice, endPrice })
  
  // 一次性更新所有价格相关的筛选条件
  const newValue = {
    ...props.modelValue,
    startPrice,
    endPrice
  }
  emit('update:modelValue', newValue)
  emit('change')
}

// 确认价格区间
const confirmPriceRange = () => {
  updatePriceFilter()
  showPriceInputs.value = false
}

// 重置价格区间
const resetPriceRange = () => {
  priceRange.value = { start: '', end: '' }
  updatePriceFilter()
}

// 更新品牌筛选
const updateBrandFilter = () => {
  console.log('更新品牌筛选:', selectedBrands.value)
  updateFilter('brandId', selectedBrands.value)
}

// 确认品牌选择
const confirmBrands = () => {
  updateBrandFilter()
  showBrandList.value = false
}

// 清空品牌筛选
const clearBrands = () => {
  selectedBrands.value = []
  updateBrandFilter()
}
</script> 