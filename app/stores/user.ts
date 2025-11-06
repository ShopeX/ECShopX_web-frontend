import { defineStore } from 'pinia'

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string
  username: string
  email?: string
  phone?: string
  avatar?: string
  isPlusVip?: boolean
}

/**
 * 用户状态接口
 */
interface UserState {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  token: string | null
}

/**
 * 用户状态管理 Store
 */
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userInfo: null,
    token: null
  }),

  getters: {
    /**
     * 获取用户名
     */
    username: (state): string => {
      return state.userInfo?.username || ''
    },

    /**
     * 是否为 PLUS 会员
     */
    isPlusVip: (state): boolean => {
      return state.userInfo?.isPlusVip || false
    }
  },

  actions: {
    /**
     * 设置用户登录状态
     */
    setLoginState(isLoggedIn: boolean) {
      this.isLoggedIn = isLoggedIn
    },

    /**
     * 设置用户信息
     */
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo
    },

    /**
     * 设置令牌
     */
    setToken(token: string | null) {
      this.token = token
    },

    /**
     * 登录
     */
    async login(username: string, password: string) {
      try {
        // TODO: 实现实际的登录 API 调用
        // const response = await $fetch('/api/auth/login', {
        //   method: 'POST',
        //   body: { username, password }
        // })

        // 模拟登录成功
        this.isLoggedIn = true
        this.userInfo = {
          id: '1',
          username: username,
          isPlusVip: true
        }
        this.token = 'mock-token'

        return { success: true }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, error }
      }
    },

    /**
     * 登出
     */
    async logout() {
      try {
        // TODO: 实现实际的登出 API 调用
        // await $fetch('/api/auth/logout', { method: 'POST' })

        this.isLoggedIn = false
        this.userInfo = null
        this.token = null

        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        return { success: false, error }
      }
    },

    /**
     * 初始化用户状态（从本地存储或 cookie 恢复）
     */
    async initUserState() {
      // 在浏览器环境中才执行
      if (import.meta.client) {
        try {
          // TODO: 从本地存储或 cookie 恢复用户状态
          // const token = localStorage.getItem('token')
          // if (token) {
          //   this.token = token
          //   await this.fetchUserInfo()
          // }
        } catch (error) {
          console.error('Init user state error:', error)
        }
      }
    },

    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      try {
        // TODO: 实现实际的获取用户信息 API 调用
        // const userInfo = await $fetch('/api/user/info')
        // this.userInfo = userInfo
        // this.isLoggedIn = true
      } catch (error) {
        console.error('Fetch user info error:', error)
      }
    }
  }
})

