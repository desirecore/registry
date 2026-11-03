# 视频剪辑固定材料审阅与发布边界

独立“视频剪辑”，与既有视频创作/视频导演分开。App PR1与CI修复PR2已合，实际固定源 `e1e5d12ce95854ca7cb02d277f955abb1536c5ac`，main CI41455224007七项真实Runner成功。直接保留FableCut `61bf46babca82214c162c0650e47a81c3530982c`历史、MIT/版权/字体通知，NOTICE.md记录独立fork，无上游背书或产品标志。Node、Chrome for Testing、FFmpeg/ffprobe与字体各自许可独立，不冒MIT-only。

## 真实分发身份

0.1.3固定资产已在2026-11-02发布到[GitHub Release](https://github.com/desirecore-agent/video-editing/releases/tag/v0.1.3)，实际公网HTTP200下载与准备归档完全相同：1372662B/SHA256 `fa9128606390a17409ff4eba46c13988df17f55cb8bbd3f21c6066cb5f9940b4`。包根app-release.json及130payload/3104880B逐字节与上述提交一致，规范releaseDigest `205ca1f94ae71ce4b86984328ab9914d477fcc9428fd69c6dc5789f93de0e68b`。清单实际worktree生成来源保留，不为了填写Git mergeRef改payload或摘要。归档不含原生bins、node_modules、用户数据、媒体、测试夹具、凭据或授权。源固定pin和归档SHA独立填写，不用releaseDigest代替下载SHA。

产品UUID/目录ID `0171a763-ad35-4b94-98b9-204782817b44`、editor embedded-web入口/serviceRef、placement来自真实清单内联definition，appRelease.definitionSource=manifest。实际安装ID/owner/代际只能来自正常安装流程；目录不自报信任。独立4.3作者Schema与现有4.2全局Schema分开，不改旧格式字节；两个validator选择同一判据，固定git/release来源、required capabilities与互斥definition来源由回归约束。

## 限定实际资格

应用0.1.3/R14限定功能通过macOS UID501/Electron44.10源码GUI、Windows x64 Console1未签GUI、Ubuntu24.04.5/WSLg普通用户Electron44.10源码GUI。正常固定依赖准备、真实AppManage/TaskHost、实际Agent与同实例MCP、可编辑工程/自产影片full decode与来源/声音校准及真实明暗UI分开留证。Windows当前UI新窗口有实际guest/Play/Pause/正常MCP24，不冒新的AgentRun；Mac的取消/故障不变域承接已验R12，不称R14重跑全矩阵。Windows/Linux当前取消及单Root故障后原任务interrupted/登记物理清理/no auto job分别实测；Linux原观察工装readlink退出竞态保留，以同case只读续核，不重复kill。旧Windows锁归档晚hard13.245秒等原边界不因后续全闭窗口抹除。自有现场均关闭，数据保留。

资格不扩展为正式签名系统安装器/官方Linux包、裸机GPU、所有版本或商业模型自主规划质量。依赖固定档案校验与原setupRuntime新回执不冒全部OS首次公网下载。原生源码平台Mac eb31、Windows/WSL f5；最新平台实际合并f897完整CI已过，新增启动审批/PORT影响尚待最终fresh-home官方市场链验证。目录Schema和CI不是安装成功证明。

## 客户端与默认市场实测

最低兼容要求为10.0.197并实际包含平台PR5598的新reader、release/runtime-binding。公开196标签源不含该reader；版本号、capability字符串或目录availability均不能替代实际来源与安装观测。

已在客户端197源码候选11285bc284bb0533f24851f9dc6d2f9b60324361的全新隔离home，通过默认官方registry main与market main实际获取固定App和独立Agent。原AppManage prepare、实际TaskHost命令接纳/enroll/CAS commit、关联空权限、独立同实例MCP24、真实Agent改名/改字幕/新影片输出及完整解码/画面声音校验、原生关联guest播放暂停/明暗主题均完成；没有目录override或手塞seed。该结果是macOS源码候选，不是公开197签名包的安装结论。

核验后旧运行修订失效和待审批停止请求的未知结果均保留。原恢复守卫正确拒绝无可信终态的旧命令，沿已有接纳流程修复同一部署，数据与影片保持；完整宿主ApplicationRuntime.stop审批允许后原HTTP200、可信TaskHost user_stopped/exit0与物理退出闭合。QA误用manage提交被writer拒绝，改合法update后通过，没有放宽校验或手写账本。源码候选的限定功能实测不代替正式发行包验收，也不证明商业模型自主质量。

English: The fixed archive and default official catalogs were actually acquired in a fresh isolated 197 source-GUI candidate. Managed admission/CAS, independent Agent installation and association, same-instance MCP, real Agent edits and output validation, native playback and both themes passed within that scope. A pending stop approval was not treated as completed; the original recovery guard remained intact, existing admission repaired the same deployment, and explicit stop approval produced HTTP200 and trusted TaskHost exit evidence without changing media. This is not qualification of a publicly distributed signed 197 client. Verify actual release source and capabilities; public 196 lacks the reader.
