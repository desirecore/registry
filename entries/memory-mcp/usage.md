# 使用 Memory MCP

## 服务描述
基于知识图谱的持久化记忆服务，支持实体和关系的存取

## 连接方式
- **传输协议**：stdio
- **启动命令**：`npx -y @modelcontextprotocol/server-memory`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-memory"
  ]
}
```

## 可用能力
- `entity_store`
- `relation_store`
- `graph_query`

共提供 **7** 个工具。
