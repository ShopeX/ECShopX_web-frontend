/**
 * 实体层统一导出
 * 
 * 实体层职责：
 * 1. 统一数据转换逻辑
 * 2. 封装业务计算逻辑  
 * 3. 提供类型安全的UI数据模型
 * 4. 减少页面中的数据处理代码
 */

// 使用 class-transformer 实现的实体
export * from './Product'

// 未来可扩展的实体
// export * from './User'
// export * from './Order' 
// export * from './Category'

/**
 * 通用实体工具
 */
export class EntityUtils {
  /**
   * 批量转换实体列表
   */
  static transformList<T, R>(
    list: T[],
    EntityClass: { fromSource: (data: T) => R }
  ): R[] {
    return list.map(item => EntityClass.fromSource(item))
  }

  /**
   * 安全的实体转换，带错误处理
   */
  static safeTransform<T, R>(
    data: T,
    EntityClass: { fromSource: (data: T) => R },
    fallback?: R
  ): R | null {
    try {
      return EntityClass.fromSource(data)
    } catch (error) {
      console.error('Entity transform error:', error)
      return fallback || null
    }
  }
}
