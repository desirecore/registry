# 使用 GitHub MCP

## 服务描述
代码仓库操作，支持 PR、Issue、代码搜索和仓库管理

## 连接方式
- **传输协议**：stdio
- **启动命令**：`docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server`

### 连接配置
```json
{
  "transport": "stdio",
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "-e",
    "GITHUB_PERSONAL_ACCESS_TOKEN",
    "ghcr.io/github/github-mcp-server"
  ]
}
```

## 可用能力
- `repo_read`
- `pr_manage`
- `issue_manage`
- `code_search`

2.1.0 的 README 为本地服务列出 **93** 个工具，按工具集分组。未指定工具集时只启用默认的 `context`、`repos`、`issues`、`pull_requests`、`users`，共 45 个；其余工具集需要在容器环境变量里设置 `GITHUB_TOOLSETS`，例如 `-e GITHUB_TOOLSETS="default,actions"`，设为 `all` 时全部启用。

只需要读取时可加 `-e GITHUB_READ_ONLY=1`，服务只提供只读工具，即使显式指定了写入工具也会跳过。

## 2.0 以来的变化
- 新增结构化输出和输出 Schema，只向声明支持 MCP 2026-07-28 及以上规范的客户端提供；旧版客户端的工具调用方式不变。
- Go 模块路径改为 v2，只影响把它当作 Go 库引用的项目，不影响容器使用。
- 2.0.3 修复了仓库资源 URI 的 UTF-8 编码问题；`get_file_contents` 遇到超过 1 MB 的文件时改为返回资源链接；`list_label` 支持游标分页。
- 2.1.0 新增两个实验性工具 `issue_artifact_read`、`issue_artifact_write`，用于读写 Issue 上附带的工件，需要开启 `issue_artifacts` 功能开关，未计入上面的工具数；另外修正了拉取请求列表中的合并状态，并拒绝不小于 2^63 的整数参数。
