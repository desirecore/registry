# 使用 Playwright MCP

## 服务描述
浏览器自动化 — 网页导航、截图、表单填写、DOM 操作、PDF 生成

## 连接方式
- **传输协议**：stdio
- **启动命令**：`npx @playwright/mcp@latest`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "npx",
  "args": [
    "@playwright/mcp@latest"
  ]
}
```

## 可用能力
- `page_navigate`
- `screenshot`
- `dom_query`
- `form_fill`
- `pdf_generate`
- `content_extract`

0.0.84 的 README 共列出 **72** 个工具：默认启用核心自动化与标签页管理 25 个，其余 47 个需用 `--caps=` 开启（`config`、`network`、`storage`、`devtools`、`vision`、`pdf`、`testing`）。`pdf_generate` 对应的 `browser_pdf_save` 需要 `--caps=pdf`。

与 0.0.68 相比：移除了 `browser_install`（浏览器需按 `install.md` 另行安装），`browser_run_code` 更名为 `browser_run_code_unsafe`；新增存储（Cookie、localStorage、sessionStorage）、网络路由、录制与追踪等可选工具。依赖的 Playwright 升级到 `1.65.0-alpha-2026-10-30`。

