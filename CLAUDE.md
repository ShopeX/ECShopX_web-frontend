# CLAUDE.md — 项目约定

## i18n 多语言规范

### key 生成规则（强制）

**禁止手工构造 key**，必须通过脚本生成：

```bash
python3 scripts/generate_i18n_key.py "<文件相对路径>" "<中文文本>"
```

key 格式：`md5(文件相对路径)[:8]` + `.` + `md5(中文文本)[:6]`

示例：
```bash
python3 scripts/generate_i18n_key.py "app/components/BCCartItem/BCCartItem.vue" "确认删除该商品？"
# 输出：9864a2ba.3e3483
```

### 翻译工作流（使用 /f2e-ai-i18n-translate skill）

1. 调用 `python3 scripts/extract_i18n.py <file...>` 扫描未翻译中文
2. 对每条文本调用 `python3 scripts/generate_i18n_key.py <path> <text>` 生成 key
3. 替换源文件中的中文为 `t('key')` / `{{ t('key') }}`
4. 将 key + 译文写入 `app/locales/zh-CN.json`、`en-US.json`、`ar.json`

### 脚本位置

- `scripts/generate_i18n_key.py` — key 生成
- `scripts/extract_i18n.py` — 中文扫描

### 约束

- 脚本不存在时必须先创建，再执行；不得手工替代脚本
- 脚本执行失败时必须停止并报告，不得继续手工翻译
