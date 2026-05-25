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
          <img :src="logoUrl" :alt="section.title || 'logo'" class="h-10 w-auto object-contain" />
        </a>

        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          :aria-label="t('48ec697b.e5f71f')"
          @click="emit('open-search')"
        >
          <Icon name="i-heroicons-magnifying-glass" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          :aria-label="t('48ec697b.4ccbdc')"
          @click="emit('open-category-nav')"
        >
          <Icon name="i-heroicons-bars-3" class="h-5 w-5" />
        </button>
      </div>

      <a
        v-if="!isLogoLeft"
        :href="logoLink"
        class="col-start-2 row-start-1 flex items-center justify-self-center"
      >
        <img :src="logoUrl" :alt="section.title || 'logo'" class="h-10 w-auto object-contain" />
      </a>

      <div class="col-start-3 row-start-1 flex h-5 items-center justify-end gap-3 lg:gap-6">
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          :aria-label="t('48ec697b.53754b')"
          @click="emit('open-mini-cart')"
        >
          <Icon name="i-heroicons-shopping-bag" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          :aria-label="t('48ec697b.1fd02a')"
          @click="emit('open-user')"
        >
          <Icon name="i-heroicons-user" class="h-5 w-5" />
        </button>
        <div
          v-if="showLanguageSelector"
          ref="languageMenuRef"
          class="relative"
          data-testid="decoration-header-language"
        >
          <button
            type="button"
            class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
            :aria-label="t('48ec697b.295bb7')"
            @click="toggleLanguageMenu"
          >
            <Icon name="i-heroicons-globe-alt" class="h-5 w-5" />
          </button>

          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div
              v-if="showLanguageMenu"
              class="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-neutral-200 bg-white py-2 text-neutral-900 shadow-lg"
            >
              <button
                v-for="lang in availableLocales"
                :key="lang.code"
                type="button"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-100"
                :class="
                  currentLocale === lang.code ? 'font-medium text-neutral-950' : 'text-neutral-600'
                "
                @click="switchLanguage(lang.code)"
              >
                <span>{{ lang.name }}</span>
                <Icon
                  v-if="currentLocale === lang.code"
                  name="i-heroicons-check"
                  class="h-4 w-4 text-neutral-950"
                />
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  resolveSectionColorScheme,
  resolveSectionPaddingClass,
} from '~/decoration-engine/utils/sectionAppearance'
import type {
  DecorationHighlightedBlock,
  DecorationSection,
} from '~/decoration-engine/types/decoration'
import { LOCALE_DEFINITIONS, type AppLocaleCode } from '~/shared/localeConfig'

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

const { mallLogoDarkUrl } = await useMallGlobalSetting()

const logoUrl = computed(() => String(props.section.settings.logoUrl || mallLogoDarkUrl.value))
const logoLink = computed(() => String(props.section.settings.logoLink || '/'))
const logoPosition = computed(() =>
  props.section.settings?.logo_position === 'left' ? 'left' : 'center'
)
const isLogoLeft = computed(() => logoPosition.value === 'left')
const isFullWidth = computed(() => props.section.settings?.full_width === true)
const showLanguageSelector = computed(
  () => props.section.settings?.enable_language_selector !== false
)
const sectionClasses = computed(() => [
  'w-full',
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

const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const showLanguageMenu = ref(false)
const languageMenuRef = ref<HTMLElement | null>(null)
const currentLocale = computed(() => locale.value)
const availableLocales = LOCALE_DEFINITIONS.map(({ code, name }) => ({ code, name }))

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
}

function switchLanguage(localeCode: AppLocaleCode) {
  showLanguageMenu.value = false
  const path = switchLocalePath(localeCode)
  navigateTo(path)
}

function handleClickOutside(event: MouseEvent) {
  if (languageMenuRef.value && !languageMenuRef.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
