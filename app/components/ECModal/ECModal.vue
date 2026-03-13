<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="handleMaskClick"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50 transition-opacity"></div>

        <!-- 弹窗内容 -->
        <Transition name="modal-scale">
          <div
            v-if="visible"
            class="relative bg-white border border-black/10 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex flex-col gap-8 p-8 max-h-[90vh] overflow-auto"
            :style="{ width: modalWidth }"
          >
            <!-- 头部 -->
            <div class="flex items-center justify-between shrink-0">
              <h2 class="text-xl font-medium text-[#191a1d] leading-5">
                {{ title }}
              </h2>
              <button
                v-if="showClose"
                class="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                @click="handleClose"
              >
                <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-[#4a5565]" />
              </button>
            </div>

            <!-- 内容区域 -->
            <div class="flex-1 shrink-0">
              <slot>
                <p class="text-base text-[#4a5565] leading-6">
                  {{ content }}
                </p>
              </slot>
            </div>

            <!-- 底部按钮 -->
            <div v-if="showFooter" class="flex items-center justify-end gap-4 shrink-0">
              <!-- 取消按钮 -->
              <button
                v-if="showCancelButton"
                class="bg-white border border-[#0f0f10] px-8 py-4 hover:bg-gray-50 transition-colors"
                :disabled="cancelLoading"
                @click="handleCancel"
              >
                <span class="text-sm font-medium text-[#191a1d] leading-5">
                  {{ cancelButtonText }}
                </span>
              </button>

              <!-- 确认按钮 -->
              <button
                v-if="showConfirmButton"
                class="bg-[#0f0f10] px-8 py-4 hover:bg-[#0f0f10]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="confirmLoading"
                @click="handleConfirm"
              >
                <span class="text-sm font-medium text-white leading-5">
                  {{ confirmLoading ? '加载中...' : confirmButtonText }}
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { IModalOptions } from './types'

interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 弹窗标题 */
  title?: string
  /** 弹窗内容 */
  content?: string
  /** 宽度 */
  width?: string | number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否可以点击遮罩关闭 */
  maskClosable?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '提示',
  content: '',
  width: '480px',
  showClose: true,
  maskClosable: true,
  confirmText: '确定',
  cancelText: '取消',
  showConfirm: true,
  showCancel: true,
  showFooter: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

defineOptions({
  name: 'Modal',
})

// 内部可见状态
const visible = ref(props.modelValue)

// 加载状态
const confirmLoading = ref(false)
const cancelLoading = ref(false)

// 监听外部变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

// 监听内部变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 计算宽度
const modalWidth = computed(() => {
  if (typeof props.width === 'number') {
    return `${props.width}px`
  }
  return props.width
})

// 显示取消按钮
const showCancelButton = computed(() => {
  return props.showCancel && props.showFooter
})

// 显示确认按钮
const showConfirmButton = computed(() => {
  return props.showConfirm && props.showFooter
})

// 取消按钮文本
const cancelButtonText = computed(() => {
  return props.cancelText
})

// 确认按钮文本
const confirmButtonText = computed(() => {
  return props.confirmText
})

/**
 * 处理确认
 */
async function handleConfirm() {
  confirmLoading.value = true
  try {
    emit('confirm')
  } finally {
    confirmLoading.value = false
  }
}

/**
 * 处理取消
 */
async function handleCancel() {
  cancelLoading.value = true
  try {
    emit('cancel')
    visible.value = false
  } finally {
    cancelLoading.value = false
  }
}

/**
 * 处理关闭
 */
function handleClose() {
  emit('close')
  visible.value = false
}

/**
 * 处理遮罩点击
 */
function handleMaskClick() {
  if (props.maskClosable) {
    handleClose()
  }
}

// 暴露方法
defineExpose({
  show: () => {
    visible.value = true
  },
  hide: () => {
    visible.value = false
  },
})
</script>

<style scoped>
/* 弹窗淡入淡出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 弹窗缩放动画 */
.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
