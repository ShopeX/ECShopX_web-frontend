<template>
  <footer class="border-t border-neutral-200 bg-[#111214] text-white" data-section-type="footer">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 md:px-12">
      <div class="flex flex-wrap items-center gap-5 text-sm text-white/80">
        <DecorationBlockHost
          v-for="item in footerBlocks"
          :key="item.blockId"
          :section-id="sectionId"
          :block-id="item.blockId"
          root-class="inline-flex min-w-0"
        >
          <a :href="item.link" class="transition hover:text-white">
            {{ item.label }}
          </a>
        </DecorationBlockHost>
      </div>

      <p class="text-sm text-white/60">{{ copyrightText }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import DecorationBlockHost from '~/decoration-engine/components/DecorationBlockHost.vue'
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

const copyrightText = computed(() =>
  String(props.section.settings.copyright || 'Copyright © ECSHOPX')
)

const footerBlocks = computed(
  () =>
    props.section.block_order
      .map((blockId) => {
        const block = props.section.blocks[blockId]
        if (!block) {
          return null
        }

        const settings = block.settings as Record<string, unknown>

        return {
          blockId,
          label: String(settings.label || settings.title || '页脚链接'),
          link: String(settings.link || '#'),
        }
      })
      .filter(Boolean) as Array<{ blockId: string; label: string; link: string }>
)
</script>
