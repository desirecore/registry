# 安装 Open WebUI

Open WebUI 是一个可扩展的自托管 AI 界面，支持完全离线操作。支持多种 LLM 运行器，包括 Ollama 和 OpenAI 兼容 API，内置 RAG 集成、网页浏览、代码执行等功能。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 2GB
- 磁盘空间：≥ 5GB
- 端口：8080

## 安装方式
使用 `docker` 部署。

### 步骤
1. 拉取 Docker 镜像并启动容器：
```bash
docker run -d -p 8080:8080 --name open-webui open-webui/open-webui:latest
```

## 配置项
- Docker 运行环境
- Ollama 或 OpenAI API Key

## 验证
访问 `http://localhost:8080` 确认服务已启动。
