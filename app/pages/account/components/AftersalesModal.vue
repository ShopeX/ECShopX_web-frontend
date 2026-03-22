<template>
  <Teleport to="body">
    <Transition name="aftersales-modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
        :class="{ 'bg-[rgba(0,0,0,0.6)]': true }"
        data-testid="aftersales-modal"
        @click.self="handleClose"
      >
        <!-- PC：居中弹窗 | H5：底部 Sheet -->
        <div
          class="flex flex-col bg-white w-full rounded-t-[16px] lg:rounded-none lg:w-[600px]"
          @click.stop
        >
          <!-- 内容区 -->
          <div class="px-[16px] py-[32px] lg:p-[32px]">
            <!-- 头部 -->
            <div class="flex items-center justify-between mb-[32px]">
              <h2
                data-testid="aftersales-modal-title"
                class="text-[20px] font-medium leading-5 text-[#191a1d]"
              >
                {{ t('0747dfee.45eb0c') }}
              </h2>
              <button
                data-testid="btn-close-aftersales"
                type="button"
                class="size-[24px] flex items-center justify-center text-[#191a1d] hover:opacity-70 transition-opacity"
                @click="handleClose"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="size-[24px]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 表单字段 -->
            <div class="flex flex-col gap-[24px]">
              <!-- 商品数量 -->
              <div class="flex items-center gap-[12px]">
                <span class="w-[80px] shrink-0 text-[12px] text-[#6b7280]">
                  {{ t('0747dfee.06612d') }}
                </span>
                <div class="flex items-center gap-[12px]">
                  <button
                    data-testid="btn-quantity-minus"
                    type="button"
                    class="w-[32px] h-[32px] flex items-center justify-center border border-[#e5e7eb] text-[#191a1d] hover:bg-gray-50 transition-colors"
                    @click="decreaseQuantity"
                  >
                    <span class="text-[16px] leading-none select-none">−</span>
                  </button>
                  <span
                    data-testid="quantity-display"
                    class="w-[40px] text-center text-[14px] text-[#191a1d]"
                  >
                    {{ quantity }}
                  </span>
                  <button
                    data-testid="btn-quantity-plus"
                    type="button"
                    class="w-[32px] h-[32px] flex items-center justify-center border border-[#e5e7eb] text-[#191a1d] hover:bg-gray-50 transition-colors"
                    @click="increaseQuantity"
                  >
                    <span class="text-[16px] leading-none select-none">+</span>
                  </button>
                </div>
              </div>

              <!-- 服务类型 -->
              <div class="flex flex-col gap-[4px]">
                <div class="flex items-center gap-[12px]">
                  <span class="w-[80px] shrink-0 text-[12px] text-[#6b7280]">
                    {{ t('0747dfee.924f67') }}
                  </span>
                  <div class="relative flex-1">
                    <select
                      v-model="aftersalesType"
                      data-testid="select-aftersales-type"
                      class="w-full h-[40px] bg-[#f3f4f6] px-[12px] appearance-none text-[14px] text-[#191a1d] border-0 outline-none focus:ring-0 cursor-pointer"
                      @change="typeError = ''"
                    >
                      <option value="" disabled>{{ t('0747dfee.e6d1c3') }}</option>
                      <option value="ONLY_REFUND">{{ t('0747dfee.6b8821') }}</option>
                      <option value="REFUND_GOODS">{{ t('0747dfee.cc0193') }}</option>
                      <option value="EXCHANGING_GOODS">{{ t('0747dfee.bb9cd5') }}</option>
                    </select>
                    <span
                      class="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]"
                    >
                      ▼
                    </span>
                  </div>
                </div>
                <p v-if="typeError" class="pl-[92px] text-[12px] text-red-500">
                  {{ typeError }}
                </p>
              </div>

              <!-- 退款理由 -->
              <div class="flex flex-col gap-[4px]">
                <div class="flex items-center gap-[12px]">
                  <span class="w-[80px] shrink-0 text-[12px] text-[#6b7280]">
                    {{ t('0747dfee.1e2355') }}
                  </span>
                  <div class="relative flex-1">
                    <select
                      v-model="reason"
                      data-testid="select-reason"
                      class="w-full h-[40px] bg-[#f3f4f6] px-[12px] appearance-none text-[14px] text-[#191a1d] border-0 outline-none focus:ring-0 cursor-pointer"
                      @change="reasonError = ''"
                    >
                      <option value="" disabled>{{ t('0747dfee.b42a2f') }}</option>
                      <option :value="t('0747dfee.c440cd')">{{ t('0747dfee.c440cd') }}</option>
                      <option :value="t('0747dfee.41eb24')">{{ t('0747dfee.41eb24') }}</option>
                      <option :value="t('0747dfee.40cfa6')">{{ t('0747dfee.40cfa6') }}</option>
                      <option :value="t('0747dfee.78d83c')">{{ t('0747dfee.78d83c') }}</option>
                      <option :value="t('0747dfee.0d98c7')">{{ t('0747dfee.0d98c7') }}</option>
                    </select>
                    <span
                      class="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]"
                    >
                      ▼
                    </span>
                  </div>
                </div>
                <p v-if="reasonError" class="pl-[92px] text-[12px] text-red-500">
                  {{ reasonError }}
                </p>
              </div>

              <!-- 退款说明 -->
              <div class="flex items-start gap-[12px]">
                <span class="w-[80px] shrink-0 text-[12px] text-[#6b7280] pt-[10px]">
                  {{ t('0747dfee.f1c0db') }}
                </span>
                <textarea
                  v-model="description"
                  data-testid="textarea-description"
                  :placeholder="t('0747dfee.ce7542')"
                  :maxlength="500"
                  class="flex-1 h-[80px] bg-[#f3f4f6] p-[12px] text-[14px] text-[#191a1d] placeholder-[#9ca3af] resize-none border-0 outline-none focus:ring-0"
                />
              </div>
            </div>

            <!-- 按钮区 -->
            <div class="flex gap-[16px] pt-[32px] lg:justify-end">
              <button
                data-testid="btn-cancel-aftersales"
                type="button"
                class="flex-1 lg:flex-none h-[50px] lg:px-[32px] flex items-center justify-center border border-[#0f0f10] text-[12px] font-medium text-[#191a1d] bg-white hover:bg-gray-50 transition-colors"
                @click="handleClose"
              >
                {{ t('0747dfee.625fb2') }}
              </button>
              <button
                data-testid="btn-submit-aftersales"
                type="button"
                class="flex-1 lg:flex-none h-[50px] lg:px-[32px] flex items-center justify-center bg-[#0f0f10] text-[12px] font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                :disabled="submitting"
                @click="handleSubmit"
              >
                {{ t('0747dfee.38cf16') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { aftersalesApiClient } from '~/infrastructure/http/clients/AftersalesApiClient'

interface Props {
  visible: boolean
  orderId: string
  itemId: string
  itemDetail: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submitted: []
}>()

const { t } = useI18n()
const toast = useToastMessage()

const quantity = ref(1)
const aftersalesType = ref('')
const reason = ref('')
const description = ref('')
const submitting = ref(false)
const typeError = ref('')
const reasonError = ref('')

function decreaseQuantity() {
  if (quantity.value > 1) quantity.value--
}

function increaseQuantity() {
  quantity.value++
}

function handleClose() {
  emit('close')
}

function validate() {
  let valid = true
  if (!aftersalesType.value) {
    typeError.value = t('0747dfee.e6d1c3')
    valid = false
  }
  if (!reason.value) {
    reasonError.value = t('0747dfee.b42a2f')
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    await aftersalesApiClient.submitAftersales({
      order_id: props.orderId,
      item_id: props.itemId,
      reason: reason.value,
      detail: props.itemDetail,
      aftersales_type: aftersalesType.value as 'ONLY_REFUND' | 'REFUND_GOODS' | 'EXCHANGING_GOODS',
      description: description.value,
    })
    toast.show(t('0747dfee.06dc88'))
    emit('submitted')
    emit('close')
  } catch (e: any) {
    toast.show(e?.message || e?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.aftersales-modal-enter-active,
.aftersales-modal-leave-active {
  transition: opacity 0.2s ease;
}
.aftersales-modal-enter-from,
.aftersales-modal-leave-to {
  opacity: 0;
}
</style>
