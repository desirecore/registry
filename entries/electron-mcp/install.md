# 安装 Electron MCP

## 环境要求

- Node.js >= 18
- 目标 Electron 应用可以带 `--remote-debugging-port` 启动（见下方「让目标应用开放调试端口」）
- 首次拉包约 200MB+：该包依赖 `electron` 与 `playwright`（截图走 `chromium.connectOverCDP`），
  `npx` 冷启动可能需要数分钟。**不需要**额外执行 `npx playwright install`——它连接的是目标应用
  自带的 Chromium，不下载浏览器。

## 安装步骤

### 1. 生成截图加密密钥（必需）

`SCREENSHOT_ENCRYPTION_KEY` 是硬性前置：未设置、仍为默认值 `default-screenshot-key-change-me`、
或长度不足 32 字符时，截图工具直接抛错。

```bash
openssl rand -hex 32
```

条目的连接配置里用 `{{secrets.SCREENSHOT_ENCRYPTION_KEY}}` 引用该值，因此需要把生成结果写入
`~/.desirecore/config/secrets.json`：

```json
{
  "SCREENSHOT_ENCRYPTION_KEY": "<上一步生成的 64 位十六进制字符串>"
}
```

未配置时连接会明确报错提示缺失的 secret，不会静默降级。

### 2. 让目标应用开放调试端口

MCP 通过 Chrome DevTools Protocol (CDP) 连接，目标应用必须显式开放端口：

```bash
# 开发态：直接给 electron 传参
electron . --remote-debugging-port=9222

# 打包应用：多数框架同样接受该参数
/Applications/YourApp.app/Contents/MacOS/YourApp --remote-debugging-port=9222
```

如果应用在主进程里用 `app.commandLine.appendSwitch('remote-debugging-port', ...)` 控制，
就按该应用自身的开关（常见做法是仅在非打包态开启）来启用。

**端口不是任意的。** v1.5.0 的端口扫描列表在代码中硬编码，且**不读取任何环境变量**：

```text
9222 9223 9224 9225
9200 9201 9202 9203 9204 9205
9300 9301 9302 9303 9304 9305
9400 9401 9402 9403 9404 9405
```

端口落在列表之外（例如自动分配到 9226）时，MCP 完全发现不到该应用，四个工具全部不可用。
此时只能改用直连 CDP（见 `usage.md`）。

### 3. 安全提示

CDP 协议**没有任何鉴权**，开放端口等于把渲染进程的完整控制权交给能访问该端口的任何人。

- 端口必须绑定 `127.0.0.1`（Electron 默认行为），不要监听 `0.0.0.0`
- 生产/最终用户环境不要常开该端口
- 用 SSH 隧道远程调试时，本地转发端口必须先确认空闲——被占用时 `ssh -L` 可能只绑到 IPv6
  而 `bind: Address already in use` 混在 stderr 里被忽略，后续请求会**静默打到本机的另一个
  实例上**。动作前先 `curl http://127.0.0.1:<port>/json/version` 核对 `User-Agent` 是不是目标机器

## 验证

启动目标应用后：

```bash
# 1. 确认 CDP 端口活着，并核对连上的确实是目标应用
curl -s http://127.0.0.1:9222/json/version

# 2. 确认 MCP 本身可启动
npx -y electron-mcp-server@1.5.0 --help
```

接入 MCP 客户端后，调用 `get_electron_window_info` 应返回窗口标题与 URL。
