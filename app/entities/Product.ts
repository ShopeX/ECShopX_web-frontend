import { Transform, Type, Exclude, Expose, plainToClass, classToPlain } from 'class-transformer'
import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator'

/**
 * 库存状态枚举
 */
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_STOCK = 'out_stock'
}

/**
 * 价格信息类 - 演示嵌套对象转换
 */
export class PriceInfo {
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Math.round((value || 0) / 100 * 100) / 100)
  @Expose({ name: 'price' })
  current!: number

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ? Math.round(value / 100 * 100) / 100 : 0)
  @Expose({ name: 'activity_price' })
  activity!: number

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ? Math.round(value / 100 * 100) / 100 : 0)
  @Expose({ name: 'member_price' })
  member!: number

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ? Math.round(value / 100 * 100) / 100 : 0)
  @Expose({ name: 'market_price' })
  market!: number

  // 计算属性
  get display(): number {
    return this.activity > 0 && this.activity < this.current ? this.activity : this.current
  }

  get displayText(): string {
    return `¥${this.display.toFixed(2)}`
  }

  get originalText(): string {
    return this.activity > 0 && this.activity < this.current ? `¥${this.current.toFixed(2)}` : ''
  }

  get isOnSale(): boolean {
    return this.activity > 0 && this.activity < this.current
  }

  get discountText(): string {
    if (!this.isOnSale) return ''
    const discount = Math.round((this.activity / this.current) * 10)
    return `${discount}折`
  }
}

/**
 * 图片信息类 - 演示复杂数据转换
 */
export class ImageInfo {
  @Transform(({ value }) => {
    if (!value) return ''
    if (Array.isArray(value)) return value[0] || ''
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed[0] || '' : value
      } catch {
        return value
      }
    }
    return ''
  })
  @Expose({ name: 'pics' })
  main!: string

  @Transform(({ value }) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : [value]
      } catch {
        return [value]
      }
    }
    return []
  })
  @Expose({ name: 'pics' })
  list!: string[]
}

/**
 * 库存信息类
 */
export class StockInfo {
  @IsNumber()
  @Min(0)
  @Expose({ name: 'stock' })
  quantity!: number

  @IsNumber()
  @Min(0)
  @Expose({ name: 'sales' })
  sold!: number

  get status(): StockStatus {
    if (this.quantity === 0) return StockStatus.OUT_STOCK
    if (this.quantity < 10) return StockStatus.LOW_STOCK
    return StockStatus.IN_STOCK
  }

  get statusText(): string {
    const statusMap = {
      [StockStatus.IN_STOCK]: '现货',
      [StockStatus.LOW_STOCK]: '库存紧张',
      [StockStatus.OUT_STOCK]: '缺货'
    }
    return statusMap[this.status]
  }

  get salesDisplay(): string {
    if (this.sold >= 10000) {
      return `${Math.floor(this.sold / 10000)}万+人购买`
    }
    if (this.sold >= 1000) {
      return `${Math.floor(this.sold / 1000)}k+人购买`
    }
    return `${this.sold}人购买`
  }

  get isPopular(): boolean {
    return this.sold > 1000
  }
}

/**
 * 商品实体类 - 使用 class-transformer
 */
export class ProductEntity {
  @IsString()
  @Expose({ name: 'item_id' })
  itemId!: string

  @IsString()
  @Expose({ name: 'itemName' })
  itemName!: string

  @IsString()
  @IsOptional()
  @Expose({ name: 'brief' })
  description!: string

  // 🎯 嵌套对象转换 - class-transformer 的强大功能
  @Type(() => PriceInfo)
  @Transform(({ obj }) => {
    const priceInfo = new PriceInfo()
    priceInfo.current = obj.price || 0
    priceInfo.activity = obj.activity_price || 0
    priceInfo.member = obj.member_price || 0
    priceInfo.market = obj.market_price || 0
    return priceInfo
  })
  price!: PriceInfo

  @Type(() => ImageInfo)
  @Transform(({ obj }) => {
    const imageInfo = new ImageInfo()
    imageInfo.main = obj.pics
    imageInfo.list = obj.pics
    return imageInfo
  })
  images!: ImageInfo

  @Type(() => StockInfo)
  @Transform(({ obj }) => {
    const stockInfo = new StockInfo()
    stockInfo.quantity = obj.stock || 0
    stockInfo.sold = obj.sales || 0
    return stockInfo
  })
  stock!: StockInfo

  @IsString()
  @IsOptional()
  @Expose({ name: 'approve_status' })
  status!: string

  // 🎯 计算属性 - 基于嵌套对象的复杂业务逻辑
  get tags(): string[] {
    const tags: string[] = []

    if (this.stock.isPopular) tags.push('热销')
    if (this.price.isOnSale) tags.push('特惠')
    if (this.stock.status === StockStatus.LOW_STOCK) tags.push('仅剩少量')

    return tags
  }

  get isRecommended(): boolean {
    return this.stock.isPopular && this.stock.status === StockStatus.IN_STOCK
  }

  // 🎯 静态工厂方法 - class-transformer 提供的标准方法
  static fromPlain(plain: any): ProductEntity {
    return plainToClass(ProductEntity, plain, {
      // 启用隐式类型转换
      enableImplicitConversion: true,
      // 排除未定义的属性
      excludeExtraneousValues: true,
      // 启用转换装饰器
      enableCircularCheck: true
    })
  }

  static fromList(plainArray: any[]): ProductEntity[] {
    return plainArray.map(item => ProductEntity.fromPlain(item))
  }

  // 🎯 转换为普通对象 - 用于 API 响应
  toPlain(): IProductListItem {
    return classToPlain(this, {
      excludeExtraneousValues: true
    }) as IProductListItem
  }

  // 🎯 转换为 UI 所需的扁平结构（兼容原有接口）
  toUIModel(): IProductListItem {
    return {
      itemId: this.itemId,
      itemName: this.itemName,
      description: this.description,

      imgs: this.images.list,      // 新字段

      // 价格相关（双重兼容）
      price: this.price.current,
      activityPrice: this.price.display,  // 兼容原有接口
      memberPrice: 0,                     // 兼容原有接口，暂时设为0
      displayPrice: this.price.display,
      priceDisplay: this.price.displayText,
      originalPriceDisplay: this.price.originalText,
      discountText: this.price.discountText,

      // 库存相关
      sales: this.stock.sold,
      salesDisplay: this.stock.salesDisplay,
      stock: this.stock.quantity,
      stockStatus: this.stock.status,
      stockStatusText: this.stock.statusText,

      // 业务状态
      isPopular: this.stock.isPopular,
      isOnSale: this.price.isOnSale,
      tags: this.tags
    }
  }
}

/**
 * UI 接口定义 - 保持与原来一致
 */
export interface IProductListItem {
  itemId: string
  itemName: string
  description?: string
  imgs: string[]   // 商品图片列表，主图一般为第一个
  price: number
  displayPrice?: number
  activityPrice: number  // 兼容原有接口
  memberPrice: number    // 兼容原有接口
  priceDisplay?: string
  originalPriceDisplay?: string
  discountText?: string
  sales: number
  salesDisplay?: string
  stock: number
  stockStatus?: StockStatus
  stockStatusText?: string
  isPopular?: boolean
  isOnSale?: boolean
  tags?: string[]
}

/**
 * 导出转换器 - 兼容原有接口
 */
export const productTransformer = {
  transform: (source: any): IProductListItem => {
    const entity = ProductEntity.fromPlain(source)
    return entity.toUIModel()
  },

  transformList: (sources: any[]): IProductListItem[] => {
    return ProductEntity.fromList(sources).map(entity => entity.toUIModel())
  }
}
