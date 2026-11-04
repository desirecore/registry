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

共提供 **1** 个工具（`fetch`）和 1 个同名提示词。

## 2026.10.28 的行为变化

- **默认拒绝内网地址**：私有网段、回环、链路本地（含多数云元数据地址）等非公网目标在每次请求和每一跳重定向时都会被拒绝。确需抓取本机或内网页面时在 `args` 里加 `--allow-private-ips`，这会放开对内网服务的访问，须经用户明确同意。
- **可关闭 Node.js 子进程**：`PATH` 上有 Node.js 时，HTML 提取在 Node.js 子进程里运行 Readability.js，且该子进程没有超时；新增的 `--no-readability-js` 只用纯 Python 提取器，不再启动 Node.js 或 npm。
- **代理**：新增 SOCKS5 支持（`socks://` 按 `socks5://` 处理）；未传 `--proxy-url` 时沿用 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 与 `NO_PROXY`。
- **依赖**：改为 `mcp>=2.3,<3`，同时支持 2025-11-25 与 2026-07-28 两代 MCP 协议；Python 要求仍是 3.10 及以上。

