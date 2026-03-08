# 使用 Dify MCP Bridge

## 服务描述
Dify 平台 Agent 工具集桥接，支持调用 Dify 内置工具和自定义工具

## 连接方式
- **传输协议**：streamable-http
- **服务地址**：`http://localhost:3000/mcp`

### 连接配置
```json
{
  "transport": "streamable-http",
  "url": "http://localhost:3000/mcp"
}
```

## 可用能力
- `tool_invoke`
- `workflow_trigger`
- `knowledge_query`
