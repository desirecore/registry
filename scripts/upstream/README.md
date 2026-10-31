# MCP 上游更新

`propose_mcp_updates.py` 默认只检查所有 MCP 条目并输出 JSON/Markdown 状态。npm 使用已声明包的 latest，PyPI 使用项目版本元数据；没有本地安装声明的远程服务标记 remote-managed；有本地安装声明的 HTTP/SSE 服务仍检查发行包，不因传输类型就当作托管服务，关联应用标记 app-managed，未配置可靠规则的交付形态标记 requires-version-feed。网络失败不等于已是最新。

`--publish` 仅在官方 Registry 使用触发用户身份，每次最多提出五个去重 PR，不覆盖已有候选，不自动合并。旧版本已经具备准入证据，且固定包、许可/第三方声明、结构化依赖、引擎和启动入口不变时，核验实际发布摘要和旧目录 SHA-256，生成明确机器身份、绑定新版本和摘要的审核记录；通过 Registry 两套校验后提交普通 PR。

许可、依赖或入口变化、版本相关实测说明、工具数量等不能自动判定时，只生成带原因的候选说明草稿，不改变旧 manifest、sidecar 或准入状态。不能把旧版本的运行验收继承到新版。自动核验不执行安装脚本、MCP 握手或业务工具，不代表安全认证。npm 签名和供应链认证未在此实现。

核验预算为下载 32 MiB、展开 128 MiB、单文件 16 MiB、5000 个文件，仅用于 CI 自动核验。制品只读，不解压到用户目录。Python 自动核验限唯一通用 wheel；平台 wheel、Docker/Go/二进制需要另外的固定制品规则，明确报告阻碍。

运行相关单文件：`python3 scripts/upstream/test_mcp_updates.py`、`node --test scripts/catalog/automated-mcp-review.test.mjs`。定时流程须合入 main，且仓库允许 Actions 创建 PR 后才生效。默认 GITHUB_TOKEN 创建 PR 不保证触发其它工作流，因此候选提交前执行目录校验，合并前仍确认必需检查。
