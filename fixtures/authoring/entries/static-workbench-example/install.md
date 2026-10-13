# 静态工作台示例 1.0.0

目录材料对应固定应用release，上传、目录审阅和实例安装分别核验。

- 来源：https://git.example.test/examples/releases/download/1.0.0/workbench.zip
- 固定来源ref：1111111111111111111111111111111111111111
- 归档响应体SHA-256：ed9b876d3162d09d5d7264cf552079d44e8a17d14665a00fb97bffb94c121284
- releaseDigest：fe8290e42731a0132753b0c99bc0c08c82e039845ac7a489e3ee8c1e36515044
- 作者定义：application.json
- 所需能力：app-authoring-v1, release, web-bundle

先读取应用安装管理技能 app-install-manager，解析当前请求、精确目标与占用。实际能力握手必须满足以上要求，版本号不能代替握手。

使用用户已授权的Git/HTTP工具取得此固定材料，核对归档原始字节摘要；安全解包后核读app-release.json和全部文件摘要、作者定义与版本。releaseDigest按app-release-c14n-v1计算，不能换成归档摘要。

通过已有release prepare接口取得owned固定候选与来源物化descriptor，分别核验descriptor原始字节；沿唯一安装writer提交CAS，登记成功后再检查启动和功能，不能把材料存在或端口响应说成已完成安装。

静态文件只能沿release.delivery.entrypoints映射承载，不运行构建/宿主程序，不注册虚假的全局API服务。

此release未声明平台业务文件合同；安装说明不授予宿主文件或共享数据库权限。持久数据和备份要求须在实际应用中核读。

同版本异内容必须创建新修订。目录更新只产生候选，不能改写已安装快照。目录撤回阻止新获取，不自动卸载或删除本机数据；离线只能继续使用已经核验且本地依赖完整的版本。

私有来源由真实Git/Gitea ACL和连接鉴权；凭据不写入本目录、归档或URL。团队成员移除不会自动撤销来源端访问，需源管理员处理；已下载字节不能收回。
