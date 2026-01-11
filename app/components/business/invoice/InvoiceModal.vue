<template>
  <Modal v-model="visible" title="发票信息" :width="598" :show-footer="false" @close="handleClose">
    <form class="flex flex-col gap-8" @submit.prevent="handleSubmit">
      <!-- 发票类型 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">发票类型</label>
        <div class="flex gap-4">
          <button
            type="button"
            :class="[
              'flex-1 py-3 px-4 border text-sm font-medium leading-5 transition-colors',
              formData.type === 'personal'
                ? 'bg-[#191a1d] text-white border-[#191a1d]'
                : 'bg-white text-[#191a1d] border-[#191a1d] hover:bg-gray-50',
            ]"
            @click="formData.type = 'personal'"
          >
            个人
          </button>
          <button
            type="button"
            :class="[
              'flex-1 py-3 px-4 border text-sm font-medium leading-5 transition-colors',
              formData.type === 'company'
                ? 'bg-[#191a1d] text-white border-[#191a1d]'
                : 'bg-white text-[#191a1d] border-[#191a1d] hover:bg-gray-50',
            ]"
            @click="formData.type = 'company'"
          >
            企业
          </button>
        </div>
      </div>

      <!-- 发票抬头 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">
          {{ formData.type === 'personal' ? '个人姓名' : '企业名称' }}
          <span class="text-[#d0112f]">*</span>
        </label>
        <div class="flex flex-col gap-1">
          <input
            v-model="formData.title"
            type="text"
            :placeholder="formData.type === 'personal' ? '请输入个人姓名' : '请输入企业名称'"
            class="h-10 px-4 bg-[#f3f4f6] border text-sm text-[#191a1d] leading-5 focus:outline-none focus:border-[#191a1d] transition-colors"
            :class="errors.title ? 'border-[#d0112f]' : 'border-transparent'"
          />
          <p v-if="errors.title" class="text-xs text-[#d0112f] leading-4">
            {{ errors.title }}
          </p>
        </div>
      </div>

      <!-- 纳税人识别号（仅企业） -->
      <div v-if="formData.type === 'company'" class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">
          纳税人识别号
          <span class="text-[#d0112f]">*</span>
        </label>
        <div class="flex flex-col gap-1">
          <input
            v-model="formData.taxNumber"
            type="text"
            placeholder="请输入纳税人识别号（统一社会信用代码）"
            class="h-10 px-4 bg-[#f3f4f6] border text-sm text-[#191a1d] leading-5 focus:outline-none focus:border-[#191a1d] transition-colors"
            :class="errors.taxNumber ? 'border-[#d0112f]' : 'border-transparent'"
          />
          <p v-if="errors.taxNumber" class="text-xs text-[#d0112f] leading-4">
            {{ errors.taxNumber }}
          </p>
        </div>
      </div>

      <!-- 发票内容 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">
          发票内容
          <span class="text-[#d0112f]">*</span>
        </label>
        <Select
          v-model="formData.content"
          :options="invoiceContentOptions"
          :error="!!errors.content"
          size="md"
          placeholder="请选择发票内容"
        />
        <p v-if="errors.content" class="text-xs text-[#d0112f] leading-4">
          {{ errors.content }}
        </p>
      </div>

      <!-- 接收邮箱 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-[#4a5565] leading-4">
          接收邮箱
          <span class="text-[#d0112f]">*</span>
        </label>
        <div class="flex flex-col gap-1">
          <input
            v-model="formData.email"
            type="email"
            placeholder="请输入接收电子发票的邮箱地址"
            class="h-10 px-4 bg-[#f3f4f6] border text-sm text-[#191a1d] leading-5 focus:outline-none focus:border-[#191a1d] transition-colors"
            :class="errors.email ? 'border-[#d0112f]' : 'border-transparent'"
          />
          <p v-if="errors.email" class="text-xs text-[#d0112f] leading-4">
            {{ errors.email }}
          </p>
        </div>
      </div>

      <!-- 保存按钮 -->
      <button
        type="submit"
        :disabled="loading"
        class="bg-[#191a1d] text-white py-4 text-sm font-medium leading-5 hover:bg-[#191a1d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '保存中...' : '保存' }}
      </button>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Modal } from '~/components/ui/modal'
import { Select } from '~/components/ui/select'
import type { ISelectOption } from '~/components/ui/select'
import type { IInvoiceFormData } from './types'

defineOptions({
  name: 'InvoiceModal',
})

interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 初始数据 */
  initialData?: IInvoiceFormData
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialData: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [data: IInvoiceFormData]
  close: []
}>()

// 内部状态
const visible = ref(props.modelValue)
const loading = ref(false)
const errors = ref<Partial<Record<keyof IInvoiceFormData, string>>>({})

// 表单数据
const formData = ref<IInvoiceFormData>({
  type: 'personal',
  title: '',
  taxNumber: '',
  content: '',
  email: '',
})

// 发票内容选项
const invoiceContentOptions: ISelectOption[] = [
  { value: 'goods', label: '商品明细' },
  { value: 'service', label: '服务费' },
  { value: 'goods_service', label: '商品及服务' },
  { value: 'other', label: '其他' },
]

// 监听外部变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.initialData) {
      formData.value = { ...props.initialData }
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
 * 验证表单
 */
function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  // 验证发票抬头
  if (!formData.value.title.trim()) {
    errors.value.title = formData.value.type === 'personal' ? '请输入个人姓名' : '请输入企业名称'
    isValid = false
  }

  // 企业类型需要验证纳税人识别号
  if (formData.value.type === 'company') {
    if (!formData.value.taxNumber.trim()) {
      errors.value.taxNumber = '请输入纳税人识别号'
      isValid = false
    } else if (
      !/^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(formData.value.taxNumber)
    ) {
      errors.value.taxNumber = '请输入正确的纳税人识别号（18位统一社会信用代码）'
      isValid = false
    }
  }

  // 验证发票内容
  if (!formData.value.content) {
    errors.value.content = '请选择发票内容'
    isValid = false
  }

  // 验证邮箱
  if (!formData.value.email.trim()) {
    errors.value.email = '请输入接收邮箱'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = '请输入正确的邮箱地址'
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

  loading.value = true
  try {
    // 构建发票数据
    const invoiceData: IInvoiceFormData = {
      type: formData.value.type,
      title: formData.value.title.trim(),
      taxNumber: formData.value.type === 'company' ? formData.value.taxNumber.trim() : '',
      content: formData.value.content,
      email: formData.value.email.trim(),
    }

    // 触发成功事件
    emit('success', invoiceData)
    visible.value = false
  } catch (error: any) {
    // 显示错误提示
    alert(error.message || '保存发票信息失败，请重试')
  } finally {
    loading.value = false
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
    type: 'personal',
    title: '',
    taxNumber: '',
    content: '',
    email: '',
  }
  errors.value = {}
}
</script>
