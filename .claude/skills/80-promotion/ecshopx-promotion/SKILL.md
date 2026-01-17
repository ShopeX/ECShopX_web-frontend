---
name: ecshopx-promotion
description: "ECShopX 促销活动功能开发指南。包含优惠券领取/使用、限时折扣、满减活动、优惠规则计算等。适用场景: (1) 开发优惠券功能 (2) 实现促销活动展示 (3) 优惠规则验证 (4) 优惠金额计算 (5) 优惠券中心页面。混合架构：优惠券列表用简化架构，用户优惠券用Store管理。"
---

# 促销活动功能开发

## 概述

促销活动是提升转化率的重要手段，包括优惠券、限时折扣、满减等多种形式。

**核心功能**：
- 优惠券领取和使用
- 优惠券中心
- 用户优惠券列表
- 优惠规则验证
- 优惠金额计算
- 促销活动展示

**架构方案**：**混合架构**
- 优惠券列表：方案 2（简化）
- 用户优惠券：方案 1（需要 Store 和持久化）

## 快速开始

### 基本结构

```
app/
├── pages/
│   ├── coupons/
│   │   ├── index.vue            # 优惠券中心
│   │   └── my.vue               # 我的优惠券
│   └── promotions/
│       └── [id].vue             # 促销活动详情
│
├── components/business/promotion/
│   ├── CouponCard.vue           # 优惠券卡片
│   ├── CouponList.vue           # 优惠券列表
│   └── PromotionBanner.vue      # 促销横幅
│
├── composables/
│   └── useCoupon.ts             # 优惠券逻辑
│
├── stores/
│   └── coupon.ts                # 用户优惠券 Store
│
└── infrastructure/http/clients/
    └── CouponApiClient.ts       # 优惠券 API
```

## 核心功能实现

### 1. 优惠券中心

```vue
<!-- app/pages/coupons/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">领券中心</h1>
    
    <!-- 优惠券列表 -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
    
    <div v-else-if="hasCoupons" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CouponCard
        v-for="coupon in coupons"
        :key="coupon.id"
        :coupon="coupon"
        @claim="handleClaim"
      />
    </div>
    
    <div v-else class="text-center py-20">
      <p class="text-gray-500">暂无可领取的优惠券</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { coupons, loading, loadCoupons, claimCoupon } = useCoupon()

const hasCoupons = computed(() => coupons.value.length > 0)

onMounted(() => {
  loadCoupons()
})

const handleClaim = async (couponId: string) => {
  try {
    await claimCoupon(couponId)
    useMessage().success('领取成功')
    loadCoupons()  // 重新加载
  } catch (error: any) {
    useMessage().error(`领取失败: ${error.message}`)
  }
}
</script>
```

### 2. 我的优惠券

```vue
<!-- app/pages/coupons/my.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">我的优惠券</h1>
    
    <!-- 状态标签 -->
    <div class="flex gap-4 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentTab === tab.value
            ? 'bg-primary text-white'
            : 'bg-gray-100'
        ]"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <!-- 优惠券列表 -->
    <div v-if="hasMyCoupons" class="space-y-4">
      <CouponCard
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        :coupon="coupon"
        :show-status="true"
      />
    </div>
    
    <div v-else class="text-center py-20">
      <p class="text-gray-500">暂无优惠券</p>
      <UButton to="/coupons" class="mt-4">去领券</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { myCoupons, loadMyCoupons } = useCoupon()

const currentTab = ref('available')
const tabs = [
  { label: '可使用', value: 'available' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' }
]

const hasMyCoupons = computed(() => myCoupons.value.length > 0)

const filteredCoupons = computed(() => {
  return myCoupons.value.filter(coupon => {
    if (currentTab.value === 'available') return coupon.status === 'available'
    if (currentTab.value === 'used') return coupon.status === 'used'
    if (currentTab.value === 'expired') return coupon.status === 'expired'
    return true
  })
})

onMounted(() => {
  loadMyCoupons()
})
</script>
```

### 3. 优惠券卡片

```vue
<!-- app/components/business/promotion/CouponCard.vue -->
<template>
  <div :class="[
    'relative overflow-hidden rounded-lg border-2 transition-all',
    coupon.status === 'available' 
      ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5'
      : 'border-gray-200 bg-gray-50 opacity-60'
  ]">
    <div class="p-4 flex items-center gap-4">
      <!-- 金额 -->
      <div class="text-center min-w-[80px]">
        <div class="text-2xl font-bold text-primary">
          <span class="text-sm">¥</span>{{ coupon.amount }}
        </div>
        <div v-if="coupon.minAmount" class="text-xs text-gray-500 mt-1">
          满{{ coupon.minAmount }}可用
        </div>
      </div>
      
      <!-- 信息 -->
      <div class="flex-1">
        <h3 class="font-medium">{{ coupon.name }}</h3>
        <p class="text-sm text-gray-500 mt-1">
          有效期至：{{ formatDate(coupon.expireAt) }}
        </p>
      </div>
      
      <!-- 按钮 -->
      <div>
        <UButton
          v-if="!showStatus && coupon.status === 'available'"
          size="sm"
          @click="$emit('claim', coupon.id)"
        >
          立即领取
        </UButton>
        
        <div v-else-if="showStatus" class="text-sm">
          <span v-if="coupon.status === 'available'" class="text-primary">可使用</span>
          <span v-else-if="coupon.status === 'used'" class="text-gray-400">已使用</span>
          <span v-else class="text-gray-400">已过期</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Coupon {
  id: string
  name: string
  amount: number
  minAmount?: number
  expireAt: string
  status: 'available' | 'used' | 'expired'
}

interface Props {
  coupon: Coupon
  showStatus?: boolean
}

interface Emits {
  (e: 'claim', couponId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>
```

### 4. 优惠券 Composable

```typescript
// app/composables/useCoupon.ts

import { ref, computed, readonly } from 'vue'
import type { ICoupon } from '~/types/coupon'
import { couponApiClient } from '~/infrastructure/http/clients/CouponApiClient'
import { useCouponStore } from '~/stores/coupon'
import { logger } from '~/utils/log'

export function useCoupon() {
  const couponStore = useCouponStore()
  
  const coupons = ref<ICoupon[]>([])  // 可领取的优惠券
  const loading = ref(false)
  
  /**
   * 加载可领取的优惠券
   */
  async function loadCoupons() {
    loading.value = true
    
    try {
      const response = await couponApiClient.getAvailableCoupons()
      coupons.value = response.list
      
      logger.info('[useCoupon] 加载优惠券成功:', coupons.value.length)
    } catch (e: any) {
      logger.error('[useCoupon] 加载优惠券失败:', e)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 领取优惠券
   */
  async function claimCoupon(couponId: string) {
    try {
      await couponApiClient.claimCoupon(couponId)
      
      // 重新加载用户优惠券
      await couponStore.loadMyCoupons()
      
      logger.info('[useCoupon] 领取优惠券成功:', couponId)
      return true
    } catch (e: any) {
      logger.error('[useCoupon] 领取优惠券失败:', e)
      throw e
    }
  }
  
  /**
   * 加载我的优惠券
   */
  async function loadMyCoupons() {
    await couponStore.loadMyCoupons()
  }
  
  /**
   * 验证优惠券是否可用
   */
  async function validateCoupon(
    couponId: string,
    orderAmount: number
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      const response = await couponApiClient.validateCoupon({
        coupon_id: couponId,
        order_amount: orderAmount
      })
      
      return {
        valid: response.valid,
        message: response.message
      }
    } catch (e: any) {
      logger.error('[useCoupon] 验证优惠券失败:', e)
      return { valid: false, message: e.message }
    }
  }
  
  return {
    coupons: readonly(coupons),
    myCoupons: computed(() => couponStore.myCoupons),
    loading: readonly(loading),
    
    loadCoupons,
    claimCoupon,
    loadMyCoupons,
    validateCoupon
  }
}
```

### 5. 优惠券 Store

```typescript
// app/stores/coupon.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ICoupon } from '~/types/coupon'
import { couponApiClient } from '~/infrastructure/http/clients/CouponApiClient'
import { logger } from '~/utils/log'

export const useCouponStore = defineStore('coupon', () => {
  const myCoupons = ref<ICoupon[]>([])
  
  // 可用优惠券
  const availableCoupons = computed(() => 
    myCoupons.value.filter(c => c.status === 'available')
  )
  
  // 可用优惠券数量
  const availableCount = computed(() => availableCoupons.value.length)
  
  /**
   * 加载我的优惠券
   */
  async function loadMyCoupons() {
    try {
      const response = await couponApiClient.getMyCoupons()
      myCoupons.value = response.list
      
      logger.info('[CouponStore] 加载我的优惠券成功:', myCoupons.value.length)
    } catch (e: any) {
      logger.error('[CouponStore] 加载我的优惠券失败:', e)
    }
  }
  
  return {
    myCoupons,
    availableCoupons,
    availableCount,
    
    loadMyCoupons
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['myCoupons']
  }
})
```

## 优惠规则示例

### 满减优惠

```typescript
// 满100减20
{
  type: 'full_discount',
  minAmount: 100,
  discountAmount: 20
}
```

### 折扣优惠

```typescript
// 8折优惠
{
  type: 'discount',
  discountRate: 0.8,  // 80%
  maxDiscountAmount: 50  // 最多优惠50元
}
```

### 无门槛优惠券

```typescript
// 立减10元
{
  type: 'voucher',
  discountAmount: 10,
  minAmount: 0
}
```

## 开发检查清单

- [ ] 优惠券中心页面
- [ ] 我的优惠券页面
- [ ] 优惠券卡片组件
- [ ] 领取优惠券功能
- [ ] 优惠券验证
- [ ] 优惠金额计算
- [ ] 优惠券状态管理
- [ ] 优惠券持久化

## 常见问题

**Q: 优惠券如何叠加使用？**
A: 由后端规则控制。通常只能使用一张优惠券。

**Q: 如何防止重复领取？**
A: 后端做限制，前端显示"已领取"状态。

**Q: 优惠金额如何计算？**
A: 后端计算并返回，前端只做展示。

---

**相关 Skills**：
- `ecshopx-checkout` - 结账流程（使用优惠券）
- `ecshopx-cart` - 购物车（展示可用优惠券）

**最后更新**：2025-01-12
