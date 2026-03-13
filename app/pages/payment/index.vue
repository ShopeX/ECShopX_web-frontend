<template>
  <div class="bg-white min-h-screen flex flex-col pb-24 lg:pb-0" data-testid="payment-page">
    <!-- 无订单号 -->
    <template v-if="!hasOrderId">
      <div class="max-w-[800px] mx-auto w-full px-4 lg:px-32 pt-8 flex flex-col gap-4">
        <p class="text-[14px] leading-5 text-[#4a5565]">{{ $t('eab46cc2.941324') }}</p>
        <NuxtLink to="/cart" class="text-sm font-medium text-[#191a1d] underline">
          {{ $t('common.back') }} {{ $t('eab46cc2.983adc') }}
        </NuxtLink>
      </div>
    </template>

    <!-- 有订单号 -->
    <template v-else>
      <!-- 仅在选择支付方式 / 待支付时展示：订单摘要 + 支付方式 + 主内容区 -->
      <template
        v-if="
          !showQrcode && payResult !== 'success' && payResult !== 'fail' && payResult !== 'timeout'
        "
      >
        <div class="flex-1 flex flex-col gap-8 px-4 lg:px-32 py-8 max-w-[1440px] mx-auto w-full">
          <!-- 订单提交成功 + 剩余时间 + 订单金额（设计稿 2183:8676 / 2876:3381） -->
          <section class="border-b border-[#e5e7eb] px-0 py-6 lg:p-8" data-testid="payment-summary">
            <div
              class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 h-full lg:h-[56px]"
            >
              <div class="flex flex-col gap-[8px] justify-center">
                <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
                  {{ $t('eab46cc2.b2ec2a') }}
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-[14px] leading-5 text-[#4a5565]">{{
                    $t('eab46cc2.b7071d')
                  }}</span>
                  <span class="text-[14px] font-medium leading-5 text-[#191a1d] min-w-[118px]">{{
                    remainingTimeText
                  }}</span>
                </div>
              </div>
              <div class="flex flex-col items-start lg:items-end gap-1 justify-center">
                <span class="text-[14px] leading-5 text-[#6a7282]">{{
                  $t('eab46cc2.b1862e')
                }}</span>
                <span class="text-[24px] font-medium leading-[36px] text-[#191a1d]">
                  {{ orderAmountFormatted || (loadingOrder ? $t('product.loading') : '¥ 0.00') }}
                </span>
              </div>
            </div>
          </section>

          <!-- 请选择以下支付方式（设计稿 2183:8690 / 2876:3395） -->
          <section class="flex flex-col gap-[16px] px-0 py-6 lg:p-8">
            <p class="text-[14px] leading-5 text-[#4a5565]">
              {{ $t('eab46cc2.a8d60c') }}
            </p>
            <div v-if="loadingMethods" class="text-sm text-[#4a5565]">
              {{ $t('product.loading') }}
            </div>
            <ul
              v-else
              class="flex flex-col sm:flex-row gap-4 sm:gap-[32px]"
              data-testid="payment-method-list"
            >
              <li
                v-for="(method, index) in paymentMethods"
                :key="String(method?.code ?? method?.id ?? index)"
                class="relative flex items-center gap-4 py-4 pl-8 pr-4 border cursor-pointer transition-colors flex-1 sm:flex-none sm:w-[170px] shrink-0"
                :class="
                  selectedPayType === (method.code ?? method.id)
                    ? 'border-[#0f0f10] bg-white'
                    : 'border-[#e5e7eb] bg-white'
                "
                :data-selected="selectedPayType === (method.code ?? method.id) ? 'true' : undefined"
                data-testid="payment-method-item"
                @click="selectedPayType = method.code ?? method.id ?? ''"
              >
                <!-- 占位 Icon (根据 code 决定显示不同图标颜色，项目中没有实体资产则用 UIcon 代替) -->
                <UIcon
                  v-if="(method.code ?? method.id) === 'wxpaypc'"
                  name="i-heroicons-chat-bubble-oval-left-ellipsis-solid"
                  class="w-6 h-6 text-[#09B956]"
                />
                <UIcon
                  v-else-if="(method.code ?? method.id) === 'alipay'"
                  name="i-heroicons-credit-card-solid"
                  class="w-6 h-6 text-[#1677FF]"
                />
                <UIcon
                  v-else-if="(method.code ?? method.id) === 'unionpay'"
                  name="i-heroicons-banknotes-solid"
                  class="w-6 h-6 text-[#E60012]"
                />

                <span class="text-[14px] font-medium leading-5 text-[#101828]">
                  {{ method.name ?? method.code ?? method.id ?? '' }}
                </span>
                <span
                  v-if="selectedPayType === (method.code ?? method.id)"
                  class="absolute right-[-1px] bottom-[-1px] w-4 h-4 bg-black flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-black"
                >
                  <UIcon name="i-heroicons-check" class="w-[14px] h-[14px] text-white" />
                </span>
              </li>
            </ul>
          </section>

          <!-- 通用错误（加载失败等） -->
          <section
            v-if="error && payResult === 'idle'"
            class="p-4 border border-amber-200 bg-amber-50 rounded-lg"
            data-testid="payment-error"
          >
            <p class="text-sm text-amber-800">{{ error }}</p>
            <button
              type="button"
              class="mt-2 text-sm font-medium text-amber-700 underline"
              @click="handleRetryLoad"
            >
              {{ $t('orders.retry') }}
            </button>
          </section>
        </div>

        <!-- PC：底部固定栏 待支付 + 去支付（设计稿 2183:8717） -->
        <div
          class="hidden lg:flex flex-col items-end border-t border-[#f3f4f6] bg-white py-4 px-8 lg:px-32 gap-4"
        >
          <div class="flex items-center justify-end gap-[32px] w-full max-w-[1440px] mx-auto">
            <div class="flex items-center gap-[8px]">
              <span class="text-[14px] leading-5 text-[#4a5565]">{{ $t('eab46cc2.9246fe') }}</span>
              <span class="text-[24px] font-medium leading-[36px] text-[#191a1d]">{{
                orderAmountFormatted || '¥ 0.00'
              }}</span>
            </div>
            <button
              type="button"
              class="bg-[#0f0f10] text-white py-4 px-8 w-[200px] text-[14px] font-medium leading-5 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="payment-pay-now"
              :disabled="!canPay || loading"
              @click="payNow"
            >
              {{ loading ? $t('product.adding') : $t('eab46cc2.ae94de') }}
            </button>
          </div>
        </div>

        <!-- H5：底部吸底栏（设计稿 2876:4843） -->
        <div
          class="lg:hidden fixed bottom-0 left-0 right-0 border-t border-[#e5e7eb] bg-white py-8 px-4 flex flex-col gap-4 z-50"
        >
          <div class="flex items-center">
            <div class="flex items-center gap-[8px]">
              <span class="text-[14px] leading-5 text-[#4a5565]">{{ $t('eab46cc2.9246fe') }}</span>
              <span class="text-[24px] font-medium leading-[36px] text-[#191a1d]">{{
                orderAmountFormatted || '¥ 0.00'
              }}</span>
            </div>
          </div>
          <button
            type="button"
            class="w-full bg-[#0f0f10] text-white py-4 text-[14px] font-medium leading-5 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="payment-pay-now"
            :disabled="!canPay || loading"
            @click="payNow"
          >
            {{ loading ? $t('product.adding') : $t('eab46cc2.ae94de') }}
          </button>
        </div>
      </template>

      <!-- 支付码区域（设计稿 2849:8104） -->
      <section
        v-if="showQrcode && paymentCode"
        class="flex-1 flex flex-col items-center justify-center px-4 lg:px-32 py-8"
        :data-testid="'payment-qrcode'"
      >
        <div class="flex flex-col items-center gap-4 max-w-[400px] w-full">
          <div class="flex items-center gap-[10px] w-full justify-center">
            <UIcon
              v-if="selectedPayType === 'wxpaypc'"
              name="i-heroicons-chat-bubble-oval-left-ellipsis-solid"
              class="w-8 h-8 text-[#09B956]"
            />
            <UIcon
              v-else-if="selectedPayType === 'alipay'"
              name="i-heroicons-credit-card-solid"
              class="w-8 h-8 text-[#1677FF]"
            />
            <div class="flex flex-col gap-1 items-start text-[#4a5565]">
              <span class="text-[16px] font-medium leading-5">{{ selectedMethodName }}</span>
              <span class="text-[12px] leading-4">{{ $t('eab46cc2.a841e4') }}</span>
            </div>
          </div>
          <div class="p-2 bg-white rounded-lg shadow-[0px_4px_8px_0px_#e1e7f0]">
            <div
              class="w-[200px] h-[200px] flex items-center justify-center overflow-hidden rounded"
            >
              <img
                v-if="isPaymentCodeImage"
                :src="paymentCode"
                :alt="$t('eab46cc2.c8d2a2')"
                class="w-full h-full object-contain"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-xs text-[#4a5565] break-all p-2"
              >
                {{ paymentCode.slice(0, 80) }}{{ paymentCode.length > 80 ? '...' : '' }}
              </div>
            </div>
          </div>
          <p class="text-[12px] leading-4 text-[#4a5565] text-center">
            {{ $t('eab46cc2.03d763') }}<br />{{ $t('eab46cc2.d7ce53') }}
          </p>
        </div>
      </section>

      <!-- 支付成功（设计稿 2199:669 / 2885:6692） -->
      <section
        v-if="payResult === 'success'"
        class="flex-1 flex flex-col items-center px-4 lg:px-32 py-8 w-full"
        data-testid="payment-success"
      >
        <div class="w-full max-w-[1440px] flex flex-col gap-8 p-0 lg:p-8 bg-white items-start">
          <p class="text-[24px] font-medium leading-[48px] text-[#191a1d]">
            {{ $t('eab46cc2.eb5dc9') }} {{ orderAmountFormatted }}
          </p>
          <div class="flex gap-4">
            <NuxtLink
              to="/account"
              class="inline-flex items-center justify-center bg-[#0f0f10] text-white px-8 py-4 text-[14px] font-medium leading-5"
            >
              {{ $t('eab46cc2.27a3ff') }}
            </NuxtLink>
            <NuxtLink
              to="/"
              class="inline-flex items-center justify-center bg-white border border-[#0f0f10] text-[#191a1d] px-8 py-4 text-[14px] font-medium leading-5"
            >
              {{ $t('eab46cc2.3a2c9f') }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- 失败/超时（设计稿未单独给出，保持现有） -->
      <section
        v-if="payResult === 'fail' || payResult === 'timeout'"
        class="flex-1 flex flex-col items-center justify-center px-4 py-8"
        data-testid="payment-error"
      >
        <div class="max-w-[500px] w-full p-6 border border-red-200 bg-red-50 rounded-lg">
          <p class="text-sm text-red-800">
            {{ payResult === 'timeout' ? $t('eab46cc2.201d09') : error || $t('eab46cc2.4548cc') }}
          </p>
          <div class="mt-4 flex gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-[#191a1d] border border-[#e5e7eb] rounded hover:bg-gray-50"
              @click="retry"
            >
              {{ $t('eab46cc2.132c5c') }}
            </button>
            <NuxtLink
              to="/cart"
              class="px-4 py-2 text-sm font-medium text-[#191a1d] border border-[#e5e7eb] rounded hover:bg-gray-50 inline-block"
            >
              {{ $t('common.back') }}
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const orderIdRef = computed(() => (route.query.orderId as string) ?? '')
const {
  orderIdValue,
  paymentMethods,
  selectedPayType,
  orderInfo,
  paymentCode,
  loading,
  loadingMethods,
  loadingOrder,
  error,
  payResult,
  hasOrderId,
  canPay,
  showQrcode,
  orderAmountFormatted,
  remainingTimeText,
  selectedMethodName,
  loadPaymentMethods,
  loadOrderInfo,
  payNow,
  retry,
} = usePayment(orderIdRef)

const isPaymentCodeImage = computed(() => {
  const code = paymentCode.value
  return code.startsWith('data:') || code.startsWith('http://') || code.startsWith('https://')
})

const handleRetryLoad = () => {
  loadPaymentMethods()
  loadOrderInfo()
}
</script>
