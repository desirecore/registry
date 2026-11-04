# AWS MCP 收录核验 / Listing review

初次收录审核：2026-10-25（1.7.0，mashagua）；1.8.0 升级复核：2026-11-04（yi-ge）。收录维护者：mashagua。独立 community 条目，维护者不标为 verified，`upstreamEndorsed=false`。AWS 名称仅用于指称来源，使用通用 cloud 图标，不复制 AWS 标志。`installable` 表示符合目录来源和治理条件，不等于已安装、连接就绪、账户已授权或通过安全认证。

Initially reviewed on 2026-10-25 (1.7.0) by mashagua; the 1.8.0 update was re-reviewed on 2026-11-04 by yi-ge. Independent community listing, unverified maintainers, no upstream endorsement, nominative naming and a generic icon. Installable catalog evidence is not installation, readiness, account permission or software safety certification.

## 1.8.0 升级复核 / 1.8.0 update review (2026-11-04)

| 项目 / Item | 证据 / Evidence |
| --- | --- |
| CLI 发行包 / CLI distribution | [PyPI 1.8.0 元数据](https://pypi.org/pypi/mcp-proxy-for-aws-cli/1.8.0/json) |
| CLI wheel | [固定下载 / fixed download](https://files.pythonhosted.org/packages/e6/a5/ea0c7aaf2df02a84bfd365a1b7449814da5c33c81dbaef9ada3d77b82bd9/mcp_proxy_for_aws_cli-1.8.0-py3-none-any.whl) |
| CLI wheel SHA-256 | `aa0db82cfdcb0ed1c1e94b6fc7de6d8f2b2e8537a9d8ba489901fbae5363326e`，7301 字节 / bytes |
| CLI 上传时间 / uploaded | `2026-11-03T17:46:35.135595Z`；sidecar 以秒精度保存 |
| 实现包 / implementation | [PyPI 1.8.0 元数据](https://pypi.org/pypi/mcp-proxy-for-aws/1.8.0/json) |
| 实现 wheel / implementation wheel | [固定下载 / fixed download](https://files.pythonhosted.org/packages/a4/cb/72a0cf893c313cd3098c97a0cac87dc75b5c71a9cd8d9f1f12a9776ca799/mcp_proxy_for_aws-1.8.0-py3-none-any.whl) |
| 实现 wheel SHA-256 | `a9dec447aaea7b3b1563b3bc5bb412bb72768dd82c9a41c0ba7194786e554b27`，46684 字节 / bytes |
| 上游发布代码 / release source | tag `v1.8.0`，提交 [`a5dd25e0ad99d0d874f2b779435b12b10932eae7`](https://github.com/aws/mcp-proxy-for-aws/tree/a5dd25e0ad99d0d874f2b779435b12b10932eae7) |

- 两个 wheel 均从 PyPI 实际下载，核对发布摘要与大小；只按 ZIP 读取，未导入或执行。实现包 `mcp_proxy_for_aws/` 全部源文件与 v1.8.0 发布提交逐字节相同；CLI 包仍只有元数据，entry point 不变（`mcp-proxy-for-aws-cli = mcp_proxy_for_aws.server:main`）。
- 两个包 dist-info 中的 LICENSE、NOTICE 与发布提交根目录文件逐字节相同，内容也与 1.7.0 相同（SHA-256 分别为 `09e8a9bcec8067104652c168685ab0931e7868f9c8284b66f5ae6edae5f1130b`、`6402dc36cc1b754d7971a80232af8804f8ed113a6ee895323f431bc289e957c8`），许可证仍为 Apache-2.0。证据路径随 dist-info 目录名改为 `mcp_proxy_for_aws_cli-1.8.0.dist-info/licenses/`。
- `Requires-Python` 由 `>=3.10,<3.15` 改为 `>=3.11,<3.15`，分类器去掉 3.10。CLI 运行依赖由 84 条变为 83 条，仍全部是精确版本：去掉仅用于 Python 3.10 的 `tomli`，更新 `anyio` 4.14.2、`authlib` 1.9.1、`certifi` 2026.10.23、`dnspython` 2.9.1、`fastmcp` / `fastmcp-slim` 3.4.11、`joserfc` 1.7.6、`mcp` 1.30.0、`mcp-proxy-for-aws` 1.8.0、`opentelemetry-api` 1.45.2、`packaging` 26.3、`pyjwt` 2.15.1、`typing-extensions` 4.16.0、`urllib3` 2.8.0。与 1.7.0 一样，没有逐个审核这些依赖的全部平台制品、签名或供应链证明。
- 实现代码有三处变化：只读过滤在远端无法解析工具时返回错误，提示无法核实只读注解，不再误报为只读拒绝；`initialize` 时把宿主客户端声明的 `experimental` 与扩展能力转发给远端；SigV4 传输要求 HTTPS 端点，仅本机回环地址允许 HTTP。`cli.py` 未变，本条目使用的 `--read-only`、`--disable-telemetry`、`--metadata` 及默认端点继续适用。
- 本轮没有运行 1.8.0，也没有重新做握手、工具发现或 DesireCore 客户端验收；下文的 macOS 补测针对 1.7.0，不能视为 1.8.0 已运行验收。

Both 1.8.0 wheels were downloaded from PyPI, matched their published digests and sizes, and were read as ZIP data without import or execution. The implementation sources are byte-identical to the v1.8.0 release commit, and the CLI wrapper remains metadata-only with an unchanged entry point. LICENSE and NOTICE are byte-identical to the release commit and unchanged from 1.7.0 (Apache-2.0); only the dist-info evidence paths moved. Python 3.10 is no longer supported. The wrapper now declares 83 exact-version requirements (tomli removed; the listed dependency bumps). Code changes cover a retryable error for unresolved tools in read-only mode, forwarding of host experimental/extension capabilities during `initialize`, and enforced HTTPS endpoints except for loopback. The launch flags used by this entry are unchanged. 1.8.0 was not executed; the macOS runtime acceptance below applies to 1.7.0 only.

## 制品与许可（1.7.0 初次收录）/ Artifacts and license (initial 1.7.0 listing)

| 项目 / Item | 证据 / Evidence |
| --- | --- |
| CLI 发行包 / CLI distribution | [PyPI 1.7.0 元数据](https://pypi.org/pypi/mcp-proxy-for-aws-cli/1.7.0/json) |
| CLI wheel | [固定下载 / fixed download](https://files.pythonhosted.org/packages/5d/ec/2faa62a1c8186966d73b4d3069d7098f08e1891b2f5141dd7bcf135c3561/mcp_proxy_for_aws_cli-1.7.0-py3-none-any.whl) |
| CLI wheel SHA-256 | `75f990fc5cab688bba31b67fb6a01832b64f7f097c94503877012c6595f0836e`，7321 字节 / bytes |
| CLI 上传时间 / uploaded | `2026-09-15T11:20:51.587229Z`；sidecar 以秒精度保存 |
| 实现包 / implementation | [PyPI 1.7.0 元数据](https://pypi.org/pypi/mcp-proxy-for-aws/1.7.0/json) |
| 实现 wheel / implementation wheel | [固定下载 / fixed download](https://files.pythonhosted.org/packages/73/df/04a7dba8d3ed744daff2783b220e9239969f0e0714266c52f0ced8d4ebf2/mcp_proxy_for_aws-1.7.0-py3-none-any.whl) |
| 实现 wheel SHA-256 | `d7e6c8f45ef89303cb48822e25f91c0234bb28ee987ebb56615cd16a5d044a1b`，45971 字节 / bytes |
| 上游发布代码 / release source | tag `v1.7.0`，提交 [`22f1b3f8b7c4ef37112114b4af3d6c5a6c0a83bb`](https://github.com/aws/mcp-proxy-for-aws/tree/22f1b3f8b7c4ef37112114b4af3d6c5a6c0a83bb) |

实际下载两个 wheel，分别核对其 SHA-256、大小和 PyPI 元数据；初始静态审查只用 ZIP 读取发行元数据和相关源文件，未导入或执行包；后续运行补测见文末。CLI 的 entry point 为 `mcp-proxy-for-aws-cli = mcp_proxy_for_aws.server:main`；它本身没有 Python 实现模块，由固定 `mcp-proxy-for-aws==1.7.0` 提供。启动参数的 `--from` 与 `--with` 分别使用上述两份带 `#sha256=` 的固定 URL。

Sidecar 的 `provenance.content.url` 使用 PyPI 包主页标识包身份，版本由 `ref=1.7.0` 单独固定，不是主页 HTML 的摘要；`sha256` 对应所列 CLI wheel 字节。内容根为 wheel ZIP 根，因此许可证与通知路径分别为：

- `mcp_proxy_for_aws_cli-1.7.0.dist-info/licenses/LICENSE`
- `mcp_proxy_for_aws_cli-1.7.0.dist-info/licenses/NOTICE`

这两个文件已读取，分别与发布提交根 LICENSE/NOTICE 字节相同，许可证为 Apache-2.0。实现包也保留相应声明。`compliance.reviewedRef` 与 `provenance.content.ref` 都是 `1.7.0`，审核日期与 timestamps 一致。v1.7.0 发布代码中的 `cli.py`、`middleware/tool_filter.py` 与实现 wheel 对应文件也逐字节相同。不要用后续 main 分支代码替代发布包事实。

Both wheels were downloaded and matched their PyPI SHA-256/size metadata. The initial static review inspected ZIP data without import or execution; subsequent runtime acceptance is recorded below. The wrapper entry point delegates to the pinned implementation. The sidecar hash identifies the CLI wheel, while the implementation hash is additionally enforced in the launch definition and recorded here. License evidence paths are relative to the wheel archive root; its Apache-2.0 LICENSE/NOTICE match the release source. Ref-bound review and release argument/filter files were checked against published bytes, not assumed from current main.

CLI 元数据有 84 条带精确版本、部分带平台条件的运行依赖声明。固定版本不等于审核全部第三方制品、PyPI 账户、签名或供应链证明；本轮没有完成那些验证。依赖、Python 和 uv 各适用其许可；Apache-2.0 不授予 AWS 托管服务或其他商业服务使用权。仓库不复制发行包、Python 实现、SDK、凭据或本机验收原始数据。

The wrapper declares 84 exact-version runtime requirements, some conditional. This does not verify every dependency artifact, publisher, signature or supply-chain attestation. External dependencies retain their own licenses; Apache-2.0 does not license AWS services. No runtime artifacts or credentials are vendored.

## 参数、认证和行为 / Arguments, authentication and behavior

- 固定发行包实际支持 `--read-only`、`--disable-telemetry`、`--metadata` 和 `--profile`；它没有通用 `--version` 开关。初始审查仅静态检查参数；后续 macOS 补测实际运行了该启动定义。
- `--read-only` 按远端 `readOnlyHint=true` 过滤工具列表，并在具有 FastMCP 上下文的调用路径检查注解；不能作为 IAM 策略、服务端授权或完整沙箱保证。远端工具注解与清单可能变化，故不登记工具数量，不承诺所有只读 AWS API 都可经此模式调用。
- 本地 stdio 与远端 AWS 认证是两层。本条目实际选择 SigV4，不能把 stdio 无独立 API key 解读为 AWS 匿名访问。当前 sidecar 的 authType 枚举没有 SigV4，因此保留 `unknown` 并在双语描述和安装/使用说明中准确披露；不冒充 `none`、Bearer 或已验收的 OAuth，也不为单条登记修改 Schema。
- 上游另有匿名文档检索和直接 OAuth 流程；默认参数既不加 `--skip-auth`，也不配置 OAuth，用户须先在私有环境确认凭据。缺凭据或权限时停止，不自动改认证方式、扩大 IAM 权限或移除只读模式。
- `--disable-telemetry` 只关闭代理可选遥测，不阻止 HTTPS 数据流、AWS 认证、CloudTrail 或服务监控。默认 MCP 端点与操作区域均明确为 us-east-1，二者作用不同，使用前须确认。

The release supports the declared flags, but no generic --version option. Read-only behavior depends on upstream annotations and is not an IAM/security boundary. Local stdio and remote authentication are separate. The schema has no SigV4 enum, so authType remains unknown with explicit textual disclosure rather than a false none/Bearer/OAuth claim. There is no anonymous or permission-elevation fallback. Optional proxy telemetry suppression does not suppress AWS data transfer or audit logging.

## 官方接入与服务条款 / Official setup and terms

- [AWS MCP 设置、认证方案、端点与区域](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/getting-started-aws-mcp-server.html)
- [AWS MCP 能力与文档查询边界](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/mcp-server.html)
- [IAM 认证与最小权限](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/security-iam.html)
- [IAM 工作机制](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/security_iam_service-with-iam.html)
- [官方端点与配额](https://docs.aws.amazon.com/general/latest/gr/aws-mcp.html)
- [工具包计费说明](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/what-is-agent-toolkit.html)
- [AWS Customer Agreement](https://aws.amazon.com/agreement/) 与 [AWS Service Terms](https://aws.amazon.com/service-terms/)
- [uv 工具运行与来源说明](https://docs.astral.sh/uv/guides/tools/)

于审核日读取官方文档；这些持续更新的远端服务页面不代表固定后端软件。AWS 文档称工具包/MCP 服务没有额外费用，云资源使用仍按标准定价计费，不能宣传为所有操作免费。需遵守账户/组织的合同、区域、配额、数据处理与授权要求；安装本条目不会提供它们。

Official service documentation was checked on the review date, but does not pin the managed backend. No additional toolkit/MCP fee does not make all resource usage free. Account/organization terms, regions, quotas, data handling and authorization remain prerequisites.

## macOS 补测（1.7.0）/ macOS runtime acceptance for 1.7.0 (2026-10-25)

- 在独立 Python 3.12.13、uv 0.11.2 环境使用本条目的真实 uvx 定义；两份 wheel 仍按 URL 与 SHA-256 固定，实际安装 76 个符合本平台条件的包。
- 显式空 AWS config/credentials、空登录缓存、禁用 IMDS，子进程环境采用白名单；没有读取真实 AWS 凭据或登录账户。
- 默认签名定义在 initialize 阶段明确返回 `No AWS credentials available`，这是缺凭据负向用例通过，不是 SigV4 授权成功。
- 在仅本轮独立测试变体中加 `--skip-auth`，继续保留 `--read-only`、`--disable-telemetry`；initialize 和完整 tools/list 成功，真实返回 6 个唯一工具。以 `AWS Lambda function timeout troubleshooting` 检索，返回 3 条公开结果，并成功读取其中一篇 AWS re:Post 文档；两次调用 `isError=false`。未调用账户业务工具。
- DesireCore 10.0.187 的独立 macOS GUI 实测发现并修正了包身份 URL 兼容性：当前 dev 会把版本化 PyPI URL 的 `/1.7.0/` 一并当成包名，真实一致性函数返回 `acquisition.source` 不匹配。改用包主页后同一函数通过，真实客户端从“仅收录”恢复“可接入”，可选择本机并发起带精确来源/快照的接入任务。`ref`、审核版本、两个 wheel URL/摘要和默认认证参数均未放宽。
- 另通过正在运行的 DesireCore 实例真实 `/api/mcp/test-connection` owner 复验：默认空凭据返回 HTTP 500 和明确缺凭据信息；匿名只读变体返回 HTTP 200、`status=connected`、6 个工具。该临时连接测试由真实客户端后端执行，不是 mock，也没有手写安装锁或成功状态；持久登记、宿主任务的完整安装及账户业务需分别验收。未进行 AWS 登录、真实凭据读取、账户业务、资源创建或 Windows/Linux 实测；没有运行本地全量测试或全量 typecheck。直接相关校验器单文件 16 项通过，目录校验通过。
- 单独匿名测试变体经正常 `/api/agents/:id/mcp-servers` owner 接入测试 Agent；实际工具组装返回 6 个 MCP 工具。随后在真实 GUI 对话指定公开文档查询，经过正常工具审批完成调用；运行回执显示 `DiscoverTools` 和真实 MCP 查询均 success，返回 3 条 URL 与独立探针一致。这是匿名变体的客户端集成通过，不是默认 SigV4 账户接入通过。
- 仍有明确 GUI 限制：市场安装委派任务在准备阶段停止后，持久记录仍是 `status=installing`，资源卡片的来源标签却显示“已安装”，详情为“离线”。实际点击“测试连接”能显示缺凭据错误；没有把这一默认安装记为成功。此主仓库显示/任务收尾问题不在本目录 PR 中修复。


The pinned proxy was executed on isolated macOS/Python 3.12.13 with uv 0.11.2 and 76 platform-applicable packages. Explicit empty AWS credential/config/login-cache paths and disabled IMDS prevented use of real AWS credentials. Default signed initialization reported missing credentials as expected. A separate, authorized unsigned read-only variant initialized, discovered six unique tools, searched public Lambda documentation and read one returned document, with both calls returning `isError=false`. No account operations were invoked.

A real DesireCore 10.0.187 catalog test exposed the versioned-PyPI-URL identity mismatch also present in current dev. Using the package homepage plus the unchanged version ref and wheel hashes restored the connectable entry and exact-source task launch. The running DesireCore instance’s real MCP connection-test owner also returned the expected missing-credentials failure in default mode and HTTP 200 / connected / six tools for the temporary public variant. A separate public test variant was then registered to an Agent through the normal configuration owner. Its six tools were assembled by the real runtime, and a GUI chat performed the approved MCP search with a successful tool audit and three matching public URLs. Default signed installation is still incomplete: a stopped installation leaves an installing record whose Resources origin label says installed, while details remain offline; the real test-connection button correctly displays the missing-credentials error. That main-repository UI/lifecycle limitation is not fixed by this catalog PR. No SigV4 account access, all-tool readiness, security certification or Windows/Linux acceptance is claimed. The directly related validator file passed 16 tests and catalog validation passed; no full test suite or full typecheck ran.
