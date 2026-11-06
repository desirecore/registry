# REA MCP 收录证据 / Listing evidence

初次收录审核：2026-10-11（6.4.0，mashagua）；6.8.0 升级复核：2026-11-06（yi-ge）。收录维护者：mashagua。独立社区收录，未获得上游背书，维护者身份不标记为 verified。REA 名称仅用于指称上游产品，使用通用 `terminal` 图标，不复制上游商标图形。此记录是来源、许可和有限连接检查，不是完整安全审计。

Initially reviewed on 2026-10-11 (6.4.0) by mashagua; the 6.8.0 update was re-reviewed on 2026-11-06 by yi-ge. Independent community listing, without upstream endorsement or verified maintainer claims. The name identifies the upstream product; the icon is generic. This is a provenance/license review and a limited connection check, not a complete security audit.

## 6.8.0 升级复核 / 6.8.0 update review (2026-11-06)

| 项目 / Item | 证据 / Evidence |
| --- | --- |
| 上游发布 / Release | [rea-agents 6.8.0](https://github.com/morluto/rea/releases/tag/rea-agents-6.8.0)，发布时间 `2026-10-25T08:36:02Z` |
| 发布代码 / Release commit | tag 指向 `160d821ac9a0310afcb8d1fc427862dd6508add5` |
| 固定 tarball | `https://registry.npmjs.org/rea-agents/-/rea-agents-6.8.0.tgz`，`9944902` 字节 / bytes |
| SHA-256 | `8d542ec76a9cb350584b60a6c9c088706ff812d5bb5b094c20c95b6dc25698bb` |
| npm 来源证明 / provenance | SLSA v1：GitHub 托管 runner 由 `morluto/rea` 的 `.github/workflows/release.yml` 在提交 `160d821…` 构建；证明中的 SHA-512 与 `dist.integrity` 及下载字节一致 |

- 实际下载 tarball，核对 SHA-256、npm `dist.shasum`（SHA-1）与 `dist.integrity`（SHA-512），只读展开、未安装或执行。npm 元数据不再带 `gitHead`，发布提交改由 tag 与 SLSA 来源证明确认，二者一致。读取了来源证明的内容，但没有校验其 Sigstore 签名。
- 顶层 `LICENSE`（MIT）与发布提交逐字节相同，与 6.4.0 一致。新增 `THIRD_PARTY_NOTICES.md` 与 `licenses/` 目录，均与发布提交相同；`compliance.noticePath` 改为 `THIRD_PARTY_NOTICES.md`。新增的第三方文本包括：GPL-3.0 与 GCC 运行库例外（MinGW 静态链接的 Windows 原生模块）、MinGW-w64 运行库声明、可选依赖 Frida 的 wxWindows 许可与 LGPL-2.0 文本，以及 Ghidra 12.1.4、.NET 运行库、Node 22.19.0、pefile、protobuf-es、cfworker、xterm 的声明。上游注明 Ghidra 与完整 Node 运行时未打包，Node 文本只因 Windows 模块使用 Node-API 头文件。条目不打包或再分发 REA，`redistribution: allowed` 维持不变；第三方组件仍适用各自条款。
- `engines.node` 由 `^22.19.0 || ^24.11.0 || >=26.0.0` 提高到 `^22.23.4 || ^24.22.1 || >=26.12.1`。MCP 模式不做版本检查，只有 `doctor` / `setup` 报告。DesireCore 10.0.200 及更早版本随包的 Node.js 24.21.0 不满足；主仓 #5671 与 config-center#131、#132 让 10.0.201 起随包 Node.js 26.13.0，因此 sidecar 增加 `compatibility.requiredClientVersion: 10.0.201`。
- 包体由 1.8 MB 增至 9.9 MB（展开约 49 MB）。新增预编译 Windows 原生模块 `native/windows/build/rea-windows-x64.node`（SHA-256 `6a015bfefee7fafb6cbafab659f040170848a45425bbcef6caf962fd39b6ff7b`，与包内 manifest 一致）；上游说明由发布 CI 构建，加载前核对包版本、ABI、Node-API、PE 架构与 SHA-256，不能通过环境变量改载其他模块。
- 新增可选依赖 `frida@17.23.2`（LGPL-2.0 WITH WxWindows-exception-3.1），其原生绑定靠安装脚本下载；本条目使用 `--ignore-scripts`，绑定不会下载。REA 按需动态加载 Frida，失败时由相应工具报告不可用。新增运行依赖还有 `@bufbuild/protobuf`、`@msgpack/msgpack`、`cborg`、`openpgp`、`saxes`、`stream-chain`、`tokenx`，均为精确版本。包自身只有 `prepare` 脚本，从 npm 安装时不运行。
- 包内记录的 MCP 目录（`dist/mcp-catalog.json`）为服务 `rea` 6.8.0，229 项工具（名称唯一）与 6 个提示词。
- 本轮没有运行 6.8.0，也没有重做握手、工具列表或 DesireCore 接入验收；下文的运行检查针对 6.4.0。

The tarball matched its SHA-256, npm SHA-1 and SHA-512 values and was read without installation or execution. The release tag and the SLSA v1 npm provenance both identify commit `160d821…`, built by the upstream release workflow on a GitHub-hosted runner; the provenance payload was read but its Sigstore signature was not verified. The MIT LICENSE is unchanged. New third-party notices (GPL-3.0 with the GCC runtime exception for the MinGW-built Windows addon, Frida's wxWindows/LGPL texts, Ghidra, .NET, Node and others) match the release commit; Ghidra and a full Node runtime are not bundled, and this catalog does not redistribute REA. The Node.js range now excludes the 24.21.0 runtime bundled through DesireCore 10.0.200, so the sidecar requires client 10.0.201, which bundles Node.js 26.13.0. The package adds a hash-checked prebuilt Windows addon and an optional Frida dependency whose native binding is not downloaded under `--ignore-scripts`. The packaged MCP catalog lists 229 unique tools and 6 prompts. 6.8.0 was not executed; the runtime check below applies to 6.4.0.

## 来源与许可（6.4.0 初次收录）/ Provenance and license (initial 6.4.0 listing)

- [上游发布 rea-agents 6.4.0](https://github.com/morluto/rea/releases/tag/rea-agents-6.4.0)：发布时间 `2026-10-11T03:58:03Z`。
- 发布 tag 指向 `a56f7bb668ab23fec8d33f7af353ac7ed2fe1895`；npm 元数据的 `gitHead` 相同。未使用浮动 `main` 或 `latest`。
- [npm 固定版本元数据](https://registry.npmjs.org/rea-agents/6.4.0)和[固定 tarball](https://registry.npmjs.org/rea-agents/-/rea-agents-6.4.0.tgz)已读取；实际下载 `1825761` 字节。
- 实测 SHA-256：`59eb1604b8db75f522d4a975c36ce6b4a2ad465e43bad165f9a8f728391db9b8`。同时核对 npm `dist.shasum` 的 SHA-1 与 `dist.integrity` 的 SHA-512，均匹配下载字节。未验证 npm 签名或 SLSA provenance，不宣称完成该层认证。
- 内容根为 tarball 的 `package/`。Sidecar 的 `ref`/`reviewedRef` 都是包版本 `6.4.0`；许可证证据 `LICENSE` 相对于该内容根，已核对包内实际文本与[发布代码的 LICENSE](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/LICENSE)，均为 MIT。
- Sidecar 的 `kind: package` URL 标识 npm 包 `rea-agents`；`ref` 固定版本，SHA-256 固定该版本的 tarball 字节，不是包主页 HTML 的摘要。实际下载 URL 见上文与 install.md。以客户端真实包身份、一致性和获取准入函数复查通过；直接把 tarball URL 当作包身份会被该客户端拒绝，因此未采用这种形态。
- 保留 REA 版权和许可声明，以及包内 `third_party/evmole/LICENSE`、`third_party/pwndbg/LICENSE.md` 和 `licenses/nativeaot-parser-MIT.txt` 等适用声明。外部 Python 包、分析引擎和 npm 依赖仍遵循其各自许可；REA 的 MIT 不授予商业引擎许可。
- registry 只收 manifest、sidecar 和说明，不复制源码、发布包、引擎、原始验收日志或本机配置。

The release tag and npm `gitHead` match the pinned commit. The downloaded tarball matched the recorded SHA-256 and npm SHA-1/SHA-512 integrity values. npm signatures and SLSA provenance were not verified. License evidence paths refer to the tarball's `package/` content root; preserve bundled notices and review external dependencies separately. No upstream source or runtime artifact is vendored here.

## 运行检查（6.4.0）/ Runtime check for 6.4.0

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
