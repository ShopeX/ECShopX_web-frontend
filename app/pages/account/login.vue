<template>
  <div class="min-h-screen bg-pink-50 flex items-center justify-center py-12 px-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <!-- 标题 -->
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Sign in</h1>

      <!-- 社交登录按钮 -->
      <div class="mb-6 flex flex-row items-center gap-2">
        <button
          type="button"
          class="w-full py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          @click="handleSocialLogin('facebook')"
        >
          <Icon name="logos:facebook" class="w-5 h-5" />
          <span class="font-medium text-gray-700">Facebook</span>
        </button>
        <button
          type="button"
          class="w-full py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          @click="handleSocialLogin('google')"
        >
          <Icon name="logos:google-icon" class="w-5 h-5" />
          <span class="font-medium text-gray-700">Google</span>
        </button>
      </div>

      <!-- 分隔符 -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleAccountLogin" class="space-y-4">
        <!-- Email 输入框 -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('logon.email')
          }}</label>
          <input
            id="email"
            v-model="accountForm.username"
            type="text"
            placeholder="Email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
          />
        </div>

        <!-- Password 输入框 -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('logon.password')
          }}</label>
          <div class="relative">
            <input
              id="password"
              v-model="accountForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <!-- 忘记密码 -->
        <div class="text-sm">
          <span class="text-gray-600">{{ $t('app.pages.account.login.forgetPassword') }} </span>
          <NuxtLink
            to="/forgot-password"
            class="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            {{ $t('app.pages.account.login.logonforgotpassword') }}
          </NuxtLink>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="error"
          class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          {{ error }}
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="w-full py-3 px-4 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all"
          :class="
            isLoading
              ? 'bg-orange-400 text-white cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          "
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <!-- 验证码登录按钮 -->
        <button
          type="button"
          class="w-full py-3 px-4 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-all"
          @click="switchToPhoneLogin"
        >
          Sign in with email code
        </button>
      </form>

      <!-- 注册入口 -->
      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">Not registered yet? </span>
        <NuxtLink
          to="/account/register"
          class="text-orange-500 font-medium hover:text-orange-600 hover:underline"
        >
          Sign up
        </NuxtLink>
      </div>
    </div>

    <!-- 手机验证码登录弹窗 (如果需要的话) -->
    <!-- 这里可以添加一个 Modal 组件 -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// 设置页面元信息
definePageMeta({
  layout: 'auth',
})

const router = useRouter()

// 使用 Composables
const { isLoading, error, login, fetchUserInfo, clearError } = useAuth()

// 账号密码登录表单
const accountForm = reactive({
  username: '',
  password: '',
  captcha: '',
})

// 显示/隐藏密码
const showPassword = ref(false)

/**
 * 社交登录
 */
function handleSocialLogin(provider: 'facebook' | 'google') {
  // TODO: 实现社交登录逻辑
  console.log('Social login:', provider)
}

/**
 * 切换到手机验证码登录
 */
function switchToPhoneLogin() {
  // TODO: 实现验证码登录逻辑或打开验证码登录弹窗
  console.log('Switch to phone login')
  router.push('/account/login-phone')
}

/**
 * 账号密码登录
 */
async function handleAccountLogin() {
  clearError()

  // 简单验证
  if (!accountForm.username) {
    error.value = 'Please enter your email'
    return
  }

  if (!accountForm.password) {
    error.value = 'Please enter your password'
    return
  }

  // 执行登录
  const success = await login({
    username: accountForm.username,
    password: accountForm.password,
    // captcha: accountForm.captcha,
    // captchaKey: '',
  })

  if (success) {
    await fetchUserInfo()
    // 登录成功，跳转到首页或来源页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  }
}
</script>
