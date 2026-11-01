# 视频剪辑：安装、更新与卸载

本条目是固定源码指针，不包含已安装事实、原生二进制、用户工程、模型额度或工具授权。先读取同目录 `manifest.json`、`review.md`，以及[固定源运行合同](https://github.com/desirecore-agent/video-editing/blob/be7680fb90e1f3d8e52a6d9e00ab91db64cbd5a2/desirecore/RUNTIME.md)、`LICENSE`、`NOTICE.md` 和 `desirecore/runtime-assets.json`。

## 兼容性与固定材料

目录要求 DesireCore 10.0.195 及以上；这是实际验收平台的版本下限选择，不声称它是最早兼容版本，也不保证任意同号构建已有所需能力。安装前读取公开 `apps/authoring/capabilities`，确认 `app-authoring-v1` 的 `release`、`runtime-binding` 及正常 App 管理能力实际可用；缺失时报告兼容性问题，不改条目类型绕过。

在安装者已授权的新源码目录中克隆 `manifest.source.url`，检出并核对完整 `manifest.source.ref`。Node.js 22+ 使用 DesireCore 已有受管 PATH。编辑内核无 npm 运行时依赖，不使用上游 `npx fablecut`、可变 `main` 或另一个 npm 包代替本固定源。在该源码根执行：

```sh
node desirecore/release.js --output <新的空材料目录>
```

生成器只固定材料，不安装、启动或发布服务。核对新材料根的 `app-release.json`、逐文件大小/SHA-256 和 `releaseDigest`。本固定提交的合格 r11 为 128 文件、3095832 字节，canonical `releaseDigest` 为 `053be31c5dd6428af470f9e8fe18cc1bf0f2a979bc8dc510c367759943dac775`；不符时停止并查原因，不补写摘要迁就结果。源码内的 `desirecore/app-release.json` 是草稿，不能代替新材料根清单，也不能直接用于附着受管运行。材料不含工程、媒体、exports、依赖缓存、凭据、MCP grant 或安装账本。

## 正式受管安装

委派平台正式 AppManage / 应用管理流程，沿公开 Schema 完成 prepare、原 owner 的真实 Bash/TaskHost 接纳、runtime contract 与 CAS commit。管理动作通过正式平台工具/界面，不让 Agent 用 Bash/curl 冒充 Renderer 写入管理控制面。源码生成的产品 UUID `0171a763-ad35-4b94-98b9-204782817b44` 与入口 `editor` / `video-editing:editor` 是产品定义；实际 installationId、Actor、revision、代际和端口只取平台响应。已有安装按真实实例和 expectedRevision 更新，不因仓库 slug 新建另一份安装事实。

以平台返回的固定材料根为 cwd，在本应用独立数据根中显式准备依赖：

```sh
node desirecore/setup-runtime.js --data-dir <本应用独立数据根>
```

准备按固定清单下载并核验 FFmpeg、ffprobe 与 Chrome for Testing headless shell，保留各自许可和展开回执。不要把这些组件称为 MIT-only；Node、字体与可选模型/媒体服务也各自遵循实际许可和费用。首次准备需要网络和磁盘空间。Linux 还需要浏览器所需系统库及正常 sandbox 前提；缺依赖时停止报告，不自动运行 sudo、关闭 sandbox 或修改系统权限。Windows 使用系统 tar.exe，Linux 使用 unzip；不包含正式操作系统安装器。

正式启动契约执行 `node desirecore/start.js --data-dir <同一数据根>`，由原 owner 注入实际 `PORT`、`APP_DATA_DIR` 和受管身份。目录选择 7777 作为可调安装默认值，取自源码 fallback；它不是已分配端口、验收端口或在线证明。owner 应核对可用端口并记录真实 PORT，发生占用时选择另一个可用值，不结束其他进程。准备本身不启动应用；登记前的候选启动和关闭均遵循原 owner 合同。正式打开沿应用管理入口，不另起游离服务。

端口已监听不代表初始化完成。应读取 `/api/desirecore/runtime-identity` 与当前 release/revision/generation 的真实 binding，确认就绪后再核对 GUI、工程保存与导出；HTTP 200 或单项 verified 标签不等同完整验收。缺失或旧运行证明不可自制。

## 视频剪辑师与同实例 MCP

新数字员工[视频剪辑师](https://github.com/desirecore-agent/video-editor)单独从 Agent 市场获取，不替换既有视频导演。用实际导入响应中的 Agent ID 通过正式关联入口绑定当前应用；关联是打开偏好，不授予目录、工具、模型或 MCP 权限。

如需 MCP，经原授权流程配置 `node desirecore/cli.mjs mcp --runtime-file <当前owner响应快照.json>`，CLI 必须来自同次固定材料根。快照按源 Schema 记录真实 `schemaVersion`、`dataDir`、`port`、`instanceId`、`scopeId`、`runtimeGeneration`、`releaseDigest`，不含 proof、凭据或预授 grant。它只帮助连接已安装且已核验的同实例；CLI 会拒绝旧代际、不同数据根或不同材料，不自启第二个服务。`status` / `identity` 使用同一快照合同。

## 更新、备份与卸载

更新前保留未保存草稿，检查原工程/导出/审批，沿精确 owner 正常停止并等待进程及编码器实际退出。以已授权文件工具备份独立数据根、外部媒体与文件摘要；`video-editing-home-v1` 中的工程、原媒体和成片不是可重建缓存。`runtime/` 可按运行合同重新准备。不得复用旧 PID、锁、proof、审批或连接快照作为当前身份。

新固定源按正常 prepare、数据合同比较和 expectedRevision CAS 更新；结果未知时查询原 submission，不重复提交。恢复保持应用停止，核对相对路径、媒体引用和格式，再由原 owner 启动测试工程。0.1.0 没有自动迁移、降级或后台续渲染；不支持的格式保持原数据并失败。

卸载通过平台正式入口停止该精确安装，数据合同默认保留用户数据。不要调用清理材料的动作顺手删除素材、工程或成片。Agent 内容更新走其正常来源更新与冲突合并，保留人工修改和偏好。

English: Check actual authoring/runtime capabilities as well as the tested 10.0.195 client floor. Generate fresh immutable material from the exact pinned source; the nested source manifest is a draft. Use normal AppManage/AppHost/TaskHost admission, explicit runtime preparation and real owner-injected identities. Port 7777 is an adjustable catalog installation choice, not a live or tested-port claim. Acquire Video Editor separately and attach its authorized MCP client to the same verified instance. Source-pointer publication grants no permissions. Preserve application data and human edits through updates, backup and uninstall; query uncertain operations before retrying.
