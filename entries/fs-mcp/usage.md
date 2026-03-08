# 使用 Filesystem MCP

## 服务描述
本地文件系统操作，支持读写、搜索、监控文件变化

## 连接方式
- **传输协议**：stdio
- **启动命令**：`npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/path/to/allowed/dir"
  ]
}
```

## 可用能力
- `file_read`
- `file_write`
- `file_search`
- `file_watch`

共提供 **11** 个工具。
