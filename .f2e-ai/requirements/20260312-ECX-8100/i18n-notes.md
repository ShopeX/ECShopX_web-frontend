# 20260312-ECX-8100 积分页 i18n 说明

## 执行摘要

- **脚本**：已调用 `extract_i18n.py`（计划内文件）、`generate_i18n_key.py`（每条中文生成 key）。
- **Key 规则**：`md5(文件相对路径)` 前 8 位 + `.` + `md5(翻译内容)` 前 6 位。
- **语言包**：`app/locales/zh-CN.json`、`en-US.json`、`ar.json` 已补充本需求相关 key。

## 涉及文件

| 文件 | 说明 |
|------|------|
| `app/pages/account/points.vue` | 积分页标题、总览、筛选、列表、空态、加载更多等文案改为 `$t(key)` |
| `app/pages/account/components/AccountMenu.vue` | 侧栏「积分」菜单改为 `$t('8b2de97c.9f68a8')` |
| `app/composables/useMemberPoint.ts` | 错误提示「获取积分信息失败」「获取积分流水失败」改为 `t(key)` |

## Key 一览（积分页与菜单）

| Key | 中文 | 英文 | 阿拉伯语 |
|-----|------|------|----------|
| 96a0d248.9f68a8 | 积分 | Points | النقاط |
| 96a0d248.26b5bd | 加载中... | Loading... | جاري التحميل... |
| 96a0d248.b97575 | 可用积分 | Available Points | النقاط المتاحة |
| 96a0d248.2076e8 | 积分明细 | Points History | سجل النقاط |
| 96a0d248.a8b0c2 | 全部 | All | الكل |
| 96a0d248.6c2fb3 | 收入 | Income | إيراد |
| 96a0d248.e67d00 | 支出 | Expense | مصروف |
| 96a0d248.551786 | 暂无积分记录 | No points records yet | لا توجد سجلات نقاط |
| 96a0d248.772815 | 加载更多 | Load more | تحميل المزيد |
| 8b2de97c.9f68a8 | 积分 | Points | النقاط |
| 9e61c248.61ac5c | 获取积分信息失败 | Failed to load points info | فشل تحميل معلومات النقاط |
| 9e61c248.fd0319 | 获取积分流水失败 | Failed to load points history | فشل تحميل سجل النقاط |

## 脚本执行命令与结果

```bash
# 扫描计划内文件（占位脚本）
python3 .cursor/skills/f2e-ai-i18n-translate/scripts/extract_i18n.py app/pages/account/points.vue app/pages/account/components/AccountMenu.vue
# 输出: {"status": "placeholder", "files": ["app/pages/account/points.vue", "app/pages/account/components/AccountMenu.vue"]}

# 为每条中文生成 key（积分页 + 菜单 + composable 错误文案）
python3 .cursor/skills/f2e-ai-i18n-translate/scripts/generate_i18n_key.py "app/pages/account/points.vue" "积分"
# 96a0d248.9f68a8
# …（其余 9 条同上表）
python3 .cursor/skills/f2e-ai-i18n-translate/scripts/generate_i18n_key.py "app/composables/useMemberPoint.ts" "获取积分信息失败"
# 9e61c248.61ac5c
python3 .cursor/skills/f2e-ai-i18n-translate/scripts/generate_i18n_key.py "app/composables/useMemberPoint.ts" "获取积分流水失败"
# 9e61c248.fd0319
```

脚本均执行成功，key 已写入三语言包并用于替换源码中的中文。
