# 使用 Fetch MCP

## 服务描述
网页内容获取与转换，将网页转为 Markdown 供 LLM 使用

## 连接方式
- **传输协议**：stdio
- **启动命令**：`uvx mcp-server-fetch`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "uvx",
  "args": [
    "mcp-server-fetch"
  ]
}
```

## 可用能力
- `url_fetch`
- `html_to_markdown`
- `content_extract`

共提供 **2** 个工具。
