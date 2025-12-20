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

    <!-- 右侧：手机号登录表单面板 -->
    <div v-if="loginMode === 'phone'" class="w-[560px] bg-white shadow-2xl flex flex-col">
      <div class="p-8 flex flex-col h-full">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between py-4 mb-8">
          <h2 class="text-[20px] font-medium text-[#191a1d] leading-5">验证码登录</h2>
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
            已注册会员请登录结算，未注册会员短信验证码登录后即可成为会员。登录后可加快结算流程，并保存购买记录。
          </p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handlePhoneLogin" class="flex flex-col gap-8" autocomplete="off">
          <!-- 手机号输入框 -->
          <div class="border-b border-[#e5e7eb]">
            <input
              v-model="phoneForm.phone"
              type="tel"
              name="phone"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              placeholder="手机号码"
              class="w-full py-4 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
          </div>

          <!-- 短信验证码输入框 -->
          <div class="border-b border-[#e5e7eb] flex items-center justify-between pb-4 pt-4">
            <input
              v-model="phoneForm.code"
              type="text"
              name="sms-code"
              autocomplete="one-time-code"
              placeholder="短信验证码"
              class="flex-1 text-[14px] text-[#4a5565] leading-5 outline-none bg-transparent placeholder-[#4a5565]"
            />
            <button
              type="button"
              class="text-[14px] font-medium text-[#191a1d] leading-5 whitespace-nowrap ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canSend || isSending"
              @click="handleSendCode"
            >
              <template v-if="isSending">发送中...</template>
              <template v-else-if="countdown > 0">{{ countdown }}秒后重试</template>
              <template v-else>获取验证码</template>
            </button>
          </div>

          <!-- 1年内免登录 -->
          <div class="flex items-center gap-2">
            <input
              id="remember"
              v-model="phoneForm.remember"
              type="checkbox"
              class="w-4 h-4 border border-[#191a1d] rounded-none appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] cursor-pointer relative"
            />
            <label for="remember" class="text-[12px] text-[#4a5565] leading-4 cursor-pointer">
              1年内免登录
            </label>
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
              {{ isLoading ? '登录中...' : '登录' }}
            </button>
            <button
              type="button"
              class="w-full py-4 bg-white border border-[#0f0f10] text-[#191a1d] text-[14px] font-medium leading-5 transition-all hover:bg-gray-50"
              @click="goToRegister"
            >
              注册
            </button>
          </div>

          <!-- 账号登录链接 -->
          <div class="flex items-center justify-center py-4">
            <button
              type="button"
              class="text-[14px] text-[#191a1d] leading-5 underline hover:text-gray-600 transition-colors"
              @click="switchToAccountLogin"
            >
              账号登录
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 右侧：账号登录表单面板 -->
    <div v-if="loginMode === 'account'" class="w-[560px] bg-white shadow-2xl flex flex-col">
      <div class="p-8 flex flex-col h-full">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between py-4 mb-8">
          <h2 class="text-[20px] font-medium text-[#191a1d] leading-5">账号登录</h2>
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
            已注册会员请登录结算，未注册会员短信验证码登录后即可成为会员。登录后可加快结算流程，并保存购买记录。
          </p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleAccountLogin" class="flex flex-col gap-8" autocomplete="off">
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
              placeholder="手机号"
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
              placeholder="密码"
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
              {{ isLoading ? '登录中...' : '登录' }}
            </button>
            <button
              type="button"
              class="w-full py-4 bg-white border border-[#0f0f10] text-[#191a1d] text-[14px] font-medium leading-5 transition-all hover:bg-gray-50"
              @click="goToRegister"
            >
              注册
            </button>
          </div>

          <!-- 验证码登录链接 -->
          <div class="flex items-center justify-center py-4">
            <button
              type="button"
              class="text-[14px] text-[#191a1d] leading-5 underline hover:text-gray-600 transition-colors"
              @click="switchToPhoneLogin"
            >
              验证码登录
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
import { useAuth } from '~/composables/useAuth'
import { useSmsCode } from '~/composables/useSmsCode'

// 设置页面元信息
definePageMeta({
  layout: 'auth',
})

const router = useRouter()

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
    error.value = '请输入手机号码'
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = '请输入正确的手机号码'
    return
  }

  // 获取图形验证码（如果还没有）
  if (!captcha.value) {
    const captchaSuccess = await getCaptcha('login')
    if (!captchaSuccess) {
      error.value = '获取图形验证码失败，请稍后重试'
      return
    }
  }

  // 调用发送验证码 API
  const success = await sendSmsCode(
    phoneForm.phone,
    '', // 图形验证码值（需要用户输入）
    captcha.value?.imageToken || ''
  )

  if (success) {
    // 提示发送成功（可以使用 toast 组件）
    console.log('验证码已发送')
  } else {
    // 显示发送错误
    error.value = smsError.value || '发送验证码失败，请稍后重试'
  }
}

/**
 * 手机验证码登录
 */
async function handlePhoneLogin() {
  clearError()

  // 简单验证
  if (!phoneForm.phone) {
    error.value = '请输入手机号码'
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = '请输入正确的手机号码'
    return
  }

  if (!phoneForm.code) {
    error.value = '请输入验证码'
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
    router.push(redirect || '/')
  }
}

/**
 * 账号密码登录
 */
async function handleAccountLogin() {
  clearError()

  // 简单验证
  if (!accountForm.username) {
    error.value = '请输入账号'
    return
  }

  if (!accountForm.password) {
    error.value = '请输入密码'
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
    router.push(redirect || '/')
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
}

/**
 * 前往注册页面
 */
function goToRegister() {
  router.push('/account/register')
}

/**
 * 关闭登录页面
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
