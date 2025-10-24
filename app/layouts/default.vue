<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  // {
  //   label: 'Docs',
  //   to: '/docs/getting-started',
  //   active: route.path.startsWith('/docs/getting-started'),
  // },
  // {
  //   label: 'Components',
  //   to: '/docs/components',
  //   active: route.path.startsWith('/docs/components'),
  // },
  {
    label: 'Figma',
    to: 'https://go.nuxt.com/figma-ui',
    target: '_blank',
  },
  {
    label: 'Releases',
    to: 'https://github.com/nuxt/ui/releases',
    target: '_blank',
  },
])
</script>

<template>
  <UHeader>
    <template #title> ECSHOPX </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>

  <!-- 页面内容插槽 -->
  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>
</template>
