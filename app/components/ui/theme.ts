
// 按钮变体
export const buttonVariants: Record<string, string> = {
  solid: 'bg-[#b22420] text-white hover:opacity-90',
  ghost: 'bg-transparent hover:bg-gray-50',
  outline: 'border border-[#ddd] hover:border-[#b22420] hover:text-[#b22420]'
}

// 按钮尺寸
export const buttonSizes: Record<string, string> = {
  sm: 'h-7 px-3 text-sm',
  md: 'h-9 px-4 text-base',
  lg: 'h-11 px-6 text-lg'
}

// 输入框变体
export const inputVariants: Record<string, string> = {
  default: 'border border-[#ddd] rounded focus:outline-none focus:border-[#b22420]',
  error: 'border border-red-500 rounded focus:outline-none focus:border-red-600'
}

// 输入框尺寸
export const inputSizes: Record<string, string> = {
  sm: 'h-7 px-2 text-sm',
  md: 'h-9 px-3 text-base',
  lg: 'h-11 px-4 text-lg'
}

// 工具提示主题
export const tooltipTheme = {
  content: 'bg-[#333] text-white px-2 py-1 rounded text-xs'
} 