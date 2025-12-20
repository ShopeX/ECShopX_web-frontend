# 认证 API 文档

本目录包含认证相关的 API 对接文档。

## 文档列表

- [API 对接总结](./api-integration-summary.md) - 详细的 API 对接说明和使用指南

## 快速开始

### 1. 账号密码登录

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { login, error, isLoading } = useAuth()

async function handleLogin() {
  const success = await login({
    username: '13917609856',
    password: '123456',
    company_id: appConfig.companyId
  })
  
  if (success) {
    // 登录成功
    await fetchUserInfo()
    router.push('/')
  } else {
    // 显示错误信息
    console.error(error.value)
  }
}
</script>
```

### 2. 发送短信验证码

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'
import { useSmsCode } from '~/composables/useSmsCode'

const { getCaptcha, captcha } = useAuth()
const { sendCode, countdown, canSend } = useSmsCode()

async function handleSendSms() {
  // 1. 获取图形验证码
  await getCaptcha('login')
  
  // 2. 发送短信验证码（需要用户输入图形验证码）
  const success = await sendCode(
    phoneNumber.value,
    userInputCaptcha.value,
    captcha.value.imageToken
  )
  
  if (success) {
    // 短信发送成功，开始倒计时
    console.log('验证码已发送')
  }
}
</script>
```

## 已实现的功能

✅ 账号密码登录  
✅ 获取图形验证码  
✅ 发送短信验证码  
✅ 获取用户信息  
✅ 应用配置管理（company_id）  

## 待实现的功能

⏳ 手机验证码登录接口（API 文档待确认）  
⏳ 图形验证码 UI 展示  
⏳ Token 自动刷新机制  

## 更多信息

查看 [api-integration-summary.md](./api-integration-summary.md) 了解完整的 API 对接细节。

