# DesireCore Registry

DesireCore 官方注册表仓库，包含可安装的应用、MCP 服务、HTTP API 服务，以及只用于发现和合规披露的第三方外部集成。

DesireCore 客户端启动时会克隆此仓库，并定期同步更新。用户在应用商店中看到的所有条目均来自此仓库。

## 目录结构

```text
.
├── README.md              # 本文件
├── SCHEMA_VERSION         # 数据格式版本号（当前 4.0.0）
├── manifest.json          # 仓库元数据（版本、统计、维护者）
├── package.json           # Registry 校验入口
├── schemas/               # legacy entry、仓库 manifest 与 catalog sidecar Schema
├── scripts/               # Registry v4 校验入口与回归测试
├── scripts/catalog/       # 零依赖离线 validator 与 node:test
├── entries/               # 🔑 所有注册表条目（统一格式）
│   ├── n8n/               # 示例：Docker 应用
│   │   ├── manifest.json  # 条目元数据（必需）
│   │   ├── catalog-metadata.v1.json # 统一目录元数据（迁移窗口内可选）
│   │   ├── install.md     # 安装说明（Agent 使用，可选）
│   │   └── usage.md       # 使用说明（Agent 使用，可选）
│   ├── playwright-mcp/    # 示例：MCP 服务
│   │   ├── manifest.json
│   │   ├── install.md
│   │   └── usage.md
│   ├── baidu-map/         # 示例：HTTP API（无需安装）
│   │   ├── manifest.json
│   │   └── usage.md
│   └── kimi-webbridge/    # external-integration：只允许 manifest.json
│       └── manifest.json
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
| `type` | string | ✅ | 条目类型：`docker-app` / `mcp` / `http-api` / `external-integration` |
| `version` | string | ✅ | 上游原始版本字符串；可为 SemVer、CalVer 或不透明版本 |
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

**第三方外部集成专属字段（`type: "external-integration"`）：**

Schema v4 的 external integration 是严格、失败关闭的目录指针，不是 `StoreApp`、安装事实、连接或 Browser Provider。当前只准入经过审核的 `kimi-webbridge` ID，并固定以下治理语义：

- `stewardship: "pointer"`
- `availability: "listing-only"`
- `redistribution: "source-pointer-only"`
- `branding.relationship: "independent-listing"`
- `branding.nameUsage: "nominative"`
- `branding.logoStatus: "not-used"`
- `admission.status: "blocked"`

条目还必须结构化披露上游维护者、完整官方 URL、浏览器扩展 ID、物理组件、扩展权限、独立 Profile 建议、WebBridge 本地链路与 DesireCore 模型 Provider 的不同数据边界、阻塞准入原因，以及固定版本 daemon 的 SHA-256 审核记录。

external integration 目录必须恰好包含一个常规文件 `manifest.json`。额外文件、目录、符号链接、设备节点、FIFO、Socket 或二进制制品全部被拒绝；因此它没有可被 Agent 当成安装指令执行的自由文本面。`sourceId` 和 `hasInstall` 仅由客户端从可信来源和目录事实注入，禁止写入上游 manifest。

### install.md（可选）

自然语言安装说明，供 DesireCore Agent 读取并执行安装流程。

内容应包含：

- 环境要求（Node.js 版本、Python 等）
- 安装步骤（可直接执行的命令）
- 验证方式

**不需要 install.md 的情况**：纯 HTTP API 服务（无需在本地安装）、通过关联应用附带安装的服务（如 dify-mcp 随 Dify 一起可用）。`external-integration` 明确禁止 `install.md`。

### usage.md（可选）

使用说明，描述安装后如何连接和使用此服务。

内容应包含：

- 连接配置（transport、command、URL 等）
- 配置示例（JSON 格式，可直接使用）
- 注意事项

`external-integration` 不允许 `usage.md` 或其他附加文件；所有用户可见披露必须是经过 Schema 约束的 manifest 字段。

### catalog-metadata.v1.json（迁移窗口内可选）

固定路径为 `entries/<id>/catalog-metadata.v1.json`，Schema 为
`schemas/catalog-metadata.v1.schema.json`。它给新客户端提供统一目录读模型所需的条目事实，
不会替换 `manifest.json`；旧客户端继续只读 legacy manifest，新客户端在 sidecar 缺失时也必须
回退到 legacy adapter。

Sidecar 只允许声明条目自身事实：

- `identity`：`app` / `service` 与来源内 ID。不得写 `sourceId` 或 `catalogSourceId`。
- `presentation`：默认语言和真实 i18n 文案。未翻译文本只能保留一个 locale，不能复制成伪双语。
- `release`：显式 `known` / `unknown`；已知时保留原始版本与 `semver` / `calver` / `opaque` 解释方式。
- `timestamps`：目录更新、内容发布、治理审核和上游观察时间相互独立；客户端同步时间不写入。
- `provenance.content`：内容上游及其不可变 ref/digest；Catalog 仓库来源由客户端受信上下文注入。
- `governance`：listing-only/installable、维护者、许可证、品牌和审核证据。
- `compatibility`：平台必须显式区分 `known` / `all` / `unknown`。
- `spec`：App 分类、入口类型与放置策略，或 Service 协议、鉴权类型、能力与工具数；安装命令、endpoint 和凭据不进入统一目录元数据。

示例（证据不足的条目必须失败关闭为 listing-only）：

```json
{
  "$schema": "../../schemas/catalog-metadata.v1.schema.json",
  "schemaVersion": 1,
  "identity": { "kind": "app", "id": "my-app" },
  "presentation": {
    "defaultLocale": "zh-CN",
    "i18n": {
      "zh-CN": { "name": "My App", "summary": "应用摘要" }
    },
    "tags": ["demo"]
  },
  "release": { "state": "known", "version": "1.0.0", "versionScheme": "semver" },
  "timestamps": {
    "catalogUpdatedAt": { "state": "unknown" },
    "releasePublishedAt": { "state": "unknown" },
    "reviewedAt": { "state": "unknown" },
    "upstreamObservedAt": { "state": "unknown" }
  },
  "provenance": {},
  "governance": {
    "availability": "listing-only",
    "license": { "state": "unknown" },
    "redistribution": "verify-package-terms"
  },
  "compatibility": { "platforms": { "state": "unknown" } },
  "spec": { "kind": "app", "category": "tools" }
}
```

`official` 不是条目可以自报的属性。即使本仓库由 DesireCore 维护，第三方应用或服务也不能因此
自动成为 DesireCore 官方内容。正文中的 `sourceId`、`catalogSourceId` 或 `official` 声明会被
validator 拒绝；受信 Provider 身份只能由客户端同步器注入。

只有同时具备 HTTPS 不可变内容来源、已知许可证、分发策略、双维护者身份、品牌依据以及绑定到
同一 ref 的审核记录时，`availability` 才能写 `installable`。Git 分支名、`latest`、浮动包版本或
缺少 SHA-256 的制品只能保持 `listing-only`。

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
  "shortDesc": "简短描述...",
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

新条目必须添加 `catalog-metadata.v1.json`。3.1 的全量迁移已经完成，根
`manifest.json#catalogMetadata.required` 为 `true`，CI 会阻断缺失 sidecar 的条目；
`legacyFallback` 继续保留，供尚未退出兼容窗口的旧客户端读取原始 manifest。

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
  "platformSupport": ["macos", "windows", "linux"],
  "endpoint": "https://api.example.com/v1",
  "capabilities": ["capability_1"]
}
EOF
```

HTTP API 通常不需要 install.md，只需 usage.md 说明如何调用。

### 添加第三方外部集成

external integration 不是开放的自助条目类型。新增 ID、URL、扩展 ID、组件或制品审核事实需要先修改严格 Schema、校验器与 DesireCore 客户端契约，并经过安全与合规 review；未知 ID 会失败关闭。请以 [`entries/kimi-webbridge/manifest.json`](entries/kimi-webbridge/manifest.json) 为唯一当前示例。

## 修改现有条目

1. 编辑 `entries/<id>/manifest.json` 中的字段
2. 如有安装/使用流程变更，同步更新 `install.md` / `usage.md`；external integration 不适用
3. **务必更新 `version` 字段**（客户端通过版本号判断是否有更新）
4. 新增或删除条目时同步更新根 `manifest.json#stats`
5. 执行 `npm ci && npm test`
6. 提交并创建 PR

## 版本规范

- `SCHEMA_VERSION`：数据格式版本，格式不兼容时递增主版本号
- `manifest.json#version`：仓库元数据版本，必须等于 `SCHEMA_VERSION`
- `manifest.json#dataVersion`：仓库数据版本，必须等于 `SCHEMA_VERSION`
- `entries/<id>/manifest.json#version`：条目自身版本

**Schema 版本历史：**

| 版本 | 说明 |
|------|------|
| 1.0.0 | 初始格式 — 单文件 JSON 数组 |
| 2.0.0 | 分散式目录 — apps/mcp/services 三目录，每个条目 `<id>/index.json` |
| 3.0.0 | 统一 entries/ 目录，manifest.json + install.md + usage.md |
| 4.0.0 | **当前** — Draft-07 严格判别 Schema、仓库校验和 listing-only external integration |

## 校验

```bash
npm ci
npm test
```

校验包含 JSON Schema、目录与 ID、全局唯一性、根版本、统计、来源注入字段、external 单文件布局、固定 Kimi ID、完整官方 URL、扩展 ID、组件/权限/准入集合、真实日历日期和不可变供应链审核记录。

Schema v4 同时保留 `catalog-metadata.v1.json` 统一目录 sidecar、strict validator 与 legacy fallback。

## 本地验证

本仓库的验证器只依赖 Node.js 22，不联网、不读取 Git 历史，也不会把当前时间伪造成目录事实：

```bash
# 逐条验证根 stats、目录 ID、legacy manifest 与全部 sidecar
node scripts/catalog/validate-registry.mjs --require-sidecars

# 机器可读报告
node scripts/catalog/validate-registry.mjs --json

# 正反 fixture 与当前目录兼容回归
node --test scripts/catalog/*.test.mjs
```

证据路径必须是安全相对路径，禁止绝对路径和 `..` 穿越。离线 validator 只证明字段结构、路径安全
和 ref/digest 一致性，不把网络不可达或未验证的远端事实伪造成通过。

## 同步机制

DesireCore 客户端的同步流程：

1. 启动时检查本地缓存（2 分钟 TTL）
2. 缓存过期时 `git fetch` 检查更新
3. 有新 commit 时 `git pull` 并重建本地索引
4. 离线时使用本地缓存或内置 fallback 数据

客户端读取 `entries/` 目录下所有 `manifest.json`，按 `type` 字段分类为应用、MCP 服务、HTTP 服务和第三方外部集成展示在商店中。旧三类条目的 `install.md` 和 `usage.md` 可供 AI Agent 执行安装和配置时使用；external integration 只有结构化 manifest，且 listing-only 条目不会被派生为 Docker 应用、installed-entry、ready 连接或 Browser Provider。

本仓库的 `scripts/validate-registry.mjs` 只服务 Registry 自身的 CI 与贡献者本地检查。主仓库
`npm run sync-registry` 把 checkout 视为待验证数据，使用主仓受审的固定 Schema、策略与 commit
门禁校验后再打包，**绝不执行本 checkout 携带的脚本**。两侧任一校验失败都不能生成新的
`defaults/registry.zip`。

`.gitattributes` 将所有文本固定为 LF；这是跨平台信任边界的一部分。主仓固定 authored Schema
与受审内容摘要，Windows checkout 不得把已审核的 JSON/Markdown 改写为 CRLF，否则运行时会
按哈希不匹配失败关闭整个官方 v4 目录。

## 贡献指南

1. Fork 本仓库
2. 在 `entries/` 下创建以 ID 命名的子目录
3. 按上述格式添加 `manifest.json`，旧三类按需添加 `install.md` 和 `usage.md`
4. 更新根目录 `manifest.json` 中的 `stats` 统计
5. 执行 `npm ci && npm test`
   并运行 `node --test scripts/catalog/*.test.mjs` 与 `node scripts/catalog/validate-registry.mjs --require-sidecars`
6. 提交 PR 并描述变更内容、来源和验证结果
7. 等待审核合并

external integration 需要额外安全、供应链、商标和隐私 review，不接受绕过严格 Schema 的未知 ID 或自由文本安装说明。

## 镜像

- GitHub（主）：https://github.com/desirecore/registry.git
- git.hxr.so（镜像）：https://git.hxr.so/desirecore/registry.git
