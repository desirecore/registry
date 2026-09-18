# 1.4.0 目录发布核验

日期：2026-09-18。产品是面向外部智能体的独立宿主机应用，不是内部 MCP。

上游：desirecore-agent/desirecore-cdp-mcp，固定源码 38184fbb01f82d4dd850b67366cdac048a09474b，GitHub Release v1.4.0。
制品：desirecore-cdp-mcp-1.4.0.tgz；SHA-256 ecfd6e770cd1854d7368ec89852b5e798cc04f6e19bbb59fedae52a56bacbee0。
MIT 仅涵盖独立应用仓库；制品保留 LICENSE、NOTICE；第三方依赖遵循各自许可。不转载 DesireCore 主工程，不使用其图标或声明上游背书。

上游 PR #2 的 Windows/Linux/macOS CI 均通过；Release workflow 35326965105 完成构建、测试和 package smoke。源码侧包验证覆盖隔离安装、零实例启动、管理页和对外 SDK 调用，不读取真实实例或运行账户密钥。未完成用户的实际 ChatGPT 工作区及真实 DesireCore 操作验收，不能把 ready 或 CI 提升为该验收。

目录要求支持 native-app 的客户端（最低 10.0.169）与安装技能 1.4.0。catalog 为 installable 只表示满足此兼容条件时可按审核后的指南获取，不表示旧版客户端能安装、已安装或正在运行。发布应用目录不等于发布新版桌面客户端。
