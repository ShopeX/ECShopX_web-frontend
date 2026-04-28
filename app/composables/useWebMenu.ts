/**
 * 按菜单 key 拉取 Web 端导航树。
 * 后端：`GET …/web/menus/{key}` → `{ data: { id, name, key, items } }`；
 * HTTP 插件会解包一层 `data`，此处 `useAsyncData` 的 `data` 即为菜单对象。
 */
export function useWebMenu(menuKey: string) {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase || '')
  const normalized = base.replace(/\/$/, '')
  const path =
    normalized.endsWith('/h5app') || /\/h5app(\/|$)/.test(normalized)
      ? `/web/menus/${encodeURIComponent(menuKey)}`
      : `/h5app/web/menus/${encodeURIComponent(menuKey)}`

  return useAsyncData(
    `web-menu-${menuKey}`,
    () =>
      nuxtApp.$api(path, {
        method: 'GET',
      }),
    {
      server: true,
      lazy: false,
    }
  )
}
