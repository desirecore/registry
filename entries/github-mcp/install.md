# 安装 GitHub MCP

## 环境要求
- Docker，且 Docker 服务正在运行
- 能拉取公开镜像 `ghcr.io/github/github-mcp-server`（拉取报错时多半是本机 `ghcr.io` 登录凭据过期，执行 `docker logout ghcr.io` 后重试）
- GitHub Personal Access Token

## 安装步骤

### 1. 准备访问令牌
在 GitHub 创建 Personal Access Token，只授予实际需要的仓库和权限，然后在启动 MCP 的环境中提供：

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=<your-token>
```

连接配置用 `-e GITHUB_PERSONAL_ACCESS_TOKEN` 把这个变量传进容器，令牌不写入镜像或条目文件。

### 2. 拉取镜像
```bash
docker pull ghcr.io/github/github-mcp-server
```

连接配置没有固定镜像标签，拉取的是上游最新发行版（目录核对时为 2.1.0）。需要固定版本时可改用 `ghcr.io/github/github-mcp-server:v2.1.0`。

## 验证
```bash
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server --help
```
