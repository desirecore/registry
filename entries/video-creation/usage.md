# 视频创作使用

从真实安装的应用入口打开工程，film.html仍是唯一时间线；支持自主HTML/CSS/SVG/Canvas/WebGL场景，也可使用构件与组合，不要求字幕或预设模板。人工参数、DOM overrides及锁保持各自权威。

先用公开review --schema发现实际合同。工程顶部“审片”可选择带版本和实际时点的观察材料、点总览格、放大已有PNG，并播放仍核验匹配的历史输出。只有已保存版本、静态源输入与可证明时间映射都匹配时，才允许跳当前工程；缺失明确unknown，不猜时间。

可选data-review-intent按唯一Draft-07Schema记录目标宽度和必要/辅助/装饰信息，它帮助理解用途，不命令删字、排版或改锁。时间窗序列、同捕获尺寸对照和已有两版review-pair沿同一个review入口；对照复用原PNG，不再渲染。每侧来源、版本、实际时间、原图尺寸与摘要独立记录；数字秒数相同不保证语义对齐，数据变化不自动证明画面改善。

导演应对必要图片以完整expected_sha256实际Read，再结合可见像素给出意见；生成回执或HTTP成功不等于已经看图。可选用CLI的--copy-to把核SHA的PNG副本保存到已授权工作目录，用--read <reviewId>读取既有材料而不重新捕获；也可只登记必要的精确制品目录。副本不授予目录权限，不预授权整个应用数据根，文件冲突不覆盖。导出先固定输入快照，读取真实jobs终态；超时未知先查原任务，不重提付费或耗时工作。

新建付费媒体、外部生成服务或模型调用遵循平台原许可、审批和费用边界。若缺依赖、权限或证据，保留工程并报告可恢复的缺项，不伪称成功。技术量值不是审美、节奏、字形对比度或听感认证。

English: Use the installed app and public review contract. Original scenes and human locks remain editable under their existing rules. Review materials retain source/version/time/size identity; comparisons reuse existing PNGs. Optionally copy existing review PNGs into an already authorized workspace with --read/--copy-to, without permission grants or recapture. Read required images with exact digests, verify current inputs before engineering seek, preserve unknown mappings, and use real job receipts for completion. Optional model/media services, licensing, approvals and costs remain separate.
