<script setup lang="ts">
import { ref } from 'vue'

// Mock Data
const addresses = ref([
  {
    id: 1,
    alias: 'leo',
    city: '北京市',
    recipient: 'leo',
    fullAddress: '北京市/北京市/昌平区/xxxx',
    zipCode: '123123',
    phone: '13988880001',
    isDefault: true
  },
  // Add more mock data if needed to test list rendering
])

const maxAddresses = 20

const handleAdd = () => {
  console.log('Add new address')
}

const handleEdit = (id: number) => {
  console.log('Edit address', id)
}

const handleDelete = (id: number) => {
  console.log('Delete address', id)
}

const handleSetDefault = (id: number) => {
  console.log('Set default address', id)
}
</script>

<template>
  <div class="flex gap-6">
    <MemberSidebar />

    <div class="flex-1 bg-white rounded-lg p-8">
      <h2 class="text-lg font-medium text-gray-900 mb-6">收货地址管理</h2>

      <!-- Header Actions -->
      <div class="flex items-center gap-4 mb-6">
        <UButton
          color="white"
          variant="solid"
          class="ring-1 ring-gray-200 hover:ring-gray-300 text-gray-600"
          @click="handleAdd"
        >
          新增收货地址
        </UButton>
        <span class="text-sm text-gray-500">
          您已创建<span class="text-[#ff0036] mx-1">{{ addresses.length }}</span>个收货地址，最多可创建<span class="text-[#ff0036] mx-1">{{ maxAddresses }}</span>个
        </span>
      </div>

      <!-- Address List -->
      <div class="space-y-4">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="border rounded-lg p-6 relative group transition-all"
          :class="addr.isDefault ? 'border-[#ff0036]/30 bg-[#ff0036]/[0.02]' : 'border-gray-200 hover:border-gray-300'"
        >
          <!-- Title -->
          <div class="flex items-baseline gap-3 mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ addr.alias }}</h3>
            <span class="text-lg text-gray-900">{{ addr.city }}</span>
            <span v-if="addr.isDefault" class="ml-auto text-xs bg-[#ff0036] text-white px-2 py-0.5 rounded">默认地址</span>
          </div>

          <!-- Details -->
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex">
              <span class="w-20 text-gray-400">收货人：</span>
              <span>{{ addr.recipient }}</span>
            </div>
            <div class="flex">
              <span class="w-20 text-gray-400">收货地址：</span>
              <span>{{ addr.fullAddress }}</span>
            </div>
            <div class="flex">
              <span class="w-20 text-gray-400">邮政编码：</span>
              <span>{{ addr.zipCode }}</span>
            </div>
            <div class="flex">
              <span class="w-20 text-gray-400">手机：</span>
              <span>{{ addr.phone }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="absolute bottom-6 right-6 flex items-center gap-4 text-sm">
            <button
              v-if="!addr.isDefault"
              class="text-[#ff0036] hover:underline"
              @click="handleSetDefault(addr.id)"
            >
              设为默认
            </button>
            <span v-else class="text-[#ff0036] font-medium">默认地址</span>
            
            <button
              class="text-blue-500 hover:text-blue-600 hover:underline"
              @click="handleEdit(addr.id)"
            >
              编辑
            </button>
            <button
              class="text-blue-500 hover:text-blue-600 hover:underline"
              @click="handleDelete(addr.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
