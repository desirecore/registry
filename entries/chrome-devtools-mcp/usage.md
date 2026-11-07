# 使用 / Usage

把服务添加给需要网页调试的数字员工后，可用 `new_page` 打开授权测试页，用 `list_pages` 获取页面 ID，再用 `take_snapshot` 核对页面内容。还可按任务查看控制台、网络和性能。使用 Addy 的 `browser-testing-with-devtools` 时，把服务和技能配给同一个数字员工。

默认用临时、无头的 Chrome 配置，关闭 MCP 使用统计与 CrUX 查询。服务本身无需登录。访问需要认证的网页时，仍须获得用户授权并满足网站条款。连接或工具不可用时，说明阻碍，避免报告浏览器验证通过。

After adding the service to the target agent, call `new_page` on an authorized test page, use `list_pages` to identify it, and pass the ID to `take_snapshot`. Console, network and performance tools can be used as needed. Assign both the service and Addy's `browser-testing-with-devtools` skill to the same agent if using them together.

The preset uses an isolated, headless Chrome profile with MCP usage statistics and CrUX lookups disabled. The server needs no account. Access to authenticated sites requires authorization and compliance with site terms. If tools are unavailable, report the blocker before claiming verification.
