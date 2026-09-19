# 安装、升级与卸载 DesireCore Control

这是供外部智能体使用的**独立应用**，不是给 DesireCore 内部智能体安装的 MCP。只接受 resolver 已复核的 `kind=app`、`manifest.type=native-app` 和本指南。需要客户端 >=10.0.170 及 app-install-manager >=1.5.0，使用 application-observation-v1 核验记录协议；旧版拒绝时停止，不改成 Docker/MCP，不预写安装中间态或绕过修订检查。

## 安装前确认

向用户确认目标设备与独立应用安装目录。Node.js >=22.22.2，npm 可用；512 MB 内存/磁盘为建议预留，不是实测峰值。安装阶段不需要 DesireCore 实例在线，不读取用户实例、截图或凭据。默认管理页面端口 9333；启动前被占用则说明并停止，不终止占用进程、不偷偷改端口。

固定制品：`https://github.com/desirecore-agent/desirecore-cdp-mcp/releases/download/v1.4.0/desirecore-cdp-mcp-1.4.0.tgz`

SHA-256：`ecfd6e770cd1854d7368ec89852b5e798cc04f6e19bbb59fedae52a56bacbee0`

源码提交：`38184fbb01f82d4dd850b67366cdac048a09474b`。下载后先比对 resolver manifest.source 与本指南的版本、URL、ref、摘要；不一致立即停止。只从该固定 Release 安装，依赖通过 npm 正常解析；摘要针对应用 tgz，不声称覆盖全部传递依赖。

## Windows PowerShell

默认独立安装根为当前用户 `%LOCALAPPDATA%\DesireCoreControl`，不得混用 DesireCore 数据 home。明确存在旧版本或自定义安装目录时先确认实际路径，不能覆盖未知目录。

```powershell
$ErrorActionPreference = 'Stop'
$Root = Join-Path $env:LOCALAPPDATA 'DesireCoreControl'
$Prefix = Join-Path $Root 'versions\1.4.0'
$Temp = Join-Path ([IO.Path]::GetTempPath()) ('dc-control-install-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $Temp | Out-Null
$Archive = Join-Path $Temp 'desirecore-cdp-mcp-1.4.0.tgz'
Invoke-WebRequest -Uri 'https://github.com/desirecore-agent/desirecore-cdp-mcp/releases/download/v1.4.0/desirecore-cdp-mcp-1.4.0.tgz' -OutFile $Archive
if ((Get-FileHash -LiteralPath $Archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'ecfd6e770cd1854d7368ec89852b5e798cc04f6e19bbb59fedae52a56bacbee0') { throw '制品校验失败，不安装' }
npm install --prefix "$Prefix" --omit=dev --ignore-scripts --no-audit --no-fund "$Archive"
if ($LASTEXITCODE -ne 0) { throw '安装失败' }
$Package = Join-Path $Prefix 'node_modules\desirecore-cdp-mcp'
$Meta = Get-Content -Raw -LiteralPath (Join-Path $Package 'package.json') | ConvertFrom-Json
if ($Meta.name -ne 'desirecore-cdp-mcp' -or $Meta.version -ne '1.4.0') { throw '已安装版本不符' }
node (Join-Path $Package 'bin\desirecore-control.cjs') --help
if ($LASTEXITCODE -ne 0) { throw '应用入口自检失败' }
$Empty = Join-Path $Temp 'empty-registry.json'
[IO.File]::WriteAllText($Empty, '{"version":1,"instances":[]}', [Text.UTF8Encoding]::new($false))
node (Join-Path $Package 'bin\desirecore-cdp-mcp.cjs') list --registry "$Empty"
if ($LASTEXITCODE -ne 0) { throw '隔离实例发现自检失败' }
# 仅移除本次随机创建的临时目录；应用包、用户数据和凭据保留。
Remove-Item -LiteralPath $Temp -Recurse
```

安装入口与空名录自检通过后，按 app-install-manager 的 recording-api.md 提交 present 观察，保存实际安装前缀、核验时间和证据引用。复用 resolver 返回的 material 与 expectedRevision，不手拼收据、不传 operationId/runtimeServerId，不直接编辑 installed-entries.json。观察只说明当时核验通过，不代表应用或隧道正在运行。

## macOS / Linux

使用用户确认的独立前缀（默认 `$HOME/.local/share/desirecore-control/versions/1.4.0`），无需 sudo。不支持时不要自动升级 Node 或更改系统配置。用 `mktemp -d` 创建本次下载目录，`curl --fail --location` 下载上述固定 URL，分别用 `shasum -a 256`（macOS）或 `sha256sum`（Linux）核对**上述完整摘要**后再执行：

```sh
npm install --prefix "$PREFIX" --omit=dev --ignore-scripts --no-audit --no-fund "$ARCHIVE"
node "$PREFIX/node_modules/desirecore-cdp-mcp/bin/desirecore-control.cjs" --help
# REGISTRY 是本次临时目录内写入 {"version":1,"instances":[]} 的 UTF-8 文件。
node "$PREFIX/node_modules/desirecore-cdp-mcp/bin/desirecore-cdp-mcp.cjs" list --registry "$REGISTRY"
```

同时读取该前缀的 package.json 核对 name/version。任何一步失败立即停止，不能仅凭下载成功或 npm 退出码 0 提交 present 观察。只清理本次创建的临时目录。

## 独立启动与 ChatGPT 隧道

安装完成后向用户提供准确的启动命令。用户另行批准启动时，在独立终端运行 `node <Prefix>/node_modules/desirecore-cdp-mcp/bin/desirecore-control.cjs`。访问 `http://127.0.0.1:9333/`；系统浏览器打开，不嵌入 DesireCore 窗口，不创建登录/开机自启动项，不把进程生命周期绑定到 DesireCore。

默认只读，不追加 `--allow-control` 或 `--chatgpt-tunnel`。官方 tunnel-client 是可选的独立依赖，安装需要另行确认；账户 key 由用户在本机管理页输入，不发到聊天、日志、Git 或安装收据。市场安装本身不创建 Platform Tunnel、不连接 ChatGPT、不开放公网 CDP。操作说明见 usage.md。

## 升级、重装和回滚

只按用户批准的精确安装身份操作。新版本安装到独立版本目录并校验成功后才切换启动入口、提交新版本观察；不得覆盖运行中的包目录。失败或结果不明时检查实际软件，不写 failed、不宣称自动回滚，不用新版本资料登记旧版成功。没有明确结果就保留历史记录；记账失败只补记，不重跑安装。不要删除用户凭据、旧实例数据或其它版本以“修复”安装。版本切换后要求用户重新扫描外部客户端工具定义。

## 卸载

先由 resolver 按精确安装记录返回历史管理指南，再获得用户确认。仅停止明确由此安装启动的 Control 进程及其自有隧道，不执行按名称批量 kill Node/tunnel-client，不停止 DesireCore。对准确安装前缀运行 `npm uninstall --prefix <Prefix> desirecore-cdp-mcp`，并确认该包入口已不存在，再提交 absent 观察。卸载失败或结果不明时不覆盖历史记录；不预写 uninstalling，也不自动恢复为 installed。

默认保留 `%LOCALAPPDATA%\DesireCoreMcp` 或 `$HOME/.desirecore-mcp` 的用户凭据，以及其它版本与用户配置；删除这些材料必须另行获得明确同意。不得清理 DesireCore 的任何 home、用户数据、实例名录或内部 MCP 配置。
