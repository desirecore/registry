# 视频剪辑使用

从已安装应用的“剪辑工作台”打开或新建工程，组织视频、音频、图片、标题和叠加层，使用时间线完成裁剪、分割、轨道编排、声音与调色。界面跟随 DesireCore 明暗主题；窄窗口通过 Preview / Media / Inspector 切换主任务区域。部分上游控件保留英文标签。[固定源编辑手册](https://github.com/desirecore-agent/video-editing/blob/e1e5d12ce95854ca7cb02d277f955abb1536c5ac/docs/editor-guide.md)说明实际编辑与 MCP 合同。

视频剪辑师可协助素材组织、时间线与声音处理，也可自主编写 HTML/SVG/Canvas/WebGL 原创动效并按工程实际支持的素材/组件流程加入作品，不要求作品局限于字幕或模板。人工编辑、草稿和锁遵循原工程合同；保存和 MCP 修改携带当前 projectId/baseRevision，遇到冲突先保留草稿、重新读取当前修订，不盲覆盖。

正式 MCP 的 `fablecut_*` 工具保留上游命名，连接同一当前服务与工程；工具列表、审批和授权来自实际平台配置。关联数字员工不自动连接、授权或启动服务，安装目录也不提供 Provider Key、模型额度或预设付费生成。可选 ASR、MediaPipe、远程字体及外部媒体服务可能访问其上游；许可、账户、网络和费用另行确认。

GUI Fast 与 `fablecut_export` 使用后台无头渲染器读取原 job 的冻结工程与声明本地媒体，不从正在编辑的可变页面输出。导出 `where` 省略、auto 或 headless 可用，tab 明确拒绝。动态 SVG 依赖、网络资源和 OS 字体尚未完整冻结，不承诺所有外部输入都有同样的快照资格。

完成状态以原 job 的回执、文件及必要视听检查为准，提交成功不是成片成功。取消等待原编码会话退出再清理已登记且身份匹配的临时产物；缺失或不可靠身份保持 unknown。重启把原未完成 job 记为 interrupted，并清理可证明归属的登记项，不自动续跑或新建替代 job。结果未知先查原 job；重试是明确的新任务。输入、工程、已完成输出与未登记文件不属于临时产物删除清单。

当前目录平台范围为 macOS 源码 GUI、Windows 未签 GUI 与 Ubuntu/WSLg 源码 GUI 的限定功能，详见 `review.md`。包含新reader的197客户端仍在发行准备；正式签名安装器、官方 Linux 包、裸机 GPU 与模型自主规划质量均未由这些运行证据证明。素材内容、审美、节奏和听感仍需实际审看与试听。

English: Use the installed timeline for editable multitrack media, sound, color and original motion; preserve human edits and compare current project revisions before applying changes. Video Editor can create original HTML/SVG/Canvas/WebGL material without reducing the work to captions or presets. Authorized MCP tools attach to the same current instance. Exports use frozen job inputs and the headless renderer; external dynamic resources and OS fonts are not fully frozen. Inspect the original job and output, keep unknown results explicit, and retry only as a new request. Runtime evidence is scoped to macOS source GUI, unsigned Windows GUI and Ubuntu/WSLg source GUI. The compatible 197 client and fresh default-market installation remain pending; production packages and model quality are separate.
