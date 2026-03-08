# 使用 GitHub MCP

## 服务描述
代码仓库操作，支持 PR、Issue、代码搜索和仓库管理

## 连接方式
- **传输协议**：stdio
- **启动命令**：`npx -y @modelcontextprotocol/server-github`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-github"
  ]
}
```

## 可用能力
- `repo_read`
- `pr_manage`
- `issue_manage`
- `code_search`

共提供 **35** 个工具。
