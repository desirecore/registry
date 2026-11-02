import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { validateRegistry } from './catalog/validator.mjs'
import { validateJsonSchema } from './catalog/json-schema.mjs'

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const temporary = []
const entryFile = 'entries/desirecore-control/manifest.json'
const sidecarFile = 'entries/desirecore-control/catalog-metadata.v1.json'
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }) })

function mutate(root, file, change) {
  const path = join(root, file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  change(data)
  writeFileSync(path, JSON.stringify(data))
}

function fixture(type = 'native-app') {
  const root = mkdtempSync(join(tmpdir(), 'registry-authored-'))
  temporary.push(root)
  cpSync(join(source, 'schemas'), join(root, 'schemas'), { recursive: true })
  cpSync(join(source, 'entries/desirecore-control'), join(root, 'entries/desirecore-control'), { recursive: true })
  const manifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'))
  manifest.stats = { totalEntries: 1, dockerApps: 0, nativeApps: type === 'native-app' ? 1 : 0, mcpServices: 0, httpApis: 0, externalIntegrations: 0 }
  writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest))
  writeFileSync(join(root, 'SCHEMA_VERSION'), manifest.version + '\n')
  // 测试 release 引用仅用于校验分支；不代表线上 Control 已发布此 release。
  mutate(root, entryFile, entry => {
    entry.type = type
    entry.install.method = type === 'web-bundle' ? 'web-bundle' : 'release'
    if (type === 'web-bundle') entry.install.requirements = { docker: false, ports: [] }
    entry.entrypoints = [{ id: 'editor', name: 'Editor', kind: 'embedded-web', serviceRef: 'demo:editor' }]
    entry.appRelease = {
      schemaVersion: 1,
      releaseDigest: 'a'.repeat(64),
      manifestPath: 'app-release.json',
      definitionSource: 'manifest',
      requiredCapabilities: ['app-authoring-v1', 'release', ...(type === 'web-bundle' ? ['web-bundle'] : [])],
    }
  })
  mutate(root, sidecarFile, sidecar => { sidecar.spec.entrypointKinds = ['embedded-web'] })
  return root
}

function result(root) {
  const cli = spawnSync(process.execPath, [join(source, 'scripts/validate-registry.mjs'), '--root', root], { encoding: 'utf8' })
  return { cli, offline: validateRegistry(root) }
}
function expectValid(root) {
  const report = result(root)
  assert.equal(report.cli.status, 0, report.cli.stderr)
  assert.equal(report.offline.ok, true, JSON.stringify(report.offline.errors))
}
function expectInvalid(root) {
  const report = result(root)
  assert.equal(report.cli.status, 1, report.cli.stdout + report.cli.stderr)
  assert.equal(report.offline.ok, false, JSON.stringify(report.offline))
}

test('官方根仍为4.2且global Schema保留已发布原字节', () => {
  assert.equal(readFileSync(join(source, 'SCHEMA_VERSION'), 'utf8'), '4.2.0\n')
  assert.equal(createHash('sha256').update(readFileSync(join(source, 'schemas/registry-entry.schema.json'))).digest('hex'), 'ea63d6305ae17994e595aea009a131c41300d2b7fdb07ec83cc2c19c37b32038')
})
for (const type of ['native-app', 'web-bundle']) test('两个入口接受固定内联定义 ' + type, () => { expectValid(fixture(type)) })
test('旧独立definitionPath分支继续通过', () => {
  const root = fixture()
  mutate(root, entryFile, entry => { delete entry.appRelease.definitionSource; entry.appRelease.definitionPath = 'definition.json' })
  expectValid(root)
})
test('普通条目与external-integration不被作者Schema重定义', () => {
  const root = mkdtempSync(join(tmpdir(), 'registry-global-'))
  temporary.push(root)
  for (const path of ['entries', 'schemas']) cpSync(join(source, path), join(root, path), { recursive: true })
  for (const path of ['SCHEMA_VERSION', 'manifest.json']) cpSync(join(source, path), join(root, path))
  for (const id of readdirSync(join(root, 'entries'))) {
    const entry = JSON.parse(readFileSync(join(root, 'entries', id, 'manifest.json'), 'utf8'))
    if (entry.type === 'web-bundle' || Object.hasOwn(entry, 'appRelease')) {
      rmSync(join(root, 'entries', id), { recursive: true })
      mutate(root, 'manifest.json', manifest => {
        manifest.stats.totalEntries -= 1
        const stat = { 'native-app': 'nativeApps', 'docker-app': 'dockerApps' }[entry.type]
        if (stat) manifest.stats[stat] -= 1
      })
    }
  }
  writeFileSync(join(root, 'schemas/registry-entry.v4.3.schema.json'), 'false\n')
  expectValid(root)
  writeFileSync(join(root, 'schemas/registry-entry.schema.json'), 'false\n')
  expectInvalid(root)
})
test('作者Schema拒绝时不回退global', () => {
  const root = fixture()
  writeFileSync(join(root, 'schemas/registry-entry.v4.3.schema.json'), 'false\n')
  expectInvalid(root)
})
for (const invalid of ['null', '[]', '42']) test('两个入口拒绝非法作者Schema根 ' + invalid, () => {
  const root = fixture()
  writeFileSync(join(root, 'schemas/registry-entry.v4.3.schema.json'), invalid + '\n')
  expectInvalid(root)
})
test('离线contains匹配实际元素并拒绝空数组与缺失能力', () => {
  const schema = { type: 'array', contains: { const: 'app-authoring-v1' } }
  assert.deepEqual(validateJsonSchema(['release', 'app-authoring-v1'], schema), [])
  assert.ok(validateJsonSchema(['release'], schema).length > 0)
  assert.ok(validateJsonSchema([], schema).length > 0)
})
for (const [name, change] of [
  ['同时声明两种定义来源', entry => { entry.appRelease.definitionPath = 'definition.json' }],
  ['缺少定义来源', entry => { delete entry.appRelease.definitionSource }],
  ['伪造inline来源', entry => { entry.appRelease.definitionSource = 'payload' }],
  ['缺app-authoring-v1能力', entry => { entry.appRelease.requiredCapabilities = ['release'] }],
  ['缺release能力', entry => { entry.appRelease.requiredCapabilities = ['app-authoring-v1'] }],
  ['浮动源码ref', entry => { entry.source.ref = 'main' }],
  ['缺归档摘要', entry => { delete entry.source.sha256 }],
  ['HTTPS URL携带凭据', entry => { entry.source.url = 'https://user@example.com/release.zip' }],
  ['HTTPS URL携带query', entry => { entry.source.url += '?download=1' }],
  ['HTTP归档', entry => { entry.source.url = 'http://example.com/release.zip' }],
  ['git缺归档内路径', entry => { entry.source.kind = 'git'; delete entry.source.path }],
  ['git归档内路径穿越', entry => { entry.source.kind = 'git'; entry.source.path = '../release' }],
  ['非Docker镜像依赖', entry => { entry.appRelease.imageRefs = ['registry.example.com/app@sha256:' + 'a'.repeat(64)] }],
  ['重复入口ID', entry => { entry.entrypoints.push({ ...entry.entrypoints[0] }) }],
  ['保留端口引用', entry => { entry.entrypoints[0].serviceRef = 'native-port:9333' }],
]) test('两个入口拒绝 ' + name, () => {
  const root = fixture()
  mutate(root, entryFile, change)
  expectInvalid(root)
})
test('web-bundle缺web-bundle能力仍拒绝', () => {
  const root = fixture('web-bundle')
  mutate(root, entryFile, entry => { entry.appRelease.requiredCapabilities = ['app-authoring-v1', 'release'] })
  expectInvalid(root)
})
test('web-bundle仍核对sidecar治理与内容来源', () => {
  const root = fixture('web-bundle')
  mutate(root, sidecarFile, sidecar => { sidecar.provenance.content.sha256 = 'b'.repeat(64) })
  const report = validateRegistry(root)
  assert.equal(report.ok, false)
  assert.ok(report.errors.some(item => item.code === 'native-source-mismatch'))
})
