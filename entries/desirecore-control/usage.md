# 使用 DesireCore Control 1.4.0

这是一款独立应用。先启动已安装的 Control，再在系统浏览器打开终端显示的本机管理页（默认 http://127.0.0.1:9333/）。关闭 DesireCore 不应关闭 Control；退出 Control 也不关闭 DesireCore。安装完成不等于正在运行，必要时在应用资源中发起启动请求。

## 本机实例

在管理页输入 Control 自己的本机 token。应用自动列出各实例实际端口，不扫固定端口段，不替实例开启 CDP。先核对实例，再将 instanceId 与该实例的 targetId 提供给外部客户端。截图和 DOM 可能含隐私。实例重启后重新选择 ID，不重放超时操作。

## ChatGPT 安全隧道

1. 用户另行安装官方 native tunnel-client，在 OpenAI Platform 创建 Tunnel 并关联目标工作区，准备具有 Tunnels Read + Use 的运行 key。不要把 key 交给市场安装智能体或发到聊天。
2. 使用 `desirecore-control --tunnel-client <绝对路径>`（本地前缀安装则通过 Node 加载该前缀 bin 入口）。在管理页的“ChatGPT 安全隧道”输入本次启动终端所示 admin-token，再填 Tunnel ID 和运行 key。
3. 点击启动后，应用自动接线实际 MCP 端点、调用与初始化认证头。ChatGPT 开发者连接选择 Tunnel 和对应 ID；采用本机认证头注入时选择认证 None，不配置覆盖 Authorization 的同名头。
4. state=running 只表示子进程运行，ready=true 只表示客户端就绪。必须在 ChatGPT 实际调用 desirecore_list_instances，再核对实例并截图，才是端到端验收。

MCP token、隧道 admin-token、OpenAI key 用途不同，不可互换。普通安装和启动不会自动开放隧道；停止隧道只停止本应用拥有的客户端，不删除 Platform Tunnel。

## 控制权限

默认只读。用户明确授予控制权后，可在本机终端以 `--allow-control` 重启。此权限可执行主世界 JavaScript 并访问完整 IPC，不是沙箱。不能通过市场分类或内部 Agent 绕过 DesireCore 自身的受治理 GUI 工具。

## 更新与客户端要求

在市场“应用”而非“MCP 服务”中管理此产品。市场应用类型为 native-app，要求支持该类型的客户端（最低 10.0.169）和 app-install-manager >=1.4.0；旧版不支持时应显示升级要求或不显示该条目，不能改成 Docker/MCP 安装。同步市场目录不会自动升级桌面客户端或智能体技能。

上游固定版说明：https://github.com/desirecore-agent/desirecore-cdp-mcp/tree/v1.4.0
官方隧道指南：https://developers.openai.com/api/docs/guides/secure-mcp-tunnels
