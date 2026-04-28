<template>
  <section
    class="group relative w-full overflow-hidden bg-neutral-100"
    :style="{ height: normalizedHeight }"
    data-section-type="carousel"
  >
    <template v-if="activeSlide">
      <component
        :is="resolveSlideTag(activeSlide.link)"
        :href="resolveSlideHref(activeSlide.link)"
        :target="resolveSlideTarget(activeSlide.link)"
        :rel="resolveSlideRel(activeSlide.link)"
        class="block h-full w-full"
        :data-section-id="sectionId"
        :data-block-id="activeSlide.id"
        @click="handleSlideClick($event, activeSlide.id)"
      >
        <DecorationBlockHost
          :section-id="sectionId"
          :block-id="activeSlide.id"
          root-class="h-full w-full"
        >
          <img
            v-if="activeSlide.imageUrl"
            :src="activeSlide.imageUrl"
            :alt="activeSlide.alt"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500"
          >
            {{ t('8cac7342.cc2e46') }}
          </div>
        </DecorationBlockHost>
      </component>

      <div
        v-if="shouldShowDots"
        class="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/25 px-3 py-2"
      >
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          class="h-2.5 w-2.5 rounded-full transition"
          :class="index === currentIndex ? 'bg-white' : 'bg-white/45'"
          :aria-label="`slide-${index + 1}`"
          @click.stop="currentIndex = index"
        />
      </div>

      <template v-if="shouldShowArrows">
        <button
          type="button"
          class="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-xl text-white transition hover:bg-black/50 group-hover:flex"
          aria-label="previous-slide"
          @click.stop="goToPrevious"
        >
          <span aria-hidden="true">&lsaquo;</span>
        </button>
        <button
          type="button"
          class="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-xl text-white transition hover:bg-black/50 group-hover:flex"
          aria-label="next-slide"
          @click.stop="goToNext"
        >
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </template>
    </template>

    <template v-else-if="isPreview && placeholderHighlightBlockId">
      <DecorationBlockHost
        :section-id="sectionId"
        :block-id="placeholderHighlightBlockId"
        root-class="flex h-full min-h-[200px] w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400"
      >
        {{ t('8cac7342.cc2e46') }}
      </DecorationBlockHost>
    </template>

    <div
      v-else
      class="flex h-full min-h-[200px] items-center justify-center bg-neutral-100 text-sm text-neutral-400"
    >
      {{ t('8cac7342.cc2e46') }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DecorationSection } from '~/types/decoration'
import { useDecorationPreview } from '~/composables/useDecorationPreview'

interface CarouselSettings {
  autoplay: boolean
  interval: number
  height: number
  showDots: boolean
  showArrows: boolean
}

interface CarouselSlide {
  id: string
  imageUrl: string
  link: string
  alt: string
}

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const { t } = useI18n()
const { focusBlock } = useDecorationPreview()
const editCtx = useDecorationEditOptional()

const currentIndex = ref(0)
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)

const settings = computed<CarouselSettings>(() => {
  const raw = props.section.settings as Record<string, unknown>
  const height = Number(raw.height ?? 520)
  const interval = Number(raw.interval ?? 3000)

  return {
    autoplay: raw.autoplay !== false,
    interval: Number.isFinite(interval) ? Math.max(1000, interval) : 3000,
    height: Number.isFinite(height) ? Math.min(800, Math.max(200, height)) : 520,
    showDots: raw.showDots !== false,
    showArrows: raw.showArrows !== false,
  }
})

const slides = computed<CarouselSlide[]>(() =>
  props.section.block_order
    .map((blockId) => {
      const block = props.section.blocks[blockId]
      if (!block) {
        return null
      }

      const slideSettings = block.settings as Record<string, unknown>
      return {
        id: blockId,
        imageUrl: String(slideSettings.imageUrl || ''),
        link: String(slideSettings.link || ''),
        alt: String(slideSettings.alt || props.section.title || ''),
      }
    })
    .filter((slide): slide is CarouselSlide => Boolean(slide))
)

const activeSlide = computed(() => slides.value[currentIndex.value] || slides.value[0] || null)
const normalizedHeight = computed(() => `${settings.value.height}px`)

/** 后台选中某一帧 slide 时同步当前帧，否则只渲染当前帧的 BlockHost，高亮 blockId 与 DOM 不一致则无描边 */
watch(
  () => (editCtx && props.isPreview ? unref(editCtx.highlightedBlock) : undefined),
  (hb) => {
    if (!props.isPreview || !hb || hb.sectionId !== props.sectionId || !hb.blockId) {
      return
    }
    const idx = slides.value.findIndex((s) => s.id === hb.blockId)
    if (idx >= 0) {
      currentIndex.value = idx
    }
  },
  { immediate: true }
)

/** 无 slide 数据时空占位仍可承接 BLOCK_HIGHLIGHT（与 ImageHotspot 一致） */
const placeholderHighlightBlockId = computed(() => {
  if (slides.value.length > 0 || !props.isPreview) {
    return null
  }
  const hb = editCtx ? unref(editCtx.highlightedBlock) : undefined
  if (!hb || hb.sectionId !== props.sectionId || !hb.blockId) {
    return null
  }
  return hb.blockId
})
const shouldRotate = computed(() => slides.value.length > 1)
const shouldShowDots = computed(() => settings.value.showDots && shouldRotate.value)
const shouldShowArrows = computed(() => settings.value.showArrows && shouldRotate.value)
const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

const startAutoplay = () => {
  stopAutoplay()
  if (!settings.value.autoplay || !shouldRotate.value) {
    return
  }

  autoplayTimer.value = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.value.length
  }, settings.value.interval)
}

const goToPrevious = () => {
  if (!slides.value.length) {
    return
  }

  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
}

const goToNext = () => {
  if (!slides.value.length) {
    return
  }

  currentIndex.value = (currentIndex.value + 1) % slides.value.length
}

const resolveSlideTag = (link: string) => (link && !props.isPreview ? 'a' : 'div')
const resolveSlideHref = (link: string) => (link && !props.isPreview ? link : undefined)
const resolveSlideTarget = (link: string) =>
  !props.isPreview && /^https?:\/\//.test(link) ? '_blank' : undefined
const resolveSlideRel = (link: string) =>
  !props.isPreview && /^https?:\/\//.test(link) ? 'noopener noreferrer' : undefined

const handleSlideClick = (event: MouseEvent, blockId: string) => {
  if (!props.isPreview) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  focusBlock(props.sectionId, blockId)
}

watch(
  () => slides.value.length,
  (length) => {
    if (!length) {
      currentIndex.value = 0
      stopAutoplay()
      return
    }

    if (currentIndex.value >= length) {
      currentIndex.value = 0
    }
  },
  { immediate: true }
)

watch(
  () => [settings.value.autoplay, settings.value.interval, slides.value.length],
  () => {
    startAutoplay()
  },
  { immediate: true }
)

onBeforeUnmount(stopAutoplay)
</script>
