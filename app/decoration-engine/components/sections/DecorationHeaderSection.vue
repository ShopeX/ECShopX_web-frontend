<template>
  <header
    class="border-b border-neutral-200 bg-[var(--section-background)] text-[var(--section-foreground)]"
    :class="sectionClasses"
    :style="sectionStyle"
    data-section-type="header"
  >
    <div :class="innerClasses">
      <div class="col-start-1 row-start-1 flex items-center gap-3 lg:gap-6">
        <a v-if="isLogoLeft" :href="logoLink" class="flex items-center">
          <img
            :src="logoUrl"
            :alt="section.title || 'logo'"
            class="h-10 w-auto object-contain"
          />
        </a>

        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          aria-label="搜索"
          @click="emit('open-search')"
        >
          <Icon name="i-heroicons-magnifying-glass" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          aria-label="菜单"
          @click="emit('open-category-nav')"
        >
          <Icon name="i-heroicons-bars-3" class="h-5 w-5" />
        </button>
      </div>

      <a v-if="!isLogoLeft" :href="logoLink" class="col-start-2 row-start-1 flex items-center justify-self-center">
        <img
          :src="logoUrl"
          :alt="section.title || 'logo'"
          class="h-10 w-auto object-contain"
        />
      </a>

      <div class="col-start-3 row-start-1 flex h-5 items-center justify-end gap-3 lg:gap-6">
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          aria-label="购物袋"
          @click="emit('open-mini-cart')"
        >
          <Icon name="i-heroicons-shopping-bag" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          aria-label="用户"
          @click="emit('open-user')"
        >
          <Icon name="i-heroicons-user" class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { resolveSectionColorScheme, resolveSectionPaddingClass } from '~/decoration-engine/utils/sectionAppearance'
import type {
  DecorationHighlightedBlock,
  DecorationSection,
} from '~/decoration-engine/types/decoration'

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
  highlightedBlock?: DecorationHighlightedBlock | null
}>()
const emit = defineEmits<{
  'open-category-nav': []
  'open-mini-cart': []
  'open-search': []
  'open-user': []
}>()

const logoUrl = computed(() => String(props.section.settings.logoUrl || '/images/logo/logo.png'))
const logoLink = computed(() => String(props.section.settings.logoLink || '/'))
const logoPosition = computed(() =>
  props.section.settings?.logo_position === 'left' ? 'left' : 'center'
)
const isLogoLeft = computed(() => logoPosition.value === 'left')
const isFullWidth = computed(() => props.section.settings?.full_width === true)
const sectionClasses = computed(() => [
  isFullWidth.value ? 'w-full' : 'mx-auto max-w-[1440px]',
  resolveSectionPaddingClass(props.section.settings?.padding_top || 'xs', 'top'),
  resolveSectionPaddingClass(props.section.settings?.padding_bottom || 'xs', 'bottom'),
])
const innerClasses = computed(() => [
  'mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-8 px-6',
  isFullWidth.value ? 'w-full max-w-none' : 'max-w-[1440px]',
])
const sectionStyle = computed(() => {
  const scheme = resolveSectionColorScheme(props.section.settings?.color_scheme)
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
  }
})

</script>
