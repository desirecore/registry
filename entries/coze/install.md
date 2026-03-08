# 安装 Coze

Coze 是一个 AI 聊天机器人和应用开发平台，提供 LLM、知识库、插件和工作流等能力。支持快速构建、测试和部署 AI Bot，无需编程经验。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 4GB
- 磁盘空间：≥ 8GB
- 端口：8800

## 安装方式
使用 `docker` 部署。

### 步骤
1. 拉取 Docker 镜像并启动容器：
```bash
docker run -d -p 8800:8800 --name coze coze/coze:latest
```

## 配置项
- Docker 运行环境
- API Key 配置

## 验证
访问 `http://localhost:8800` 确认服务已启动。
