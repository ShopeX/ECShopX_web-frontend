/**
 * 消息提示组合式函数（SSR 兼容）
 * 
 * 封装 Nuxt UI 的 Toast 功能，提供统一的消息提示 API
 * 
 * 特点：
 * - SSR 安全：服务端返回空实现，客户端正常工作
 * - 延迟初始化：只在需要时才调用 useToast
 * - 统一 API：所有地方直接使用，无需特殊处理
 * 
 * @example
 * ```vue
 * <script setup>
 * const message = useMessage()
 * 
 * function handleSuccess() {
 *   message.success('操作成功')
 * }
 * </script>
 * ```
 */
export function useMessage() {
  // SSR 环境下返回空实现
  if (import.meta.server) {
    return {
      success: (message: string) => { },
      error: (message: string) => { },
      warning: (message: string) => { },
      info: (message: string) => { },
    }
  }

  // 客户端环境下使用 Nuxt UI Toast
  const toast = useToast()

  return {
    success(message: string) {
      toast.add({
        title: '成功',
        description: message,
        color: 'success',
      })
    },
    error(message: string) {
      toast.add({
        title: '错误',
        description: message,
        color: 'error',
      })
    },
    warning(message: string) {
      toast.add({
        title: '警告',
        description: message,
        color: 'warning',
      })
    },
    info(message: string) {
      toast.add({
        title: '提示',
        description: message,
        color: 'info',
      })
    },
  }
}

export default {}