# REA MCP 安装 / Installation

本条目提供 `rea-agents@6.8.0` 的本地 stdio MCP 服务。CLI 与 MCP 来自同一个包，不需要分别安装；它不是独立桌面 GUI。市场中的 `reverse-engineer-anything` 是配套使用指南，安装该 Skill 不等于安装 REA 服务。

This entry provides the local stdio MCP service from `rea-agents@6.8.0`. CLI and MCP share one package; this is not a standalone desktop GUI. The separate `reverse-engineer-anything` Market Skill is a usage guide, not a runtime installation.

## 环境要求 / Prerequisites

- Node.js：`^22.23.4 || ^24.22.1 || >=26.12.1`（6.8.0 起提高到 Node 2026-10-20 安全发布之后的版本），以及该运行时配套的 npm/npx。Node.js 23、25 不在上游支持范围内。DesireCore 10.0.201 起随包提供 Node.js 26.13.0，条目据此要求客户端 10.0.201 及以上；更早客户端随包的 Node.js 24.21.0 不满足要求。MCP 模式不会因 Node 版本不符而拒绝启动，但那已超出上游支持范围。不要为本条目自动升级用户的 Node.js 或 npm。
- MCP 宿主需支持 stdio，能找到 `npx`，并允许启动本地工具进程。第一次获取 npm 依赖需要网络。
- 不设置 `HOPPER_TARGET_PATH`，即可先做无目标连接检查。已有 REA/引擎环境变量需要先复核，不能把用户的旧目标当作本次授权。
- 服务启动不代表分析引擎就绪。原生分析按任务需要 Hopper、Ghidra 或 IDA；Android 按流程需要 JADX、Java、ADB 或 Apktool；浏览器流程需要兼容浏览器。Frida 是可选依赖：本条目关闭安装生命周期脚本，npm 会获取 frida 包，但不会下载它的原生绑定，相关动态插桩工具在调用时报告加载失败。固件、托管代码与运行时流程也有各自依赖。具体要求见[固定版本的安装指南](https://github.com/morluto/rea/blob/160d821ac9a0310afcb8d1fc427862dd6508add5/docs/installation.md)。
- Hopper、IDA、JEB 等商业产品的许可和费用独立于 REA 的 MIT 许可。第三方引擎及依赖适用各自条款，不得用 REA 的许可覆盖它们。

Requires Node.js `^22.23.4 || ^24.22.1 || >=26.12.1` (DesireCore 10.0.201 and later bundle Node.js 26.13.0; the Node.js 24.21.0 bundled with earlier clients does not qualify), npm/npx, network access for initial acquisition, and a host that supports local stdio processes. Do not automatically upgrade the user's runtime or reuse a configured target as authorization. Analysis providers, Java, Android tools and browsers must be prepared separately for the selected workflow. The optional Frida dependency is fetched without its native binding because lifecycle scripts are disabled. Commercial providers require their own licenses and may incur fees.

## 固定制品与校验 / Pinned artifact

| 项目 / Field | 固定值 / Value |
| --- | --- |
| Package | `rea-agents@6.8.0` |
| 发布包 / Artifact | `https://registry.npmjs.org/rea-agents/-/rea-agents-6.8.0.tgz` |
| SHA-256 | `8d542ec76a9cb350584b60a6c9c088706ff812d5bb5b094c20c95b6dc25698bb` |
| 文件大小 / Bytes | `9944902` |
| 发布代码 / Release commit | `160d821ac9a0310afcb8d1fc427862dd6508add5` |

推荐需要明确制品校验的安装流程：在用户选择的独立安装目录下载上述文件，先核验 SHA-256，再安装。以下 macOS/Linux 示例在当前目录创建一个新目录；若同名目录已存在，先检查现有安装，不覆盖它。

```sh
mkdir rea-mcp-6.8.0 && cd rea-mcp-6.8.0
curl --fail --location --proto '=https' --proto-redir '=https' \
  --output rea-agents-6.8.0.tgz \
  https://registry.npmjs.org/rea-agents/-/rea-agents-6.8.0.tgz
```

macOS 校验：

```sh
printf '%s  %s\n' \
  8d542ec76a9cb350584b60a6c9c088706ff812d5bb5b094c20c95b6dc25698bb \
  rea-agents-6.8.0.tgz | shasum -a 256 --check
```

Linux 使用同一校验行，将 `shasum -a 256 --check` 换为 `sha256sum --check`。Windows 可以用 `Invoke-WebRequest` 获取同一 HTTPS 文件，再用 `Get-FileHash -Algorithm SHA256` 比较上述值。**下载失败或摘要不一致时停止，不执行包。**

仅在摘要通过后运行：

```sh
npm install --ignore-scripts --no-audit --no-fund ./rea-agents-6.8.0.tgz
node ./node_modules/rea-agents/scripts/rea.mjs --version
```

应输出 `6.8.0`。连接验证后的副本时，用 `node` 的绝对路径作 `command`，用安装目录下 `node_modules/rea-agents/scripts/rea.mjs` 的绝对路径和 `--mcp` 作 `args`，不依赖宿主工作目录。禁止为连接这条服务执行 `rea setup` 或覆盖其他客户端配置。

The explicit verification path downloads the pinned HTTPS tarball, checks SHA-256, and only then installs it in a separate directory with lifecycle scripts disabled. A mismatch must stop installation. `--version` must return `6.8.0`. Connect this verified copy using absolute Node and script paths, followed by `--mcp`. Do not run `rea setup` or replace unrelated client configurations.

## 目录默认启动方式 / Catalog launch

默认 manifest 使用固定版本的 npx 启动，并关闭依赖安装生命周期脚本：

```sh
npx --yes --ignore-scripts rea-agents@6.8.0 --mcp
```

普通 `npx rea-agents@6.8.0` 是 CLI，不能替代上述 MCP 命令。默认 npx 获取过程由 npm 校验包完整性；sidecar 中的 SHA-256 是目录证据，不能据此宣称每个客户端都会强制校验它。需要此保证时采用前面的下载校验流程和绝对路径连接。固定 REA 包版本也不等于锁住或完整审计全部传递依赖；离线或可重复部署应保留安装锁文件，并按部署环境复核依赖。

The default launch pins the package and disables dependency lifecycle scripts. Omitting `--mcp` selects CLI mode. npm handles integrity for npx acquisition; recording SHA-256 in the sidecar does not prove that every client enforces it. Use the verified local-copy path when that guarantee is required. The top-level pin is not a complete transitive dependency lock or security audit.

## 验证、升级、卸载 / Verify, update, remove

- 先检查版本，再由 MCP 宿主做 `initialize` 和 `tools/list`。6.8.0 包内记录的 MCP 目录有 229 项工具（6.4.0 曾在 macOS 无目标检查中实际列出 170 项；6.8.0 未运行）；工具声明存在不代表相应引擎、目标或权限可用。
- 握手或依赖检查失败时保留具体错误，不能标为可用，也不能编造分析结果。不要为“验证”自动执行目标、连接调试端口、安装设备应用或购买许可。
- 升级时重新核对新版本制品、摘要、许可证和兼容性，提交目录更新；不改为 `latest`。
- 卸载先停止该 MCP 进程并移除这条连接。只处理本条目拥有的安装目录；不要删除共享 npm 缓存、其他引擎、用户分析产物或整个 MCP 配置。

Verify version and target-free MCP initialization/tool listing first. A published tool is not proof of provider readiness. Report dependency failures honestly. Updates require a fresh pin and evidence review. Removal stops this connection and handles only its owned installation, preserving shared caches, other providers, user evidence and unrelated client configuration.
