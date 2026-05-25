import { useToastMessage } from '~/composables/useToastMessage'

export default defineNuxtPlugin((nuxtApp) => {
  const t = (key: string) => (nuxtApp.$i18n as any)?.t?.(key) || key
  nuxtApp.vueApp.directive('copy', {
    mounted(el: any, binding: any) {
      el.$copyHandler = async () => {
        const textToCopy = typeof binding.value === 'function' ? binding.value() : binding.value
        if (!textToCopy) return

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy)
          } else {
            // Fallback for non-secure contexts (e.g. 0.0.0.0:3000 instead of localhost)
            const textArea = document.createElement('textarea')
            textArea.value = textToCopy
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            const successful = document.execCommand('copy')
            textArea.remove()
            if (!successful) throw new Error('execCommand failed')
          }
          const toast = useToastMessage()
          toast.show(t('e9b26ce6.20a495'))
        } catch (err) {
          console.error('Failed to copy text', err)
          const toast = useToastMessage()
          toast.show(t('e9b26ce6.5154ae'))
        }
      }
      el.addEventListener('click', el.$copyHandler)
      el.style.cursor = 'pointer'
    },
    updated(el: any, binding: any) {
      el.removeEventListener('click', el.$copyHandler)
      el.$copyHandler = async () => {
        const textToCopy = typeof binding.value === 'function' ? binding.value() : binding.value
        if (!textToCopy) return

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy)
          } else {
            const textArea = document.createElement('textarea')
            textArea.value = textToCopy
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            const successful = document.execCommand('copy')
            textArea.remove()
            if (!successful) throw new Error('execCommand failed')
          }
          useToastMessage().show(t('e9b26ce6.20a495'))
        } catch (err) {
          console.error('Failed to copy text', err)
          useToastMessage().show(t('e9b26ce6.5154ae'))
        }
      }
      el.addEventListener('click', el.$copyHandler)
    },
    unmounted(el: any) {
      if (el.$copyHandler) {
        el.removeEventListener('click', el.$copyHandler)
      }
    },
  })
})
