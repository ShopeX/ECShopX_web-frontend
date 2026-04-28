<template>
  <section
    class="w-full border-b border-neutral-200"
    :class="settings.color_mode === 'dark' ? 'bg-[#111827] text-white' : 'bg-white text-[#111827]'"
    data-section-type="announcement-bar"
  >
    <div class="mx-auto flex max-w-[1440px] items-center px-6 py-2 text-sm md:px-12">
      <DecorationBlockHost
        v-if="activeBlock"
        :section-id="sectionId"
        :block-id="activeBlock.id"
        root-class="min-w-0 flex-1"
      >
        <div class="truncate">
          {{ activeText }}
        </div>
      </DecorationBlockHost>
      <div v-else class="min-w-0 flex-1 truncate opacity-70">--</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DecorationSection } from '~/types/decoration'

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const settings = computed(() => {
  const raw = props.section.settings as Record<string, unknown>
  return {
    color_mode: String(raw.color_mode || 'light'),
  }
})

const activeBlock = computed(() => {
  const firstId = props.section.block_order?.[0]
  if (!firstId) {
    return null
  }
  const block = props.section.blocks?.[firstId]
  if (!block) {
    return null
  }
  return {
    id: firstId,
    settings: (block.settings || {}) as Record<string, unknown>,
  }
})

const activeText = computed(() => String(activeBlock.value?.settings?.text || '--'))
</script>
