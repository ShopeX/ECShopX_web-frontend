import { ref } from 'vue'
import type { IToast } from '@/components/ui/Toast.vue'

const toastComponent = ref<{ add: (toast: Omit<IToast, 'id'>) => void } | null>(null)

export function useToast() {
  const setToastComponent = (component: typeof toastComponent.value) => {
    toastComponent.value = component
  }

  const show = (toast: Omit<IToast, 'id'>) => {
    if (toastComponent.value) {
      toastComponent.value.add(toast)
    } else {
      console.warn('Toast component is not initialized')
    }
  }

  return {
    setToastComponent,
    show
  }
} 