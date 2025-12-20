<template>
  <div class="bg-[#f3f4f6] min-h-screen">
    <div class="container mx-auto px-32 py-8">
      <div class="flex gap-8">
        <!-- 左侧菜单 -->
        <div class="w-64 shrink-0">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="flex-1 flex flex-col gap-8">
          <!-- 积分卡片 -->
          <div class="bg-white p-8 flex flex-col gap-4">
            <div class="pb-4">
              <h2 class="text-base font-medium text-[#101828] leading-5">个人中心</h2>
            </div>
            <div class="border border-[#e5e7eb] flex items-center justify-between px-4 py-8">
              <div class="flex items-center gap-4">
                <span class="text-sm text-[#4a5565] leading-5">可用积分</span>
                <span class="text-4xl font-medium text-[#191a1d] leading-9">{{
                  availablePoints
                }}</span>
              </div>
              <button
                class="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                @click="handleViewAllPoints"
              >
                <span class="text-sm text-[#191a1d] leading-5">全部积分</span>
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
              </button>
            </div>
          </div>

          <!-- 积分明细 -->
          <div class="bg-white p-8 flex flex-col gap-4">
            <div class="pb-4">
              <h2 class="text-base font-medium text-[#191a1d] leading-5">积分明细（近一年内）</h2>
            </div>

            <!-- 积分记录列表 -->
            <div class="flex flex-col gap-6">
              <div v-for="(record, index) in pointRecords" :key="index" class="flex flex-col gap-2">
                <div class="text-base font-medium text-[#191a1d] leading-5">
                  {{ record.date }}
                </div>
                <div class="flex items-center justify-between text-sm leading-5">
                  <span class="text-[#4a5565]">{{ record.description }}</span>
                  <span class="font-medium text-[#191a1d]">{{ record.points }}</span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="pointRecords.length === 0" class="py-8 text-center text-gray-500">
              暂无积分记录
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()

// 当前激活的菜单项
const activeMenu = ref('profile')

// 可用积分
const availablePoints = ref(100)

// 积分记录（模拟数据）
const pointRecords = ref([
  {
    date: '2025-10-30 23:34:23',
    description: '购物扣减积分，当前剩余积分：99',
    points: '-1',
  },
  {
    date: '2025-10-30 23:34:23',
    description: '购物扣减积分，当前剩余积分：99',
    points: '-1',
  },
  {
    date: '2025-10-30 23:34:23',
    description: '购物扣减积分，当前剩余积分：99',
    points: '-1',
  },
  {
    date: '2025-10-30 23:34:23',
    description: '购物扣减积分，当前剩余积分：99',
    points: '-1',
  },
  {
    date: '2025-10-30 23:34:23',
    description: '购物扣减积分，当前剩余积分：99',
    points: '-1',
  },
  {
    date: '2025-10-30 23:34:23',
    description: '购物扣减积分，当前剩余积分：99',
    points: '-1',
  },
])

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}

/**
 * 查看所有积分
 */
function handleViewAllPoints() {
  // 这里可以跳转到积分详情页或打开弹窗
  console.log('查看所有积分')
}
</script>
