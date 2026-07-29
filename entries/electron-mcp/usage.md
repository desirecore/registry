# 使用 Electron MCP

## 服务描述

通过 Chrome DevTools Protocol 操控**本机正在运行的 Electron 桌面应用**：发现窗口、在渲染进程里
执行 JavaScript、点击/填表、截图、读日志。

它不启动应用，只连接已经在跑、且开放了调试端口的应用。

## 什么时候用它

| 场景 | 选择 |
|------|------|
| 验证 Electron 桌面应用改动后的真实 UI 表现 | ✅ Electron MCP |
| 对着运行中的桌面应用截图取证、断言 DOM | ✅ Electron MCP |
| 抓桌面应用的渲染进程 console 报错 | ✅ Electron MCP |
| 自动化普通网站、需要自己开浏览器 | ❌ 用 Playwright MCP |
| 需要网络面板、性能 trace、Lighthouse | ❌ 用 Chrome DevTools MCP |
| 驱动应用的原生部分（菜单栏、系统对话框、托盘） | ❌ CDP 够不着，见「已知限制」 |

## 连接方式

- **传输协议**：stdio
- **启动命令**：`npx -y electron-mcp-server@1.5.0`

### 连接配置

```json
{
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "electron-mcp-server@1.5.0"],
  "env": {
    "SCREENSHOT_ENCRYPTION_KEY": "{{secrets.SCREENSHOT_ENCRYPTION_KEY}}"
  }
}
```

该密钥在 `~/.desirecore/config/secrets.json` 中配置；缺失或不足 32 字符时截图工具直接报错，
详见 `install.md`。

## 可用能力

共提供 **4** 个工具。

| 工具 | 用途 |
|------|------|
| `get_electron_window_info` | 扫描本机调试端口，列出 Electron 应用的窗口标题、URL、尺寸 |
| `send_command_to_electron` | 在渲染进程执行命令（含 `eval` 与一组封装好的 UI 交互命令） |
| `take_screenshot` | 截取窗口图像，返回 base64；给 `outputPath` 才落盘 |
| `read_electron_logs` | 读取 console / main / renderer 日志 |

### send_command_to_electron 的参数形状

**参数必须是对象**，传裸字符串会被拒。常用命令：

```jsonc
{ "command": "get_page_structure" }                                   // 先看页面有什么
{ "command": "debug_elements" }                                       // 按钮/表单元素调试信息
{ "command": "click_by_text",    "args": { "text": "保存" } }
{ "command": "click_by_selector","args": { "selector": "button.submit" } }
{ "command": "fill_input",       "args": { "selector": "#email", "value": "a@b.com" } }
{ "command": "fill_input",       "args": { "placeholder": "请输入名称", "value": "测试" } }
{ "command": "select_option",    "args": { "selector": "#lang", "value": "zh-CN" } }
{ "command": "send_keyboard_shortcut", "args": { "text": "Enter" } }
{ "command": "navigate_to_hash", "args": { "text": "#settings" } }
{ "command": "get_title" }  { "command": "get_url" }  { "command": "get_body_text" }
{ "command": "eval",             "args": { "code": "document.title" } }
```

## 推荐工作流

1. `get_electron_window_info` — **每次动作前先做这一步**，确认连上的是哪个应用、哪个端口
2. `get_page_structure` 或 `debug_elements` — 摸清当前页面有哪些可交互元素
3. `click_by_text` / `fill_input` 等封装命令驱动 UI（比手写 `eval` 可靠，见下）
4. `take_screenshot` 取证
5. 出问题时 `read_electron_logs` 看渲染进程报错

## 已知限制与规避

### 1. 端口不可配置，超出扫描范围就完全连不上

v1.5.0 硬编码扫描 `9222-9225`、`9200-9205`、`9300-9305`、`9400-9405`，**不读任何环境变量**。
应用若把调试端口自动分配到列表外（多实例并行开发时很常见），MCP 会直接报「未找到运行中的
Electron 应用」。此时只能改用直连 CDP（见第 5 条）。

### 2. 多实例时会连错应用（最容易踩的坑）

工具连的是「扫描到的第一个」应用，本机同时跑多个 Electron 应用（或同一应用的多个实例、
或遗留的 SSH 隧道占着端口）时，动作会打到非预期的目标上。

**铁律：先 `get_electron_window_info` 核对窗口标题与 URL 再动手。** 端口归属存疑时用
`lsof -nP -i :9222`（Windows：`Get-NetTCPConnection -LocalPort 9222`）确认占用进程。

判断「截图是不是同一个窗口」不要靠往页面加视觉标记（`document.body` 加边框在高度为 0 的
应用里根本不可见，会误判），改成改 `document.title` 后用 `curl http://127.0.0.1:9222/json`
核对 target 标题。

### 3. `eval` 被安全策略静默过滤（不是报错，是悄悄返回错值）

v1.5.0 的安全级别**永远是 `balanced`**——运行代码里没有任何地方读取 `SECURITY_LEVEL`
环境变量，配了也不生效。`balanced` 下：

- **赋值语句被禁**（`allowAssignments: false`）
- 只放行白名单函数：`querySelector(All)`、`getElementById`、`getElementsBy*`、
  `getComputedStyle`、`getBoundingClientRect`、`focus`、`blur`、`scrollIntoView`、`dispatchEvent`

典型症状是**返回 `false` 或 `success: true` 但没有 `result`，而不是抛异常**：复杂表达式、
IIFE、任何赋值都可能这样悄悄失败。简单表达式（`document.title`、`...length`）正常。

另外 `get_page_structure` / `debug_elements` 只返回前若干个元素，大页面不够用。

**规避**：能用封装命令（`click_by_text` 等）就别用 `eval`；需要任意复杂表达式时走第 5 条。

### 4. `eval` 的顶层 `const` 会驻留全局

同名变量第二次执行报 `already declared`。复杂代码一律包进 IIFE。

### 5. 绕行方案：直连 CDP

上述限制（端口范围、eval 过滤、返回值丢失）在直连 CDP 时都不存在。Node 22+ 有全局
`WebSocket`，无需任何依赖：

```js
// 1. 列出 target，挑 webSocketDebuggerUrl
//    curl -s http://127.0.0.1:<port>/json
const ws = new WebSocket(wsUrl)
ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: '(() => { /* 任意代码 */ })()', returnByValue: true, awaitPromise: true },
  }))
})
ws.addEventListener('message', e => console.log(JSON.parse(e.data)))
```

截图同理用 `Page.captureScreenshot`，键盘用 `Input.dispatchKeyEvent`。

### 6. CDP 够不着的东西

- **原生对话框**（`dialog.showOpenDialog` / `showSaveDialog`）、原生菜单、托盘：CDP 完全操作不到。
  绕行是直接调用接收路径参数的 IPC，跳过对话框环节
- **`contextBridge` 暴露的对象是冻结的**：`writable: false` / `configurable: false`，无法
  monkey-patch 去 mock 主进程调用（赋值静默失败）
- **主进程逻辑**：只能通过渲染进程可达的 IPC 间接触发

### 7. 关闭连接可能触发应用退出

CDP 的 `Browser.close` 会让应用走完整的退出流程（`before-quit` 等钩子照常执行，可能触发
安装更新、写盘、清理等副作用）。调试结束想断开，断 WebSocket 即可，不要发 `Browser.close`。

### 8. React / 虚拟滚动应用的断言假阴性

- **虚拟滚动列表**只渲染视口内的条目，`querySelectorAll` 可能返回 0。先滚动到目标位置再断言
- **`loading="lazy"` 的图片**未进视口时 `naturalWidth === 0` / `complete === false`，
  这不代表加载失败，`scrollIntoView` 后再查
- **改动前端源码会触发 HMR 重置组件状态**，注入状态做验证时不要中途改代码

### 9. 生产包通常不开放调试端口

多数应用只在开发态开 CDP。要调试打包版本，得用应用自身提供的开关（环境变量/启动参数），
且**用完立即关闭**——CDP 无鉴权，开着等于把应用控制权敞开给本机任何进程。
