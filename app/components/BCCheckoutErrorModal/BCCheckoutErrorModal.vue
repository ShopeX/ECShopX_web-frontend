<template>
  <ECModal
    v-model="visible"
    title="提示"
    :content="errorMessage"
    confirm-text="去购物车"
    cancel-text="继续购物"
    @confirm="handleGoToCart"
    @cancel="handleContinueShopping"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ECModal } from '~/components/ECModal'
import { useRouter } from 'nuxt/app'

interface Props {
  modelValue: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  errorMessage: '结算异常，请返回购物车重试'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const router = useRouter()

function handleGoToCart() {
  visible.value = false
  router.push('/cart')
}

function handleContinueShopping() {
  visible.value = false
  router.push('/')
}
</script>
