# ECX-8122 收货地址列表页 开发计划

## 1. 目标与范围

- **需求 ID**：20260316-ECX8122
- **目标**：H5 收货地址列表页，支持列表展示、新增、编辑、删除、设为默认，对接 5 个接口，UI 按 Figma 节点二（H5）。
- **范围**：仅 H5/移动端；页面 `/account/address`，复用/扩展 AddressCard、BCAddressModal，不扩大为 PC 或其它模块。

## 2. 与 handbook 对齐

- **技术栈**：Nuxt 4、Vue 3、TypeScript、Tailwind、Pinia；页面用 composables（如 `useAddress`），不直接调 ApiClient。
- **目录**：页面 `app/pages/account/address.vue`，卡片 `app/pages/account/components/AddressCard.vue`，API `app/infrastructure/http/clients/AddressApiClient.ts`，composable `app/composables/useAddress.ts`。
- **命名**：组件 PascalCase；`data-testid` 语义化；EC*/BC* 沿用现有。
- **E2E**：选择器以 `data-testid` 为主；本需求测试写在 `.f2e-ai/requirements/20260316-ECX8122/test.spec.ts`。

## 3. 实施步骤

### 步骤 1：AddressApiClient 补全地址详情接口（若缺失）

- **文件**：`app/infrastructure/http/clients/AddressApiClient.ts`
- **内容**：若尚无 `getAddressDetail(addressId: string)`，则新增：`GET /wxapp/member/address/{address_id}`，返回原始响应。
- **验证**：类型与现有 get/put/delete 一致，不破坏现有调用。

### 步骤 2：useAddress 支持获取详情与列表数据结构

- **文件**：`app/composables/useAddress.ts`
- **内容**：若 API 有详情接口，则增加 `getAddressDetail(addressId)`，供编辑回填；确认列表接口返回结构与现有 `IAddressItem` 一致（含 `is_def` 等），必要时在 composable 或 transformer 中做列表项映射，供页面与 AddressCard 使用。
- **验证**：列表/详情在类型与调用链上可被页面与 BCAddressModal 使用。

### 步骤 3：扩展 AddressCard

- **文件**：`app/pages/account/components/AddressCard.vue`
- **内容**：
  - 新增 prop：`isDefault?: boolean`，为 true 时展示「默认」标签（样式：背景 `#f3f4f6`、12px Medium，与 ui-notes 一致）。
  - 卡片根元素：默认边框 `#191a1d`，非默认 `#e5e7eb`；H5 单列时宽度 100%，内边距 17px、间距 16px。
  - 新增：删除入口（如文案/图标按钮）、设为默认入口（非默认时显示）；触发 `@delete`、`@set-default`，由列表页处理确认与请求。
  - 编辑按钮设置 `data-testid="address-edit-btn"`。
  - 保留现有 `address`（姓名、电话、fullAddress 等）与 `@edit`，如需兼容 API 字段可接受列表页传入已映射好的展示用对象。
- **验证**：H5 下单列展示正确，默认/非默认样式与设计稿一致，事件由父组件接收。

### 步骤 4：address.vue 改为 H5 优先并对接接口

- **文件**：`app/pages/account/address.vue`
- **内容**：
  - **布局**：本需求仅 H5。采用 H5 布局：顶部 Header（复用现有 H5 头部，若有）→ FilterBar（返回 + 「收货地址」）→ 标题行「收货地址」+「+ 添加新地址」→ 单列地址列表；无左侧 AccountMenu（与 ui-notes 一致）。
  - **数据**：使用 `useAddress().getAddressList()` 拉取列表（如 onMounted 或 useAsyncData），将 API 列表转为 AddressCard 所需结构（含 `isDefault`）；加载中、错误态做简单展示。
  - **列表**：单列渲染 AddressCard，传 `address`、`isDefault`，监听 `@edit`、`@delete`、`@set-default`。
  - **新增**：点击「+ 添加新地址」打开 BCAddressModal（新增模式），保存成功后关闭弹窗并重新拉取列表。
  - **编辑**：点击编辑打开 BCAddressModal，传入 addressId，内部调用详情接口回填后 PUT 保存，保存成功后关闭并刷新列表。
  - **删除**：点击删除先弹出确认（使用现有 EC 或 Nuxt UI 确认框），确认后调用 `useAddress().deleteAddress(addressId)`，成功后刷新列表。
  - **设为默认**：调用 `useAddress().updateAddress(addressId, { ...现有字段, is_def: 1 })`（或接口约定字段），成功后刷新列表。
  - **空状态**：列表为空时展示「暂无收货地址」。
  - **data-testid**：页面根 `address-page`，列表容器 `address-list`，空状态容器 `address-empty`，添加按钮 `address-add-btn`；AddressCard 根 `address-card`（步骤 3 已含编辑按钮 testid）。
- **验证**：H5 下可访问、列表/空状态正确、增删改与设为默认流程顺畅、列表刷新正确。

### 步骤 5：BCAddressModal 与地址详情、编辑回填

- **文件**：`app/components/BCAddressModal/BCAddressModal.vue`
- **内容**：若编辑模式需要详情数据，在打开编辑时传入 addressId，内部调用 `getAddressDetail(addressId)`（或 useAddress 暴露方法）回填表单；保存时继续使用现有 `saveAddress`（PUT）。确保新增用 POST、编辑用 PUT，与 api-notes 一致。
- **验证**：从地址页进入编辑，表单回填正确，保存后列表更新。

### 步骤 6：E2E 与样式收尾

- **文件**：`.f2e-ai/requirements/20260316-ECX8122/test.spec.ts`、`app/pages/account/address.vue`、`AddressCard.vue`
- **内容**：运行 Playwright（H5 viewport），确认用例通过；根据设计稿微调间距、字体、颜色（主文 `#191a1d`、次要 `#4a5565`、边框 `#e5e7eb`、默认标签背景 `#f3f4f6`）。
- **验证**：E2E 全部通过，H5 样式与 Figma 节点二一致。

## 4. 验证与回滚

- **验收**：上述步骤与 `requirement.md` 验收标准、`test.spec.ts` 用例一一对应；接口以 `api-notes.md` 为准。
- **若执行中与 handbook 冲突**：先暂停，与产品/用户确认后再改计划或按例外处理。
