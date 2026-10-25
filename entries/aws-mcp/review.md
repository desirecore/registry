# AWS MCP 收录核验 / Listing review

审核日期：2026-10-25；收录维护者：mashagua。独立 community 条目，维护者不标为 verified，`upstreamEndorsed=false`。AWS 名称仅用于指称来源，使用通用 cloud 图标，不复制 AWS 标志。`installable` 表示符合目录来源和治理条件，不等于已安装、连接就绪、账户已授权或通过安全认证。

Reviewed on 2026-10-25 by mashagua. Independent community listing, unverified maintainers, no upstream endorsement, nominative naming and a generic icon. Installable catalog evidence is not installation, readiness, account permission or software safety certification.

## 制品与许可 / Artifacts and license

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

实际下载两个 wheel，分别核对其 SHA-256、大小和 PyPI 元数据；只用 ZIP 读取发行元数据和相关源文件，未导入或执行包。CLI 的 entry point 为 `mcp-proxy-for-aws-cli = mcp_proxy_for_aws.server:main`；它本身没有 Python 实现模块，由固定 `mcp-proxy-for-aws==1.7.0` 提供。启动参数的 `--from` 与 `--with` 分别使用上述两份带 `#sha256=` 的固定 URL。

Sidecar 的 `provenance.content.url` 是版本化 PyPI 包身份，不是主页 HTML 的摘要；`sha256` 对应所列 CLI wheel 字节。内容根为 wheel ZIP 根，因此许可证与通知路径分别为：

- `mcp_proxy_for_aws_cli-1.7.0.dist-info/licenses/LICENSE`
- `mcp_proxy_for_aws_cli-1.7.0.dist-info/licenses/NOTICE`

这两个文件已读取，分别与发布提交根 LICENSE/NOTICE 字节相同，许可证为 Apache-2.0。实现包也保留相应声明。`compliance.reviewedRef` 与 `provenance.content.ref` 都是 `1.7.0`，审核日期与 timestamps 一致。v1.7.0 发布代码中的 `cli.py`、`middleware/tool_filter.py` 与实现 wheel 对应文件也逐字节相同。不要用后续 main 分支代码替代发布包事实。

Both wheels were downloaded and matched their PyPI SHA-256/size metadata. They were inspected as ZIP data without import or execution. The wrapper entry point delegates to the pinned implementation. The sidecar hash identifies the CLI wheel, while the implementation hash is additionally enforced in the launch definition and recorded here. License evidence paths are relative to the wheel archive root; its Apache-2.0 LICENSE/NOTICE match the release source. Ref-bound review and release argument/filter files were checked against published bytes, not assumed from current main.

CLI 元数据有 84 条带精确版本、部分带平台条件的运行依赖声明。固定版本不等于审核全部第三方制品、PyPI 账户、签名或供应链证明；本轮没有完成那些验证。依赖、Python 和 uv 各适用其许可；Apache-2.0 不授予 AWS 托管服务或其他商业服务使用权。仓库不复制发行包、Python 实现、SDK、凭据或本机验收原始数据。

The wrapper declares 84 exact-version runtime requirements, some conditional. This does not verify every dependency artifact, publisher, signature or supply-chain attestation. External dependencies retain their own licenses; Apache-2.0 does not license AWS services. No runtime artifacts or credentials are vendored.

## 参数、认证和行为 / Arguments, authentication and behavior

- 固定发行包实际支持 `--read-only`、`--disable-telemetry`、`--metadata` 和 `--profile`；它没有通用 `--version` 开关。参数代码仅静态检查，未实际运行。
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

## 验证边界 / Validation scope

本轮执行目录/Schema/sidecar 校验、直接相关的单文件校验器测试及制品/参数一致性检查；未执行上游 Python 代码、AWS 登录、凭据读取、真实 MCP 握手或 tools/list、业务工具调用、DesireCore 安装、桌面 GUI 或跨平台功能测试。未运行本地全量测试或全量 typecheck。本条目不声称业务可用性或完整安全认证。

Validation covers catalog/schema/sidecar contracts, a directly relevant single-file validator test and artifact/argument consistency. No upstream Python execution, AWS sign-in/credential access, live MCP initialization/tool listing, business tool call, DesireCore installation/GUI or cross-platform acceptance was performed. No local full suite or full typecheck was run. Runtime readiness and complete security certification are not claimed.
