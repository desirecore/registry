# 安装 / Install

1. 在运行数字员工的设备上准备 Node.js LTS、npm 和当前稳定版 Google Chrome，并允许 npm 访问软件包注册表。市场预设启动固定版本的 MCP 服务。Node.js、npm 和 Chrome 需另行准备并遵循各自条款。
2. 在市场的「服务」中搜索 **Chrome DevTools MCP**。点击「安装」并选择运行设备。随后在「资源 → 服务」打开条目详情，点击「添加到 Agent」并选择目标数字员工。用「测试连接」确认已发现工具，再开始浏览器任务。
3. 如连接失败，检查运行设备是否能找到 `npx`、访问 npm 并启动 Chrome。缺少任一前提时，先处理阻碍。

On the agent's execution device, supply Node.js LTS, npm, a current stable Google Chrome, and access to the npm registry. In Market → Services, find **Chrome DevTools MCP** and select the execution device from Install. Open the service details in Resources → Services, choose Add to Agent, and select the target agent. Use Test Connection to confirm tool discovery before use. If setup fails, check `npx`, npm access, and Chrome availability. These prerequisites are separately provided and follow their own terms.

[Chrome 官方文档 / Official Chrome setup](https://developer.chrome.com/docs/devtools/agents/get-started)
