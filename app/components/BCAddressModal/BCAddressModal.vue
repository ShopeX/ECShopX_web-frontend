<template>
  <ECModal
    v-model="visible"
    :title="isEdit ? '编辑地址' : '添加地址'"
    :width="598"
    :show-footer="false"
    @close="handleClose"
  >
    <div data-testid="address-modal">
      <form class="flex flex-col gap-8" data-testid="address-form" @submit.prevent="handleSubmit">
      <!-- 收货人 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">收货人</label>
        <div class="flex flex-col gap-1">
          <input
            v-model="formData.name"
            type="text"
            placeholder="请输入收货人姓名"
            class="h-10 px-4 bg-[#f3f4f6] border text-sm text-[#191a1d] leading-5 focus:outline-none focus:border-[#191a1d] transition-colors"
            :class="errors.name ? 'border-[#d0112f]' : 'border-transparent'"
          />
          <p v-if="errors.name" class="text-xs text-[#d0112f] leading-4">
            {{ errors.name }}
          </p>
        </div>
      </div>

      <!-- 手机号码 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">手机号码</label>
        <div class="flex gap-4">
          <!-- 区号选择 -->
          <!-- <ECSelect
            v-model="formData.countryCode"
            :options="countryCodeOptions"
            class="w-[180px]"
            size="md"
          /> -->

          <!-- 手机号输入 -->
          <div class="flex-1 flex flex-col gap-1">
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="请输入手机号码"
              class="h-10 px-4 bg-[#f3f4f6] border text-sm text-[#191a1d] leading-5 focus:outline-none focus:border-[#191a1d] transition-colors"
              :class="errors.phone ? 'border-[#d0112f]' : 'border-transparent'"
            />
            <p v-if="errors.phone" class="text-xs text-[#d0112f] leading-4">
              {{ errors.phone }}
            </p>
          </div>
        </div>
      </div>

      <!-- 省市区 -->
      <div class="flex gap-4">
        <!-- 省 -->
        <div class="flex-1 flex flex-col gap-2">
          <label class="text-xs text-[#4a5565] leading-4">省</label>
          <ECSelect
            v-model="formData.province"
            :options="provinces"
            :error="!!errors.province"
            size="md"
            placeholder="省份/直辖市"
            @change="handleProvinceChange"
          />
          <p v-if="errors.province" class="text-xs text-[#d0112f] leading-4">
            {{ errors.province }}
          </p>
        </div>

        <!-- 市 -->
        <div class="flex-1 flex flex-col gap-2">
          <label class="text-xs text-[#4a5565] leading-4">市</label>
          <ECSelect
            v-model="formData.city"
            :options="cities"
            :disabled="!formData.province"
            :error="!!errors.city"
            size="md"
            placeholder="市"
            @change="handleCityChange"
          />
          <p v-if="errors.city" class="text-xs text-[#d0112f] leading-4">
            {{ errors.city }}
          </p>
        </div>

        <!-- 区 -->
        <div class="flex-1 flex flex-col gap-2">
          <label class="text-xs text-[#4a5565] leading-4">区</label>
          <ECSelect
            v-model="formData.district"
            :options="districts"
            :disabled="!formData.city"
            :error="!!errors.district"
            size="md"
            placeholder="县/区"
          />
          <p v-if="errors.district" class="text-xs text-[#d0112f] leading-4">
            {{ errors.district }}
          </p>
        </div>
      </div>

      <!-- 详细地址 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">详细地址</label>
        <div class="flex flex-col gap-1">
          <textarea
            v-model="formData.detail"
            placeholder="请输入街道、门牌号等详细地址"
            rows="3"
            class="px-4 py-2 bg-[#f3f4f6] border transition-colors text-xs text-[#191a1d] leading-4 focus:outline-none focus:border-[#191a1d] resize-none"
            :class="errors.detail ? 'border-[#d0112f]' : 'border-transparent'"
          ></textarea>
          <p v-if="errors.detail" class="text-xs text-[#d0112f] leading-4">
            {{ errors.detail }}
          </p>
        </div>
      </div>

      <!-- 设置为默认地址 -->
      <ECCheckbox v-model="formData.isDefault" variant="primary" label="设置为默认收货地址" />

      <!-- 保存按钮 -->
      <button
        type="submit"
        :disabled="loading"
        class="bg-[#191a1d] text-white py-4 text-sm font-medium leading-5 hover:bg-[#191a1d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '保存中...' : '保存' }}
      </button>
    </form>
    </div>
  </ECModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ECModal } from '~/components/ECModal'
import { ECCheckbox } from '~/components/ECCheckbox'
import { ECSelect } from '~/components/ECSelect'
import type { ISelectOption } from '~/components/ECSelect'
import type { IRegionItem } from './regionData'
import { useRegion } from '~/composables/useRegion'
import { useAddress } from '~/composables/useAddress'
import type { IAddressFormData } from '~/composables/useAddress'

defineOptions({
  name: 'AddressModal',
})

interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 地址 ID（编辑时传入） */
  addressId?: string
  /** 初始数据 */
  initialData?: IAddressFormData
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  addressId: undefined,
  initialData: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [data: IAddressFormData]
  close: []
}>()

// 内部状态
const visible = ref(props.modelValue)
const loading = ref(false)
const errors = ref<Partial<Record<keyof IAddressFormData, string>>>({})

// 使用 useRegion composable
const { regionData, loadRegionData, loading: loadingRegions } = useRegion()

// 表单数据
const formData = ref<IAddressFormData>({
  name: '',
  phone: '',
  countryCode: '+86',
  province: '',
  city: '',
  district: '',
  tmp_code: [],
  detail: '',
  isDefault: false,
})

// 是否编辑模式
const isEdit = computed(() => !!props.addressId)

// 国家区号选项
const countryCodeOptions: ISelectOption[] = [
  { value: '+86', label: '+86 中国大陆地区' },
  { value: '+852', label: '+852 香港' },
  { value: '+853', label: '+853 澳门' },
  { value: '+886', label: '+886 台湾' },
]

// 省份列表
const provinces = computed<ISelectOption[]>(() => {
  return regionData.value.map((item) => ({
    value: item.id,
    label: item.label,
  }))
})

// 城市列表
const cities = computed<ISelectOption[]>(() => {
  if (!formData.value.province) return []
  const province = regionData.value.find((item) => item.id === formData.value.province)
  return (
    province?.children?.map((item) => ({
      value: item.id,
      label: item.label,
    })) || []
  )
})

// 区县列表
const districts = computed<ISelectOption[]>(() => {
  if (!formData.value.city) return []
  const province = regionData.value.find((item) => item.id === formData.value.province)
  const city = province?.children?.find((item) => item.id === formData.value.city)
  return (
    city?.children?.map((item) => ({
      value: item.id,
      label: item.label,
    })) || []
  )
})

// 监听外部变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      // 打开时加载省市区数据
      loadRegionData()

      if (props.initialData) {
        formData.value = { ...props.initialData }
      }
    }
  }
)

// 监听内部变化
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

/**
 * 处理省份变化
 */
function handleProvinceChange() {
  formData.value.city = ''
  formData.value.district = ''
}

/**
 * 处理城市变化
 */
function handleCityChange() {
  formData.value.district = ''
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = '请输入收货人姓名'
    isValid = false
  }

  if (!formData.value.phone.trim()) {
    errors.value.phone = '请输入手机号码'
    isValid = false
  } else if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    errors.value.phone = '请输入正确的手机号码'
    isValid = false
  }

  if (!formData.value.province) {
    errors.value.province = '请选择省份'
    isValid = false
  }

  if (!formData.value.city) {
    errors.value.city = '请选择城市'
    isValid = false
  }

  if (!formData.value.district) {
    errors.value.district = '请选择区县'
    isValid = false
  }

  if (!formData.value.detail.trim()) {
    errors.value.detail = '请输入详细地址'
    isValid = false
  }

  return isValid
}

/**
 * 处理提交
 */
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  // 使用 useAddress composable
  const { saveAddress } = useAddress()

  const result = await saveAddress(formData.value, props.addressId)

  if (result.success) {
    // 成功后触发事件
    emit('success', { ...formData.value })
    visible.value = false
  } else {
    // 显示错误提示
    alert(result.error || '保存地址失败，请重试')
  }
}

/**
 * 处理关闭
 */
function handleClose() {
  visible.value = false
  emit('close')
}

/**
 * 重置表单
 */
function resetForm() {
  formData.value = {
    name: '',
    phone: '',
    countryCode: '+86',
    province: '',
    city: '',
    district: '',
    tmp_code: [],
    detail: '',
    isDefault: false,
  }
  errors.value = {}
}

// 组件挂载时预加载省市区数据
onMounted(() => {
  loadRegionData()
})
</script>
