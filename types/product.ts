export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  tags?: string[]
}

export interface Category {
  id: number
  name: string
  path: string
  icon?: string
  children?: Category[]
} 