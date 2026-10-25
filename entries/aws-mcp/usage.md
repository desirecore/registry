# AWS MCP 使用 / Usage

先阅读 [安装说明](install.md) 和 [来源核验](review.md)。本条目通过 AWS 官方代理连接托管服务；它不是本地 AWS 模拟器，不包含账户、云资源、配套技能或其他宿主插件。默认只读模式不保证所有账户 API 都可用。

Read installation and review notes first. This is a proxy to a managed service, not a local AWS emulator, account, cloud deployment, skill bundle or host plugin. Default read-only mode does not guarantee availability of every account API.

## 默认连接定义 / Default connection

```json
{
  "transport": "stdio",
  "command": "uvx",
  "args": [
    "--from",
    "mcp-proxy-for-aws-cli @ https://files.pythonhosted.org/packages/5d/ec/2faa62a1c8186966d73b4d3069d7098f08e1891b2f5141dd7bcf135c3561/mcp_proxy_for_aws_cli-1.7.0-py3-none-any.whl#sha256=75f990fc5cab688bba31b67fb6a01832b64f7f097c94503877012c6595f0836e",
    "--with",
    "mcp-proxy-for-aws @ https://files.pythonhosted.org/packages/73/df/04a7dba8d3ed744daff2783b220e9239969f0e0714266c52f0ced8d4ebf2/mcp_proxy_for_aws-1.7.0-py3-none-any.whl#sha256=d7e6c8f45ef89303cb48822e25f91c0234bb28ee987ebb56615cd16a5d044a1b",
    "mcp-proxy-for-aws-cli",
    "https://aws-mcp.us-east-1.api.aws/mcp",
    "--read-only",
    "--disable-telemetry",
    "--metadata",
    "AWS_REGION=us-east-1"
  ]
}
```

上方 command/args 与本目录 manifest 的 install 和 connection 一致，两个 wheel 都通过 URL 摘要固定。由 DesireCore 管理时使用其服务安装/连接流程和精确目录来源，不把示例直接写入其他客户端，也不覆盖现有配置。本机 uvx 的绝对路径、用户 Profile、账户与区域属于私有运行配置，不写入公共目录。

The definition matches both install and connection in the manifest, pinning both wheels by URL hash. Use DesireCore’s governed service flow and exact catalog source; do not overwrite other clients or existing configurations. Absolute executable paths, profiles, accounts and user-selected Regions belong to private runtime configuration.

本地 stdio 不要求填写 API key，但远端使用用户选择的 AWS 身份做 SigV4。启动前先让用户确认可用的本地凭据链，例如其已授权的 AWS Profile/SSO；不要自动读取凭据内容、遍历其他账户或把身份输出粘贴到对话。凭据过期、IAM 拒绝或服务不可达时，报告具体阻碍并停止受影响操作，不通过去掉只读、换账户、附加管理员权限或改认证方式来制造“成功”。

Local stdio does not require an API key field, but the upstream request is SigV4-authenticated with the identity the user selects. Confirm the approved credential chain privately before starting. Do not read credential contents, enumerate unrelated accounts or paste identity output into chat. Report expired credentials, access denial and connectivity errors without changing accounts, permissions or authentication to manufacture success.

## 区域、能力与只读范围 / Region and read-only scope

- `https://aws-mcp.us-east-1.api.aws/mcp` 选择 MCP 服务端点；`--metadata AWS_REGION=us-east-1` 选择 AWS 操作默认区域。访问其他区域资源前需用户确认并调整私有配置，不能因为宿主在某地就猜测资源区域。端点替换以 [AWS 官方端点清单](https://docs.aws.amazon.com/general/latest/gr/aws-mcp.html) 为准。
- `--read-only` 依据远端的 `readOnlyHint=true` 展示工具并限制相应调用；未标注、可写或混合 API 工具可能被排除。读操作也可能产生资源或服务费用。此模式不能代替 IAM 最小权限和宿主工具审批，不是对远端工具实现的安全证明。
- 默认不传 `--skip-auth`。AWS 支持公开文档查询以及另一套直接 OAuth 接入，但这不等于本条目无需凭据即可操作账户，也不意味着本轮验收了 OAuth。仅当用户明确选择其他方案并完成客户端兼容性检查后，才在私有配置中调整，不静默降级。
- 远端工具清单会变化，需实际 `initialize`、`notifications/initialized` 和 `tools/list`（含分页）后才能得知本次能力。进程启动、工具被列出、IAM 允许和业务执行成功分别验证；不要把某一步成功泛化成全部成功。
- `--disable-telemetry` 关闭代理的可选遥测，不会关闭到 AWS 的 HTTPS、认证、请求参数传输或 AWS 审计日志。CloudTrail/CloudWatch 等实际采集、保留和费用按账户配置与服务要求核对。

The endpoint Region and operational default Region are distinct. Confirm both rather than guessing from host location. Read-only annotation filtering may exclude mixed-operation tools and does not replace IAM, host consent or cost review. Anonymous documentation and direct OAuth are separate flows, not implicit fallbacks. Discover actual capabilities after initialization and paginated tool listing. Process startup, tool discovery, permission and task success are separate checks. Disabling optional proxy telemetry does not disable AWS traffic, authentication or audit logging.

## 可提出的需求示例 / Example requests

以下是用户可提出的任务，不是安装后自动执行的操作；需以本次实际发现的只读工具为准，工具缺失时说明并停止：

- “查找 Lambda 超时排查的 AWS 官方文档，列出依据，先不要访问我的账户。”
- “对照官方服务资料解释 S3 与 EFS 的适用场景，只给建议，不创建资源。”
- “先说明完成我这个任务需要哪些 AWS 账户权限、区域和可能的费用；暂不调用账户 API。”

These are optional user requests, not automatic actions: find official Lambda timeout guidance without account access; compare S3 and EFS without provisioning; or explain required permissions, Regions and likely charges before any account API call. Use only tools actually available in this connection and report missing capabilities.

如要创建/删除资源、调整 IAM、上传数据、发送消息、切换流量、执行脚本或产生费用，先确认目标、授权、影响范围、成本和恢复/清理方案，再根据任务核对依赖与权限。不得为绕过默认限制直接去掉 `--read-only`；需要写能力时先让用户明确授权并使用宿主支持的受治理配置流程。不得以连接检查为由执行这些动作。

Provisioning/deletion, IAM changes, uploads, messaging, traffic changes, script execution and chargeable work require explicit target/scope/cost/recovery authorization and per-task dependency checks. Do not silently remove read-only mode. Use the host’s governed configuration flow if authorized write capability is needed; connection checks alone never authorize these operations.

## 条款、成本和数据边界 / Terms, costs and data handling

代理采用 Apache-2.0，不包含 AWS 或第三方服务的使用许可。根据 [AWS 工具包计费说明](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/what-is-agent-toolkit.html)，工具包/MCP 服务本身没有额外费用；资源、API 使用引起的资源成本、模型、存储、流量、日志和第三方服务仍可能收费，按各服务价格、配额及用户合同核对。不承诺所有查询、只读调用或所谓免费额度都免费。

The Apache-2.0 proxy license does not license AWS or other services. AWS documents no additional toolkit/MCP service charge, while resource use, models, storage, traffic, logging and external providers can still incur their applicable costs and quotas. Do not promise that every read or free-tier usage is free.

请求参数、业务内容及操作可能传到 AWS，并进入相应服务或组织配置的日志；DesireCore 宿主模型的数据处理边界也需遵守。仅处理用户授权的账户和数据；不得将凭据、私有账户信息、资源标识、业务数据或完整日志提交到公共目录、PR 或截图。适用 [AWS Customer Agreement](https://aws.amazon.com/agreement/)、[AWS Service Terms](https://aws.amazon.com/service-terms/)、组织合同与各依赖许可。

Request parameters and business content can reach AWS and configured logs; the host model’s data boundary also applies. Operate only on authorized accounts/data. Never publish credentials, private account/resource identifiers, business data or raw logs in the catalog, PR or screenshots. AWS agreements, organizational terms and dependency licenses remain applicable.

本次未执行上游代码、读取 AWS 凭据、登录、真实握手或业务工具调用，也未做 DesireCore GUI/跨平台验收。来源与目录核验记录见 [review.md](review.md)；不能把这些记录当作你的连接或业务已验证。

This listing review did not execute upstream code, read credentials, sign in, perform a live handshake/tool call or test DesireCore GUI/cross-platform functionality. Catalog evidence does not establish readiness for your connection or task.
