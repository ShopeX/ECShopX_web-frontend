// 商品基础类型
export interface IProduct {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  memberPrice?: number;
  imageUrl: string;
  tags?: string[];
}

// 商品卡片组件Props类型
export interface IProductCardProps {
  product: IProduct;
  showMemberPrice?: boolean;
}

// 商品列表响应类型
export interface IProductListResponse {
  total: number;
  items: IProduct[];
  page: number;
  pageSize: number;
}

// 商品列表请求参数类型
export interface IProductListParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  keyword?: string;
  sort?: EProductSort;
  order?: EOrder;
}

// 商品排序枚举
export enum EProductSort {
  PRICE = 'price',
  SALES = 'sales',
  CREATED_TIME = 'created_time'
}

// 排序方向枚举
export enum EOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface Category {
  id: number
  name: string
  path: string
  icon?: string
  children?: Category[]
} 