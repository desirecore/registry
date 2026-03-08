# 安装 n8n

n8n 是一个可扩展的工作流自动化工具。使用公平代码许可，拥有原生 AI 能力，可以连接任何东西。支持自托管，提供丰富的第三方服务集成节点。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 2GB
- 磁盘空间：≥ 5GB
- 端口：5678

## 安装方式
使用 `docker` 部署。

### 步骤
1. 拉取 Docker 镜像并启动容器：
```bash
docker run -d -p 5678:5678 --name n8n n8n/n8n:latest
```

## 配置项
- Docker 运行环境
- 数据库（SQLite / PostgreSQL）

## 验证
访问 `http://localhost:5678` 确认服务已启动。
