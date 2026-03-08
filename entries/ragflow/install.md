# 安装 RagFlow

RagFlow 是一款基于深度文档理解构建的开源 RAG 引擎。可以为各种规模的企业及个人提供流畅的 RAG 工作流，结合大语言模型（LLM）针对用户各类不同的复杂格式数据提供可靠的问答以及有理有据的引用。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 8GB
- 磁盘空间：≥ 20GB
- 端口：9380, 443, 80

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
- Elasticsearch / Infinity 数据库

## 验证
访问 `http://localhost:9380` 确认服务已启动。
