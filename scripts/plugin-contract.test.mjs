import assert from 'node:assert/strict'
import { test, afterEach } from 'node:test'
import { cpSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { validateRegistry } from './catalog/validator.mjs'

const source = join(dirname(fileURLToPath(import.meta.url)), '..')
const temporary = []
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }) })
const contribution = { id: 'help', point: 'session.panels', contractVersion: 1, definitionRef: { path: 'panel.json', sha256: 'a'.repeat(64) } }
const requires = [{ sourceId: 'official', appId: 'capability-provider', contributionId: 'help', contractVersion: 1, optional: false }]
const extension = { apiVersion: '1.0.0', hosts: ['agent-service'], runtime: { kind: 'declarative' }, contributes: [contribution] }

function fixture(type = 'artifact') {
  const root = mkdtempSync(join(tmpdir(), 'registry-plugin-'))
  temporary.push(root)
  cpSync(join(source, 'schemas'), join(root, 'schemas'), { recursive: true })
  cpSync(join(source, 'entries/desirecore-control'), join(root, 'entries/desirecore-control'), { recursive: true })
  const manifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'))
  manifest.stats = { totalEntries: 1, dockerApps: 0, nativeApps: type === 'native-app' ? 1 : 0, artifactApps: type === 'artifact' ? 1 : 0, mcpServices: 0, httpApis: 0, externalIntegrations: 0 }
  writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest))
  writeFileSync(join(root, 'SCHEMA_VERSION'), manifest.version + '\n')
  mutate(root, 'manifest.json', entry => {
    entry.type = type
    entry.productKind = 'plugin'
    entry.entrypoints = []
    entry.extension = structuredClone(extension)
    if (type === 'artifact') entry.install = { method: 'artifact', requirements: { docker: false, ports: [] } }
  })
  mutate(root, 'catalog-metadata.v1.json', sidecar => {
    sidecar.spec.productKind = 'plugin'
    sidecar.spec.entrypointKinds = []
    sidecar.spec.extension = structuredClone(extension)
  })
  return root
}
function mutate(root, file, change) {
  const path = join(root, 'entries/desirecore-control', file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  change(data)
  writeFileSync(path, JSON.stringify(data))
}
function result(root) {
  const cli = spawnSync(process.execPath, [join(source, 'scripts/validate-registry.mjs'), '--root', root], { encoding: 'utf8' })
  return { cli, offline: validateRegistry(root) }
}
function expectValid(root) {
  const report = result(root)
  assert.equal(report.cli.status, 0, report.cli.stderr)
  assert.equal(report.offline.ok, true, JSON.stringify(report.offline.errors))
  return report
}
function expectInvalid(root) {
  const report = result(root)
  assert.equal(report.cli.status, 1, report.cli.stdout + report.cli.stderr)
  assert.equal(report.offline.ok, false, JSON.stringify(report.offline))
}

test('无 UI artifact 插件仍为 App，无端口与执行进程', () => {
  const report = expectValid(fixture())
  assert.equal(report.offline.counts.artifactApps, 1)
  assert.equal(report.offline.counts.mcpServices, 0)
})
test('普通原生应用可携带宿主贡献', () => {
  const root = fixture('native-app')
  mutate(root, 'manifest.json', data => { data.productKind = 'application'; data.entrypoints = [{ id: 'manage', name: '维护', kind: 'agent' }] })
  mutate(root, 'catalog-metadata.v1.json', data => { data.spec.productKind = 'application'; data.spec.entrypointKinds = ['agent'] })
  expectValid(root)
})
test('原生应用的真实服务 runtime 由固定 descriptorRef 定位', () => {
  const root = fixture('native-app')
  const runtime = { kind: 'service', protocol: 'http', descriptorRef: { path: 'runtime.json', sha256: 'c'.repeat(64) } }
  mutate(root, 'manifest.json', data => { data.extension.runtime = structuredClone(runtime) })
  mutate(root, 'catalog-metadata.v1.json', data => { data.spec.extension.runtime = structuredClone(runtime) })
  expectValid(root)
})
test('普通应用可只依赖能力，依赖 sourceId 不冒充目录身份', () => {
  const root = fixture('native-app')
  mutate(root, 'manifest.json', data => { data.productKind = 'application'; data.entrypoints = [{ id: 'manage', name: '维护', kind: 'agent' }]; data.extension.contributes = []; data.extension.requires = structuredClone(requires) })
  mutate(root, 'catalog-metadata.v1.json', data => { data.spec.productKind = 'application'; data.spec.entrypointKinds = ['agent']; data.spec.extension.contributes = []; data.spec.extension.requires = structuredClone(requires) })
  expectValid(root)
})
for (const [name, change] of [
  ['插件无贡献', data => { data.extension.contributes = []; data.extension.requires = structuredClone(requires) }],
  ['贡献与依赖均为空', data => { data.extension.contributes = [] }],
  ['非法贡献点', data => { data.extension.contributes[0].point = 'arbitrary.code' }],
  ['材料相对路径穿越', data => { data.extension.contributes[0].definitionRef.path = '../panel.json' }],
  ['材料缺摘要', data => { delete data.extension.contributes[0].definitionRef.sha256 }],
  ['artifact 声明端口', data => { data.install.requirements.ports = [9333] }],
  ['artifact 伪造执行服务', data => { data.extension.runtime = { kind: 'service', protocol: 'http', descriptorRef: { path: 'runtime.json', sha256: 'c'.repeat(64) } } }],
  ['伪造条目来源', data => { data.sourceId = 'official' }],
  ['其他层级伪造来源', data => { data.extension.runtime.sourceId = 'official' }],
  ['重复贡献 ID', data => { data.extension.contributes.push(structuredClone(contribution)) }],
  ['重复入口 ID', data => { data.entrypoints = [{ id: 'x', name: '一', kind: 'agent' }, { id: 'x', name: '二', kind: 'agent' }] }],
  ['第三方伪造 builtin', data => { data.entrypoints = [{ id: 'x', name: '一', kind: 'builtin', route: '/settings' }] }],
  ['第三方指定 reserved port', data => { data.entrypoints = [{ id: 'x', name: '一', kind: 'external', serviceRef: 'native-port:9333' }] }],
  ['结构错误 entrypoints', data => { data.entrypoints = {} }],
  ['结构错误贡献数组', data => { data.extension.contributes = [null] }],
]) test('CLI 与离线校验都拒绝 ' + name, () => {
  const root = fixture()
  mutate(root, 'manifest.json', change)
  expectInvalid(root)
})

test('同一产品侧录不能改变 productKind 或关系声明', () => {
  const root = fixture()
  mutate(root, 'catalog-metadata.v1.json', data => { data.spec.productKind = 'application' })
  const report = validateRegistry(root)
  assert.equal(report.ok, false)
  assert.ok(report.errors.some(error => error.code === 'product-kind-mismatch'))
})
test('artifact 统计必须对应真实文件，来源摘要不可漂移', () => {
  const root = fixture()
  mutate(root, 'catalog-metadata.v1.json', data => { data.provenance.content.sha256 = 'b'.repeat(64) })
  assert.equal(validateRegistry(root).ok, false)
  const manifestPath = join(root, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  manifest.stats.artifactApps = 0
  writeFileSync(manifestPath, JSON.stringify(manifest))
  expectInvalid(root)
})
