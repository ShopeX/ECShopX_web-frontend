# 04-testing: 自动化测试基础设施

本技能包定义了项目中 UI 自动化测试的技术栈、规范及验证流程。

## 1. 测试框架配置

- **E2E 测试**: 使用 **Playwright** 进行全链路验证。
- **单元测试**: 使用 **Vitest** 进行 Composable 和 Utils 的逻辑测试。
- **配置**: 测试用例存放于 `tests/e2e/` 和 `tests/unit/`。

## 2. 选择器规范 (Selector Spec)

为了保证测试脚本的稳定性，禁止使用动态生成的 CSS 类或复杂的 DOM 结构作为选择器。
- **强制使用**: `data-testid` 属性进行元素定位。
- **格式**: `data-testid="<module>-<element>-<action>"` (如 `cart-item-delete-btn`)。

## 3. 页面对象模型 (POM)

- **封装原则**: 每一个复杂的页面（如详情页、结算页）应对应一个 POM 类。
- **方法设计**: 方法名应描述业务意图，而非底层点击逻辑（如使用 `checkoutPage.submitOrder()` 而非 `click('.submit-btn')`）。

## 4. 自动化验证流程

1. **功能开发**: 在开发业务逻辑的同时，需构思或编写对应的测试脚本。
2. **本地验证**: 提交代码前，必须在本地 Headless 模式运行核心链路测试。
3. **CI 集成**: 代码合并至 `develop` 分支时触发自动化测试流水线。
