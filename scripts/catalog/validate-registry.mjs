#!/usr/bin/env node

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateRegistry } from './validator.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const defaultRoot = resolve(scriptDir, '..', '..')
const args = process.argv.slice(2)
const rootIndex = args.indexOf('--root')
const root = rootIndex >= 0 ? resolve(args[rootIndex + 1]) : defaultRoot
const json = args.includes('--json')
const requireSidecars = args.includes('--require-sidecars') ? true : undefined
const report = validateRegistry(root, { requireSidecars })

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} else {
  const { counts } = report
  process.stdout.write(`Registry 校验：${report.ok ? '通过' : '失败'}\n`)
  process.stdout.write(`条目 ${counts.totalEntries}（App ${counts.dockerApps} / MCP ${counts.mcpServices} / HTTP ${counts.httpApis}）\n`)
  process.stdout.write(`Catalog sidecar ${counts.sidecars}，legacy fallback ${counts.legacyOnly}\n`)
  for (const item of report.diagnostics) {
    process.stdout.write(`${item.level === 'error' ? 'ERROR' : 'WARN '} ${item.file} ${item.path} [${item.code}] ${item.message}\n`)
  }
}

process.exitCode = report.ok ? 0 : 1
