# 安装 AnythingLLM

AnythingLLM 是一个全能型 AI 应用，可以将任何文档、资源或内容转化为上下文，供任何 LLM 在聊天中使用。支持多用户管理、权限控制和嵌入式对话。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 2GB
- 磁盘空间：≥ 5GB
- 端口：3001

## 安装方式
使用 `docker` 部署。

### 步骤
1. 拉取 Docker 镜像并启动容器：
```bash
docker run -d -p 3001:3001 --name anythingllm anythingllm/anythingllm:latest
```

## 配置项
- Docker 运行环境
- LLM API Key

## 验证
访问 `http://localhost:3001` 确认服务已启动。
