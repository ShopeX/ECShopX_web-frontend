import { useToast } from '@/composables/useToast'

export function useMessage() {
  const toast = useToast()

  return {
    success(message: string) {
      toast.show({
        type: 'success',
        title: '成功',
        description: message
      })
    },
    error(message: string) {
      toast.show({
        type: 'error',
        title: '错误',
        description: message
      })
    },
    warning(message: string) {
      toast.show({
        type: 'warning',
        title: '警告',
        description: message
      })
    },
    info(message: string) {
      toast.show({
        type: 'info',
        title: '提示',
        description: message
      })
    }
  }
} 