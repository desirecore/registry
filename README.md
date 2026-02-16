# DesireCore Registry

DesireCore 官方应用商店与服务注册表数据仓库。

## 目录结构

```
.
├── README.md                    # 本文件
├── SCHEMA_VERSION               # 数据格式版本
├── manifest.json                # 仓库元数据
├── apps/
│   └── apps.json                # StoreApp[] 应用列表
├── services/
│   ├── services.json            # RegisteredService[] 服务列表
│   ├── descriptors.json         # ServiceDescriptor[] 服务描述符
│   └── categories.json          # ServiceCategoryDescriptor[] 服务分类
└── ui-config/
    ├── app-categories.json      # 应用分类配置
    └── service-status.json      # 服务状态 UI 配置
```

## 数据格式

所有 JSON 文件遵循 DesireCore 定义的 JSON Schema：

- `apps/apps.json` → `StoreApp` schema
- `services/services.json` → `RegisteredService` schema
- `services/descriptors.json` → `ServiceDescriptor` schema
- `services/categories.json` → `ServiceCategoryDescriptor` schema

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
