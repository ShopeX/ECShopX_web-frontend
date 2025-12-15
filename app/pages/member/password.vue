<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  captcha: '',
  smsCode: '',
  password: '',
  confirmPassword: ''
})

const handleSendCode = () => {
  // TODO: Implement send SMS code logic
  console.log('Send SMS code')
}

const handleSubmit = () => {
  // TODO: Implement password change logic
  console.log('Submit password change', form.value)
}
</script>

<template>
  <div class="flex gap-6">
    <MemberSidebar />

    <div class="flex-1 bg-white rounded-lg p-8">
      <h2 class="text-lg font-medium text-gray-900 mb-8 pb-4 border-b border-gray-100">修改密码</h2>

      <div class="max-w-md mx-auto space-y-6">
        <!-- Image Captcha -->
        <div class="flex gap-4">
          <UInput
            v-model="form.captcha"
            placeholder="图片验证码"
            class="flex-1"
            size="lg"
            :ui="{ wrapper: 'w-full' }"
          />
          <div class="w-32 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm cursor-pointer">
            <!-- Placeholder for captcha image -->
            <span class="font-mono text-lg tracking-widest">Q3Vj</span>
          </div>
        </div>

        <!-- SMS Code -->
        <div class="flex gap-4">
          <UInput
            v-model="form.smsCode"
            placeholder="动态验证码"
            class="flex-1"
            size="lg"
            :ui="{ wrapper: 'w-full' }"
          />
          <UButton
            color="gray"
            variant="solid"
            size="lg"
            class="w-32 justify-center"
            @click="handleSendCode"
          >
            发送验证码
          </UButton>
        </div>

        <!-- New Password -->
        <div>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="设置密码"
            size="lg"
            :ui="{ wrapper: 'w-full' }"
          />
          <p class="mt-2 text-xs text-gray-400">建议使用两种或两种以上的字符组合</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="lg"
            :ui="{ wrapper: 'w-full' }"
          />
          <p class="mt-2 text-xs text-gray-400">再次输入密码</p>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <UButton
            block
            color="primary"
            size="xl"
            class="w-full bg-[#ff0036] hover:bg-[#ff0036]/90 text-white font-medium"
            @click="handleSubmit"
          >
            确认修改
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
