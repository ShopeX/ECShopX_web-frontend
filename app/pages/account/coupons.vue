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
            <!-- 标题 -->
            <div>
              <h2 class="text-base font-medium text-[#101828] leading-5">优惠券</h2>
            </div>

            <!-- 优惠券列表 - 每行 2 张 -->
            <div class="flex flex-col gap-4">
              <div
                v-for="(row, rowIndex) in couponRows"
                :key="rowIndex"
                class="grid grid-cols-2 gap-4"
              >
                <LazyCouponCard
                  v-for="(coupon, colIndex) in row"
                  :key="`${rowIndex}-${colIndex}`"
                  :amount="coupon.amount"
                  :title="coupon.title"
                  :description="coupon.description"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="coupons.length === 0" class="py-16 text-center text-gray-500">
              暂无优惠券
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
const activeMenu = ref('coupons')

// 优惠券数据接口
interface Coupon {
  amount: number
  title: string
  description: string
}

// 优惠券列表（模拟数据）
const coupons = ref<Coupon[]>([
  {
    amount: 100,
    title: '满500减100',
    description: '全场无门槛使用',
  },
  {
    amount: 100,
    title: '满500减100',
    description: '全场无门槛使用',
  },
  {
    amount: 100,
    title: '满500减100',
    description: '全场无门槛使用',
  },
  {
    amount: 100,
    title: '满500减100',
    description: '全场无门槛使用',
  },
])

// 将优惠券列表转换为每行 2 张的二维数组
const couponRows = computed(() => {
  const rows: Coupon[][] = []
  for (let i = 0; i < coupons.value.length; i += 2) {
    rows.push(coupons.value.slice(i, i + 2))
  }
  return rows
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}
</script>
