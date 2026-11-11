# 固定源审阅边界

## 0.3.2 固定运行时修复

[应用 PR #20](https://github.com/desirecore-agent/video-creation/pull/20) 修复精简 FFmpeg 仅通过版本检查、却不能混音和导出的误判。固定源 `dae13711e5a340647574f2b73d2aea24e6995ab0` 与被测 head 树一致；core（含类型）及 Linux 实际运行 CI 通过。macOS ARM64 实际精简 PATH、空缓存的固定 SHA 回退通过，回退副本执行 5 项真实运行 smoke；18 项定向测试通过。

[公开 0.3.2 归档](https://github.com/desirecore-agent/video-creation/releases/tag/v0.3.2) 实际下载 5,020,403B，SHA `bfa4fbe51d3bbed9a2fd54f0805bdfb14f658ca30025793b8f3fdd746983d933`，215 文件 / 9,682,993B，releaseDigest `3e9db34f598b4f4ae4d74958cc4039e2d13be113e8f539043687ba780be66ca2`。只指向公开固定包，不改变 studio 入口及权限。完整 DesireCore 原生验收另记。

English: 0.3.2 detects extraction-only FFmpeg and verifies the pinned application copy where supported. Source checks, Linux runtime CI, the actual macOS ARM64 cold-cache fallback and a five-check runtime smoke passed. The public ZIP matches the reviewed archive; full native employee acceptance is separate.

## 0.3.1 固定发布材料

固定源码51aa4088ff6eea92c88213b6fc36c5e24d8a23d9由应用PR #19合入；发布head的core（含类型）与Linux真实运行门禁均成功。当前目录改为已发布ZIP、归档SHA、appRelease与studio/embedded-web入口一致的指针，消除源码重建与旧manage/agent目录不匹配。215个payload文件逐项核验，保留原MIT/来源/第三方许可；没有用户数据或原生依赖二进制。

发布材料和CI不代替所有OS的DesireCore安装、导演业务与附件验收；这些结果在对应平台单独记录。附件沿正常审批下载到已授权工作目录交付，不添加应用数据根读取白名单。

English: Version0.3.1 pins the published ZIP and matching release/entrypoint identity after PR19 and its core/type/Linux runtime checks. Exact payload and notices were verified. These facts do not replace native end-to-end installation/director acceptance on every OS.

## 0.3.0 历史源码审阅

- 产品源码固定为manifest.source.ref；0.3.0取自该源码package声明，不捏造新的上游发布号。此目录为源码指针，没有另发二进制Release或打包上游桌面版。
- 源码保留OpenFilm历史、MIT、TRADEMARK与第三方通知，使用独立产品名和自身发行流程；可选媒体服务、浏览器、字体和编解码器许可另按实际组件处理。
- 固定源经core与Linux runtime的PR检查后实际合并，自然main检查单独归源，不挪作合并前门槛。已记录macOS正式受管应用/导演审片、版本与时间点、图片字节、原片及人工锁保留；本次新增CLI副本能力在隔离macOS中以冻结候选客户端连接兼容的已安装服务端，实际读取既有三图，未把候选冒称新服务端安装。Linux运行和macOS原生分源，不推广为新版Windows/Linux GUI验收。
- 已验证构建为DesireCore10.0.186，目录要求实际app-authoring-v1能力准入。代码默认动态port0；目录安装材料选择6390作为可调管理端口约定，并披露相邻只读影片端口6391。实际端口、安装、授权与健康仍由正式运行合同和回执决定。
- 不复制用户影片、私人部署路径、身份、凭据、审片记录或运行标识到公共目录。目录发布本身不改生产安装，不默认创建模型、启用外部服务或注册内部MCP。

English: The catalog pins reviewed source, preserves upstream provenance and notices, and declares a tested client floor rather than a client release promise. Runtime ports and readiness require actual lifecycle evidence. Platform-specific validation stays scoped; private projects and runtime identifiers are not published here.
