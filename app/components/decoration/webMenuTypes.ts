/** Web 导航菜单项（与 ThemeBundle 前台 transformFront 一致） */
export interface WebMenuItem {
  id: number
  name: string
  link_type: 'category' | 'custom_page' | 'list_page' | 'article' | 'url' | 'none'
  link_value: string | null
  children: WebMenuItem[]
}

export interface WebMenuPayload {
  id: number
  name: string
  key: string
  items: WebMenuItem[]
}
