# 视频创作：安装、更新与卸载

本条目固定 Release ZIP、归档摘要与发布清单，不携带用户配置、模型额度、素材或已安装事实。安装者先读取同目录 manifest.json、review.md 与材料内 LICENSE、TRADEMARK.md、THIRD_PARTY_NOTICES.md、desirecore/RUNTIME.md。浏览器、字体、FFmpeg及可选媒体服务按各自实际许可和费用使用；目录元数据不授予文件、工具或模型权限。

## 准备固定材料

从 manifest.source.url 下载 video-creation-0.3.2.zip（5,020,403 字节），先核归档 SHA-256 `bfa4fbe51d3bbed9a2fd54f0805bdfb14f658ca30025793b8f3fdd746983d933`。解压根的 app-release.json 发布摘要须为 `3e9db34f598b4f4ae4d74958cc4039e2d13be113e8f539043687ba780be66ca2`；再逐项核215个payload文件的大小与摘要。源码关联提交为dae13711e5a340647574f2b73d2aea24e6995ab0，入口必须为studio/embedded-web/video-creation:studio，与目录完全一致。

归档已经包含构建后的UI和完整运行依赖许可，不包含node_modules、原生依赖、用户工程、身份、凭据或安装ledger。正式安装直接使用该固定材料；只在材料根按RUNTIME.md准备prod依赖，不重新构建UI或生成另一份清单。不要从可变main、旧源码包或上游原版替代，也不篡改清单迁就不匹配。

## 正式安装

先GET平台公开的/apps/authoring/capabilities（实际路由前缀以平台合同为准），确认app-authoring-v1的release和runtime-binding均supported、authorized、available。固定归档与manifest内联定义需要至少10.0.197且确实包含相应reader的客户端；同号版本或capability字符串不代替实际读取能力。缺失时报告需要兼容客户端，不伪装成Docker、MCP或已安装应用。

沿当前平台正式prepare、原owner的真实Bash/TaskHost接纳、runtime/contracts、commit流程，参数遵循公开Schema和RUNTIME.md。安装目标沿当前目录来源与稳定appId=video-creation解析；已有安装则使用其实际installationId和expectedRevision，不新建第二条事实或换来源覆盖。

本目录安装约定Studio管理端口为6390、只读影片origin为相邻6391，均仅回环。这是目录声明的可调安装约定；源码CLI默认port0动态分配，不能拿目录值当在线端口。端口占用时，原owner可选择另一对实际可用连续端口，检查两者并把真实端口写入正式运行合同；不要结束别人的进程。

在平台返回的固定材料根准备prod依赖，并在明确候选home中setup-runtime；浏览器与FFmpeg可能需首次下载。通过原owner执行候选start命令并保存实际terminalId、端口及身份路径/api/desirecore/runtime-identity。正式commit前由原owner关闭候选，确认精确进程及端口退出。正式启动使用平台登记的数据根与注入的PORT，核当前release/revision/generation的binding和实际页面；激活available、安装核验记录或HTTP200单项不等于完整可用。

0.3.2 的 setup-runtime 检查实际混音滤镜和 H.264/AAC 编码器，精简系统 FFmpeg 会触发支持平台的固定应用副本回退。候选根与正式根不同时，按 AppAuthoring.release_history 的实际 currentData.dataRoot 在正式根准备，再经原 owner 正常停止并重开已有进程。 / Prepare the actual registered data root and restart through its original runtime owner. The pinned application FFmpeg takes precedence if the system build lacks required features.

视频导演单独从市场安装。只从真实安装结果读Agent ID，沿正式配置和弱关联流程接线；不把显示名、仓库slug或个人ID写进公共包。顶层AppHost使用有限桥，交接需宿主真实确认；影片iframe不获得平台权限。

## 更新和卸载

成片交付先核当前实例和原job完成回执，再从其结果URL经正常工具/审批下载到智能体已有授权工作目录，核字节和媒体后附该工作目录路径。安装/关联/MCP不授予应用数据根附件读取权；下载或审批失败保留原失败，不改用未授权源路径重发。

更新前核真实实例、活动Actor/审批/导出/审片队列与未保存工作，保留当前工程及人工参数、DOM和锁。正常AppStop、核精确端口退出后，再prepare固定新源、比较数据合同并以expectedRevision CAS更新；响应未知先查询原submissionId，不重复登记。用户工程、偏好、身份、凭据和ledger不手写、不复制覆盖。更新Agent内容沿平台Git更新/冲突合并，保留本地修改与偏好。

卸载先停止该精确安装，使用正式卸载入口；数据合同默认保留数据。作品与素材不属于release文件，不能随材料清理顺手删除。目录本身不删除或更改用户数据。

English: Download the pinned 0.3.2 release ZIP and verify its archive hash, root manifest digest and every payload file. Do not rebuild a different source snapshot during installation. Require the manifest-inline release reader (client floor10.0.197), actual authoring capabilities and normal owner admission/runtime/CAS lifecycle. Prepare production/native dependencies explicitly. Use verified current-job downloads into the Agent's existing authorized workspace for attachments; no application-data permission is implied. Preserve human edits/data and query uncertain submissions before retrying.
