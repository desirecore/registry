# DesireCore Registry

DesireCore 官方注册表仓库，包含所有可安装的应用、MCP 服务和 HTTP API 服务。

DesireCore 客户端启动时会克隆此仓库，并定期同步更新。用户在应用商店中看到的所有条目均来自此仓库。

## 目录结构

```
.
├── README.md              # 本文件
├── SCHEMA_VERSION         # 数据格式版本号（当前 3.0.0）
├── manifest.json          # 仓库元数据（版本、统计、维护者）
├── entries/               # 🔑 所有注册表条目（统一格式）
│   ├── n8n/               # 示例：Docker 应用
│   │   ├── manifest.json  # 条目元数据（必需）
│   │   ├── install.md     # 安装说明（Agent 使用，可选）
│   │   └── usage.md       # 使用说明（Agent 使用，可选）
│   ├── playwright-mcp/    # 示例：MCP 服务
│   │   ├── manifest.json
│   │   ├── install.md
│   │   └── usage.md
│   └── baidu-map/         # 示例：HTTP API（无需安装）
│       ├── manifest.json
│       └── usage.md
├── models/                # 模型能力描述符与分类
│   ├── descriptors.json
│   └── categories.json
└── ui-config/             # UI 展示配置
    ├── app-categories.json
    └── service-status.json
```

## 条目格式

每个条目是 `entries/<id>/` 下的一个目录，目录名即条目 ID。

### manifest.json（必需）

条目元数据，供客户端渲染商店列表和详情页。

**公共字段（所有类型）：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识，与目录名一致 |
| `name` | string | ✅ | 显示名称 |
| `type` | string | ✅ | 条目类型：`docker-app` / `mcp` / `http-api` |
| `version` | string | ✅ | 语义版本号 |
| `description` | string | ✅ | 一行功能摘要 |
| `author` | string | | 作者或组织 |
| `tags` | string[] | | 搜索标签 |
| `icon` | string | | 图标（CSS 渐变或 Lucide icon 名） |
| `platformSupport` | string[] | | 支持平台：`macos` / `windows` / `linux` |

**Docker 应用专属字段（`type: "docker-app"`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `iconLetter` | string | 图标上显示的字母 |
| `category` | string | 应用分类：`ai-platform` / `chat` / `workflow` / `rag` / `tools` |
| `shortDesc` | string | 简短描述（列表页） |
| `fullDesc` | string | 详细描述（详情页） |
| `stars` | number | GitHub Stars 数量 |
| `githubUrl` | string | GitHub 仓库地址 |
| `install` | object | 安装配置（见下方） |

Docker 应用 `install` 结构：

```json
{
  "method": "docker",
  "requirements": {
    "docker": true,
    "minMemory": "2GB",
    "minDisk": "5GB",
    "ports": [5678]
  },
  "configNeeded": ["Docker 运行环境", "数据库（SQLite / PostgreSQL）"]
}
```

**MCP 服务专属字段（`type: "mcp"`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `capabilities` | string[] | 能力标签列表 |
| `toolCount` | number | 提供的工具数量 |
| `install` | object | 安装配置：`{ method, packageName, command, args, postInstall?, env? }` |
| `connection` | object | 连接配置：`{ transport, command?, args?, url? }` |
| `sourceAppId` | string | 关联的应用 ID（如 dify-mcp 关联 dify） |
| `sourceAppName` | string | 关联的应用名称 |

MCP `connection.transport` 取值：`stdio` / `streamable-http` / `sse`

**HTTP API 专属字段（`type: "http-api"`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `endpoint` | string | API 基础 URL |
| `capabilities` | string[] | 能力标签列表 |
| `sourceAppId` | string | 关联的应用 ID |
| `sourceAppName` | string | 关联的应用名称 |

### install.md（可选）

自然语言安装说明，供 DesireCore Agent 读取并执行安装流程。

内容应包含：
- 环境要求（Node.js 版本、Python 等）
- 安装步骤（可直接执行的命令）
- 验证方式

**不需要 install.md 的情况**：纯 HTTP API 服务（无需在本地安装）、通过关联应用附带安装的服务（如 dify-mcp 随 Dify 一起可用）。

### usage.md（可选）

使用说明，描述安装后如何连接和使用此服务。

内容应包含：
- 连接配置（transport、command、URL 等）
- 配置示例（JSON 格式，可直接使用）
- 注意事项

## 添加新条目

### 添加 Docker 应用

```bash
mkdir entries/my-app

# 1. 创建 manifest.json
cat > entries/my-app/manifest.json << 'EOF'
{
  "id": "my-app",
  "name": "My App",
  "type": "docker-app",
  "version": "1.0.0",
  "author": "Author",
  "description": "一行功能描述",
  "category": "tools",
  "tags": ["tag1", "tag2"],
  "icon": "linear-gradient(135deg, #3B82F6, #1D4ED8)",
  "iconLetter": "M",
  "platformSupport": ["macos", "windows", "linux"],
  "fullDesc": "详细描述...",
  "install": {
    "method": "docker",
    "requirements": {
      "docker": true,
      "minMemory": "2GB",
      "minDisk": "5GB",
      "ports": [8080]
    },
    "configNeeded": ["Docker 运行环境"]
  }
}
EOF

# 2. 创建 install.md（安装说明）
cat > entries/my-app/install.md << 'EOF'
# 安装 My App

## 环境要求
- Docker >= 20.10

## 安装步骤
1. 拉取镜像并启动容器：
```bash
docker run -d -p 8080:8080 --name my-app my-app:latest
```

## 验证
访问 http://localhost:8080 确认服务已启动。
EOF

# 3. 创建 usage.md（使用说明）
cat > entries/my-app/usage.md << 'EOF'
# 使用 My App

## 访问方式
浏览器打开 http://localhost:8080
EOF
```

### 添加 MCP 服务

```bash
mkdir entries/my-mcp

cat > entries/my-mcp/manifest.json << 'EOF'
{
  "id": "my-mcp",
  "name": "My MCP",
  "type": "mcp",
  "version": "1.0.0",
  "author": "Author",
  "description": "一行功能描述",
  "tags": ["tag1"],
  "icon": "terminal",
  "platformSupport": ["macos", "windows", "linux"],
  "capabilities": ["capability_1", "capability_2"],
  "toolCount": 5,
  "install": {
    "method": "npx",
    "packageName": "@my-org/my-mcp",
    "command": "npx",
    "args": ["-y", "@my-org/my-mcp"]
  },
  "connection": {
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@my-org/my-mcp"]
  }
}
EOF
```

### 添加 HTTP API 服务

```bash
mkdir entries/my-api

cat > entries/my-api/manifest.json << 'EOF'
{
  "id": "my-api",
  "name": "My API",
  "type": "http-api",
  "version": "1.0",
  "author": "Author",
  "description": "一行功能描述",
  "tags": ["tag1"],
  "icon": "globe",
  "endpoint": "https://api.example.com/v1",
  "capabilities": ["capability_1"]
}
EOF
```

HTTP API 通常不需要 install.md，只需 usage.md 说明如何调用。

## 修改现有条目

1. 编辑 `entries/<id>/manifest.json` 中的字段
2. 如有安装/使用流程变更，同步更新 `install.md` / `usage.md`
3. **务必更新 `version` 字段**（客户端通过版本号判断是否有更新）
4. 提交并创建 PR

## 版本规范

- `SCHEMA_VERSION`：数据格式版本，格式不兼容时递增主版本号
- `manifest.json#version`：仓库元数据版本
- `entries/<id>/manifest.json#version`：条目自身版本

**Schema 版本历史：**

| 版本 | 说明 |
|------|------|
| 1.0.0 | 初始格式 — 单文件 JSON 数组 |
| 2.0.0 | 分散式目录 — apps/mcp/services 三目录，每个条目 `<id>/index.json` |
| 3.0.0 | **当前** — 统一 entries/ 目录，manifest.json + install.md + usage.md |

## 同步机制

DesireCore 客户端的同步流程：

1. 启动时检查本地缓存（2 分钟 TTL）
2. 缓存过期时 `git fetch` 检查更新
3. 有新 commit 时 `git pull` 并重建本地索引
4. 离线时使用本地缓存或内置 fallback 数据

客户端读取 `entries/` 目录下所有 `manifest.json`，按 `type` 字段分类为应用、MCP 服务和 HTTP 服务展示在商店中。`install.md` 和 `usage.md` 供 AI Agent 执行安装和配置时使用。

## 贡献指南

1. Fork 本仓库
2. 在 `entries/` 下创建以 ID 命名的子目录
3. 按上述格式添加 `manifest.json`，按需添加 `install.md` 和 `usage.md`
4. 更新根目录 `manifest.json` 中的 `stats` 统计
5. 提交 PR 并描述变更内容
6. 等待审核合并

## 镜像

- GitHub（主）：https://github.com/desirecore/registry.git
- git.hxr.so（镜像）：https://git.hxr.so/desirecore/registry.git
