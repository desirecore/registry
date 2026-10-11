# REA MCP 使用 / Usage

## 连接 / Connection

```json
{
  "mcpServers": {
    "rea-mcp": {
      "command": "npx",
      "args": ["--yes", "--ignore-scripts", "rea-agents@6.4.0", "--mcp"]
    }
  }
}
```

这是常见 MCP 宿主的配置示例，字段外层需遵循实际宿主契约；只添加 REA 连接，不替换现有配置。由 DesireCore 管理连接时，应通过其服务安装/连接流程完成，不直接覆盖用户文件。校验过的本地副本可以按 [install.md](install.md) 改为绝对路径启动。

This is a common MCP host configuration example; use the actual host's configuration contract and preserve existing connections. In DesireCore, use its service installation/connection flow. A verified local copy can use absolute launch paths as described in [install.md](install.md).

本地 stdio 连接本身不要求 API key，`authType: none` 不代表绕过宿主的工具授权、系统权限或第三方服务认证。先完成 `initialize`、`notifications/initialized`、`tools/list`；有分页则读取全部页。本轮无目标启动返回服务 `rea`、版本 `6.4.0` 和 170 项工具，正常断开后进程退出。

Local stdio requires no API key of its own. This does not bypass host consent, OS permissions or provider authentication. Initialize, send the initialized notification, and list tools, including pagination. The target-free macOS check observed server `rea`, version `6.4.0`, and 170 tools, followed by a clean shutdown.

## 使用边界 / Workflow boundaries

以下为用户可提出的需求示例，不是本条目自动执行的操作：

- “检查我授权提供的 JavaScript 项目，列出入口与调用关系，标明证据和未知项。”
- “使用已配置的 Ghidra 分析我提供的二进制，只读检查函数与字符串，不运行程序。”
- “检查我授权的浏览器页面网络请求，先说明需要连接的调试端口和数据范围。”

Examples of requests, not automatic actions: inspect an authorized JavaScript project with evidence and unknowns; inspect a supplied binary with an already configured Ghidra provider without executing it; or explain the debug endpoint and data scope before observing an authorized browser page.

每次根据目标与任务检查依赖。服务包不会提供全部分析引擎；工具列表也不保证某个工具在当前主机可执行。Hopper、Ghidra、IDA、JEB、JADX/ADB、浏览器和固件工具的主机/目标支持不同；Windows Ghidra 属于上游实验性 P0，只读范围及其他限制见[固定安装指南](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/installation.md)。缺依赖时报告缺失项并停止对应操作，不把未知项当作已验证结果。

Check prerequisites for each target and task. The package does not include every analysis engine, and a tool inventory does not establish executability on this host. Provider support varies; upstream Windows Ghidra is experimental P0 with read-only limitations. Report missing providers and unknowns instead of inventing results.

仅处理用户拥有或明确授权分析的目标。执行程序、注入/附加调试、修改分析数据库、写文件、连接设备、安装/卸载 APK、采集敏感网络数据均需对应的明确授权。不要在普通连接检查时调用这些工具。证据、截图、路径、网络内容和输出可能包含敏感信息，分享前应复核；调用的宿主模型及第三方服务适用各自的数据处理边界和费用。

Analyze only owned or explicitly authorized targets. Execution, injection/debugger attachment, database mutation, file writes, device operations, APK installation/removal and sensitive traffic capture require explicit authority for that operation. Do not invoke them during a connection check. Evidence may contain sensitive data; review it before sharing, and respect the data boundaries and costs of the host model and any third-party services.

可选配套技能：[reverse-engineer-anything 的收录 PR](https://github.com/desirecore/market/pull/212)。该技能提供 REA 的使用说明，不是服务安装依赖，也不授予目标访问权限。本服务与 Skill 可分别收录、安装，不制造第二份 REA 运行时。

Optional companion: [reverse-engineer-anything Skill listing](https://github.com/desirecore/market/pull/212). It provides usage guidance, is not a runtime installation dependency, and grants no target access. The two listings do not create separate REA runtime installations.
