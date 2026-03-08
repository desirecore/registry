# 安装 Dify

Dify 是一个开源的 LLM 应用开发平台，提供从 Agent 构建到 AI Workflow 编排、RAG 检索、模型管理等能力，轻松构建和运营生成式 AI 原生应用。支持数百种模型接入。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 4GB
- 磁盘空间：≥ 10GB
- 端口：3000, 5001

## 安装方式
使用 `docker-compose` 部署。

### 步骤
1. 克隆项目仓库或下载 docker-compose.yml
2. 根据需要修改 `.env` 配置文件
3. 启动服务：
```bash
docker compose up -d
```

## 配置项
- Docker 运行环境
- OpenAI API Key（可选）

## 验证
访问 `http://localhost:3000` 确认服务已启动。
