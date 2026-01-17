<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold">AddressModal 使用示例</h1>

    <div class="space-y-4">
      <!-- 添加地址 -->
      <div>
        <button
          class="bg-[#191a1d] text-white px-6 py-3 hover:bg-[#191a1d]/90 transition-colors"
          @click="handleAdd"
        >
          添加地址
        </button>
      </div>

      <!-- 编辑地址 -->
      <div>
        <button
          class="bg-[#191a1d] text-white px-6 py-3 hover:bg-[#191a1d]/90 transition-colors"
          @click="handleEdit"
        >
          编辑地址
        </button>
      </div>

      <!-- 地址列表 -->
      <div v-if="addressList.length > 0" class="space-y-2">
        <h2 class="text-xl font-semibold">已保存的地址</h2>
        <div
          v-for="(address, index) in addressList"
          :key="index"
          class="border border-gray-300 p-4 rounded"
        >
          <p><strong>收货人：</strong>{{ address.name }}</p>
          <p><strong>手机号：</strong>{{ address.countryCode }} {{ address.phone }}</p>
          <p>
            <strong>地址：</strong>{{ address.province }} {{ address.city }} {{ address.district }}
            {{ address.detail }}
          </p>
          <p><strong>默认地址：</strong>{{ address.isDefault ? '是' : '否' }}</p>
        </div>
      </div>
    </div>

    <!-- 地址弹窗 -->
    <BCAddressModal
      v-model="showModal"
      :address-id="editingId"
      :initial-data="editingData"
      @success="handleSuccess"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BCAddressModal from './BCAddressModal.vue'
import type { IAddressFormData } from '~/composables/useAddress'

const showModal = ref(false)
const editingId = ref<string>()
const editingData = ref<IAddressFormData>()
const addressList = ref<IAddressFormData[]>([])

/**
 * 处理添加地址
 */
function handleAdd() {
  editingId.value = undefined
  editingData.value = undefined
  showModal.value = true
}

/**
 * 处理编辑地址
 */
function handleEdit() {
  editingId.value = '123'
  editingData.value = {
    name: '张三',
    phone: '13800138000',
    countryCode: '+86',
    province: '110000',
    city: '110100',
    district: '110105',
    tmp_code: [],
    detail: '朝阳区某街道某号',
    isDefault: true,
  }
  showModal.value = true
}

/**
 * 处理保存成功
 */
function handleSuccess(data: IAddressFormData) {
  console.log('地址保存成功:', data)
  addressList.value.push(data)
  showModal.value = false
}

/**
 * 处理关闭
 */
function handleClose() {
  console.log('弹窗关闭')
}
</script>
