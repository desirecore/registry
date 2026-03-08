# 安装 LobeChat

LobeChat 是一个开源的现代设计 ChatGPT/LLM UI 框架，支持多模型服务提供商（OpenAI / Claude / Gemini / Ollama 等），多模态和可扩展的插件系统。一键免费部署私有 ChatGPT/Claude 应用。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 1GB
- 磁盘空间：≥ 3GB
- 端口：3210

## 安装方式
使用 `docker` 部署。

### 步骤
1. 拉取 Docker 镜像并启动容器：
```bash
docker run -d -p 3210:3210 --name lobechat lobechat/lobechat:latest
```

## 配置项
- Docker 运行环境
- OpenAI API Key（可选）

## 验证
访问 `http://localhost:3210` 确认服务已启动。
