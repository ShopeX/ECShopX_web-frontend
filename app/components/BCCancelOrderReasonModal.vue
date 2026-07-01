<template>
  <Teleport to="body">
    <Transition name="cancel-order-modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end justify-center bg-[#282828] lg:items-center lg:bg-[rgba(0,0,0,0.6)] lg:py-[128px]"
        data-testid="cancel-order-reason-modal"
        @click.self="handleClose"
      >
        <div
          class="flex w-full max-w-[375px] flex-col gap-[32px] bg-white px-[16px] py-[32px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] lg:w-[600px] lg:max-w-[600px] lg:p-[32px]"
          @click.stop
        >
          <div class="flex w-full shrink-0 items-center justify-between">
            <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
              <span class="hidden lg:inline">{{ t('a208bce0.1fece8') }}</span>
              <span class="lg:hidden">{{ t('a208bce0.b21b5e') }}</span>
            </h2>
            <button
              type="button"
              class="flex size-[24px] shrink-0 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
              :aria-label="t('a208bce0.595db5')"
              @click="handleClose"
            >
              <UIcon name="i-heroicons-x-mark" class="size-[24px]" />
            </button>
          </div>

          <div class="flex w-full flex-col gap-[16px]">
            <p class="w-full text-[14px] font-normal leading-5 text-[#4a5565] lg:w-[392px]">
              {{ t('a208bce0.3bd30a') }}
            </p>

            <button
              v-for="reason in reasonOptions"
              :key="reason.value"
              type="button"
              class="flex w-full items-center justify-between gap-[8px] rounded-[8px] bg-white py-[16px] text-left"
              :aria-pressed="selectedReason === reason.value"
              @click="selectReason(reason.value)"
            >
              <span class="min-w-0 text-[14px] font-medium leading-5 text-[#191a1d]">
                {{ reason.label }}
              </span>
              <span
                class="flex size-[16px] shrink-0 items-center justify-center rounded-full border"
                :class="
                  selectedReason === reason.value
                    ? 'border-[#191a1d] bg-[#191a1d]'
                    : 'border-[#6a7282] bg-white'
                "
                aria-hidden="true"
              >
                <UIcon
                  v-if="selectedReason === reason.value"
                  name="i-heroicons-check"
                  class="size-[12px] text-white"
                />
              </span>
            </button>

            <div v-if="selectedReason === 'other'" class="flex flex-col gap-[8px]">
              <textarea
                v-model="otherReason"
                class="h-[56px] w-full resize-none border-0 bg-[#f3f4f6] px-[8px] py-[12px] text-[14px] leading-5 text-[#191a1d] placeholder-[#99a1af] outline-none focus:ring-0"
                :placeholder="t('a208bce0.122878')"
                :aria-invalid="Boolean(errorMessage)"
                :disabled="loading"
                maxlength="100"
                @input="errorMessage = ''"
              />
              <p v-if="errorMessage" class="min-h-[16px] text-[12px] leading-4 text-[#d92d20]">
                {{ errorMessage }}
              </p>
            </div>
          </div>

          <div
            class="flex w-full items-center justify-between gap-[16px] border-t border-[#e5e7eb] pt-[32px] lg:border-t-0 lg:pt-0"
          >
            <button
              type="button"
              class="flex h-[36px] min-w-0 flex-1 items-center justify-center border border-[#0f0f10] bg-white px-[24px] text-[14px] font-medium leading-5 text-[#191a1d] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[37px] lg:flex-none lg:px-[72px]"
              :disabled="loading"
              @click="handleClose"
            >
              {{ t('a208bce0.4085e5') }}
            </button>
            <button
              type="button"
              class="flex h-[36px] min-w-0 flex-1 items-center justify-center bg-[#0f0f10] px-[24px] text-[14px] font-medium leading-5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[37px] lg:flex-none lg:px-[72px]"
              :disabled="loading"
              @click="handleSubmit"
            >
              {{ t('a208bce0.98cb95') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CANCEL_ORDER_REASONS, type CancelOrderReasonValue } from '~/utils/orderCancel'

interface Props {
  visible: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  close: []
  submit: [{ reason: CancelOrderReasonValue; otherReason?: string }]
}>()

const { t } = useI18n()
const selectedReason = ref<CancelOrderReasonValue>(CANCEL_ORDER_REASONS[0].value)
const otherReason = ref('')
const errorMessage = ref('')

const reasonLabelKeys: Record<CancelOrderReasonValue, string> = {
  '多买/错买': 'a208bce0.d5505c',
  不想要了: 'a208bce0.78d83c',
  买多了: 'a208bce0.bea53b',
  other: 'a208bce0.5a0afc',
}

const reasonOptions = computed(() =>
  CANCEL_ORDER_REASONS.map((reason) => ({
    ...reason,
    label: t(reasonLabelKeys[reason.value]),
  }))
)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      selectedReason.value = CANCEL_ORDER_REASONS[0].value
      otherReason.value = ''
      errorMessage.value = ''
    }
  }
)

function selectReason(reason: CancelOrderReasonValue) {
  selectedReason.value = reason
  errorMessage.value = ''
}

function handleClose() {
  if (props.loading) return
  emit('close')
}

function handleSubmit() {
  if (selectedReason.value === 'other' && !otherReason.value.trim()) {
    errorMessage.value = t('a208bce0.6f2f64')
    return
  }

  emit('submit', {
    reason: selectedReason.value,
    otherReason: selectedReason.value === 'other' ? otherReason.value.trim() : undefined,
  })
}
</script>

<style scoped>
.cancel-order-modal-fade-enter-active,
.cancel-order-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.cancel-order-modal-fade-enter-from,
.cancel-order-modal-fade-leave-to {
  opacity: 0;
}
</style>
