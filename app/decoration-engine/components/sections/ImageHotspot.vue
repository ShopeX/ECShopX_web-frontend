<template>
  <section class="relative w-full overflow-hidden bg-neutral-100" data-section-type="image-hotspot">
    <!--
      无背景图时原先不渲染 DecorationBlockHost，Admin 选中「图片」块后预览区没有任何描边节点。
      统一用同一 relative 容器：有/无底图都叠加热区；无热区时在预览下可用整块占位承接 BLOCK_HIGHLIGHT。
    -->
    <div class="relative w-full" :style="aspectRatioStyle">
      <img
        v-if="backgroundImage"
        :src="backgroundImage"
        :alt="section.title || 'image hotspot'"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        v-else
        class="absolute inset-0 flex min-h-[200px] items-center justify-center bg-neutral-100 text-sm text-neutral-400"
      >
        {{ t('44646d39.9bb1a6') }}
      </div>

      <DecorationBlockHost
        v-for="hotspot in hotspots"
        :key="hotspot.id"
        :section-id="sectionId"
        :block-id="hotspot.id"
        :root-style="hotspot.style"
        :root-class="'group absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center'"
      >
        <component
          :is="resolveHotspotTag(hotspot.link)"
          :href="resolveHotspotHref(hotspot.link)"
          :target="resolveHotspotTarget(hotspot.link)"
          :rel="resolveHotspotRel(hotspot.link)"
          :aria-label="hotspot.label || `hotspot-${hotspot.id}`"
          @click="handleHotspotClick($event, hotspot.id)"
        >
          <span
            v-if="hotspot.shape === 'rect'"
            class="min-h-12 min-w-12 rounded-xl border-2 border-white/80 bg-black/20 shadow-lg backdrop-blur-sm"
          />
          <span
            v-else
            class="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow-lg"
          >
            <span class="absolute inset-0 rounded-full bg-white/40 animate-ping" />
            <span class="relative h-3 w-3 rounded-full bg-white" />
          </span>

          <span
            v-if="hotspot.label"
            class="pointer-events-none absolute -top-3 left-1/2 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs text-white group-hover:block"
          >
            {{ hotspot.label }}
          </span>
        </component>
      </DecorationBlockHost>

      <DecorationBlockHost
        v-if="isPreview && placeholderHighlightBlockId"
        :section-id="sectionId"
        :block-id="placeholderHighlightBlockId"
        root-class="absolute inset-0 z-[2] min-h-[120px]"
      >
        <span class="sr-only">{{ t('44646d39.9bb1a6') }}</span>
      </DecorationBlockHost>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DecorationSection } from '~/decoration-engine/types/decoration'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'

interface HotspotBlock {
  id: string
  x: number
  y: number
  link: string
  label: string
  shape: 'circle' | 'rect'
  style: {
    left: string
    top: string
  }
}

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const { t } = useI18n()
const { focusBlock } = useDecorationPreview()
const editCtx = useDecorationEditOptional()

const sectionSettings = computed(() => {
  const raw = props.section.settings as Record<string, unknown>
  const imageWidth = Number(raw.imageWidth ?? 1200)
  const imageHeight = Number(raw.imageHeight ?? 600)

  return {
    imageUrl: String(raw.imageUrl || ''),
    imageWidth: Number.isFinite(imageWidth) && imageWidth > 0 ? imageWidth : 1200,
    imageHeight: Number.isFinite(imageHeight) && imageHeight > 0 ? imageHeight : 600,
  }
})

const backgroundImage = computed(() => sectionSettings.value.imageUrl)
const aspectRatioStyle = computed(() => ({
  aspectRatio: `${sectionSettings.value.imageWidth} / ${sectionSettings.value.imageHeight}`,
}))

const hotspots = computed<HotspotBlock[]>(() =>
  props.section.block_order
    .map((blockId) => {
      const block = props.section.blocks[blockId]
      if (!block) {
        return null
      }

      const settings = block.settings as Record<string, unknown>
      const x = Number(settings.x ?? 0)
      const y = Number(settings.y ?? 0)
      const shape: HotspotBlock['shape'] = settings.shape === 'rect' ? 'rect' : 'circle'

      return {
        id: blockId,
        x: Math.min(100, Math.max(0, Number.isFinite(x) ? x : 0)),
        y: Math.min(100, Math.max(0, Number.isFinite(y) ? y : 0)),
        link: String(settings.link || ''),
        label: String(settings.label || ''),
        shape,
        style: {
          left: `${Math.min(100, Math.max(0, Number.isFinite(x) ? x : 0))}%`,
          top: `${Math.min(100, Math.max(0, Number.isFinite(y) ? y : 0))}%`,
        },
      }
    })
    .filter((hotspot): hotspot is HotspotBlock => Boolean(hotspot))
)

/** 无热区节点时（仅空底图占位），用编辑上下文里的高亮块 id 撑一层整区 BlockHost，便于看到选中描边 */
const placeholderHighlightBlockId = computed(() => {
  if (hotspots.value.length > 0 || backgroundImage.value) {
    return null
  }
  const hb = editCtx ? unref(editCtx.highlightedBlock) : undefined
  if (!hb || hb.sectionId !== props.sectionId || !hb.blockId) {
    return null
  }
  return hb.blockId
})

const resolveHotspotTag = (link: string) => (link && !props.isPreview ? 'a' : 'button')
const resolveHotspotHref = (link: string) => (link && !props.isPreview ? link : undefined)
const resolveHotspotTarget = (link: string) =>
  !props.isPreview && /^https?:\/\//.test(link) ? '_blank' : undefined
const resolveHotspotRel = (link: string) =>
  !props.isPreview && /^https?:\/\//.test(link) ? 'noopener noreferrer' : undefined

const handleHotspotClick = (event: MouseEvent, blockId: string) => {
  if (!props.isPreview) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  focusBlock(props.sectionId, blockId)
}
</script>
