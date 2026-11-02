# 视频剪辑：固定材料安装、关联与维护

本条目只发布固定应用材料与运行说明，不包含已安装事实、系统安装器、原生依赖二进制、用户数据、模型额度或预授权。产品UUID/目录ID均为 `0171a763-ad35-4b94-98b9-204782817b44`；源仓库与skill名video-editing不是安装ID。先读取同目录manifest.json/review.md、[固定源运行合同](https://github.com/desirecore-agent/video-editing/blob/e1e5d12ce95854ca7cb02d277f955abb1536c5ac/desirecore/RUNTIME.md)、LICENSE、NOTICE.md和desirecore/runtime-assets.json。

## 兼容客户端与官方获取

最低版本预定DesireCore10.0.197；该公开客户端仍在发行准备，公开196标签源缺少官方UUID目录/manifest内联appRelease读取能力，不能仅凭同号版本或capability字符串判断兼容。正常安装前检查真实app-authoring-v1的release/runtime-binding与App管理能力；缺失时报告，不改类型绕过。

沿默认官方应用市场获取本UUID条目。唯一材料为 [video-editing-0.1.3.zip](https://github.com/desirecore-agent/video-editing/releases/download/v0.1.3/video-editing-0.1.3.zip)，响应体 **1372662B**，SHA256 `fa9128606390a17409ff4eba46c13988df17f55cb8bbd3f21c6066cb5f9940b4`；来源提交 `e1e5d12ce95854ca7cb02d277f955abb1536c5ac`。ZIP根含app-release.json与130个payload文件/3104880B；releaseDigest `205ca1f94ae71ce4b86984328ab9914d477fcc9428fd69c6dc5789f93de0e68b`。归档SHA、产品Git提交与规范releaseDigest是三种不同事实。客户端正常获取需核验实际响应字节、包根清单、逐文件大小与摘要及真实UUID/版本/入口/placement。definitionSource=manifest直接采用已核验内联definition，不编造definitionPath。不要使用可变main、上游npx/npm服务或源码内嵌草稿清单代替该归档。

应用获取不等于安装完成。委派正常AppManage/AppHost/TaskHost owner完成prepare、实际Bash接纳、运行合同与CAS commit；结果未知先查询原提交，不重复副作用。实际installationId、Actor、revision、generation、材料根和数据根只取平台响应。已有同产品安装沿expectedRevision更新，不因目录重命名另造安装。

## 显式依赖准备与启动

Node.js >=22使用平台正常受管PATH。在平台返回的固定材料根为cwd、独立正式dataRoot中显式执行 `node desirecore/setup-runtime.js --data-dir <本应用数据根>`。它按完整固定URL/版本/SHA核验浏览器、FFmpeg/ffprobe并生成新展开回执，不启动服务；这些二进制没有捆入ZIP。Node、字体、浏览器和FFmpeg各自许可独立。首次准备需网络/磁盘与系统库；Linux保持正常sandbox，Windows完整路径超过原合同限制时在下载前拒绝。不可自动sudo、关闭sandbox、改ACL、身份或依赖pin迎合环境。

正式启动使用 `node desirecore/start.js --data-dir <同一数据根>`，原owner注入真实PORT、APP_DATA_DIR和受管身份。7777只是源码fallback对应的可调默认约定，不是分配端口或验收端口；占用时选择可用值，不结束其他进程。经原owner就绪观测与当前release/revision/generation binding核验后打开embedded-web editor入口。仅端口监听或HTTP200不代表完整初始化。

## 视频剪辑师和同实例MCP

从默认官方数字员工市场单独获取[视频剪辑师](https://github.com/desirecore-agent/video-editor)，按实际导入响应ID关联当前应用，旧视频创作/视频导演保持独立。关联只设置入口偏好，contextPermissions为空，不授予文件、工具、模型或MCP权限。

按正式MCP管理与授权配置同材料根的 `node desirecore/cli.mjs mcp --runtime-file <当前owner运行快照.json>`。快照沿源Schema含schemaVersion、dataDir、port、instanceId、scopeId、runtimeGeneration、releaseDigest，不包含proof、凭据或grant。只连接当前已安装同实例；CLI拒绝旧代际/不同数据根，不另起服务。status/identity同此合同。模型算力与可选媒体服务许可、账户及费用另计；无前置条件时停止并报告。

## 更新、备份与卸载

保留人工时间线与草稿，沿精确owner正常停止并等实际Root/编码器退出。用已授权文件工具备份dataRoot、外部媒体与摘要；video-editing-home-v1中的工程/素材/成片不是缓存。runtime依赖可按固定合同重建。新版本正常prepare/数据合同比较/expectedRevision CAS，不复用旧PID、锁、proof或hint。恢复在停止状态核对格式、相对路径与媒体再测试；不支持的格式保持原数据并失败，没有自动降级或后台续渲染承诺。卸载沿正式入口停止精确安装并默认保留用户数据；不能清材料时顺带删工程成片。

English: Acquire only the fixed published archive through the normal official UUID catalog. Verify its archive SHA separately from the manifest release digest and every listed file. Client 197 is being prepared; public 196 lacks the reader. Normal owner admission, explicit pinned runtime preparation, current-instance MCP authorization and observed readiness remain necessary. Dependencies and model/media terms are separate. Preserve user data and human edits through updates, backup, restore and uninstall; uncertain submissions are queried before retrying.
