<template>
  <div class="min-h-screen bg-[#f3f4f6]" data-testid="member-point-page">
    <div class="bg-white lg:hidden">
      <div class="mx-auto flex max-w-[375px] items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <h1 class="text-base font-medium leading-5 text-[#191a1d]">
            {{ $t('96a0d248.4f7a2a') }}
          </h1>
          <UIcon name="i-heroicons-chevron-down" class="h-4 w-4 text-[#191a1d]" />
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-[1440px] px-4 py-4 lg:px-32 lg:py-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-[64px]">
        <aside class="hidden w-64 shrink-0 lg:block">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </aside>

        <main class="min-w-0 flex-1">
          <section class="flex flex-col gap-4 lg:bg-white lg:p-8">
            <div class="hidden lg:block">
      <h2 class="text-base font-medium leading-5 text-[#101828]">
        {{ $t('96a0d248.9f68a8') }}
      </h2>
            </div>

            <div
              v-if="loadingInfo"
              class="border border-[#e5e7eb] bg-white px-[17px] py-[33px]"
              data-testid="point-overview"
            >
              <div class="flex items-center gap-4">
                <USkeleton class="h-5 w-16" />
                <USkeleton class="h-9 w-32" />
              </div>
            </div>
            <div
              v-else-if="errorInfo"
              class="border border-[#e5e7eb] bg-white px-[17px] py-[33px] text-sm leading-5 text-[#dc2626]"
              data-testid="point-overview"
            >
              {{ errorInfo }}
            </div>
            <div
              v-else
              class="border border-[#e5e7eb] bg-white px-[17px] py-[33px]"
              data-testid="point-overview"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <span class="text-sm font-normal leading-5 text-[#4a5565]">
                    {{ $t('96a0d248.b97575') }}
                  </span>
                  <span
                    class="font-['Inter'] text-4xl font-medium leading-9 text-[#191a1d]"
                    data-testid="point-total"
                  >
                    {{ pointTotal }}
                  </span>
                </div>
                <div class="flex items-center gap-1 text-sm font-normal leading-5 text-[#191a1d]">
                  <span>{{ $t('96a0d248.5b2726') }}</span>
                  <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>

          <section class="flex flex-col gap-4 pt-8 lg:bg-white lg:p-8 lg:pt-8">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-medium leading-5 text-[#191a1d]">
                {{ $t('96a0d248.2076e8') }}
              </h2>
            </div>

            <div data-testid="point-record-list">
              <div v-if="loadingList && list.length === 0" class="flex flex-col gap-4 lg:gap-6">
                <div v-for="i in 3" :key="i" class="flex flex-col gap-2">
                  <USkeleton class="h-5 w-32" />
                  <div class="flex items-center justify-between w-full">
                    <USkeleton class="h-5 w-48" />
                    <USkeleton class="h-5 w-12" />
                  </div>
                </div>
              </div>
              <div
                v-else-if="errorList"
                class="py-4 text-sm leading-5 text-[#dc2626]"
                data-testid="point-error"
              >
                {{ errorList }}
              </div>
              <ul v-else-if="list.length > 0" class="flex flex-col gap-4 lg:gap-6">
                <li
                  v-for="item in list"
                  :key="item.id"
                  class="flex flex-col gap-2"
                  data-testid="point-record-item"
                >
                  <div class="text-base font-medium leading-5 text-[#191a1d]">
                    {{ formatItemTime(item) }}
                  </div>
                  <div class="flex items-start justify-between gap-4 text-sm leading-5">
                    <span class="min-w-0 flex-1 text-[#4a5565]">
                      {{ item.point_desc || '—' }}
                    </span>
                    <span class="shrink-0 text-sm font-medium leading-5 text-[#191a1d]">
                      {{ formatItemPoint(item) }}
                    </span>
                  </div>
                </li>
              </ul>
              <div
                v-else
                class="py-4 text-sm leading-5 text-[#4a5565]"
                data-testid="point-record-empty"
              >
                {{ $t('96a0d248.551786') }}
              </div>
            </div>

            <div v-if="totalPages > 1 && list.length > 0" class="flex justify-center pt-6">
              <ECPagination
                :total="totalCount"
                :page-size="pageSize"
                :current-page="pageNo"
                data-testid="point-pagination"
                @update:current-page="handlePageChange"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'
import { useMemberPoint } from '~/composables/useMemberPoint'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const activeMenu = ref('points')

const {
  pointTotal,
  list,
  outinType,
  loadingInfo,
  loadingList,
  errorInfo,
  errorList,
  hasMore,
  formatItemTime,
  formatItemPoint,
  loadList,
  init,
  totalCount,
  pageSize,
  pageNo,
  totalPages,
} = useMemberPoint()

function handlePageChange(page: number) {
  pageNo.value = page
  loadList(true)
}

function syncOutinTypeFromRoute() {
  const q = route.query.outin_type
  outinType.value = q === 'income' || q === 'outcome' ? q : undefined
}

onMounted(() => {
  syncOutinTypeFromRoute()
  init()
})

watch(
  () => route.query.outin_type,
  (value, oldValue) => {
    if (value === oldValue) return
    syncOutinTypeFromRoute()
    pageNo.value = 1
    loadList(true)
  }
)

function handleLogout() {
  console.log('用户已退出登录')
}
</script>
