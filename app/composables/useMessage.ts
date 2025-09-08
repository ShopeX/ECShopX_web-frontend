export function useMessage() {
  const toast = useToast()

  return {
    success(message: string) {
      toast.add({
        title: '成功',
        description: message,
        color: 'green'
      })
    },
    error(message: string) {
      toast.add({
        title: '错误',
        description: message,
        color: 'red'
      })
    },
    warning(message: string) {
      toast.add({
        title: '警告',
        description: message,
        color: 'orange'
      })
    },
    info(message: string) {
      toast.add({
        title: '提示',
        description: message,
        color: 'blue'
      })
    }
  }
} 