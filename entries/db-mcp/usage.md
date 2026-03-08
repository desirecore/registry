# 使用 Database MCP

## 服务描述
PostgreSQL 数据库查询与管理，支持 SQL 执行和 Schema 浏览

## 连接方式
- **传输协议**：stdio
- **启动命令**：`npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://localhost/mydb"
  ]
}
```

## 可用能力
- `sql_query`
- `schema_browse`
- `data_export`

共提供 **8** 个工具。
