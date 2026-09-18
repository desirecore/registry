import assert from 'node:assert/strict'
import { test, afterEach } from 'node:test'
import { cpSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { validateRegistry } from './catalog/validator.mjs'

const source = join(dirname(fileURLToPath(import.meta.url)), '..')
const temporary = []
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }) })
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'registry-native-'))
  temporary.push(root)
  cpSync(join(source, 'schemas'), join(root, 'schemas'), { recursive: true })
  cpSync(join(source, 'entries/desirecore-control'), join(root, 'entries/desirecore-control'), { recursive: true })
  const manifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'))
  manifest.stats = { totalEntries: 1, dockerApps: 0, nativeApps: 1, mcpServices: 0, httpApis: 0, externalIntegrations: 0 }
  writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest))
  writeFileSync(join(root, 'SCHEMA_VERSION'), '4.1.0\n')
  return root
}
function mutate(root, file, change) {
  const path = join(root, file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  change(data)
  writeFileSync(path, JSON.stringify(data))
}
const entry = 'entries/desirecore-control/'
test('真实原生应用条目是 App，固定 1.4.0 制品，不包含内部 MCP 配置', () => {
  const root = fixture()
  const report = validateRegistry(root)
  assert.equal(report.ok, true, JSON.stringify(report.errors))
  assert.equal(report.counts.nativeApps, 1)
  assert.equal(report.counts.mcpServices, 0)
  const manifest = JSON.parse(readFileSync(join(root, entry, 'manifest.json'), 'utf8'))
  assert.equal(manifest.type, 'native-app')
  assert.equal(manifest.install.method, 'native-node')
  assert.equal(manifest.install.requirements.docker, false)
  assert.equal(manifest.version, '1.4.0')
  assert.equal(manifest.connection, undefined)
  assert.equal(manifest.exposes, undefined)
})
for (const field of ['connection', 'exposes', 'toolCount', 'capabilities']) test('拒绝原生应用内部服务字段 ' + field, () => {
  const root = fixture()
  mutate(root, entry + 'manifest.json', data => { data[field] = field === 'toolCount' ? 5 : field === 'connection' ? { transport: 'stdio', command: 'node' } : [] })
  assert.equal(validateRegistry(root).ok, false)
})
test('摘要、最低客户端版本和统计必须与目录事实一致', () => {
  for (const change of [data => { data.provenance.content.sha256 = '0'.repeat(64) }, data => { data.compatibility.requiredClientVersion = '0.0.0' }]) {
    const root = fixture()
    mutate(root, entry + 'catalog-metadata.v1.json', change)
    assert.equal(validateRegistry(root).ok, false)
  }
  const root = fixture()
  mutate(root, 'manifest.json', data => { data.stats.nativeApps = 0 })
  assert.equal(validateRegistry(root).ok, false)
})
test('字段顺序不是治理身份，值相同时允许序列化重排', () => {
  const root = fixture()
  mutate(root, entry + 'manifest.json', data => { data.source = Object.fromEntries(Object.entries(data.source).reverse()) })
  assert.equal(validateRegistry(root).ok, true)
})
