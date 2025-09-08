# 客户端商品模块字段转换逻辑文档

## 概述
本文档描述了客户端商品模块中API响应数据到前端显示数据的字段转换逻辑，基于项目中的 `doc.goods.js` 文件分析。

## 1. 商品列表字段转换 (ITEM_LIST_GOODS)

### 基础字段映射
```javascript
const ITEM_LIST_GOODS = {
  // 商品图片 - 处理图片数组或JSON字符串
  pic: ({ pics }) => {
    if (!pics) return '';
    if (typeof pics !== 'string') {
      return pics[0]; // 直接取第一张图片
    }
    return JSON.parse(pics)[0]; // 解析JSON字符串后取第一张
  },
  
  // 基础信息字段 - 直接映射
  itemId: 'item_id',           // 商品ID
  itemName: 'item_name',       // 商品名称
  brief: 'brief',              // 商品简介
  distributorId: 'distributor_id', // 分销商ID
  distributor_info: 'distributor_info', // 分销商信息
  promotion: 'promotion_activity', // 促销活动
  origincountry_name: 'origincountry_name', // 原产地名称
  origincountry_img_url: 'origincountry_img_url', // 原产地图片
  type: 'type',                // 商品类型
  store: 'store',              // 店铺信息
  medicineData: 'medicine_data', // 药品数据
  isMedicine: 'is_medicine',   // 是否药品
}
```

### 价格字段转换（分转元）
```javascript
// 所有价格字段都需要除以100，从分转换为元
price: ({ price }) => price / 100,                    // 销售价
activityPrice: ({ activity_price }) => Number(activity_price) / 100, // 活动价
marketPrice: ({ market_price }) => market_price / 100, // 市场价
memberPrice: ({ member_price }) => member_price / 100, // 会员价
vipPrice: ({ vip_price }) => vip_price / 100,         // VIP价
svipPrice: ({ svip_price }) => svip_price / 100,      // SVIP价
```

### 条件字段转换
```javascript
// 处方药判断逻辑
isPrescription: ({ medicine_data, is_prescription }) => {
  return is_prescription ? is_prescription : medicine_data?.is_prescription;
}
```

## 2. 商品详情字段转换 (GOODS_INFO)

### 基础字段映射
```javascript
const GOODS_INFO = {
  itemId: 'item_id',           // 商品ID
  itemBn: 'item_bn',           // 商品编号
  itemName: 'itemName',        // 商品名称（注意：这里直接使用itemName）
  brief: 'brief',              // 商品简介
  img: 'pics[0]',              // 主图（取第一张）
  imgs: 'pics',                // 所有图片
  companyId: 'company_id',     // 公司ID
  activityInfo: 'activity_info', // 活动信息
  activityType: 'activity_type', // 活动类型
  approveStatus: 'approve_status', // 审核状态
  point: 'point',              // 积分
  isPoint: 'is_point',         // 是否积分商品
  nospec: 'nospec',            // 无规格
  itemSpecDesc: 'item_spec_desc', // 规格描述
  specText: '',                // 规格文本（固定为空）
  vipgradeGuideTitle: 'vipgrade_guide_title', // VIP升级引导
  couponList: 'kaquan_list',   // 优惠券列表
  store: 'store',              // 店铺信息
  store_setting: 'store_setting', // 店铺设置
  limitNum: 'limit_num',       // 限购数量
  purlimitByCart: 'purchase_limit_num_by_cart', // 购物车限购
  purlimitByFastbuy: 'purchase_limit_num_by_fastbuy', // 快速购买限购
  isGift: 'is_gift',           // 是否赠品
  groupsList: 'groups_list',   // 组合列表
  orderItemType: 'item_type',  // 商品类型
  sales: 'sales',              // 销量
  salesSetting: 'sales_setting', // 销量设置
  startNum: 'start_num',       // 起订量
}
```

### 价格字段转换（分转元）
```javascript
// 详情页价格转换逻辑与列表页相同
price: ({ price }) => price / 100,                    // 销售价
activityPrice: ({ activity_price }) => activity_price / 100, // 活动价
marketPrice: ({ market_price }) => market_price / 100, // 市场价
memberPrice: ({ member_price }) => member_price / 100, // 会员价
vipPrice: ({ vip_price }) => vip_price / 100,         // VIP价
svipPrice: ({ svip_price }) => svip_price / 100,      // SVIP价
packagePrice: ({ package_price }) => package_price / 100, // 组合价
```

### 复杂字段转换

#### 商品参数处理
```javascript
itemParams: ({ regions, item_unit, item_params }) => {
  const res = [];
  
  // 处理计量单位
  if (item_unit) {
    res.push({ 
      attribute_name: '计量单位', 
      attribute_value_name: item_unit 
    });
  }
  
  // 处理产地信息
  if (regions) {
    // 确保regions是数组
    if (!Array.isArray(regions)) {
      regions = [regions];
    }
    res.push({ 
      attribute_name: '产地', 
      attribute_value_name: regions.join(' ') 
    });
  }
  
  // 合并原有参数
  return res.concat(item_params || []);
}
```

#### 促销活动处理
```javascript
promotionActivity: ({ promotion_activity }) => {
  if (!promotion_activity) {
    return [];
  }
  
  return pickBy(promotion_activity, {
    joinLimit: ({ join_limit }) => parseInt(join_limit),
    promotionTag: 'promotion_tag',
    marketingName: 'marketing_name',
    marketingType: 'marketing_type',
    marketingId: 'marketing_id',
    // ... 其他促销活动字段
  });
}
```

## 3. 积分商品字段转换 (ITEM_LIST_POINT_GOODS)

积分商品的字段转换逻辑与普通商品基本相同，主要区别是增加了积分相关字段：

```javascript
const ITEM_LIST_POINT_GOODS = {
  // ... 基础字段与ITEM_LIST_GOODS相同
  
  point: 'point',              // 积分（新增）
  
  // 价格转换逻辑相同
  price: ({ price }) => price / 100,
  activityPrice: ({ activity_price }) => activity_price / 100,
  // ... 其他价格字段
}
```

## 4. 使用示例

### 在React组件中使用
```javascript
import { pickBy } from '@/utils';
import doc from '@/doc';

// 商品列表数据处理
const processItemList = (apiResponse) => {
  const { list } = apiResponse;
  return pickBy(list, doc.goods.ITEM_LIST_GOODS);
};

// 商品详情数据处理
const processItemDetail = (apiResponse) => {
  return pickBy(apiResponse, doc.goods.GOODS_INFO);
};

// 在组件中使用
const ItemList = () => {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    const fetchItems = async () => {
      const response = await api.item.search(params);
      const processedItems = processItemList(response);
      setItems(processedItems);
    };
    
    fetchItems();
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <div key={item.itemId}>
          <img src={item.pic} alt={item.itemName} />
          <h3>{item.itemName}</h3>
          <p>价格: ¥{item.price}</p>
          {item.activityPrice && (
            <p>活动价: ¥{item.activityPrice}</p>
          )}
        </div>
      ))}
    </div>
  );
};
```

## 5. 注意事项

### 价格处理
- 所有价格字段在API中都以分为单位存储
- 前端显示时需要除以100转换为元
- 使用 `Number()` 确保数值类型转换正确

### 图片处理
- 商品图片可能是数组或JSON字符串格式
- 需要先判断类型再进行相应处理
- 列表页通常只显示第一张图片

### 条件字段
- 某些字段需要根据其他字段的值进行条件判断
- 使用可选链操作符 `?.` 避免空值错误
- 提供默认值处理异常情况

### 数组处理
- 某些字段需要确保是数组格式
- 使用 `Array.isArray()` 进行类型检查
- 提供默认空数组避免错误

## 6. 错误处理

```javascript
// 安全的字段转换函数
const safeTransform = (data, transformFn, defaultValue = null) => {
  try {
    return transformFn(data);
  } catch (error) {
    console.warn('字段转换失败:', error);
    return defaultValue;
  }
};

// 使用示例
const safePrice = safeTransform(
  { price: 1000 }, 
  ({ price }) => price / 100, 
  0
);
```

这份文档提供了完整的字段转换逻辑，可以直接在Web项目中使用。所有的转换逻辑都基于项目中的实际代码分析，确保了准确性和实用性。