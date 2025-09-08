/**
 * 字段映射元数据的 key
 */
const FIELD_MAPPINGS_KEY = Symbol('fieldMappings')

/**
 * 字段映射接口
 */
interface IFieldMapping {
  propertyKey: string | symbol  // 目标属性名
  sourceKey: string            // 源数据属性名
  transform?: (value: any) => any  // 可选的转换函数
  isComputed?: boolean         // 是否为计算字段（getter）
}

/**
 * 获取类的字段映射
 */
export function getFieldMappings(target: any): IFieldMapping[] {
  return Reflect.getMetadata(FIELD_MAPPINGS_KEY, target) || []
}

/**
 * 添加字段映射
 */
function addFieldMapping(target: any, mapping: IFieldMapping) {
  const mappings = getFieldMappings(target)
  mappings.push(mapping)
  Reflect.defineMetadata(FIELD_MAPPINGS_KEY, mappings, target)
}

/**
 * 字段映射装饰器工厂
 */
export function Field(sourceKey: string, transform?: (value: any) => any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    addFieldMapping(target.constructor, {
      propertyKey,
      sourceKey,
      transform,
      isComputed: false
    })
  }
}

/**
 * 计算字段装饰器 - 用于标记 getter 方法
 */
export function ComputedField(propertyKey: string | symbol): PropertyDecorator {
  return (target: any, _propertyKey: string | symbol) => {
    addFieldMapping(target.constructor, {
      propertyKey,
      sourceKey: '', // 计算字段不需要源字段
      isComputed: true
    })
  }
}

/**
 * 自动映射装饰器 - 通用性实现
 */
export function AutoMap<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args)
      const mappings = getFieldMappings(constructor)
      
      // 创建 getter 和 setter
      mappings.forEach(({ propertyKey, sourceKey, transform, isComputed }) => {
        if (!isComputed) {
          let value: any
          
          Object.defineProperty(this, propertyKey, {
            get() {
              // 如果有转换函数，应用转换
              return transform ? transform(value) : value
            },
            set(newValue: any) {
              value = newValue
            },
            enumerable: true,
            configurable: true
          })
        }
      })
    }

    /**
     * 从源数据转换
     */
    fromSource(source: any) {
      const mappings = getFieldMappings(constructor)
      mappings.forEach(({ propertyKey, sourceKey, transform, isComputed }) => {
        if (!isComputed) {
          const value = source[sourceKey]
          ;(this as any)[propertyKey] = value
        }
      })
      return this
    }

    /**
     * 转换为目标数据 - 通用性实现，自动处理所有属性
     */
    toTarget() {
      const result: any = {}
      
      // 处理所有映射的字段
      const mappings = getFieldMappings(constructor)
      mappings.forEach(({ propertyKey, sourceKey, isComputed }) => {
        if (isComputed) {
          // 计算字段（getter 方法）
          try {
            result[propertyKey] = (this as any)[propertyKey]
          } catch (error) {
            console.warn(`Error accessing computed field ${String(propertyKey)}:`, error)
          }
        } else {
          // 普通字段
          result[propertyKey] = (this as any)[propertyKey]
        }
      })
      
      return result
    }
  }
} 