import { Field, ComputedField, AutoMap, getFieldMappings } from './decorators'

/**
 * 商品详情转换器 - 基于 GOODS_INFO 规则
 */
@AutoMap
export class ItemDetailTransformer {
  // 基础字段映射
  @Field('item_id')
  itemId!: string

  @Field('stock')
  stock!: number

  @Field('is_new')
  isNew!: boolean

  @Field('item_bn')
  itemBn!: string

  @Field('itemName')
  itemName!: string

  @Field('brief')
  brief!: string

  // 图片字段 - 分别处理主图和图片列表
  @Field('pics', (pics: any) => {
    if (!pics) return ''
    if (Array.isArray(pics)) {
      return pics[0] || ''
    }
    if (typeof pics === 'string') {
      try {
        const parsed = JSON.parse(pics)
        return Array.isArray(parsed) ? parsed[0] || '' : ''
      } catch {
        return pics
      }
    }
    return ''
  })
  img!: string

  @Field('pics', (pics: any) => {
    if (!pics) return []
    if (Array.isArray(pics)) {
      return pics
    }
    if (typeof pics === 'string') {
      try {
        const parsed = JSON.parse(pics)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })
  imgs!: string[]

  @Field('company_id')
  companyId!: string

  @Field('activity_info')
  activityInfo!: any

  @Field('activity_type')
  activityType!: string

  @Field('approve_status')
  approveStatus!: string

  @Field('point')
  point!: number

  @Field('is_point')
  isPoint!: boolean

  @Field('nospec')
  nospec!: boolean

  @Field('item_spec_desc')
  itemSpecDesc!: string

  @Field('vipgrade_guide_title')
  vipgradeGuideTitle!: string

  @Field('kaquan_list')
  couponList!: any[]

  @Field('store')
  store!: any

  @Field('store_setting')
  store_setting!: any

  @Field('limit_num')
  limitNum!: number

  @Field('purchase_limit_num_by_cart')
  purlimitByCart!: number

  @Field('purchase_limit_num_by_fastbuy')
  purlimitByFastbuy!: number

  @Field('is_gift')
  isGift!: boolean

  @Field('groups_list')
  groupsList!: any[]

  @Field('item_type')
  orderItemType!: string

  @Field('sales')
  sales!: number

  @Field('sales_setting')
  salesSetting!: any

  @Field('start_num')
  startNum!: number

  // 价格字段转换（分转元）
  @Field('price', (price: number) => price / 100)
  price!: number

  @Field('activity_price', (activity_price: number) => activity_price / 100)
  activityPrice!: number

  @Field('market_price', (market_price: number) => market_price / 100)
  marketPrice!: number

  @Field('member_price', (member_price: number) => member_price / 100)
  memberPrice!: number

  @Field('vip_price', (vip_price: number) => vip_price / 100)
  vipPrice!: number

  @Field('svip_price', (svip_price: number) => svip_price / 100)
  svipPrice!: number

  @Field('package_price', (package_price: number) => package_price / 100)
  packagePrice!: number

  // 复杂字段转换 - 使用 getter 方法
  @Field('regions')
  regions!: any[]

  @Field('item_unit')
  itemUnit!: string

  @Field('item_params')
  itemParamsSource!: any[]

  // 计算字段 - 使用 @ComputedField 装饰器
  @ComputedField('itemParams')
  get itemParams(): any[] {
    const res: any[] = []
    
    // 处理计量单位
    if (this.itemUnit) {
      res.push({ 
        attribute_name: '计量单位', 
        attribute_value_name: this.itemUnit 
      })
    }
    
    // 处理产地信息
    if (this.regions) {
      // 确保regions是数组
      const regionsArray = Array.isArray(this.regions) ? this.regions : [this.regions]
      res.push({ 
        attribute_name: '产地', 
        attribute_value_name: regionsArray.join(' ') 
      })
    }
    
    // 合并原有参数
    return res.concat(this.itemParamsSource || [])
  }

  @Field('promotion_activity')
  promotionActivitySource!: any

  @ComputedField('promotionActivity')
  get promotionActivity(): any {
    if (!this.promotionActivitySource) {
      return []
    }
    
    // 简化的促销活动转换
    return {
      joinLimit: parseInt(this.promotionActivitySource.join_limit || '0'),
      promotionTag: this.promotionActivitySource.promotion_tag,
      marketingName: this.promotionActivitySource.marketing_name,
      marketingType: this.promotionActivitySource.marketing_type,
      marketingId: this.promotionActivitySource.marketing_id
    }
  }

  // 固定值字段
  @ComputedField('specText')
  get specText(): string {
    return '' // 固定为空
  }

  /**
   * 从源数据创建转换器实例
   */
  static fromSource(source: any): ItemDetailTransformer {
    const transformer = new ItemDetailTransformer()
    const mappings = getFieldMappings(ItemDetailTransformer)
  
    mappings.forEach(({ propertyKey, sourceKey, transform, isComputed }) => {
      if (!isComputed) {
        const value = source[sourceKey]
        ;(transformer as any)[propertyKey] = transform ? transform(value) : value
      }
    })
    console.log('transform-------fromSource-transformer',transformer)
    return transformer
  }
}

export const itemDetailTransformer = {
  transform: (source: any) => ItemDetailTransformer.fromSource(source).toTarget()
}

