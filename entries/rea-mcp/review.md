# REA MCP 收录证据 / Listing evidence

审核日期：2026-10-11；收录维护者：mashagua。独立社区收录，未获得上游背书，维护者身份不标记为 verified。REA 名称仅用于指称上游产品，使用通用 `terminal` 图标，不复制上游商标图形。此记录是来源、许可和有限连接检查，不是完整安全审计。

Reviewed on 2026-10-11 by mashagua. Independent community listing, without upstream endorsement or verified maintainer claims. The name identifies the upstream product; the icon is generic. This is a provenance/license review and a limited connection check, not a complete security audit.

## 来源与许可 / Provenance and license

- [上游发布 rea-agents 6.4.0](https://github.com/morluto/rea/releases/tag/rea-agents-6.4.0)：发布时间 `2026-10-11T03:58:03Z`。
- 发布 tag 指向 `a56f7bb668ab23fec8d33f7af353ac7ed2fe1895`；npm 元数据的 `gitHead` 相同。未使用浮动 `main` 或 `latest`。
- [npm 固定版本元数据](https://registry.npmjs.org/rea-agents/6.4.0)和[固定 tarball](https://registry.npmjs.org/rea-agents/-/rea-agents-6.4.0.tgz)已读取；实际下载 `1825761` 字节。
- 实测 SHA-256：`59eb1604b8db75f522d4a975c36ce6b4a2ad465e43bad165f9a8f728391db9b8`。同时核对 npm `dist.shasum` 的 SHA-1 与 `dist.integrity` 的 SHA-512，均匹配下载字节。未验证 npm 签名或 SLSA provenance，不宣称完成该层认证。
- 内容根为 tarball 的 `package/`。Sidecar 的 `ref`/`reviewedRef` 都是包版本 `6.4.0`；许可证证据 `LICENSE` 相对于该内容根，已核对包内实际文本与[发布代码的 LICENSE](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/LICENSE)，均为 MIT。
- Sidecar 的 `kind: package` URL 标识 npm 包 `rea-agents`；`ref` 固定版本，SHA-256 固定该版本的 tarball 字节，不是包主页 HTML 的摘要。实际下载 URL 见上文与 install.md。以客户端真实包身份、一致性和获取准入函数复查通过；直接把 tarball URL 当作包身份会被该客户端拒绝，因此未采用这种形态。
- 保留 REA 版权和许可声明，以及包内 `third_party/evmole/LICENSE`、`third_party/pwndbg/LICENSE.md` 和 `licenses/nativeaot-parser-MIT.txt` 等适用声明。外部 Python 包、分析引擎和 npm 依赖仍遵循其各自许可；REA 的 MIT 不授予商业引擎许可。
- registry 只收 manifest、sidecar 和说明，不复制源码、发布包、引擎、原始验收日志或本机配置。

The release tag and npm `gitHead` match the pinned commit. The downloaded tarball matched the recorded SHA-256 and npm SHA-1/SHA-512 integrity values. npm signatures and SLSA provenance were not verified. License evidence paths refer to the tarball's `package/` content root; preserve bundled notices and review external dependencies separately. No upstream source or runtime artifact is vendored here.

## 运行检查 / Runtime check

macOS、Node.js `24.18.0`。在独立临时工作目录安装已核验 tarball，关闭安装生命周期脚本；未执行上游构建或全量测试。

- `--version`：输出 `6.4.0`，退出码 0。
- 生产入口 `--mcp`：完成 MCP `initialize`，返回 `serverInfo.name: rea`、`version: 6.4.0`；协议协商为 `2025-11-25`。
- `tools/list`：170 项，名称唯一，每项含 `inputSchema`。只验证目录声明，没有调用分析工具。
- 关闭 stdin：服务正常退出，退出码 0；检查使用的临时资源目录没有残留条目。
- 默认 `npx --yes --ignore-scripts rea-agents@6.4.0 --mcp` 也完成同样的检查；使用临时目录内已安装的核验包，未覆盖首次远程获取场景。npx 的 Node 编译缓存仍存在，这不同于 REA provider 资源泄漏。
- 未调用 `rea setup`，未打开目标、启动分析引擎、附加浏览器/调试器、操作设备或修改用户 MCP 配置。

The target-free macOS smoke check verified version, production MCP initialization and a unique 170-tool inventory, with clean EOF shutdown. No analysis tool, setup operation or target was invoked. Windows/Linux, provider-specific analyses and DesireCore desktop installation were not exercised. Listing availability is not a ready connection or client upgrade.

`compatibility.platforms` 表示上游公布的服务适用平台，不代表本轮做过三平台验收。`availability: installable` 表示具备目录要求的固定来源、许可和治理证据，不代表运行时及全部 provider 已就绪。客户端必须按自己支持的 registry/schema 与服务连接契约读取；目录 PR 不会升级客户端，也不能补齐缺失依赖。

Platform metadata records upstream applicability, not three-platform acceptance. Installable catalog evidence does not establish runtime/provider readiness. Clients must support the relevant Registry and connection contracts; publishing this entry neither upgrades them nor provisions missing analysis dependencies.
