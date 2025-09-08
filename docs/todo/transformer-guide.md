# 商品数据转换器使用指南

## 概述

本项目使用基于装饰器的数据转换器来替代传统的 `pickBy` 函数，实现 API 响应数据到前端显示数据的转换。

## 转换器架构

### 装饰器定义

```typescript
// Field 装饰器只接受两个参数：
// 1. sourceKey: 源数据中的字段名
// 2. transform: 可选的转换函数，只接受一个参数（字段值）
@Field(sourceKey: string, transform?: (value: any) => any)
```

### 转换器类结构

```typescript
@AutoMap
export class ItemListTransformer {
  // 直接映射字段
  @Field('item_id')
  itemId!: string

  // 带转换函数的字段
  @Field('price', (price: number) => price / 100)
  price!: number

  // 复杂转换需要自定义方法
  @Field('medicine_data')
  medicineData!: any

  // 自定义转换方法
  get isPrescription(): boolean {
    return this.medicineData?.is_prescription || false
  }
}
```

## 转换规则

### 1. 商品列表转换 (ITEM_LIST_GOODS)

#### 基础字段映射
```typescript
@AutoMap
export class ItemListTransformer {
  // 商品图片处理
  @Field('pics', (pics: any) => {
    if (!pics) return ''
    if (typeof pics !== 'string') {
      return pics[0] // 直接取第一张图片
    }
    try {
      return JSON.parse(pics)[0] // 解析JSON字符串后取第一张
    } catch {
      return ''
    }
  })
  pic!: string

  // 基础信息字段
  @Field('item_id')
  itemId!: string

  @Field('item_name')
  itemName!: string

  @Field('brief')
  brief!: string

  @Field('distributor_id')
  distributorId!: string

  @Field('distributor_info')
  distributor_info!: any

  @Field('promotion_activity')
  promotion!: any

  @Field('origincountry_name')
  origincountry_name!: string

  @Field('origincountry_img_url')
  origincountry_img_url!: string

  @Field('type')
  type!: string

  @Field('store')
  store!: any

  @Field('medicine_data')
  medicineData!: any

  @Field('is_medicine')
  isMedicine!: boolean
}
```

#### 价格字段转换（分转元）
```typescript
// 所有价格字段都需要除以100，从分转换为元
@Field('price', (price: number) => price / 100)
price!: number

@Field('activity_price', (activity_price: number) => Number(activity_price) / 100)
activityPrice!: number

@Field('market_price', (market_price: number) => market_price / 100)
marketPrice!: number

@Field('member_price', (member_price: number) => member_price / 100)
memberPrice!: number

@Field('vip_price', (vip_price: number) => vip_price / 100)
vipPrice!: number

@Field('svip_price', (svip_price: number) => svip_price / 100)
svipPrice!: number
```

#### 条件字段转换
```typescript
// 处方药判断逻辑 - 使用 getter 方法
@Field('medicine_data')
medicineData!: any

@Field('is_prescription')
isPrescriptionSource!: boolean

// 自定义 getter 处理复杂逻辑
get isPrescription(): boolean {
  return this.isPrescriptionSource || this.medicineData?.is_prescription || false
}
```

### 2. 商品详情转换 (GOODS_INFO)

#### 基础字段映射
```typescript
@AutoMap
export class ItemDetailTransformer {
  @Field('item_id')
  itemId!: string

  @Field('item_bn')
  itemBn!: string

  @Field('itemName')
  itemName!: string

  @Field('brief')
  brief!: string

  @Field('pics', (pics: any) => pics?.[0] || '')
  img!: string

  @Field('pics')
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

  // 固定值字段
  get specText(): string {
    return '' // 固定为空
  }
}
```

#### 复杂字段转换
```typescript
// 商品参数处理 - 使用 getter 方法
@Field('regions')
regions!: any[]

@Field('item_unit')
itemUnit!: string

@Field('item_params')
itemParamsSource!: any[]

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
    const regionsArray = Array.isArray(this.regions) ? this.regions : [this.regions]
    res.push({ 
      attribute_name: '产地', 
      attribute_value_name: regionsArray.join(' ') 
    })
  }
  
  // 合并原有参数
  return res.concat(this.itemParamsSource || [])
}

// 促销活动处理
@Field('promotion_activity')
promotionActivitySource!: any

get promotionActivity(): any {
  if (!this.promotionActivitySource) {
    return []
  }
  
  return {
    joinLimit: parseInt(this.promotionActivitySource.join_limit || '0'),
    promotionTag: this.promotionActivitySource.promotion_tag,
    marketingName: this.promotionActivitySource.marketing_name,
    marketingType: this.promotionActivitySource.marketing_type,
    marketingId: this.promotionActivitySource.marketing_id
  }
}
```

### 3. 积分商品转换 (ITEM_LIST_POINT_GOODS)

```typescript
@AutoMap
export class PointItemTransformer extends ItemListTransformer {
  @Field('point')
  point!: number
}
```

## 使用方式

### 1. 单个商品转换
```typescript
import { ItemListTransformer } from '~/transformers/list'

const transformer = ItemListTransformer.fromSource(apiItem)
const transformedItem = transformer.toTarget()
```

### 2. 商品列表转换
```typescript
import { ItemListTransformer } from '~/transformers/list'

const transformers = ItemListTransformer.fromList(apiList)
const transformedList = transformers.map(transformer => transformer.toTarget())
```

### 3. 使用转换器实例
```typescript
import { itemListTransformer } from '~/transformers/list'

// 单个转换
const transformedItem = itemListTransformer.transform(apiItem)

// 列表转换
const transformedList = itemListTransformer.transformList(apiList)
```

## 注意事项

### 1. 字段映射限制
- `Field` 装饰器的转换函数只能接受一个参数（字段值）
- 如果需要访问其他字段，使用 getter 方法
- 复杂转换逻辑应该在 getter 中实现

### 2. 类型安全
- 所有字段都应该有明确的类型定义
- 使用 `!` 断言非空字段
- 可选字段使用 `?` 标记

### 3. 性能考虑
- 转换器实例会被缓存
- 避免在转换函数中进行复杂计算
- 复杂逻辑使用 getter 延迟计算

### 4. 错误处理
- 转换函数应该处理异常情况
- 提供合理的默认值
- 使用 try-catch 处理 JSON 解析等操作

## 最佳实践

### 1. 转换器设计
```typescript
@AutoMap
export class MyTransformer {
  // 简单字段直接映射
  @Field('simple_field')
  simpleField!: string

  // 需要转换的字段
  @Field('price', (price: number) => price / 100)
  price!: number

  // 复杂字段使用 getter
  @Field('complex_data')
  complexData!: any

  get processedData(): any {
    // 复杂处理逻辑
    return this.complexData ? processComplexData(this.complexData) : null
  }
}
```

### 2. 错误处理
```typescript
@Field('pics', (pics: any) => {
  try {
    if (!pics) return ''
    if (typeof pics !== 'string') {
      return pics[0] || ''
    }
    return JSON.parse(pics)[0] || ''
  } catch (error) {
    console.warn('图片解析失败:', error)
    return ''
  }
})
pic!: string
```

### 3. 类型定义
```typescript
interface ITransformedItem {
  itemId: string
  itemName: string
  price: number
  pic: string
  // ... 其他字段
}

// 在转换器中使用
@AutoMap
export class ItemListTransformer implements ITransformedItem {
  // 实现接口
}
```

这份文档提供了完整的转换器使用指南，确保开发者能够正确使用基于装饰器的数据转换器。