<script setup lang="ts">
import type { WebMenuItem } from './webMenuTypes'

const props = defineProps<{ item: WebMenuItem }>()

function resolveLink(item: WebMenuItem): string {
  switch (item.link_type) {
    case 'category':
      return `/category/${item.link_value ?? ''}`
    case 'custom_page':
      return `/page/${item.link_value ?? ''}`
    case 'list_page':
      return `/list?${item.link_value ?? ''}`
    case 'article':
      return `/article/${item.link_value ?? ''}`
    case 'url':
      return item.link_value || '#'
    default:
      return '#'
  }
}

/** 站内相对路径（/xxx）用 NuxtLink；http(s) 外链用 <a target="_blank"> */
function isExternal(item: WebMenuItem) {
  if (item.link_type !== 'url') {
    return false
  }
  const v = (item.link_value || '').trim()
  if (!v) {
    return false
  }
  return /^https?:\/\//i.test(v) || v.startsWith('//')
}
</script>

<template>
  <a
    v-if="isExternal(item)"
    :href="resolveLink(item)"
    target="_blank"
    rel="noopener noreferrer"
    class="text-inherit hover:opacity-80"
  >{{ item.name }}</a>
  <NuxtLink
    v-else-if="item.link_type !== 'none'"
    :to="resolveLink(item)"
    class="text-inherit hover:opacity-80"
  >
    {{ item.name }}
  </NuxtLink>
  <span v-else class="cursor-default">{{ item.name }}</span>
</template>
