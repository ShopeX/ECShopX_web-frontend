<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4"
  >
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4">
          <!-- <img src="/logo.svg" alt="Logo" /> -->
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">欢迎登录</h1>
        <p class="text-sm text-gray-600">请使用账号密码或手机验证码登录</p>
      </div>

      <!-- 登录方式 Tab -->
      <div class="flex gap-4 mb-6 border-b border-gray-200">
        <button
          class="flex-1 py-3 text-center font-medium transition-all cursor-pointer hover:text-purple-600 border-b-2"
          :class="
            loginType === 'account'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent'
          "
          @click="loginType = 'account'"
        >
          账号密码登录
        </button>
        <button
          class="flex-1 py-3 text-center font-medium transition-all cursor-pointer hover:text-purple-600 border-b-2"
          :class="
            loginType === 'phone'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent'
          "
          @click="loginType = 'phone'"
        >
          验证码登录
        </button>
      </div>

      <!-- 账号密码登录表单 -->
      <div v-if="loginType === 'account'" class="mb-4">
        <Form
          ref="accountFormRef"
          :schema="accountSchema"
          v-model="accountForm"
          @submit="handleAccountLogin"
        >
          <!-- 自定义验证码输入 -->
          <template #captcha>
            <CaptchaInput
              v-model="accountForm.captcha"
              :image="captcha?.image"
              @refresh="handleRefreshCaptcha"
            />
          </template>

          <!-- 操作按钮 -->
          <template #actions>
            <div class="space-y-4">
              <button
                type="submit"
                class="w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                :class="
                  isLoading
                    ? 'bg-purple-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                "
                :disabled="isLoading"
              >
                {{ isLoading ? '登录中...' : '登录' }}
              </button>

              <div class="flex justify-end">
                <NuxtLink
                  to="/forgot-password"
                  class="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                >
                  忘记密码？
                </NuxtLink>
              </div>
            </div>
          </template>
        </Form>
      </div>

      <!-- 手机验证码登录表单 -->
      <div v-else class="mb-4">
        <Form
          ref="phoneFormRef"
          :schema="phoneSchema"
          v-model="phoneForm"
          @submit="handlePhoneLogin"
        >
          <!-- 自定义图形验证码输入 -->
          <template #captcha>
            <CaptchaInput
              v-model="phoneForm.captcha"
              :image="captcha?.image"
              @refresh="handleRefreshCaptcha"
            />
          </template>

          <!-- 自定义短信验证码输入 -->
          <template #smsCode>
            <VerificationCodeInput
              v-model="phoneForm.smsCode"
              :sending="isSending"
              :countdown="countdown"
              @send="handleSendSmsCode"
            />
          </template>

          <!-- 操作按钮 -->
          <template #actions>
            <div class="space-y-4">
              <button
                type="submit"
                class="w-full py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                :class="
                  isLoading
                    ? 'bg-purple-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                "
                :disabled="isLoading"
              >
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
            </div>
          </template>
        </Form>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="error || smsError"
        class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center"
      >
        {{ error || smsError }}
      </div>

      <!-- 注册入口 -->
      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">还没有账号？</span>
        <NuxtLink
          to="/register"
          class="ml-1 text-purple-600 font-medium hover:text-purple-700 hover:underline"
        >
          立即注册
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { IFormSchema } from '~/components/ui/form/types'
import { useAuth } from '~/composables/useAuth'
import { useSmsCode } from '~/composables/useSmsCode'

// 设置页面元信息
definePageMeta({
  // 使用默认布局
  layout: 'default',
})

const router = useRouter()

// 登录类型
const loginType = ref<'account' | 'phone'>('account')

// 使用 Composables
const {
  isLoading,
  error,
  captcha,
  captchaLoading,
  getCaptcha,
  refreshCaptcha,
  login,
  loginWithPhone,
  clearError,
} = useAuth()

const { isSending, error: smsError, countdown, sendCode, clearError: clearSmsError } = useSmsCode()

// 表单引用
const accountFormRef = ref<any>(null)
const phoneFormRef = ref<any>(null)

// 账号密码登录表单
const accountForm = reactive({
  username: '',
  password: '',
  captcha: '',
})

// 手机验证码登录表单
const phoneForm = reactive({
  phone: '',
  captcha: '',
  smsCode: '',
})

// 账号密码登录表单 Schema
const accountSchema = computed<IFormSchema[]>(() => [
  {
    type: 'input',
    name: 'username',
    label: '账号',
    props: {
      placeholder: '请输入用户名或手机号',
      maxlength: 50,
    },
    rules: [
      { required: true, message: '请输入账号' },
      { min: 3, message: '账号至少3个字符' },
    ],
  },
  {
    type: 'input',
    name: 'password',
    label: '密码',
    props: {
      type: 'password',
      placeholder: '请输入密码',
      showPassword: true,
      maxlength: 32,
    },
    rules: [
      { required: true, message: '请输入密码' },
      { min: 6, message: '密码至少6位' },
    ],
  },
  {
    type: 'custom',
    name: 'captcha',
    label: '验证码',
    rules: [
      { required: true, message: '请输入验证码' },
      { min: 4, max: 4, message: '验证码为4位' },
    ],
  },
])

// 手机验证码登录表单 Schema
const phoneSchema = computed<IFormSchema[]>(() => [
  {
    type: 'input',
    name: 'phone',
    label: '手机号',
    props: {
      placeholder: '请输入手机号',
      maxlength: 11,
    },
    rules: [
      { required: true, message: '请输入手机号' },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '手机号格式不正确',
      },
    ],
  },
  {
    type: 'custom',
    name: 'captcha',
    label: '图形验证码',
    rules: [
      { required: true, message: '请输入验证码' },
      { min: 4, max: 4, message: '验证码为4位' },
    ],
  },
  {
    type: 'custom',
    name: 'smsCode',
    label: '短信验证码',
    rules: [
      { required: true, message: '请输入短信验证码' },
      { min: 6, max: 6, message: '验证码为6位' },
    ],
  },
])

/**
 * 刷新图形验证码
 */
async function handleRefreshCaptcha() {
  await refreshCaptcha()
}

/**
 * 发送短信验证码
 */
async function handleSendSmsCode() {
  // 验证手机号和图形验证码
  if (!phoneForm.phone) {
    smsError.value = '请输入手机号'
    return
  }

  if (!phoneForm.captcha) {
    smsError.value = '请输入图形验证码'
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    smsError.value = '手机号格式不正确'
    return
  }

  clearSmsError()

  // 发送验证码
  const success = await sendCode({
    phone: phoneForm.phone,
    captcha: phoneForm.captcha,
    captchaKey: captcha.value?.key || '',
  })

  if (success) {
    // 发送成功后刷新图形验证码
    await handleRefreshCaptcha()
  }
}

/**
 * 账号密码登录
 */
async function handleAccountLogin() {
  clearError()

  // 验证表单
  const valid = await accountFormRef.value?.validate()
  if (!valid) return

  // 执行登录
  const success = await login({
    username: accountForm.username,
    password: accountForm.password,
    captcha: accountForm.captcha,
    captchaKey: captcha.value?.key || '',
  })

  if (success) {
    // 登录成功，跳转到首页或来源页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } else {
    // 登录失败，刷新验证码
    await handleRefreshCaptcha()
    accountForm.captcha = ''
  }
}

/**
 * 手机验证码登录
 */
async function handlePhoneLogin() {
  clearError()

  // 验证表单
  const valid = await phoneFormRef.value?.validate()
  if (!valid) return

  // 执行登录
  const success = await loginWithPhone({
    phone: phoneForm.phone,
    smsCode: phoneForm.smsCode,
  })

  if (success) {
    // 登录成功，跳转到首页或来源页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  }
}

/**
 * 初始化
 */
onMounted(async () => {
  // 获取图形验证码
  await getCaptcha()
})
</script>
