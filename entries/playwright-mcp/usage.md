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

共提供 **33** 个工具。
