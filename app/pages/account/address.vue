<template>
  <div class="bg-white min-h-screen" data-testid="address-page">
    <ClientOnly>
      <!-- H5 端布局（DOM 顺序靠前，便于 E2E 在小视口下匹配到可见元素）-->
      <div class="flex flex-col min-h-screen md:hidden">
        <div
          class="bg-white flex items-center justify-between px-4 py-4 shrink-0 border-b border-[#e5e7eb]"
        >
          <button type="button" class="p-1 -ml-1" aria-label="返回" @click="router.back()">
            <Icon name="ph:caret-left" class="w-6 h-6 text-[#191a1d]" />
          </button>
          <span class="text-base font-medium text-[#191a1d] leading-5">收货地址</span>
          <div class="w-6 shrink-0" />
        </div>
        <div class="px-4 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
          <h2 class="text-base font-medium text-[#191a1d] leading-5">收货地址</h2>
          <button
            type="button"
            class="border border-[#e5e7eb] px-[17px] py-2 text-xs font-medium text-[#191a1d] leading-4 hover:bg-gray-50 transition-colors"
            data-testid="address-add-btn"
            @click="openAddModal"
          >
            + 添加新地址
          </button>
        </div>
        <div class="flex-1 p-4 overflow-y-auto">
          <div v-if="loading" class="py-16 text-center text-[#4a5565] text-sm">加载中...</div>
          <div
            v-else-if="addressList.length > 0"
            class="flex flex-col gap-4"
            data-testid="address-list"
          >
            <AddressCard
              v-for="item in addressList"
              :key="item.id"
              data-testid="address-card"
              :address="item"
              :is-default="item.isDefault"
              layout="h5"
              @edit="handleEdit"
              @delete="handleDelete"
              @set-default="handleSetDefault"
            />
          </div>
          <div
            v-else
            class="py-16 text-center text-[#4a5565] text-sm"
            data-testid="address-empty"
          >
            暂无收货地址
          </div>
        </div>
      </div>

      <!-- PC 端布局：与 Figma 2507-5039 一致，左侧菜单 + 右侧收货地址 -->
      <div class="hidden md:flex md:flex-col">
        <div class="flex items-start justify-center px-[128px] py-[32px] w-full">
          <div class="flex flex-[1_0_0] gap-[64px] items-start min-w-0 max-w-[1440px] w-full">
            <div class="w-64 shrink-0">
              <AccountMenu v-model="activeMenu" @logout="handleLogout" />
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-4">
              <div class="flex items-center justify-between w-full">
                <h2 class="font-['Noto_Sans_SC',sans-serif] font-medium text-[16px] leading-5 text-[#191a1d]">
                  收货地址
                </h2>
                <button
                  type="button"
                  class="bg-white border border-[#e5e7eb] px-[17px] py-[9px] text-[12px] font-medium leading-4 text-[#191a1d] hover:bg-gray-50 transition-colors"
                  data-testid="address-add-btn-pc"
                  @click="openAddModal"
                >
                  + 添加新地址
                </button>
              </div>
              <div v-if="loading" class="py-16 text-center text-[14px] text-[#4a5565]">加载中...</div>
              <div
                v-else-if="addressList.length > 0"
                class="grid grid-cols-2 gap-4 w-full"
                data-testid="address-list-pc"
              >
                <AddressCard
                  v-for="item in addressList"
                  :key="item.id"
                  data-testid="address-card"
                  :address="item"
                  :is-default="item.isDefault"
                  layout="pc"
                  @edit="handleEdit"
                  @delete="handleDelete"
                  @set-default="handleSetDefault"
                />
              </div>
              <div
                v-else
                class="py-16 text-center text-[14px] text-[#4a5565]"
                data-testid="address-empty-pc"
              >
                暂无收货地址
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>

    <BCAddressModal
      v-model="modalVisible"
      :address-id="editingAddressId"
      :initial-data="modalInitialData"
      @success="onModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { IAddressItem, IAddressFormData } from '~/composables/useAddress'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { getAddressList, getAddressDetail, deleteAddress, updateAddress } = useAddress()

const activeMenu = ref('address')
const loading = ref(false)
const addressList = ref<Array<{
  id: string
  name: string
  phone: string
  fullAddress: string
  isDefault: boolean
}>>([])

const modalVisible = ref(false)
const editingAddressId = ref<string | undefined>(undefined)
const modalInitialData = ref<IAddressFormData | undefined>(undefined)

function normalizeList(data: unknown): IAddressItem[] {
  if (Array.isArray(data)) return data as IAddressItem[]
  if (data && typeof data === 'object' && 'data' in (data as object)) {
    const d = (data as { data: unknown }).data
    return Array.isArray(d) ? (d as IAddressItem[]) : []
  }
  if (data && typeof data === 'object' && 'list' in (data as object)) {
    const list = (data as { list: unknown }).list
    return Array.isArray(list) ? (list as IAddressItem[]) : []
  }
  return []
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getAddressList()
    if (res.success && res.data != null) {
      const raw = normalizeList(res.data)
      addressList.value = raw.map((item: IAddressItem) => ({
        id: item.address_id,
        name: item.username,
        phone: item.telephone,
        fullAddress: [item.province, item.city, item.county, item.adrdetail].filter(Boolean).join(' '),
        isDefault: item.is_def === 1,
      }))
    } else {
      addressList.value = []
    }
  } catch {
    addressList.value = []
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingAddressId.value = undefined
  modalInitialData.value = undefined
  modalVisible.value = true
}

async function handleEdit(addressId: string | number) {
  const id = String(addressId)
  const res = await getAddressDetail(id)
  if (res.success && res.data) {
    editingAddressId.value = id
    modalInitialData.value = res.data
    modalVisible.value = true
  }
}

function handleDelete(addressId: string | number) {
  if (!confirm('确定要删除该收货地址吗？')) return
  deleteAddress(String(addressId)).then((res) => {
    if (res.success) fetchList()
  })
}

async function handleSetDefault(addressId: string | number) {
  const id = String(addressId)
  const res = await getAddressDetail(id)
  if (!res.success || !res.data) return
  const formData = { ...res.data, isDefault: true }
  const updateRes = await updateAddress(id, formData)
  if (updateRes.success) fetchList()
}

function onModalSuccess() {
  modalVisible.value = false
  editingAddressId.value = undefined
  modalInitialData.value = undefined
  fetchList()
}

function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(() => {
  fetchList()
})
</script>
