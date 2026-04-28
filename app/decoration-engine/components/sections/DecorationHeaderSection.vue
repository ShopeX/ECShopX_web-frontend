<template>
  <header class="border-b border-neutral-200 bg-white" data-section-type="header">
    <div class="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-5 md:px-12">
      <a :href="logoLink" class="flex items-center gap-3">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="section.title || 'logo'"
          class="h-10 w-auto object-contain"
        />
        <span v-else class="text-lg font-semibold text-[#191A1D]">
          {{ section.title || 'ECSHOPX' }}
        </span>
      </a>

      <nav class="hidden items-center gap-6 md:flex">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="item.link"
          class="text-sm text-neutral-700 transition hover:text-black"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
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

const logoUrl = computed(() => String(props.section.settings.logoUrl || ''))
const logoLink = computed(() => String(props.section.settings.logoLink || '/'))

const navItems = computed(
  () =>
    props.section.block_order
      .map((blockId) => {
        const block = props.section.blocks[blockId]
        if (!block) {
          return null
        }

        const settings = block.settings as Record<string, unknown>

        return {
          id: blockId,
          label: String(settings.label || settings.title || '导航'),
          link: String(settings.link || '#'),
        }
      })
      .filter(Boolean) as Array<{ id: string; label: string; link: string }>
)
</script>
