<template>
  <div class="flex h-screen w-full">
    <!-- 左侧：产品展示背景 -->
    <div class="flex-1 relative overflow-hidden">
      <div class="absolute inset-0 flex items-center p-8">
        <img
          src="/assets/images/login-bg.png"
          alt="Background"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- 右侧：注册表单面板 -->
    <div class="w-[560px] bg-white shadow-2xl flex flex-col">
      <div class="p-8 flex flex-col h-full">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between py-4 mb-8">
          <h2 class="text-[20px] font-medium text-[#191a1d] leading-5">
            {{ t('5a21f3db.fe0e8b') }}
          </h2>
          <button
            type="button"
            class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleClose"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- 说明文字 -->
        <div class="mb-8">
          <p class="text-[14px] text-[#364153] leading-5">
            {{ t('5a21f3db.199a9d') }}
          </p>
        </div>

        <!-- 注册表单 -->
        <form @submit.prevent="handleRegister" class="flex flex-col gap-8">
          <!-- 手机号输入框 -->
          <div class="border-b border-[#e5e7eb]">
            <input
              v-model="registerForm.phone"
              type="tel"
              :placeholder="t('5a21f3db.92448a')"
              class="w-full py-4 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
          </div>

          <!-- 短信验证码输入框 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between pb-4 pt-4">
            <input
              v-model="registerForm.code"
              type="text"
              :placeholder="t('5a21f3db.eb76c0')"
              class="flex-1 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
            <button
              type="button"
              class="text-[14px] font-medium text-[#191a1d] leading-5 whitespace-nowrap ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canSend || isSending"
              @click="handleSendCode"
            >
              <template v-if="isSending">{{ t('5a21f3db.ba1a3a') }}</template>
              <template v-else-if="countdown > 0">
                {{ t('5a21f3db.5a9c8a', { count: countdown }) }}
              </template>
              <template v-else>{{ t('5a21f3db.d369f4') }}</template>
            </button>
          </div>

          <!-- 密码输入框 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between pb-4 pt-4">
            <input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('5a21f3db.f114c7')"
              class="flex-1 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
            <button
              type="button"
              class="text-[#4a5565] hover:text-[#191a1d] transition-colors ml-4"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>

          <!-- 确认密码输入框 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between pb-4 pt-4">
            <input
              v-model="registerForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="t('5a21f3db.3fbdde')"
              class="flex-1 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
            <button
              type="button"
              class="text-[#4a5565] hover:text-[#191a1d] transition-colors ml-4"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <UIcon
                :name="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-sm text-red-600">
            {{ error }}
          </div>

          <!-- 成功提示 -->
          <div
            v-if="successMessage"
            class="p-3 bg-green-50 border border-green-200 text-sm text-green-600"
          >
            {{ successMessage }}
          </div>

          <!-- 注册按钮 -->
          <div class="flex flex-col gap-4">
            <button
              type="submit"
              class="w-full py-4 bg-[#0f0f10] text-white text-[14px] font-medium leading-5 transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              {{ isLoading ? t('5a21f3db.2f4891') : t('5a21f3db.fe0e8b') }}
            </button>
          </div>

          <!-- 登录链接 -->
          <div class="flex items-center justify-center py-4">
            <span class="text-[14px] text-[#4a5565] mr-2">{{ t('5a21f3db.c3b432') }}</span>
            <button
              type="button"
              class="text-[14px] text-[#191a1d] leading-5 underline hover:text-gray-600 transition-colors"
              @click="goToLogin"
            >
              {{ t('5a21f3db.ed2ff8') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSmsCode } from '~/composables/useSmsCode'

// 设置页面元信息
definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

// 使用 Composables
const {
  countdown,
  isSending,
  canSend,
  sendCode: sendSmsCode,
  error: smsError,
  clearError: clearSmsError,
} = useSmsCode()

// 注册表单
const registerForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
})

// 状态管理
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// 显示/隐藏密码
const showPassword = ref(false)
const showConfirmPassword = ref(false)

/**
 * 清除错误信息
 */
function clearError() {
  error.value = ''
  clearSmsError()
}

/**
 * 发送验证码
 */
async function handleSendCode() {
  clearError()

  // 验证手机号
  if (!registerForm.phone) {
    error.value = t('5a21f3db.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    error.value = t('5a21f3db.18d771')
    return
  }

  // 调用发送验证码 API
  const success = await sendSmsCode(
    registerForm.phone,
    '', // captcha
    '' // captchaToken
  )

  if (success) {
    // 提示发送成功
    console.log('验证码已发送')
  } else {
    // 显示发送错误
    error.value = smsError.value || t('5a21f3db.227b10')
  }
}

/**
 * 注册
 */
async function handleRegister() {
  clearError()
  successMessage.value = ''

  // 表单验证
  if (!registerForm.phone) {
    error.value = t('5a21f3db.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    error.value = t('5a21f3db.18d771')
    return
  }

  if (!registerForm.code) {
    error.value = t('5a21f3db.d0c06a')
    return
  }

  if (!registerForm.password) {
    error.value = t('5a21f3db.e39ffe')
    return
  }

  if (registerForm.password.length < 6) {
    error.value = t('5a21f3db.72ace4')
    return
  }

  if (!registerForm.confirmPassword) {
    error.value = t('5a21f3db.a0fcd6')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = t('5a21f3db.6046d6')
    return
  }

  try {
    isLoading.value = true

    // TODO: 调用注册 API
    // const response = await registerApi({
    //   phone: registerForm.phone,
    //   smsCode: registerForm.code,
    //   password: registerForm.password,
    // })

    // 模拟注册成功
    await new Promise((resolve) => setTimeout(resolve, 1000))

    successMessage.value = t('5a21f3db.d3f909')

    // 延迟跳转到登录页
    setTimeout(() => {
      router.push(localePath('/account/login'))
    }, 1500)
  } catch (err: any) {
    error.value = err.message || t('5a21f3db.bd5372')
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 前往登录页面
 */
function goToLogin() {
  router.push(localePath('/account/login'))
}

/**
 * 关闭注册页面
 */
function handleClose() {
  // 返回上一页或首页
  router.back()
}
</script>

<style scoped>
/* 自定义复选框样式 */
input[type='checkbox']:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
