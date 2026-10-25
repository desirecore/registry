# 视频创作：安装、更新与卸载

本条目固定源码提交，不携带用户配置、模型额度、素材或已安装事实。安装者先读取同目录manifest.json、review.md以及固定源的LICENSE、TRADEMARK.md、THIRD_PARTY_NOTICES.md和desirecore/RUNTIME.md。浏览器、字体、FFmpeg及可选媒体服务按各自实际许可和费用使用；目录元数据不授予文件、工具或模型权限。

## 准备固定材料

使用manifest.source.url克隆到安装者自己的源码目录，检出manifest.source.ref的完整提交，核对Git对象与许可。不要从可变main、未核验镜像或上游原版替代。需要Node.js >=22.18与pnpm 9.15.9，在该固定源码根执行：

```sh
pnpm install --frozen-lockfile
pnpm build
node desirecore/release.mjs --output <新的材料目录>
```

生成器提供app-authoring-v1清单与明确列出的运行payload，不登记或启动应用。材料不含node_modules、用户工程、身份、凭据或安装ledger；用清单逐文件摘要核验，包含完整运行依赖LICENSE/NOTICE。实际生成内容与已审源不符时停止，不篡改清单迁就。

## 正式安装

先GET平台公开的/apps/authoring/capabilities（实际路由前缀以平台合同为准），确认app-authoring-v1的release和runtime-binding均supported、authorized、available。条目采用10.0.186作为已验证支持下限，不表示所有同版本构建的能力都已启用；缺失时报告需要兼容客户端，不伪装成Docker、MCP或已安装应用。

沿当前平台正式prepare、原owner的真实Bash/TaskHost接纳、runtime/contracts、commit流程，参数遵循公开Schema和RUNTIME.md。安装目标沿当前目录来源与稳定appId=video-creation解析；已有安装则使用其实际installationId和expectedRevision，不新建第二条事实或换来源覆盖。

本目录安装约定Studio管理端口为6390、只读影片origin为相邻6391，均仅回环。这是目录声明的可调安装约定；源码CLI默认port0动态分配，不能拿目录值当在线端口。端口占用时，原owner可选择另一对实际可用连续端口，检查两者并把真实端口写入正式运行合同；不要结束别人的进程。

在平台返回的固定材料根准备prod依赖，并在明确候选home中setup-runtime；浏览器与FFmpeg可能需首次下载。通过原owner执行候选start命令并保存实际terminalId、端口及身份路径/api/desirecore/runtime-identity。正式commit前由原owner关闭候选，确认精确进程及端口退出。正式启动使用平台登记的数据根与注入的PORT，核当前release/revision/generation的binding和实际页面；激活available、安装核验记录或HTTP200单项不等于完整可用。

视频导演单独从市场安装。只从真实安装结果读Agent ID，沿正式配置和弱关联流程接线；不把显示名、仓库slug或个人ID写进公共包。顶层AppHost使用有限桥，交接需宿主真实确认；影片iframe不获得平台权限。

## 更新和卸载

更新前核真实实例、活动Actor/审批/导出/审片队列与未保存工作，保留当前工程及人工参数、DOM和锁。正常AppStop、核精确端口退出后，再prepare固定新源、比较数据合同并以expectedRevision CAS更新；响应未知先查询原submissionId，不重复登记。用户工程、偏好、身份、凭据和ledger不手写、不复制覆盖。更新Agent内容沿平台Git更新/冲突合并，保留本地修改与偏好。

卸载先停止该精确安装，使用正式卸载入口；数据合同默认保留数据。作品与素材不属于release文件，不能随材料清理顺手删除。目录本身不删除或更改用户数据。

English: Install the exact pinned source using existing app-authoring-v1 prepare, owner admission, runtime contract and CAS commit. Node/pnpm/browser/FFmpeg are separate prerequisites; optional model/media licenses and costs are not bundled. Ports6390/6391 are adjustable catalog installation defaults, while the CLI defaults to automatic allocation. Use actual receipts, preserve human edits and app data, query uncertain submissions, and uninstall through the precise lifecycle owner. No internal MCP registration or permission grant is implied.
