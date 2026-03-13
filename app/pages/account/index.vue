<template>
  <div class="bg-white min-h-screen">
    <div class="content-stretch flex items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full">
      <div class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative">
        <!-- 左侧菜单 -->
        <div class="w-64 shrink-0">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
          <!-- 积分卡片 -->
          <div class="bg-white content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
            <div class="relative shrink-0 w-full">
              <div class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative w-full">
                <h2 class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#101828] text-[16px] whitespace-nowrap">个人中心</h2>
              </div>
            </div>
            <div class="relative shrink-0 w-full">
              <div class="border border-[#e5e7eb] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px px-[17px] py-[33px] relative">
                <div class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
                  <div class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center justify-center relative whitespace-nowrap">
                    <span class="font-['Noto_Sans_SC:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-[color:var(--color次亚黑,#4a5565)]">可用积分</span>
                    <USkeleton v-if="loadingInfo" class="h-9 w-20" />
                    <span
                      v-else
                      class="font-['Inter:Medium',sans-serif] font-medium leading-[36px] not-italic relative shrink-0 text-[36px] text-[color:var(--color黑,#191a1d)]"
                      data-testid="point-total"
                    >
                      {{ pointTotal }}
                    </span>
                  </div>
                  <!-- 移除跳转链接 -->
                </div>
              </div>
            </div>
          </div>

          <!-- 积分明细 -->
          <div class="bg-white content-stretch flex flex-col gap-[16px] items-center py-[32px] relative shrink-0 w-full">
            <div class="relative shrink-0 w-full">
              <div class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
                <h2 class="font-['Inter:Medium','Noto_Sans_SC:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[16px] text-[color:var(--color黑,#191a1d)] whitespace-nowrap">
                  积分明细（近一年内）
                </h2>
              </div>
            </div>

            <!-- 加载中骨架屏 -->
            <div v-if="loadingList" class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <div v-for="i in 3" :key="i" class="content-stretch flex flex-col gap-[8px] items-start relative w-full">
                <USkeleton class="h-5 w-32" />
                <div class="flex items-center justify-between w-full">
                  <USkeleton class="h-5 w-48" />
                  <USkeleton class="h-5 w-12" />
                </div>
              </div>
            </div>

            <!-- 积分记录列表 -->
            <div v-else-if="pointRecords.length > 0" class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <div v-for="(record, index) in pointRecords" :key="index" class="content-stretch flex flex-col gap-[8px] items-start relative w-full">
                <div class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[color:var(--color黑,#191a1d)] whitespace-nowrap">
                  {{ formatItemTime(record) }}
                </div>
                <div class="content-stretch flex items-center justify-between leading-[20px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                  <span class="font-['Noto_Sans_SC:Regular',sans-serif] font-normal relative shrink-0 text-[color:var(--color次亚黑,#4a5565)]">{{ record.point_desc || record.description }}</span>
                  <span class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium relative shrink-0 text-[color:var(--color黑,#191a1d)]">{{ formatItemPoint(record) }}</span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="py-8 text-center text-gray-500 font-['Noto_Sans_SC:Regular',sans-serif] text-[14px]">
              暂无积分记录
            </div>

            <!-- 首页分页组件 -->
            <div v-if="totalPages > 1 && pointRecords.length > 0" class="flex justify-center pt-6 w-full">
              <ECPagination
                :total="totalCount"
                :page-size="pageSize"
                :current-page="pageNo"
                data-testid="point-pagination"
                @update:current-page="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'
import { useMemberPoint } from '~/composables/useMemberPoint'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()

const {
  pointTotal,
  list: pointRecords,
  init,
  loadList,
  formatItemTime,
  formatItemPoint,
  loadingList,
  loadingInfo,
  totalCount,
  pageSize,
  pageNo,
  totalPages,
} = useMemberPoint()

function handlePageChange(page: number) {
  pageNo.value = page
  loadList(true)
}

// 当前激活的菜单项
const activeMenu = ref('profile')

onMounted(() => {
  init()
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}
</script>
