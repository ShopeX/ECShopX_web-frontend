<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-8">发票组件示例</h1>

    <div class="flex flex-col gap-4">
      <!-- 基础用法 -->
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-medium">基础用法</h2>
        <button
          class="bg-[#191a1d] text-white px-6 py-3 rounded hover:bg-[#191a1d]/90 transition-colors"
          @click="showInvoiceModal = true"
        >
          填写发票信息
        </button>
      </div>

      <!-- 显示已保存的发票信息 -->
      <div v-if="savedInvoice" class="bg-gray-50 p-4 rounded">
        <h3 class="text-base font-medium mb-2">已保存的发票信息：</h3>
        <div class="text-sm space-y-1">
          <p><strong>类型：</strong>{{ savedInvoice.type === 'personal' ? '个人' : '企业' }}</p>
          <p><strong>抬头：</strong>{{ savedInvoice.title }}</p>
          <p v-if="savedInvoice.taxNumber"><strong>纳税人识别号：</strong>{{ savedInvoice.taxNumber }}</p>
          <p><strong>发票内容：</strong>{{ getContentLabel(savedInvoice.content) }}</p>
          <p><strong>接收邮箱：</strong>{{ savedInvoice.email }}</p>
        </div>
      </div>
    </div>

    <!-- 发票弹窗 -->
    <InvoiceModal
      v-model="showInvoiceModal"
      :initial-data="savedInvoice"
      @success="handleInvoiceSuccess"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InvoiceModal, type IInvoiceFormData } from './index'

const showInvoiceModal = ref(false)
const savedInvoice = ref<IInvoiceFormData | undefined>()

/**
 * 处理发票保存成功
 */
function handleInvoiceSuccess(data: IInvoiceFormData) {
  savedInvoice.value = data
  console.log('发票信息已保存:', data)
}

/**
 * 处理关闭
 */
function handleClose() {
  console.log('发票弹窗已关闭')
}

/**
 * 获取发票内容标签
 */
function getContentLabel(value: string): string {
  const map: Record<string, string> = {
    goods: '商品明细',
    service: '服务费',
    goods_service: '商品及服务',
    other: '其他',
  }
  return map[value] || value
}
</script>

