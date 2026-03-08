# 安装 OpenClaw

OpenClaw 是一个开源的 Agent 运行时平台，提供嵌入式运行时、会话管理、工具策略控制、多 Agent 编排、Sandbox 隔离执行等能力。支持流式输出、对话压缩、队列管理和 hooks 扩展，适合构建企业级 AI 应用。

## 环境要求
- Docker 已安装并运行
- 内存：≥ 4GB
- 磁盘空间：≥ 10GB
- 端口：8080, 3000

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
- Node.js 18+
- API Key 配置

## 验证
访问 `http://localhost:8080` 确认服务已启动。
