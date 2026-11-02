# 视频剪辑固定材料审阅与发布边界

独立“视频剪辑”，与既有视频创作/视频导演分开。App PR1与CI修复PR2已合，实际固定源 `e1e5d12ce95854ca7cb02d277f955abb1536c5ac`，main CI41455224007七项真实Runner成功。直接保留FableCut `61bf46babca82214c162c0650e47a81c3530982c`历史、MIT/版权/字体通知，NOTICE.md记录独立fork，无上游背书或产品标志。Node、Chrome for Testing、FFmpeg/ffprobe与字体各自许可独立，不冒MIT-only。

## 真实分发身份

0.1.3固定资产已在2026-11-02发布到[GitHub Release](https://github.com/desirecore-agent/video-editing/releases/tag/v0.1.3)，实际公网HTTP200下载与准备归档完全相同：1372662B/SHA256 `fa9128606390a17409ff4eba46c13988df17f55cb8bbd3f21c6066cb5f9940b4`。包根app-release.json及130payload/3104880B逐字节与上述提交一致，规范releaseDigest `205ca1f94ae71ce4b86984328ab9914d477fcc9428fd69c6dc5789f93de0e68b`。清单实际worktree生成来源保留，不为了填写Git mergeRef改payload或摘要。归档不含原生bins、node_modules、用户数据、媒体、测试夹具、凭据或授权。源固定pin和归档SHA独立填写，不用releaseDigest代替下载SHA。

产品UUID/目录ID `0171a763-ad35-4b94-98b9-204782817b44`、editor embedded-web入口/serviceRef、placement来自真实清单内联definition，appRelease.definitionSource=manifest。实际安装ID/owner/代际只能来自正常安装流程；目录不自报信任。独立4.3作者Schema与现有4.2全局Schema分开，不改旧格式字节；两个validator选择同一判据，固定git/release来源、required capabilities与互斥definition来源由回归约束。

## 限定实际资格

应用0.1.3/R14限定功能通过macOS UID501/Electron44.10源码GUI、Windows x64 Console1未签GUI、Ubuntu24.04.5/WSLg普通用户Electron44.10源码GUI。正常固定依赖准备、真实AppManage/TaskHost、实际Agent与同实例MCP、可编辑工程/自产影片full decode与来源/声音校准及真实明暗UI分开留证。Windows当前UI新窗口有实际guest/Play/Pause/正常MCP24，不冒新的AgentRun；Mac的取消/故障不变域承接已验R12，不称R14重跑全矩阵。Windows/Linux当前取消及单Root故障后原任务interrupted/登记物理清理/no auto job分别实测；Linux原观察工装readlink退出竞态保留，以同case只读续核，不重复kill。旧Windows锁归档晚hard13.245秒等原边界不因后续全闭窗口抹除。自有现场均关闭，数据保留。

资格不扩展为正式签名系统安装器/官方Linux包、裸机GPU、所有版本或商业模型自主规划质量。依赖固定档案校验与原setupRuntime新回执不冒全部OS首次公网下载。原生源码平台Mac eb31、Windows/WSL f5；最新平台实际合并f897完整CI已过，新增启动审批/PORT影响尚待最终fresh-home官方市场链验证。目录Schema和CI不是安装成功证明。

## 正式客户端和市场验收

最低客户端预定10.0.197，包含平台PR5598新reader并须实际capability检查；197正在发行准备，公开196实际tag源没有该reader。目录main未合前保持Draft，不宣称上架。两个目录合入与兼容客户端实际可得后，仍需全新隔离home沿默认官方main获取/安装应用和数字员工、核所有者、正常关联/独立MCP授权与实际编辑预览/导出。availability=installable只允许现有受治理获取流程，不是当前安装、运行或授权事实。

English: The fixed 0.1.3 archive is publicly available and downloaded bytes match the reviewed material and merged source. The independent fork retains FableCut history and notices. Qualification is bounded to the stated macOS source, unsigned Windows and Ubuntu/WSLg source GUIs; original recovery/timing failures and unchanged-domain boundaries remain explicit. The new client reader, catalog publication and fresh default-market acquisition/use are separate gates. Client 197 is not public yet; public 196 lacks the reader. This listing grants no permissions or runtime ownership.
