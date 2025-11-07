/**
 * Button 模块类型定义
 */

import type { buttonVariants, buttonSizes } from '../theme'

export interface IButtonProps {
  /** 按钮变体 */
  variant?: keyof typeof buttonVariants
  /** 按钮尺寸 */
  size?: keyof typeof buttonSizes
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 自定义类名 */
  className?: string
}

