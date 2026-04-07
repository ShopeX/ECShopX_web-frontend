<template>
  <div class="flex min-h-screen w-full bg-white lg:h-screen">
    <!-- 左侧：产品展示背景 -->
    <div class="relative hidden flex-1 overflow-hidden lg:block">
      <div class="absolute inset-0 flex items-center p-8">
        <img
          src="/assets/images/login-bg.png"
          alt="Background"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- 右侧：手机号登录表单面板 -->
    <div
      v-if="loginMode === 'phone'"
      class="flex min-h-screen w-full flex-col bg-white lg:w-[560px] lg:shadow-2xl"
    >
      <div class="flex h-full flex-col p-6 lg:p-8">
        <!-- 标题栏 -->
        <div class="mb-6 flex items-center justify-between py-4 lg:mb-8">
          <h2 class="text-[20px] font-medium text-[#191a1d] leading-5">
            {{ t('bbf44084.4bc8be') }}
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
        <div class="mb-6 lg:mb-8">
          <p class="text-[14px] text-[#364153] leading-5">
            {{ t('bbf44084.a2e4f4') }}
          </p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handlePhoneLogin" class="flex flex-col gap-6 lg:gap-8" autocomplete="off">
          <!-- 手机号输入框 -->
          <div class="border-b border-[#e5e7eb]">
            <input
              v-model="phoneForm.phone"
              type="tel"
              name="phone"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              :placeholder="t('bbf44084.92448a')"
              class="w-full py-4 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
          </div>

          <!-- 图片验证码 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between gap-4 pb-4 pt-4">
            <!-- 图片验证码 -->
            <input
              v-model="phoneForm.captchaCode"
              type="text"
              name="image-captcha"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              :placeholder="t('bbf44084.983f59')"
              class="min-w-0 flex-1 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
            <button
              type="button"
              class="h-10 w-[108px] shrink-0 overflow-hidden border border-[#e5e7eb] bg-[#f8fafc] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="captchaLoading"
              @click="handleRefreshCaptcha"
            >
              <img
                v-if="captcha?.imageData"
                :src="captcha?.imageData"
                :alt="t('bbf44084.983f59')"
                class="h-full w-full object-cover"
              />
              <span
                v-else
                class="flex h-full w-full items-center justify-center px-2 text-[12px] text-[#4a5565]"
              >
                {{ captchaLoading ? t('bbf44084.ba1a3a') : t('bbf44084.a41d43') }}
              </span>
            </button>
          </div>

          <!-- 短信验证码输入框 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between pb-4 pt-4">
            <input
              v-model="phoneForm.code"
              type="text"
              name="sms-code"
              autocomplete="one-time-code"
              :placeholder="t('bbf44084.eb76c0')"
              class="flex-1 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
            <button
              type="button"
              class="text-[14px] font-medium text-[#191a1d] leading-5 whitespace-nowrap ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canSend || isSending"
              @click="handleSendCode"
            >
              <template v-if="isSending">{{ t('bbf44084.ba1a3a') }}</template>
              <template v-else-if="countdown > 0">
                {{ t('bbf44084.5a9c8a', { count: countdown }) }}
              </template>
              <template v-else>{{ t('bbf44084.d369f4') }}</template>
            </button>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-sm text-red-600">
            {{ error }}
          </div>

          <!-- 登录和注册按钮 -->
          <div class="flex flex-col gap-4">
            <button
              type="submit"
              class="w-full py-4 bg-[#0f0f10] text-white text-[14px] font-medium leading-5 transition-all hover:bg-opacity-90"
              :disabled="isLoading"
            >
              {{ isLoading ? t('bbf44084.04c8f7') : t('bbf44084.402d19') }}
            </button>
            <button
              type="button"
              class="w-full py-4 bg-white border border-[#0f0f10] text-[#191a1d] text-[14px] font-medium leading-5 transition-all hover:bg-gray-50"
              @click="goToRegister"
            >
              {{ t('bbf44084.fe0e8b') }}
            </button>
          </div>

          <!-- 账号登录链接 -->
          <div class="flex items-center justify-center py-4">
            <button
              type="button"
              class="text-[14px] text-[#191a1d] leading-5 underline hover:text-gray-600 transition-colors"
              @click="switchToAccountLogin"
            >
              {{ t('bbf44084.efae77') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 右侧：账号登录表单面板 -->
    <div
      v-if="loginMode === 'account'"
      class="flex min-h-screen w-full flex-col bg-white lg:w-[560px] lg:shadow-2xl"
    >
      <div class="flex h-full flex-col p-6 lg:p-8">
        <!-- 标题栏 -->
        <div class="mb-6 flex items-center justify-between py-4 lg:mb-8">
          <h2 class="text-[20px] font-medium text-[#191a1d] leading-5">
            {{ t('bbf44084.efae77') }}
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
        <div class="mb-6 lg:mb-8">
          <p class="text-[14px] text-[#364153] leading-5">
            {{ t('bbf44084.a2e4f4') }}
          </p>
        </div>

        <!-- 登录表单 -->
        <form
          @submit.prevent="handleAccountLogin"
          class="flex flex-col gap-6 lg:gap-8"
          autocomplete="off"
        >
          <!-- 隐藏的假输入框，用于欺骗浏览器自动填充 -->
          <input type="text" name="fake-username" style="display: none" />
          <input type="password" name="fake-password" style="display: none" />

          <!-- 账号输入框 -->
          <div class="border-b border-[#e5e7eb]">
            <input
              v-model="accountForm.username"
              type="text"
              name="username"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              :placeholder="t('bbf44084.8098e2')"
              class="w-full py-4 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
          </div>

          <!-- 密码输入框 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between pb-4 pt-4">
            <input
              v-model="accountForm.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="new-password"
              :placeholder="t('bbf44084.a81052')"
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

          <!-- 1年内免登录 -->
          <!-- <div class="flex items-center gap-2">
            <input
              id="remember-account"
              v-model="accountForm.remember"
              type="checkbox"
              class="w-4 h-4 border border-[#191a1d] rounded-none appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] cursor-pointer relative"
            />
            <label
              for="remember-account"
              class="text-[12px] text-[#4a5565] leading-4 cursor-pointer"
            >
              7天内免登录
            </label>
          </div> -->

          <!-- 错误提示 -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-sm text-red-600">
            {{ error }}
          </div>

          <!-- 登录和注册按钮 -->
          <div class="flex flex-col gap-4">
            <button
              type="submit"
              class="w-full py-4 bg-[#0f0f10] text-white text-[14px] font-medium leading-5 transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              {{ isLoading ? t('bbf44084.04c8f7') : t('bbf44084.402d19') }}
            </button>
            <button
              type="button"
              class="w-full py-4 bg-white border border-[#0f0f10] text-[#191a1d] text-[14px] font-medium leading-5 transition-all hover:bg-gray-50"
              @click="goToRegister"
            >
              {{ t('bbf44084.fe0e8b') }}
            </button>
          </div>

          <!-- 验证码登录链接 -->
          <div class="flex items-center justify-center py-4">
            <button
              type="button"
              class="text-[14px] text-[#191a1d] leading-5 underline hover:text-gray-600 transition-colors"
              @click="switchToPhoneLogin"
            >
              {{ t('bbf44084.4bc8be') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
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
  isLoading,
  error,
  login,
  loginWithPhone,
  fetchUserInfo,
  clearError,
  captcha,
  captchaLoading,
  getCaptcha,
  refreshCaptcha,
} = useAuth()
const {
  countdown,
  isSending,
  canSend,
  sendCode: sendSmsCode,
  error: smsError,
  clearError: clearSmsError,
} = useSmsCode()

// 手机验证码登录表单
const phoneForm = reactive({
  phone: '',
  captchaCode: '',
  code: '',
  remember: false,
})

// 账号密码登录表单
const accountForm = reactive({
  username: '',
  password: '',
  remember: false,
})

// 显示/隐藏密码
const showPassword = ref(false)

// 登录模式：phone-手机验证码登录，account-账号密码登录
const loginMode = ref<'phone' | 'account'>('phone')

/**
 * 发送验证码
 */
async function handleSendCode() {
  clearError()
  clearSmsError()

  // 验证手机号
  if (!phoneForm.phone) {
    error.value = t('bbf44084.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = t('bbf44084.18d771')
    return
  }

  // 获取图形验证码（如果还没有）
  if (!captcha.value) {
    const captchaSuccess = await getCaptcha('login')
    if (!captchaSuccess) {
      error.value = t('bbf44084.81340f')
      return
    }
  }

  if (!phoneForm.captchaCode) {
    error.value = t('bbf44084.6ca28f')
    return
  }

  // 调用发送验证码 API
  const success = await sendSmsCode(
    phoneForm.phone,
    phoneForm.captchaCode,
    captcha.value?.imageToken || ''
  )

  if (success) {
    // 提示发送成功（可以使用 toast 组件）
    console.log('验证码已发送')
  } else {
    // 显示发送错误
    error.value = smsError.value || t('bbf44084.227b10')
  }
}

async function handleRefreshCaptcha() {
  phoneForm.captchaCode = ''
  await refreshCaptcha()
}

/**
 * 手机验证码登录
 */
async function handlePhoneLogin() {
  clearError()

  // 简单验证
  if (!phoneForm.phone) {
    error.value = t('bbf44084.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = t('bbf44084.18d771')
    return
  }

  if (!phoneForm.code) {
    error.value = t('bbf44084.d0c06a')
    return
  }

  // 执行手机验证码登录
  const success = await loginWithPhone({
    phone: phoneForm.phone,
    smsCode: phoneForm.code,
  })

  if (success) {
    await fetchUserInfo()
    // 登录成功，跳转到首页或来源页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || localePath('/'))
  }
}

/**
 * 账号密码登录
 */
async function handleAccountLogin() {
  clearError()

  // 简单验证
  if (!accountForm.username) {
    error.value = t('bbf44084.f821a7')
    return
  }

  if (!accountForm.password) {
    error.value = t('bbf44084.e39ffe')
    return
  }

  // 执行账号密码登录
  // company_id 由 HTTP 插件自动添加
  const success = await login({
    username: accountForm.username,
    password: accountForm.password,
  })

  if (success) {
    await fetchUserInfo()
    // 登录成功，跳转到首页或来源页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || localePath('/'))
  }
}

/**
 * 切换到账号登录
 */
function switchToAccountLogin() {
  loginMode.value = 'account'
  clearError()
}

/**
 * 切换到手机验证码登录
 */
function switchToPhoneLogin() {
  loginMode.value = 'phone'
  clearError()
  if (!captcha.value) {
    void getCaptcha('login')
  }
}

/**
 * 前往注册页面
 */
function goToRegister() {
  router.push(localePath('/account/register'))
}

/**
 * 关闭登录页面
 */
function handleClose() {
  // 返回上一页或首页
  router.back()
}

onMounted(() => {
  if (loginMode.value === 'phone' && !captcha.value) {
    void getCaptcha('login')
  }
})
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
