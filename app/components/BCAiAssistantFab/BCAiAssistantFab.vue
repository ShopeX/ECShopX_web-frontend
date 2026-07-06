<template>
  <ClientOnly>
    <button
      v-if="shouldShow"
      type="button"
      class="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 md:bottom-8 md:right-8"
      aria-label="AI Assistant"
      data-testid="ai-assistant-fab"
      @click="openAssistant"
    >
      <img
        v-if="fabIconUrl"
        :src="fabIconUrl"
        alt=""
        class="h-full w-full rounded-full object-cover"
      />
      <span v-else>{{ fabText }}</span>
    </button>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { resolveCompanyId } from '~/utils/company'
import {
  buildAiAssistantAuthPayload,
  buildAiAssistantOpenUrl,
  buildAiEmbedPageUrl,
  isAiAssistantEnabled,
  isMobileWebUserAgent,
  openAiAssistantInNewWindow,
  resolveAiAssistantBackendUrl,
  resolveDistributorIdFromRoute,
  type AiAssistantPublicConfig,
} from '~/utils/aiAssistantEmbed'

defineOptions({ name: 'BCAiAssistantFab' })

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const userStore = useUserStore()

const mounted = ref(false)
const fabIconUrl = ref('')
const fabText = ref('AI')

const aiConfig = computed(() => config.public as AiAssistantPublicConfig)
const backend = computed(() => resolveAiAssistantBackendUrl(aiConfig.value))
const enabled = computed(() => isAiAssistantEnabled(aiConfig.value.aiAssistant))
const isAiAssistantRoute = computed(
  () => route.path.includes('/ai-assistant') || String(route.name || '').includes('ai-assistant')
)

const payload = computed(() =>
  buildAiAssistantAuthPayload({
    token: userStore.token,
    companyId: resolveCompanyId(),
    tenantId: aiConfig.value.aiTenantId,
    distributorId: resolveDistributorIdFromRoute(route),
  })
)

const assistantUrl = computed(() =>
  buildAiAssistantOpenUrl({
    embedPageUrl: buildAiEmbedPageUrl(aiConfig.value),
    backend: backend.value,
    payload: payload.value,
  })
)

const shouldShow = computed(() => mounted.value && enabled.value && !isAiAssistantRoute.value)

function buildAvatarAssetUrl(avatar: string): string {
  const tenantId = String(aiConfig.value.aiTenantId || '').trim()
  const params = new URLSearchParams()
  if (tenantId) params.set('tenant_id', tenantId)
  params.set('avatar', avatar)
  return `${backend.value}/api/widget/avatar-asset?${params.toString()}`
}

function applyAvatarConfig(value: unknown) {
  if (!value || typeof value !== 'object') return

  const data = 'data' in value && value.data && typeof value.data === 'object' ? value.data : value
  const avatar = String(
    ('default_avatar' in data && data.default_avatar) ||
      ('defaultAvatar' in data && data.defaultAvatar) ||
      ''
  ).trim()

  if (!avatar || ['fox', 'robot', 'cat'].includes(avatar)) return

  fabIconUrl.value = /^(https?:|data:|\/)/i.test(avatar) ? avatar : buildAvatarAssetUrl(avatar)
}

async function loadFabConfig() {
  if (!backend.value) return

  try {
    const tenantId = String(aiConfig.value.aiTenantId || '').trim()
    const query = new URLSearchParams()
    if (tenantId) query.set('tenant_id', tenantId)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await fetch(`${backend.value}/api/widget/embed-config${suffix}`)
    if (!response.ok) return
    applyAvatarConfig(await response.json())
  } catch {
    fabIconUrl.value = ''
  }
}

function openAssistant() {
  if (!import.meta.client) return

  if (isMobileWebUserAgent(window.navigator.userAgent)) {
    void router.push(localePath('/ai-assistant'))
    return
  }

  const opened = openAiAssistantInNewWindow(assistantUrl.value)
  if (!opened) {
    window.location.href = assistantUrl.value
  }
}

onMounted(() => {
  mounted.value = true
  void loadFabConfig()
})
</script>
