import type { IFrontendCommonSetting } from '~/types/api/common'

/**
 * 后台通用配置 HTTP 客户端
 */
export class CommonApiClient {
  private $api: any

  constructor() {}

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取 PC/H5 前端通用配置（含默认币种）
   */
  async getFrontendSetting(): Promise<IFrontendCommonSetting> {
    return this.http('/wxapp/common/setting', {
      method: 'GET',
      query: { type: 'frontend' },
      cache: 'default',
    })
  }
}

export const commonApiClient = new CommonApiClient()
