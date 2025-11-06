export function useMessage() {
  const toast = useToast()

  return {
    success(message: string) {
      toast.add({
        title: '成功',
        description: message,
        color: 'success'
      })
    },
    error(message: string) {
      toast.add({
        title: '错误',
        description: message,
        color: 'error'
      })
    },
    warning(message: string) {
      toast.add({
        title: '警告',
        description: message,
        color: 'warning'
      })
    },
    info(message: string) {
      toast.add({
        title: '提示',
        description: message,
        color: 'info'
      })
    }
  }
}

export default {}