<template>
  <div class="bg-[#f3f4f6] min-h-screen">
    <div class="container mx-auto px-32 py-8">
      <div class="flex gap-8">
        <!-- 左侧菜单 -->
        <div class="w-64 shrink-0">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="flex-1">
          <div class="bg-white p-8 flex flex-col gap-4">
            <!-- 标题和添加按钮 -->
            <div class="flex items-center justify-between">
              <h2 class="text-base font-medium text-[#191a1d] leading-5">我的地址</h2>
              <button
                class="bg-white border border-[#e5e7eb] px-[17px] py-[9px] hover:bg-gray-50 transition-colors"
                @click="handleAddAddress"
              >
                <span class="text-xs font-medium text-[#191a1d] leading-4">+ 添加新地址</span>
              </button>
            </div>

            <!-- 地址列表 - 每行 2 个 -->
            <div class="flex flex-col gap-4">
              <div
                v-for="(row, rowIndex) in addressRows"
                :key="rowIndex"
                class="grid grid-cols-2 gap-4"
              >
                <AddressCard
                  v-for="address in row"
                  :key="address.id"
                  :address="address"
                  @edit="handleEditAddress"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="addresses.length === 0" class="py-16 text-center text-gray-500">
              暂无收货地址
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()

// 当前激活的菜单项
const activeMenu = ref('address')

// 地址数据接口
interface Address {
  id: string | number
  name: string
  gender: string
  phone: string
  fullAddress: string
}

// 地址列表（模拟数据）
const addresses = ref<Address[]>([
  {
    id: 1,
    name: '花花',
    gender: '女士',
    phone: '+86 13482554021',
    fullAddress: '上海市 上海市 徐汇区 桂平路361号',
  },
  {
    id: 2,
    name: '花花',
    gender: '女士',
    phone: '+86 13482554021',
    fullAddress: '上海市 上海市 徐汇区 桂平路361号',
  },
  {
    id: 3,
    name: '花花',
    gender: '女士',
    phone: '+86 13482554021',
    fullAddress: '上海市 上海市 徐汇区 桂平路361号',
  },
  {
    id: 4,
    name: '花花',
    gender: '女士',
    phone: '+86 13482554021',
    fullAddress: '上海市 上海市 徐汇区 桂平路361号',
  },
  {
    id: 5,
    name: '花花',
    gender: '女士',
    phone: '+86 13482554021',
    fullAddress: '上海市 上海市 徐汇区 桂平路361号',
  },
  {
    id: 6,
    name: '花花',
    gender: '女士',
    phone: '+86 13482554021',
    fullAddress: '上海市 上海市 徐汇区 桂平路361号',
  },
])

// 将地址列表转换为每行 2 个的二维数组
const addressRows = computed(() => {
  const rows: Address[][] = []
  for (let i = 0; i < addresses.value.length; i += 2) {
    rows.push(addresses.value.slice(i, i + 2))
  }
  return rows
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}

/**
 * 处理添加新地址
 */
function handleAddAddress() {
  console.log('添加新地址')
  // 这里可以打开添加地址的弹窗或跳转到添加页面
}

/**
 * 处理编辑地址
 */
function handleEditAddress(addressId: string | number) {
  console.log('编辑地址:', addressId)
  // 这里可以打开编辑地址的弹窗或跳转到编辑页面
}
</script>
