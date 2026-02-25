# DesireCore Registry

DesireCore 官方应用商店与服务注册表数据仓库。

## 目录结构

```
.
├── README.md                    # 本文件
├── SCHEMA_VERSION               # 数据格式版本（2.0.0）
├── manifest.json                # 仓库元数据
├── apps/
│   └── index.json               # StoreApp[] 应用列表（含 install 字段）
├── mcp/
│   └── index.json               # RegisteredService[] MCP 服务（含 install + connection）
├── services/
│   └── index.json               # RegisteredService[] HTTP 服务
├── models/
│   ├── descriptors.json         # ServiceDescriptor[] 模型能力描述符
│   └── categories.json          # ServiceCategoryDescriptor[] 模型分类
└── ui-config/
    ├── app-categories.json      # 应用分类配置
    └── service-status.json      # 服务状态 UI 配置
```

## 数据格式

所有 JSON 文件遵循 DesireCore 定义的 JSON Schema：

- `apps/index.json` → `StoreApp` schema（含 `install`）
- `mcp/index.json` → `RegisteredService` schema（含 `install` + `connection`）
- `services/index.json` → `RegisteredService` schema
- `models/descriptors.json` → `ServiceDescriptor` schema
- `models/categories.json` → `ServiceCategoryDescriptor` schema

## 同步策略

DesireCore 客户端会：

1. 启动时检查本地缓存（2 分钟 TTL）
2. 缓存过期时 `git fetch` 检查更新
3. 有更新时 `git pull` 并重建索引
4. 离线时使用本地缓存或内置 fallback 数据

## 贡献指南

1. Fork 本仓库
2. 修改相应的 JSON 文件
3. 提交 PR 并描述变更内容
4. 等待审核合并

## 镜像

- GitHub（主）: https://github.com/desirecore/registry.git
- git.hxr.so（镜像）: https://git.hxr.so/desirecore/registry.git
