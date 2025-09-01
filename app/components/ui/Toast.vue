<template>
  <div
    v-if="visible"
    class="fixed top-4 right-4 z-50 flex flex-col gap-2"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'min-w-[320px] p-4 rounded-lg shadow-lg transform transition-all duration-300',
        toast.type === 'success' ? 'bg-green-50 text-green-900' :
        toast.type === 'error' ? 'bg-red-50 text-red-900' :
        toast.type === 'warning' ? 'bg-yellow-50 text-yellow-900' :
        'bg-blue-50 text-blue-900'
      ]"
    >
      <div class="flex items-start gap-3">
        <!-- 图标 -->
        <div class="flex-shrink-0">
          <Icon
            :name="
              toast.type === 'success' ? 'heroicons:check-circle' :
              toast.type === 'error' ? 'heroicons:x-circle' :
              toast.type === 'warning' ? 'heroicons:exclamation-triangle' :
              'heroicons:information-circle'
            "
            class="w-5 h-5"
          />
        </div>

        <!-- 内容 -->
        <div class="flex-1">
          <h3 class="text-sm font-medium">{{ toast.title }}</h3>
          <p class="mt-1 text-sm">{{ toast.description }}</p>
        </div>

        <!-- 关闭按钮 -->
        <button
          class="flex-shrink-0 hover:opacity-75"
          @click="() => removeToast(toast.id)"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface IToast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description: string
  duration?: number
}

const toasts = ref<IToast[]>([])
const visible = computed(() => toasts.value.length > 0)

// 添加提示
const addToast = (toast: Omit<IToast, 'id'>) => {
  const id = Date.now()
  toasts.value.push({
    ...toast,
    id
  })

  // 自动关闭
  if (toast.duration !== 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 3000)
  }
}

// 移除提示
const removeToast = (id: number) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 暴露方法
defineExpose({
  add: addToast,
  remove: removeToast
})
</script> 