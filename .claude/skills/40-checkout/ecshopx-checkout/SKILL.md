---
name: ecshopx-checkout
description: "ECShopX 结账流程开发指南。包含结账页面、地址选择、配送方式、优惠券使用、订单确认和下单等功能。适用场景: (1) 开发结账页面 (2) 实现地址管理 (3) 配送方式选择 (4) 优惠券功能 (5) 订单提交流程。采用完整架构方案，涉及多个状态管理。"
---

# 结账流程开发

## 概述

结账是 B2C 商城的关键转化环节，涉及地址、配送、优惠券、支付等多个模块的协同。

**核心流程**：
1. 进入结账页 → 显示选中商品
2. 选择/新增收货地址
3. 选择配送方式
4. 选择/输入优惠券
5. 确认订单信息
6. 提交订单
7. 跳转支付

**架构方案**：**方案 1（完整架构）** - 需要 Store 管理结账状态

## 快速开始

### 基本结构

```
app/
├── pages/checkout/
│   └── index.vue                 # 结账页面
│
├── components/business/checkout/
│   ├── AddressSelector.vue       # 地址选择器
│   ├── DeliverySelector.vue      # 配送方式选择
│   ├── CouponSelector.vue        # 优惠券选择
│   └── OrderSummary.vue          # 订单摘要
│
├── composables/
│   ├── useCheckout.ts            # 结账逻辑
│   └── useAddress.ts             # 地址管理
│
├── stores/
│   ├── checkout.ts               # 结账状态
│   └── address.ts                # 地址状态
│
└── infrastructure/http/clients/
    ├── CheckoutApiClient.ts      # 结账 API
    └── AddressApiClient.ts       # 地址 API
```

## 核心功能实现

### 1. 结账页面

```vue
<!-- app/pages/checkout/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">确认订单</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：结账信息 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 收货地址 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="font-medium mb-4">收货地址</h2>
          <AddressSelector v-model:selected="selectedAddressId" />
        </div>
        
        <!-- 配送方式 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="font-medium mb-4">配送方式</h2>
          <DeliverySelector v-model:selected="selectedDeliveryId" />
        </div>
        
        <!-- 优惠券 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="font-medium mb-4">优惠券</h2>
          <CouponSelector v-model:selected="selectedCouponId" />
        </div>
        
        <!-- 商品清单 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="font-medium mb-4">商品清单</h2>
          <div class="space-y-4">
            <div 
              v-for="item in checkoutItems" 
              :key="item.id"
              class="flex gap-4"
            >
              <img 
                :src="item.productImage" 
                :alt="item.productName"
                class="w-20 h-20 rounded object-cover"
              />
              <div class="flex-1">
                <p class="font-medium">{{ item.productName }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  ¥{{ item.price }} × {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium">¥{{ item.subtotal }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：订单摘要 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg p-6 shadow-sm sticky top-4">
          <h2 class="font-medium mb-4">订单摘要</h2>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span>商品金额</span>
              <span>¥{{ orderSummary.itemsTotal }}</span>
            </div>
            <div class="flex justify-between">
              <span>运费</span>
              <span>¥{{ orderSummary.shippingFee }}</span>
            </div>
            <div v-if="orderSummary.couponDiscount > 0" class="flex justify-between text-red-600">
              <span>优惠券</span>
              <span>-¥{{ orderSummary.couponDiscount }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-lg font-bold">
              <span>应付金额</span>
              <span class="text-primary">¥{{ orderSummary.totalAmount }}</span>
            </div>
          </div>
          
          <UButton 
            block 
            size="lg"
            class="mt-6"
            :loading="submitting"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            提交订单
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { 
  checkoutItems,
  orderSummary,
  canSubmit,
  submitting,
  submitOrder
} = useCheckout()

const selectedAddressId = ref<string | null>(null)
const selectedDeliveryId = ref<string | null>(null)
const selectedCouponId = ref<string | null>(null)

// 提交订单
const handleSubmit = async () => {
  if (!selectedAddressId.value) {
    useMessage().error('请选择收货地址')
    return
  }
  
  try {
    const orderId = await submitOrder({
      addressId: selectedAddressId.value,
      deliveryId: selectedDeliveryId.value,
      couponId: selectedCouponId.value
    })
    
    // 跳转到支付页面
    router.push(`/payment/${orderId}`)
  } catch (error: any) {
    useMessage().error(`下单失败: ${error.message}`)
  }
}

// SEO
useHead({
  title: '确认订单',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>
```

### 2. 结账 Composable

```typescript
// app/composables/useCheckout.ts

import { ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'
import { checkoutApiClient } from '~/infrastructure/http/clients/CheckoutApiClient'
import { logger } from '~/utils/log'

export function useCheckout() {
  const cartStore = useCartStore()
  
  const submitting = ref(false)
  const orderSummary = ref({
    itemsTotal: 0,
    shippingFee: 0,
    couponDiscount: 0,
    totalAmount: 0
  })
  
  // 结账商品列表（来自购物车选中项）
  const checkoutItems = computed(() => cartStore.selectedItems)
  
  // 是否可以提交
  const canSubmit = computed(() => {
    return checkoutItems.value.length > 0 && !submitting.value
  })
  
  /**
   * 计算订单金额
   */
  async function calculateOrder(params: {
    addressId?: string
    deliveryId?: string
    couponId?: string
  }) {
    try {
      const response = await checkoutApiClient.calculateOrder({
        items: checkoutItems.value.map(item => ({
          item_id: item.productId,
          quantity: item.quantity
        })),
        ...params
      })
      
      orderSummary.value = {
        itemsTotal: response.items_total,
        shippingFee: response.shipping_fee,
        couponDiscount: response.coupon_discount,
        totalAmount: response.total_amount
      }
    } catch (e: any) {
      logger.error('[useCheckout] 计算订单失败:', e)
    }
  }
  
  /**
   * 提交订单
   */
  async function submitOrder(params: {
    addressId: string
    deliveryId?: string | null
    couponId?: string | null
  }): Promise<string> {
    submitting.value = true
    
    try {
      const response = await checkoutApiClient.createOrder({
        items: checkoutItems.value.map(item => ({
          item_id: item.productId,
          quantity: item.quantity,
          sku_id: item.skuInfo?.skuId
        })),
        address_id: params.addressId,
        delivery_id: params.deliveryId,
        coupon_id: params.couponId
      })
      
      logger.info('[useCheckout] 下单成功:', response.order_id)
      
      // 清空购物车选中项
      // await cartStore.clearSelected()
      
      return response.order_id
    } catch (e: any) {
      logger.error('[useCheckout] 下单失败:', e)
      throw e
    } finally {
      submitting.value = false
    }
  }
  
  return {
    checkoutItems,
    orderSummary,
    canSubmit,
    submitting,
    calculateOrder,
    submitOrder
  }
}
```

### 3. 地址选择器

```vue
<!-- app/components/business/checkout/AddressSelector.vue -->
<template>
  <div class="space-y-3">
    <!-- 地址列表 -->
    <div 
      v-for="address in addresses" 
      :key="address.id"
      :class="[
        'border rounded-lg p-4 cursor-pointer transition-colors',
        selected === address.id 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-200 hover:border-primary/50'
      ]"
      @click="selectAddress(address.id)"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-medium">{{ address.consignee }}</span>
            <span class="text-gray-600">{{ address.mobile }}</span>
            <span v-if="address.isDefault" class="text-xs bg-primary text-white px-2 py-0.5 rounded">
              默认
            </span>
          </div>
          <p class="text-sm text-gray-600">
            {{ address.fullAddress }}
          </p>
        </div>
        
        <Icon 
          v-if="selected === address.id"
          name="i-heroicons-check-circle-solid" 
          class="w-6 h-6 text-primary"
        />
      </div>
    </div>
    
    <!-- 新增地址按钮 -->
    <button 
      class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-primary hover:text-primary transition-colors"
      @click="showAddAddressModal = true"
    >
      <Icon name="i-heroicons-plus" class="w-5 h-5 inline mr-2" />
      新增收货地址
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selected?: string | null
}

interface Emits {
  (e: 'update:selected', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { addresses, loadAddresses } = useAddress()
const showAddAddressModal = ref(false)

onMounted(() => {
  loadAddresses()
})

const selectAddress = (addressId: string) => {
  emit('update:selected', addressId)
}
</script>
```

## 开发检查清单

- [ ] 创建结账页面
- [ ] 实现地址选择功能
- [ ] 实现配送方式选择
- [ ] 实现优惠券功能
- [ ] 实现订单金额计算
- [ ] 实现订单提交
- [ ] 测试完整流程
- [ ] 处理异常情况（地址为空、库存不足等）

## 常见问题

**Q: 订单金额何时计算？**
A: 进入页面时计算一次，选择地址/配送/优惠券时重新计算。

**Q: 如何处理库存不足？**
A: 在提交订单前再次校验库存，如不足则提示用户并阻止提交。

**Q: 优惠券如何验证？**
A: 调用后端接口验证，后端返回折扣金额和验证结果。

---

**相关 Skills**：
- `ecshopx-cart` - 购物车功能
- `ecshopx-account` - 账号管理（地址管理）

**最后更新**：2025-01-11
