# AWS MCP 安装 / Installation

这是 AWS 托管 MCP 服务的 **SigV4 本地代理**入口，不是把 AWS 服务部署到本机。`1.7.0` 指 `mcp-proxy-for-aws-cli` 和 `mcp-proxy-for-aws` 的代理版本，远端服务不由此固定版本。配套 [AWS 技能合集 PR](https://github.com/desirecore/market/pull/226) 单独安装，不是本服务的硬依赖。

This entry connects to the managed AWS MCP Server through a local SigV4 proxy. Version `1.7.0` identifies the two proxy distributions, not the remote service. The companion skill collection is optional and acquired separately.

## 安装前确认 / Before installation

- 自行准备 Python `>=3.10,<3.15`、uv/uvx 和兼容 stdio 的 DesireCore 客户端；首次获取依赖需要访问 PyPI 与 files.pythonhosted.org，运行需要访问选定 AWS HTTPS 端点。不要自动升级 Python、uv 或客户端。
- 请求用户在本机私有配置中选择 AWS 身份、Profile、账户与资源操作区域。优先使用现有 SSO/临时凭据和最小权限角色，不申请 root/AdministratorAccess，也不索取密钥、会话 token、凭据文件或完整身份输出到对话。已有凭据不代表用户授权此次使用。
- 本条目不自动安装 AWS CLI 或发起登录。若用户选择 `aws login`，该流程另需 AWS CLI >=2.32.0；已有 SSO 流程无需因此更换。登录、刷新会话或附加 IAM 策略必须先取得相应授权，不能把命令写成隐含安装步骤。
- 默认连接 `https://aws-mcp.us-east-1.api.aws/mcp`，资源操作默认区域通过 `AWS_REGION=us-east-1` 元数据明确指定。端点所在区域不等于资源所在区域；开始前说明并确认二者，按官方区域清单调整用户私有连接配置。
- AWS 的直接远端 OAuth 接入是另一条方案；本条目不宣称已验证 DesireCore 的 AWS OAuth 联调，不在安装中改写其他客户端配置。

Provide Python 3.10–3.14, uv/uvx, a compatible stdio host and network access. Have the user select the identity, profile, account and operational Region privately before using existing credentials. Prefer temporary/SSO credentials and least privilege; never request credential files or keys in chat. Do not automatically install/upgrade tools, sign in, refresh sessions, alter IAM or replace unrelated configurations. The optional `aws login` workflow requires AWS CLI >=2.32.0. Endpoint and operational Regions are distinct. Direct OAuth is not the selected or tested flow here.

## 固定制品 / Pinned artifacts

| 发布包 / Distribution | 文件 / File | SHA-256 |
| --- | --- | --- |
| `mcp-proxy-for-aws-cli==1.7.0` | `mcp_proxy_for_aws_cli-1.7.0-py3-none-any.whl`（7321 字节 / bytes） | `75f990fc5cab688bba31b67fb6a01832b64f7f097c94503877012c6595f0836e` |
| `mcp-proxy-for-aws==1.7.0` | `mcp_proxy_for_aws-1.7.0-py3-none-any.whl`（45971 字节 / bytes） | `d7e6c8f45ef89303cb48822e25f91c0234bb28ee987ebb56615cd16a5d044a1b` |

下载 URL 与带摘要的默认参数见 [usage.md](usage.md) 和 manifest；默认使用 `uvx --from <CLI wheel + hash> --with <implementation wheel + hash> mcp-proxy-for-aws-cli ...`。CLI 只是元数据包装包；`--with` 同时固定实际代码包，不能只校验包装包后就声称代码也已校验。

`uvx` 在隔离的缓存环境中准备依赖，不是系统级安装。`#sha256=` 是交给 uv 的下载校验信息；摘要不匹配必须失败，不改用无摘要 URL、浮动版本或 `latest`。若宿主或 uv 不支持本条目参数，停止并报告兼容性问题，不静默改写受治理的定义。CLI 的其余 84 条运行依赖声明使用精确版本及条件标记；本记录没有逐个审核它们的所有平台制品或证明无漏洞。

The launch definition pins both the metadata-only CLI wrapper and actual implementation wheels by URL and SHA-256. uv prepares an isolated cached environment and checks the URL hashes. A mismatch or unsupported launch contract must stop installation, with no unhashed/latest fallback. The wrapper declares 84 exact-version runtime requirements with environment markers; this review is not a byte-level audit or vulnerability certification of all platform-specific dependency artifacts.

## 登记与连接验证 / Registration and verification

1. 通过当前 DesireCore 提供的受治理服务安装/连接流程，使用本次操作携带的精确目录来源与快照。读取该快照的 manifest、sidecar、本说明与 usage，不替换整个 MCP 配置，也不凭裸 `aws-mcp` ID 吸收其他来源的安装。
2. 先确认 uvx/Python 可用、用户批准的凭据配置已就绪，以及账户、操作区域、只读范围与费用边界。缺失时说明缺失项并停止；不要通过读取或上传凭据来“验证”。若客户端需要定位 uvx，使用本机解析出的真实绝对路径，不把本机路径写回公共目录。
3. 使用 manifest 中完全一致的 command/args 启动；默认保留 `--read-only` 与 `--disable-telemetry`，没有 `--skip-auth`。不要在验证连接时调用资源创建、删除、上传、发消息或费用相关工具。
4. 由 MCP 宿主完成 `initialize`、`notifications/initialized`、`tools/list`（包括分页），检查实际响应、错误和断开清理。工具数量以本次真实返回为准，不预填或伪造。依赖准备完成、进程已启动、握手完成及某项业务可用是不同事实；只按实际结果登记当前客户端支持的安装/连接回执，不预写“已安装/就绪”。
5. 版本信息按已核验发行包元数据确认，不假设代理提供 `--version` 命令。此版本的 argparse 没有通用 `--version` 开关，不能用不存在的参数判定安装失败。真实账户工具调用需另有对应任务与授权，不能用创建资源作为连通性探针。

Use DesireCore’s governed service workflow with the exact source and snapshot. Confirm tools and privately approved credentials before launch. Keep the catalog definition intact and preserve unrelated connections. Verify MCP initialization and the complete tool list, then record only observations actually made; preparing dependencies or starting a process is not readiness. No tool count is predeclared. Read package metadata for version confirmation rather than assuming a nonexistent `--version` option. A business operation needs its own authorized task.

## 升级与卸载 / Update and removal

- 升级需重新核对两个发布包及适用依赖、摘要、许可证、参数和兼容性，再更新目录；不自动跟随远端或包的 latest，也不把托管服务更新冒充本地代理升级。
- 卸载先停止并移除这一来源/服务的受治理连接，再按客户端支持的流程移除本条目拥有的安装记录或独立环境。不要删除共享 uv 缓存、AWS CLI、其他宿主连接、`~/.aws`、SSO 会话或用户云资源；凭据撤销和云资源清理是需单独授权的操作。

Updates require a fresh review of both artifacts, dependencies and launch compatibility. Removal stops this exact connection and handles only its owned records/environment. Preserve shared caches, other hosts, credentials and cloud resources; revocation and cloud cleanup require separate authorization.

代理为 Apache-2.0；AWS 账户、API、资源及第三方依赖的条款与费用独立，详见 usage。**macOS 补测已运行固定代理，完成独立公开模式握手、工具发现和文档检索/读取，并检查 DesireCore 目录与接入入口；完整集成和账户业务不在这些通过项内，详见 review.md。**

The proxy is Apache-2.0; AWS and third-party terms/charges are separate. The macOS follow-up executed the pinned proxy for independent public-mode initialization, tool discovery and document search/read, and checked DesireCore catalog/task entry points. Complete client integration and AWS account operations are separate, unverified claims; see review.md.
