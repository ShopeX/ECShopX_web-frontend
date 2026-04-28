<template>
  <div
    class="min-h-screen bg-gray-50"
    @click.capture="handleMouseEvent"
    @mousedown.capture="handleMouseEvent"
  >
    design
    <!-- 简化版头部（仅 Logo 和基本导航） -->
    <TemplateEngine v-if="!useDecorationDrivenChrome" template="header">
      <template #header>
        <HeaderBarSimple />
      </template>
    </TemplateEngine>

    <!-- 页面内容区域 -->
    <main class="container mx-auto px-0 py-0 md:px-4 md:py-8">
      <slot />
    </main>

    <!-- Selection Overlay -->
    <div
      v-if="selectedWidget"
      class="selection-overlay absolute pointer-events-none z-50 border-2 border-primary-500 transition-all duration-75"
      :style="{
        top: `${selectedWidget.top}px`,
        left: `${selectedWidget.left}px`,
        width: `${selectedWidget.width}px`,
        height: `${selectedWidget.height}px`,
      }"
    >
      <!-- Label -->
      <div
        class="absolute top-0 left-0 -translate-y-full bg-primary-500 text-white text-xs px-2 py-1 rounded-t-sm pointer-events-auto"
      >
        {{ selectedWidget.label || 'Widget' }}
      </div>

      <!-- Toolbar -->
      <div
        class="absolute right-0 top-0 translate-x-full ml-2 flex flex-col gap-1 pointer-events-auto bg-white shadow-lg border border-gray-100 rounded p-1"
      >
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Move Up">
          <UIcon name="i-heroicons-arrow-up" class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Move Down">
          <UIcon name="i-heroicons-arrow-down" class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Duplicate">
          <UIcon name="i-heroicons-document-duplicate" class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete">
          <UIcon name="i-heroicons-trash" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDesignMode } from '~/composables/useDesignMode'

// 引入 template-engine schema 配置
import schemaMap from '~/templateEngines/schema'

interface SelectedWidget {
  el: HTMLElement
  top: number
  left: number
  width: number
  height: number
  label?: string
  // 可扩展属性
  widgetName?: string
  schemaConfig?: any
}

// 工具函数: 切换短横线/下划线/空格等为小驼峰
function toCamelCase(str: string): string {
  // 支持 xx-yy, xx_yy, xx yy 转 xxYy
  return str
    .replace(/[-_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^([A-Z])/, (m) => m.toLowerCase())
}

const selectedWidget = ref<SelectedWidget | null>(null)
const { notifySelection } = useDesignMode()
const route = useRoute()
const isEmbedded = ref(false)
if (import.meta.client) {
  try {
    isEmbedded.value = window.parent !== window
  } catch {
    isEmbedded.value = false
  }
}
const isDecorationPreview = computed(
  () => String(route.query.preview || '') === 'true' || isEmbedded.value
)
const isHomePage = computed(() => route.path === '/')
const useDecorationDrivenChrome = computed(() => isDecorationPreview.value || isHomePage.value)

// 计算绝对位置
const getAbsolutePosition = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const scrollLeft = window.scrollX ?? document.documentElement.scrollLeft
  const scrollTop = window.scrollY ?? document.documentElement.scrollTop
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    width: rect.width,
    height: rect.height,
  }
}

// 更新overlay位置
const updateOverlay = () => {
  if (selectedWidget.value?.el) {
    if (!selectedWidget.value.el.isConnected) {
      selectedWidget.value = null
      return
    }
    const pos = getAbsolutePosition(selectedWidget.value.el)
    selectedWidget.value.top = pos.top
    selectedWidget.value.left = pos.left
    selectedWidget.value.width = pos.width
    selectedWidget.value.height = pos.height
  }
}

/**
 * 处理鼠标事件，选择widget时获取widget-name，转小驼峰，再从schemaMap中取对应schema配置
 */
const handleMouseEvent = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  // Prevent deselection if clicking on the overlay toolbar
  if (target.closest('.selection-overlay')) {
    return
  }

  const widget = target.closest('.section-widget') as HTMLElement

  if (widget) {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'mousedown') {
      const pos = getAbsolutePosition(widget)
      const label = widget.getAttribute('data-label') || '产品系列列表'
      const widgetId = widget.getAttribute('data-widget-id') || null

      // 获取 widget-name 属性并转为小驼峰
      const widgetNameAttr = widget.getAttribute('widget-name') || ''
      const widgetNameCamel = widgetNameAttr ? toCamelCase(widgetNameAttr) : ''

      // 获取对应schema配置
      const schemaConfig =
        widgetNameCamel && Object.prototype.hasOwnProperty.call(schemaMap, widgetNameCamel)
          ? (schemaMap as Record<string, (typeof schemaMap)[keyof typeof schemaMap]>)[
              widgetNameCamel
            ]
          : undefined

      selectedWidget.value = {
        el: widget,
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
        label,
        widgetName: widgetNameCamel,
        schemaConfig,
      }

      // 通知父级，传递schemaConfig配置对象（不再是原来的参数）
      notifySelection(widgetNameCamel, selectedWidget.value, schemaConfig)
    }
  } else if (e.type === 'mousedown') {
    selectedWidget.value = null
    notifySelection(null)
  }
}

onMounted(() => {
  window.addEventListener('resize', updateOverlay)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateOverlay)
})
</script>
