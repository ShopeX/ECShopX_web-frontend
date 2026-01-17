---
name: ecshopx-payment
description: "ECShopX 支付功能开发指南。包含支付方式选择、支付创建、支付回调、支付状态查询、退款等功能。适用场景: (1) 开发支付页面 (2) 集成第三方支付 (3) 处理支付回调 (4) 支付状态轮询 (5) 退款功能。采用简化架构，支付通常不需要全局状态。"
---

# 支付功能开发

## 概述

支付是交易闭环的关键环节，需要与第三方支付平台（微信、支付宝等）对接。

**核心流程**：
1. 创建支付订单
2. 选择支付方式
3. 调起支付（微信/支付宝/余额）
4. 接收支付回调
5. 更新订单状态
6. 展示支付结果

**架构方案**：**方案 2（简化架构）** - 支付流程是一次性的，不需要全局状态

## 快速开始

### 基本结构

```
app/
├── pages/payment/
│   ├── [orderId].vue            # 支付页面
│   └── result.vue               # 支付结果页
│
├── components/business/payment/
│   ├── PaymentMethods.vue       # 支付方式选择
│   └── PaymentResult.vue        # 支付结果
│
├── composables/
│   └── usePayment.ts            # 支付逻辑
│
└── infrastructure/http/clients/
    └── PaymentApiClient.ts      # 支付 API
```

## 核心功能实现

### 1. 支付页面

```vue
<!-- app/pages/payment/[orderId].vue -->
<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
    </div>
    
    <div v-else-if="paymentInfo" class="space-y-6">
      <!-- 订单信息 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-bold mb-4">订单信息</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">订单号：</span>
            <span>{{ paymentInfo.orderNo }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">订单金额：</span>
            <span class="text-2xl font-bold text-primary">
              ¥{{ paymentInfo.amount.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 支付方式选择 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-bold mb-4">选择支付方式</h2>
        <PaymentMethods 
          v-model:selected="selectedMethod"
          :available-methods="paymentInfo.availableMethods"
        />
      </div>
      
      <!-- 支付按钮 -->
      <UButton
        block
        size="lg"
        :loading="paying"
        :disabled="!selectedMethod"
        @click="handlePay"
      >
        立即支付 ¥{{ paymentInfo.amount.toFixed(2) }}
      </UButton>
      
      <!-- 支付提示 -->
      <div class="text-center text-sm text-gray-500">
        <p>请在 {{ countdown }} 分钟内完成支付</p>
        <p class="mt-2">支付过程中请勿关闭页面</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId as string

const { 
  paymentInfo,
  loading,
  paying,
  countdown,
  loadPaymentInfo,
  createPayment,
  checkPaymentStatus
} = usePayment()

const selectedMethod = ref<string>('')

// 加载支付信息
onMounted(async () => {
  await loadPaymentInfo(orderId)
  
  // 开始倒计时
  startCountdown()
  
  // 开始轮询支付状态
  startPolling()
})

// 倒计时
let countdownTimer: NodeJS.Timeout
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer)
      // 超时处理
      useMessage().warning('支付超时，请重新下单')
      router.push('/orders')
    }
  }, 60000)  // 每分钟更新一次
}

// 轮询支付状态
let pollingTimer: NodeJS.Timeout
const startPolling = () => {
  pollingTimer = setInterval(async () => {
    const status = await checkPaymentStatus(orderId)
    
    if (status === 'paid') {
      clearInterval(pollingTimer)
      clearInterval(countdownTimer)
      router.push({
        path: '/payment/result',
        query: { orderId, status: 'success' }
      })
    }
  }, 3000)  // 每 3 秒查询一次
}

// 发起支付
const handlePay = async () => {
  if (!selectedMethod.value) {
    useMessage().warning('请选择支付方式')
    return
  }
  
  try {
    const paymentUrl = await createPayment(orderId, selectedMethod.value)
    
    // 跳转到第三方支付页面
    window.location.href = paymentUrl
  } catch (error: any) {
    useMessage().error(`支付失败: ${error.message}`)
  }
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (pollingTimer) clearInterval(pollingTimer)
})
</script>
```

### 2. 支付 Composable

```typescript
// app/composables/usePayment.ts

import { ref, readonly } from 'vue'
import { paymentApiClient } from '~/infrastructure/http/clients/PaymentApiClient'
import { logger } from '~/utils/log'

interface IPaymentInfo {
  orderNo: string
  amount: number
  availableMethods: Array<{
    code: string
    name: string
    icon: string
  }>
}

export function usePayment() {
  const paymentInfo = ref<IPaymentInfo | null>(null)
  const loading = ref(false)
  const paying = ref(false)
  const countdown = ref(30)  // 30 分钟倒计时
  
  /**
   * 加载支付信息
   */
  async function loadPaymentInfo(orderId: string) {
    loading.value = true
    
    try {
      const response = await paymentApiClient.getPaymentInfo(orderId)
      
      paymentInfo.value = {
        orderNo: response.order_no,
        amount: response.amount,
        availableMethods: response.payment_methods.map(method => ({
          code: method.code,
          name: method.name,
          icon: method.icon
        }))
      }
      
      logger.info('[usePayment] 加载支付信息成功:', orderId)
    } catch (e: any) {
      logger.error('[usePayment] 加载支付信息失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建支付
   */
  async function createPayment(
    orderId: string,
    paymentMethod: string
  ): Promise<string> {
    paying.value = true
    
    try {
      const response = await paymentApiClient.createPayment({
        order_id: orderId,
        payment_method: paymentMethod
      })
      
      logger.info('[usePayment] 创建支付成功:', orderId, paymentMethod)
      
      // 返回支付 URL
      return response.payment_url
    } catch (e: any) {
      logger.error('[usePayment] 创建支付失败:', e)
      throw e
    } finally {
      paying.value = false
    }
  }
  
  /**
   * 查询支付状态
   */
  async function checkPaymentStatus(orderId: string): Promise<string> {
    try {
      const response = await paymentApiClient.checkPaymentStatus(orderId)
      return response.status
    } catch (e: any) {
      logger.error('[usePayment] 查询支付状态失败:', e)
      return 'unknown'
    }
  }
  
  /**
   * 申请退款
   */
  async function requestRefund(orderId: string, reason: string) {
    try {
      await paymentApiClient.requestRefund({
        order_id: orderId,
        reason
      })
      
      logger.info('[usePayment] 申请退款成功:', orderId)
      return true
    } catch (e: any) {
      logger.error('[usePayment] 申请退款失败:', e)
      throw e
    }
  }
  
  return {
    paymentInfo: readonly(paymentInfo),
    loading: readonly(loading),
    paying: readonly(paying),
    countdown,
    
    loadPaymentInfo,
    createPayment,
    checkPaymentStatus,
    requestRefund
  }
}
```

### 3. 支付方式选择组件

```vue
<!-- app/components/business/payment/PaymentMethods.vue -->
<template>
  <div class="space-y-3">
    <button
      v-for="method in availableMethods"
      :key="method.code"
      :class="[
        'w-full flex items-center gap-4 p-4 border rounded-lg transition-colors',
        selected === method.code
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-primary/50'
      ]"
      @click="selectMethod(method.code)"
    >
      <!-- 支付方式图标 -->
      <img 
        :src="method.icon" 
        :alt="method.name"
        class="w-10 h-10"
      />
      
      <!-- 支付方式名称 -->
      <span class="flex-1 text-left font-medium">
        {{ method.name }}
      </span>
      
      <!-- 选中图标 -->
      <Icon
        v-if="selected === method.code"
        name="i-heroicons-check-circle-solid"
        class="w-6 h-6 text-primary"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
interface PaymentMethod {
  code: string
  name: string
  icon: string
}

interface Props {
  availableMethods: PaymentMethod[]
  selected?: string
}

interface Emits {
  (e: 'update:selected', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectMethod = (code: string) => {
  emit('update:selected', code)
}
</script>
```

### 4. 支付结果页

```vue
<!-- app/pages/payment/result.vue -->
<template>
  <div class="container mx-auto px-4 py-20 max-w-md">
    <div class="text-center">
      <!-- 成功 -->
      <div v-if="status === 'success'" class="space-y-6">
        <div class="text-green-500 text-6xl">✓</div>
        <h1 class="text-2xl font-bold">支付成功</h1>
        <p class="text-gray-600">您的订单已支付成功</p>
        
        <div class="flex gap-4">
          <UButton to="/orders" variant="outline" block>
            查看订单
          </UButton>
          <UButton to="/" block>
            继续购物
          </UButton>
        </div>
      </div>
      
      <!-- 失败 -->
      <div v-else class="space-y-6">
        <div class="text-red-500 text-6xl">✗</div>
        <h1 class="text-2xl font-bold">支付失败</h1>
        <p class="text-gray-600">{{ errorMessage || '支付过程中出现错误' }}</p>
        
        <div class="flex gap-4">
          <UButton 
            :to="`/payment/${orderId}`" 
            variant="outline" 
            block
          >
            重新支付
          </UButton>
          <UButton to="/orders" block>
            查看订单
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const orderId = route.query.orderId as string
const status = route.query.status as string
const errorMessage = route.query.error as string

// SEO
useHead({
  title: status === 'success' ? '支付成功' : '支付失败',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>
```

## 第三方支付集成

### 微信支付

```typescript
// 创建微信支付
const response = await paymentApiClient.createPayment({
  order_id: orderId,
  payment_method: 'wechat'
})

// H5 支付：跳转到微信支付页面
window.location.href = response.payment_url

// JSAPI 支付：调起微信支付
if (typeof WeixinJSBridge !== 'undefined') {
  WeixinJSBridge.invoke('getBrandWCPayRequest', {
    appId: response.appId,
    timeStamp: response.timeStamp,
    nonceStr: response.nonceStr,
    package: response.package,
    signType: response.signType,
    paySign: response.paySign
  }, (res: any) => {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      // 支付成功
    }
  })
}
```

### 支付宝支付

```typescript
// 创建支付宝支付
const response = await paymentApiClient.createPayment({
  order_id: orderId,
  payment_method: 'alipay'
})

// 跳转到支付宝页面
window.location.href = response.payment_url
```

## 开发检查清单

- [ ] 支付页面开发
- [ ] 支付方式选择
- [ ] 支付创建接口
- [ ] 支付状态轮询
- [ ] 支付回调处理（后端）
- [ ] 支付结果页
- [ ] 支付超时处理
- [ ] 退款功能

## 安全注意事项

1. **金额校验**：前后端都要校验金额
2. **签名验证**：回调必须验证签名
3. **幂等性**：防止重复支付
4. **敏感信息**：不在前端暴露支付密钥
5. **HTTPS**：支付必须使用 HTTPS

## 常见问题

**Q: 支付状态如何实时更新？**
A: 采用轮询方式，每 3 秒查询一次。也可以用 WebSocket 推送。

**Q: 支付超时如何处理？**
A: 设置 30 分钟倒计时，超时后关闭订单。

**Q: 如何处理支付回调？**
A: 后端接收回调，验证签名，更新订单状态，前端通过轮询获取最新状态。

**Q: 支付失败如何处理？**
A: 允许用户重新支付，或取消订单。

---

**相关 Skills**：
- `ecshopx-checkout` - 结账流程（创建订单）
- `ecshopx-order` - 订单管理（查看支付状态）

**最后更新**：2025-01-12
