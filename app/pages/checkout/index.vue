<template>
  <div class="bg-white min-h-screen pb-16 pt-8 px-32">
    <div class="flex gap-32 items-start justify-center max-w-[1400px] mx-auto">
      <!-- 左侧：配送信息、优惠券、积分、发票 -->
      <div class="flex-1 flex flex-col gap-16 min-w-0">
        <!-- 配送信息 -->
        <div class="bg-white flex flex-col gap-4 p-6">
          <h3 class="text-base font-medium text-[#101828] leading-5">配送信息</h3>

          <!-- 配送方式选择 -->
          <div class="flex flex-col gap-4">
            <p class="text-sm text-[#191a1d] leading-5">请选择您的配送方式</p>
            <div class="flex gap-8 items-center">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  :checked="form.receiptType === 'express'"
                  @change="form.receiptType = 'express'"
                  class="w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                />
                <span class="text-sm font-medium text-[#191a1d] leading-5">快递配送</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  :checked="form.receiptType === 'ziti'"
                  @change="form.receiptType = 'ziti'"
                  class="w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                />
                <span class="text-sm font-medium text-[#191a1d] leading-5">门店自提</span>
              </label>
            </div>
          </div>

          <!-- 地址选择 -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h4 class="text-base font-medium text-[#191a1d] leading-5">地址</h4>
              <button
                class="bg-white border border-[#e5e7eb] px-[17px] py-[9px] hover:bg-gray-50 transition-colors"
                @click="handleAddAddress"
              >
                <span class="text-xs font-medium text-[#191a1d] leading-4">+ 添加新地址</span>
              </button>
            </div>

            <!-- 地址列表 -->
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="address in addresses"
                :key="address.id"
                class="border p-[17px] flex flex-col gap-4 cursor-pointer transition-colors"
                :class="
                  selectedAddress?.id === address.id ? 'border-[#191a1d]' : 'border-[#e5e7eb]'
                "
                @click="selectAddress(address.id)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="address.isDefault"
                      class="bg-[#f3f4f6] px-2 py-1 text-xs font-medium text-[#191a1d] leading-4"
                    >
                      默认
                    </span>
                    <span class="text-sm font-medium text-[#191a1d] leading-5">
                      {{ address.name }}
                    </span>
                  </div>
                  <button
                    class="text-xs text-[#4a5565] underline leading-4"
                    @click.stop="handleEditAddress(address.id)"
                  >
                    编辑
                  </button>
                </div>
                <div class="flex flex-col gap-1">
                  <p class="text-sm text-[#4a5565] leading-5">{{ address.phone }}</p>
                  <p class="text-sm text-[#4a5565] leading-5">{{ address.fullAddress }}</p>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="addresses.length === 0" class="py-8 text-center text-[#4a5565]">
              暂无收货地址，请添加
            </div>
          </div>
        </div>

        <!-- 优惠券 -->
        <div class="bg-white flex flex-col gap-4 p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium text-[#101828] leading-5">优惠券</h3>
            <div class="flex items-center gap-2 cursor-pointer" @click="handleOpenCouponSelector">
              <span v-if="selectedCoupon" class="text-sm text-[#191a1d] leading-5">
                {{ selectedCoupon.title }}
              </span>
              <span v-else class="text-sm text-[#191a1d] leading-5">选择优惠券</span>
              <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-[#4a5565] -rotate-90" />
            </div>
          </div>
        </div>

        <!-- 积分抵扣 -->
        <div class="bg-white flex flex-col gap-4 p-6">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-medium text-[#101828] leading-5">积分抵扣</h3>
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[#4a5565]" />
          </div>

          <div
            v-if="calculateResult"
            class="flex items-center justify-between text-sm text-[#101828] font-medium leading-5"
          >
            <span>用户可用积分：{{ calculateResult.userPoint }}</span>
            <span>本单最大可用积分：{{ calculateResult.maxPoint }}</span>
          </div>

          <ECCheckbox :checked="form.usePoint" size="sm" label="使用积分" @change="toggleUsePoint" />

          <div v-if="form.usePoint" class="flex items-center gap-2">
            <ECCheckbox
              :checked="form.useFullPoint"
              size="sm"
              label="全额抵扣"
              @change="toggleUseFullPoint"
            />
            <input
              v-if="!form.useFullPoint"
              v-model.number="form.pointUse"
              type="number"
              :max="calculateResult?.maxPoint || 0"
              class="border border-[#99a1af] h-5 w-[100px] px-2 text-sm"
              @input="calculateOrderAmount"
            />
          </div>
        </div>

        <!-- 发票信息 -->
        <div class="bg-white flex flex-col gap-4 p-6">
          <h3 class="text-base font-medium text-[#191a1d] leading-5">发票信息</h3>
          <ECCheckbox
            :checked="form.needInvoice"
            size="sm"
            label="需要电子发票"
            @change="handleInvoiceCheckboxChange"
          />

          <!-- 已填写的发票信息 -->
          <div v-if="form.needInvoice && invoiceData" class="bg-[#f3f4f6] p-4 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-[#191a1d] leading-5">
                {{ invoiceData.type === 'personal' ? '个人' : '企业' }} | {{ invoiceData.title }}
              </span>
              <button class="text-xs text-[#4a5565] underline leading-4" @click="handleEditInvoice">
                编辑
              </button>
            </div>
            <div class="text-xs text-[#4a5565] leading-4 space-y-1">
              <p v-if="invoiceData.taxNumber">税号: {{ invoiceData.taxNumber }}</p>
              <p>内容: {{ getInvoiceContentLabel(invoiceData.content) }}</p>
              <p>邮箱: {{ invoiceData.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：订单摘要 -->
      <div class="w-[320px] shrink-0 bg-white flex flex-col gap-8 p-6">
        <!-- 商品数量 -->
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-[#4a5565]" />
          <span class="text-sm text-[#4a5565] leading-5">{{ itemCount }} 件商品</span>
        </div>

        <!-- 商品列表 -->
        <div class="flex flex-col gap-4">
          <div v-for="item in selectedItems" :key="item.id" class="flex gap-4">
            <div class="w-24 h-24 shrink-0 bg-[#f9fafb] relative overflow-hidden">
              <img
                :src="item.productImage || '/images/placeholder.png'"
                :alt="item.productName"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 flex flex-col gap-1 min-w-0">
              <h4 class="text-sm font-medium text-[#101828] leading-5 truncate">
                {{ item.productName }}
              </h4>
              <div class="flex flex-col gap-0.5 text-xs text-[#364153] leading-4">
                <p>款号: {{ item.specName }}</p>
                <p>款式: {{ item.specName }}</p>
                <p>尺寸: {{ item.specName }}</p>
              </div>
              <div class="flex items-center justify-between mt-auto">
                <span class="text-xs text-[#364153] leading-4">数量: {{ item.quantity }}</span>
                <span class="text-sm font-medium text-[#191a1d] leading-5">
                  {{ item.subtotalDisplay }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 价格明细 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">商品总计</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ itemTotalDisplay }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">运费</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ freightDisplay }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">优惠</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ discountDisplay }}</span>
          </div>
          <div class="h-px bg-[rgba(0,0,0,0.1)]"></div>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold text-[#191a1d] leading-6">总计</span>
            <span class="text-2xl font-medium text-[#191a1d] leading-9">{{ totalDisplay }}</span>
          </div>
        </div>

        <!-- 协议和支付按钮 -->
        <div class="flex flex-col gap-4">
          <ECCheckbox v-model="agreeTerms" size="sm">
            <span class="text-xs text-[#4a5565] leading-4">
              我同意
              <a href="#" class="underline">隐私政策</a>
              以及
              <a href="#" class="underline">销售条款</a>
            </span>
          </ECCheckbox>

          <button
            :disabled="!canSubmit || loading"
            @click="handleSubmit"
            class="bg-[#0f0f10] text-white py-4 px-0 text-sm font-medium leading-5 hover:bg-[#191a1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '提交中...' : '立即支付' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 地址弹窗 -->
    <BCAddressModal
      v-model="showAddressModal"
      :address-id="editingAddressId"
      :initial-data="editingAddressData"
      @success="handleAddressSuccess"
    />

    <!-- 优惠券选择抽屉 -->
    <USlideover v-model:open="showCouponSelector" side="right">
      <template #content>
        <BCCouponSelector
          v-model="showCouponSelector"
          :coupons="[...coupons]"
          :selected-coupon="selectedCoupon"
          :loading="loading"
          @close="showCouponSelector = false"
          @select="handleSelectCoupon"
          @unselect="handleUnselectCoupon"
        />
      </template>
    </USlideover>

    <!-- 发票弹窗 -->
    <BCInvoiceModal
      v-model="showInvoiceModal"
      :initial-data="invoiceData"
      @success="handleInvoiceSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useCheckout } from '~/composables/useCheckout'
import { useCart } from '~/composables/useCart'
import BCAddressModal from '~/components/BCAddressModal/BCAddressModal.vue'
import BCInvoiceModal from '~/components/BCInvoiceModal/BCInvoiceModal.vue'
import BCCouponSelector from '~/components/BCCouponSelector/BCCouponSelector.vue'
import type { IAddressFormData } from '~/composables/useAddress'
import type { IInvoiceFormData } from '~/components/BCInvoiceModal/types'
import { ECCheckbox } from '~/components/ECCheckbox'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { cartUI, items } = useCart()
const {
  loading,
  calculating,
  error,
  addresses,
  selectedAddress,
  coupons,
  selectedCoupon,
  calculateResult,
  form,
  itemTotalDisplay,
  freightDisplay,
  discountDisplay,
  totalDisplay,
  itemCount,
  loadAddresses,
  selectAddress,
  loadCoupons,
  selectCoupon,
  unselectCoupon,
  toggleUsePoint,
  toggleUseFullPoint,
  calculateOrderAmount,
  createOrder,
} = useCheckout()

// 协议同意状态
const agreeTerms = ref(false)

// 地址弹窗状态
const showAddressModal = ref(false)
const editingAddressId = ref<string>()
const editingAddressData = ref<IAddressFormData>()

// 优惠券选择抽屉状态
const showCouponSelector = ref(false)

// 发票弹窗状态
const showInvoiceModal = ref(false)
const invoiceData = ref<IInvoiceFormData | undefined>()

// 选中的商品列表
const selectedItems = computed(() => {
  return cartUI.value.items.filter((item) => item.selected)
})

// 是否可以提交
const canSubmit = computed(() => {
  if (!agreeTerms.value) return false
  if (form.value.receiptType === 'express' && !selectedAddress.value) return false
  if (selectedItems.value.length === 0) return false
  return true
})

// 监听配送方式变化，重新计算订单金额
watch(
  () => form.value.receiptType,
  () => {
    calculateOrderAmount()
  }
)

// 监听地址变化，重新计算订单金额
watch(
  () => form.value.selectedAddressId,
  () => {
    if (form.value.receiptType === 'express') {
      calculateOrderAmount()
    }
  }
)

// 初始化
onMounted(async () => {
  // 加载地址列表
  await loadAddresses()

  // 初始计算订单金额
  await calculateOrderAmount()

  // 加载优惠券列表
  await loadCoupons()
})

/**
 * 处理添加地址
 */
function handleAddAddress() {
  editingAddressId.value = undefined
  editingAddressData.value = undefined
  showAddressModal.value = true
}

/**
 * 处理编辑地址
 */
function handleEditAddress(addressId: string) {
  const address = addresses.value.find((addr) => addr.id === addressId)
  if (address) {
    editingAddressId.value = addressId
    editingAddressData.value = {
      name: address.name,
      phone: address.phone,
      countryCode: '+86', // TODO: 从地址数据中获取
      province: address.province,
      city: address.city,
      district: address.district,
      tmp_code: [],
      detail: address.detail,
      isDefault: address.isDefault,
    }
    showAddressModal.value = true
  }
}

/**
 * 处理地址保存成功
 */
async function handleAddressSuccess(data: IAddressFormData) {
  console.log('地址保存成功:', data)
  showAddressModal.value = false
  // 刷新地址列表
  await loadAddresses()
}

/**
 * 处理打开优惠券选择器
 */
async function handleOpenCouponSelector() {
  // 打开前先加载优惠券列表
  await loadCoupons()
  showCouponSelector.value = true
}

/**
 * 处理选择优惠券
 */
function handleSelectCoupon(coupon: any) {
  selectCoupon(coupon)
}

/**
 * 处理取消选择优惠券
 */
function handleUnselectCoupon() {
  unselectCoupon()
}

/**
 * 处理发票复选框变化
 */
function handleInvoiceCheckboxChange() {
  if (!form.value.needInvoice) {
    // 勾选时打开发票弹窗
    showInvoiceModal.value = true
  } else {
    // 取消勾选时清空发票数据
    form.value.needInvoice = false
    invoiceData.value = undefined
    form.value.invoiceType = undefined
    form.value.invoiceContent = undefined
  }
}

/**
 * 处理编辑发票
 */
function handleEditInvoice() {
  showInvoiceModal.value = true
}

/**
 * 处理发票保存成功
 */
function handleInvoiceSuccess(data: IInvoiceFormData) {
  invoiceData.value = data
  form.value.needInvoice = true
  form.value.invoiceType = data.type
  form.value.invoiceContent = {
    title: data.title,
    taxNumber: data.taxNumber,
    content: data.content,
    email: data.email,
  }
  console.log('发票信息已保存:', data)
}

/**
 * 获取发票内容标签
 */
function getInvoiceContentLabel(value: string): string {
  const map: Record<string, string> = {
    goods: '商品明细',
    service: '服务费',
    goods_service: '商品及服务',
    other: '其他',
  }
  return map[value] || value
}

/**
 * 处理提交订单
 */
async function handleSubmit() {
  if (!canSubmit.value) return

  const result = await createOrder('wxpay') // TODO: 支持选择支付方式

  if (result.success && result.orderId) {
    // 跳转到支付页面
    router.push(`/payment?orderId=${result.orderId}`)
  }
}
</script>
