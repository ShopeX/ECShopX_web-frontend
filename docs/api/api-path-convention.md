# API 路径规范

## 概述

本文档定义了 APIfox 文档中的 API 路径与代码中实际使用路径的对应关系。

## 路径转换规则

### 规则说明

**APIfox 文档路径格式**: `/api/h5app/wxapp/xxx`  
**代码中使用路径格式**: `/xxx`

即：**去掉 `/api/h5app/wxapp` 前缀，直接使用相对路径**

### 原因

项目的 HTTP 插件会自动为所有请求添加 `/api/h5app/wxapp` 前缀，因此在代码中只需要写相对路径即可。

## 路径对照表

| APIfox 文档路径 | 代码中使用路径 | 说明 |
|----------------|--------------|------|
| `/api/h5app/wxapp/login` | `/login` | 账号密码登录 |
| `/api/h5app/wxapp/member/image/code` | `/member/image/code` | 获取图形验证码 |
| `/api/h5app/wxapp/member/sms/code` | `/member/sms/code` | 发送短信验证码 |
| `/api/h5app/wxapp/member` | `/member` | 获取用户信息 |
| `/api/h5app/wxapp/cart/list` | `/cart/list` | 获取购物车列表 |
| `/api/h5app/wxapp/cart` | `/cart` | 添加到购物车 |
| `/api/h5app/wxapp/cartcount` | `/cartcount` | 获取购物车数量 |
| `/api/h5app/wxapp/cartupdate/num` | `/cartupdate/num` | 更新购物车数量 |

## 代码示例

### ❌ 错误写法

```typescript
// 不要在代码中包含完整的 APIfox 路径
async login(params: ILoginRequest) {
  return this.http('/api/h5app/wxapp/login', {  // ❌ 错误
    method: 'POST',
    body: params,
  })
}
```

### ✅ 正确写法

```typescript
// 只写相对路径，去掉 /api/h5app/wxapp 前缀
async login(params: ILoginRequest) {
  return this.http('/login', {  // ✅ 正确
    method: 'POST',
    body: params,
  })
}
```

## API Client 示例

```typescript
export class AuthApiClient {
  private get http() {
    const nuxtApp = useNuxtApp()
    return nuxtApp.$api
  }

  // 登录接口
  async login(params: ILoginRequest) {
    return this.http('/login', {  // 使用相对路径
      method: 'POST',
      body: params,
    })
  }

  // 获取图形验证码
  async getCaptcha(params: ICaptchaRequest) {
    return this.http('/member/image/code', {  // 使用相对路径
      method: 'GET',
      params: params,
    })
  }

  // 发送短信验证码
  async sendSmsCode(params: ISmsCodeRequest) {
    return this.http('/member/sms/code', {  // 使用相对路径
      method: 'GET',
      params: params,
    })
  }

  // 获取用户信息
  async getUserInfo() {
    return this.http('/member', {  // 使用相对路径
      method: 'GET',
    })
  }
}
```

## 路径转换步骤

当你从 APIfox 文档对接新接口时，按以下步骤转换路径：

1. **复制 APIfox 中的完整路径**
   ```
   /api/h5app/wxapp/goods/items
   ```

2. **去掉前缀 `/api/h5app/wxapp`**
   ```
   /goods/items
   ```

3. **在代码中使用转换后的路径**
   ```typescript
   async getGoodsList() {
     return this.http('/goods/items', {
       method: 'GET',
     })
   }
   ```

## 注意事项

1. ✅ **所有接口路径都需要遵循此规范**
2. ✅ **新对接的接口必须去掉 `/api/h5app/wxapp` 前缀**
3. ✅ **保持路径的其他部分不变**（如 `/member/image/code` 保留 `/member/` 部分）
4. ⚠️ **不要修改 HTTP 插件的配置**，它会自动添加前缀
5. ⚠️ **路径必须以 `/` 开头**

## HTTP 插件配置参考

HTTP 插件的配置位于 `app/plugins/http.ts`，它会自动为所有请求添加基础路径：

```typescript
// 插件会自动添加 baseURL
const baseURL = '/api/h5app/wxapp'

// 所以代码中的 '/login' 实际请求会变成 '/api/h5app/wxapp/login'
```

## 快速检查清单

在对接新接口时，请检查：

- [ ] 是否从 APIfox 路径中去掉了 `/api/h5app/wxapp` 前缀？
- [ ] 路径是否以 `/` 开头？
- [ ] 路径的其他部分是否保持不变？
- [ ] 是否在 API Client 类中正确使用了转换后的路径？

## 相关文档

- [认证 API 对接总结](./auth/api-integration-summary.md)
- [Web 开发规范](./../.cursor/rules/web-rule.mdc)

## 更新日志

- 2025-12-15: 初始版本，定义 API 路径转换规则

