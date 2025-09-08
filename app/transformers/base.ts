/**
 * 基础转换器接口
 */
export interface ITransformer<From, To> {
  transform(from: From): To
}

/**
 * 分页数据转换器接口
 */
export interface IPaginationResponse<T> {
  list: T[]
  total_count: number
}

/**
 * 转换分页数据
 */
export function transformPagination<T, R>(
  data: IPaginationResponse<T>,
  transformer: ITransformer<T, R>
): { list: R[]; total: number } {
  console.log('transform-------data',data)
  console.log('transform-------response',data.list.map(item => transformer.transform(item)))
  return {
    list: data.list.map(item => transformer.transform(item)),
    total: data.total_count
  }
} 