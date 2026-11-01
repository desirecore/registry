# 视频剪辑固定源审阅与发布边界

本目录准备为新“视频剪辑”应用的源码指针，与原“视频创作 / 视频导演”条目独立。目录 PR 仍须等待[应用 PR1](https://github.com/desirecore-agent/video-editing/pull/1)、[视频剪辑师 PR1](https://github.com/desirecore-agent/video-editor/pull/1)的必要资格与合并门禁，以及本目录检查；当前 Draft 不代表已上架。macOS 由用户明确暂缓，不视作豁免或验收成功。

## 来源、许可与不可变身份

- 固定应用提交为 `be7680fb90e1f3d8e52a6d9e00ab91db64cbd5a2`；版本 0.1.0 来自该提交 `package.json`，不是新造的上游 Release。`source.ref` 与 `compliance.reviewedRef` 完全一致。
- 应用直接保留 FableCut `61bf46babca82214c162c0650e47a81c3530982c` 的历史、MIT 许可与版权，使用新的产品名。`NOTICE.md` 明确独立 fork 和第三方来源，不声明上游背书，不使用上游产品标志。
- 字体保留 SIL OFL 等原通知；Node、Chrome for Testing 与 FFmpeg/ffprobe 各自许可独立。固定下载 URL、完整 SHA-256、展开行为与通知位于源 `desirecore/runtime-assets.json`、`desirecore/RUNTIME.md`；目录只发布源码指针，不转发这些二进制或重新声称其许可。
- 唯一材料生成器 `desirecore/release.js` 对新材料根生成 canonical 清单。本固定源 r11 为 128 文件 / 3095832 字节，releaseDigest 为 `053be31c5dd6428af470f9e8fe18cc1bf0f2a979bc8dc510c367759943dac775`。源码草稿清单、Git SHA 与正式 releaseDigest 是不同事实。
- 产品 UUID `0171a763-ad35-4b94-98b9-204782817b44`、editor 入口及服务引用来自源定义，不填入私人安装实例、Actor 或运行 ID。视频剪辑师从独立仓库/市场获取，关联不携带权限或运行归属。

## 已核验范围

固定 App 源的 [CI 运行](https://github.com/desirecore-agent/video-editing/actions/runs/41170070155)通过七项检查；源码/包安装与 stdio 24 工具闭包是独立材料检查，不代替原生 GUI。平台实际运行源为已合并 `f5c8e576910ed999912dacbd9eec68b829c1c9fd`，该源声明版本 10.0.195；因此选它作目录客户端下限，仍须实际公开 capabilities 准入，不把版本号当能力证明。

- Windows 使用同平台源的未签名开发 GUI 候选，实际完成新 Agent 导入与关联、同实例 MCP 编辑、原始导出与全解码/源画面和立体声校准、明暗/入口/窄布局、取消，以及运行中导出被实际终止应用进程后的同原 job 恢复。恢复将原 job 记为 interrupted，物理清理四项登记临时产物，11 项保护文件摘要保持不变。新 MCP/旧 hint 拒绝、真实 Agent 核验与 CAS、有效期内旧回执拒绝和同代际复用分别留有证据。自有进程、端口、任务与租约已闭，数据和候选材料保留。
- Linux 范围为普通用户 Ubuntu 24.04.5 / WSLg 的 Electron 44.10 源码 GUI，实际完成对应编辑、原始导出与内容校准、主题/入口 UI、取消、同原任务故障恢复、可信核验回执与清理。不推广为官方 Linux 包、裸机 GPU 或其他发行版资格。
- 本轮未直接采样 Windows 故障前 part 的字节数，不能宣称已非零；原计划关于非零大小守卫已实现的文字误述已纠正。专门的后代进程停止分支未单独执行。GUI 关闭确认值为 false，CDP 关闭和自有进程清零另有实测。受控协议夹具验证执行与回执，不证明模型自主规划质量。
- Windows 验收使用发布者文档列明的镜像补齐依赖档案，完整 SHA 与源固定清单一致；不声称 GitHub 首次在线下载已通过。正式安装仍执行固定源的显式准备合同，不修改 pin、权限或 sandbox 迎合环境。

## 发布门禁

`platformSupport` 当前只含 windows/linux；macOS 完成必要真机验收后才能扩充声明。正式签名安装器、官方 Linux 包和裸机 GPU 未验。产品源 PR 合并、最新 CI、合并头/基线、目录 PR 检查及从市场实际安装/关联/打开仍须逐项核实，不能由 `availability: installable` 推断已完成。该字段只允许进入现有受治理获取流程，不是已安装、已授权或在线状态。

目录不复制个人工程、素材、影片、用户身份、Provider Key、运行快照、MCP grant、审批或信任。固定元数据不伪造当前安装/运行回执，不替用户启用模型或外部服务。

English: This draft source-pointer listing pins the actual 0.1.0 fork and preserves FableCut provenance, MIT and third-party notices. Runtime dependencies keep their own licenses and SHA pins. Qualification covers bounded Windows and Ubuntu/WSLg source-GUI behavior on platform f5; macOS, signed installers, official Linux packages, bare-metal GPU and autonomous model quality remain unqualified. Pre-fault part size was not directly observed and dedicated descendant stopping was not exercised. Product and catalog PRs plus a real market acquisition/association check remain release gates. Installable metadata is not runtime, permission or publication evidence.
