import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { validateRegistry } from './validator.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const temporaryRoots = []

afterEach(() => {
  while (temporaryRoots.length > 0) rmSync(temporaryRoots.pop(), { recursive: true, force: true })
})

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function legacyApp(overrides = {}) {
  return {
    id: 'demo-app',
    name: 'Demo App',
    type: 'docker-app',
    version: '1.2.3',
    author: 'Demo Org',
    description: '一个用于测试的应用',
    tags: ['demo'],
    icon: 'box',
    iconLetter: 'D',
    platformSupport: ['macos', 'windows', 'linux'],
    category: 'tools',
    shortDesc: '一个用于测试的应用',
    fullDesc: '这是用于验证 Registry 契约的测试应用。',
    install: {
      method: 'docker',
      requirements: { docker: true, minMemory: '1GB', minDisk: '1GB', ports: [8080] },
      configNeeded: ['Docker'],
    },
    ...overrides,
  }
}

function legacyMcp(overrides = {}) {
  return {
    id: 'demo-mcp',
    name: 'Demo MCP',
    type: 'mcp',
    version: '2026.8.31',
    author: 'Demo Org',
    description: '一个用于测试的 MCP 服务',
    tags: ['demo'],
    icon: 'terminal',
    platformSupport: ['macos', 'windows', 'linux'],
    capabilities: ['read'],
    toolCount: 1,
    install: { method: 'npx', packageName: '@demo/mcp', command: 'npx', args: ['-y', '@demo/mcp@1.0.0'] },
    connection: { transport: 'stdio', command: 'npx', args: ['-y', '@demo/mcp@1.0.0'] },
    ...overrides,
  }
}

function legacyHttp(overrides = {}) {
  return {
    id: 'demo-http',
    name: 'Demo HTTP',
    type: 'http-api',
    version: '3.0',
    author: 'Demo Org',
    description: '一个用于测试的 HTTP 服务',
    tags: ['demo'],
    icon: 'globe',
    platformSupport: ['macos', 'windows', 'linux'],
    endpoint: 'https://api.example.com/v1',
    capabilities: ['query'],
    ...overrides,
  }
}

function unknownTimestamps(overrides = {}) {
  return {
    catalogUpdatedAt: { state: 'unknown' },
    releasePublishedAt: { state: 'unknown' },
    reviewedAt: { state: 'unknown' },
    upstreamObservedAt: { state: 'unknown' },
    ...overrides,
  }
}

function appSidecar(overrides = {}) {
  return {
    $schema: '../../schemas/catalog-metadata.v1.schema.json',
    schemaVersion: 1,
    identity: { kind: 'app', id: 'demo-app' },
    presentation: {
      defaultLocale: 'zh-CN',
      i18n: {
        'zh-CN': {
          name: 'Demo App',
          summary: '一个用于测试的应用',
          description: '这是用于验证 Registry 契约的测试应用。',
        },
      },
      tags: ['demo'],
    },
    release: { state: 'known', version: '1.2.3', versionScheme: 'semver' },
    timestamps: unknownTimestamps(),
    provenance: {},
    governance: { availability: 'listing-only', license: { state: 'unknown' }, redistribution: 'verify-package-terms' },
    compatibility: { platforms: { state: 'all' } },
    spec: { kind: 'app', category: 'tools' },
    ...overrides,
  }
}

function mcpSidecar(overrides = {}) {
  return {
    $schema: '../../schemas/catalog-metadata.v1.schema.json',
    schemaVersion: 1,
    identity: { kind: 'service', id: 'demo-mcp' },
    presentation: {
      defaultLocale: 'zh-CN',
      i18n: { 'zh-CN': { name: 'Demo MCP', summary: '一个用于测试的 MCP 服务' } },
      tags: ['demo'],
    },
    release: { state: 'known', version: '2026.8.31', versionScheme: 'calver' },
    timestamps: unknownTimestamps(),
    provenance: {},
    governance: { availability: 'listing-only', license: { state: 'unknown' }, redistribution: 'verify-package-terms' },
    compatibility: { platforms: { state: 'known', values: ['macos', 'windows', 'linux'] } },
    spec: { kind: 'service', protocol: 'mcp', capabilities: ['read'], toolCount: 1 },
    ...overrides,
  }
}

function httpSidecar(overrides = {}) {
  return {
    $schema: '../../schemas/catalog-metadata.v1.schema.json',
    schemaVersion: 1,
    identity: { kind: 'service', id: 'demo-http' },
    presentation: {
      defaultLocale: 'zh-CN',
      i18n: { 'zh-CN': { name: 'Demo HTTP', summary: '一个用于测试的 HTTP 服务' } },
      tags: ['demo'],
    },
    release: { state: 'known', version: '3.0', versionScheme: 'opaque' },
    timestamps: unknownTimestamps(),
    provenance: {},
    governance: { availability: 'listing-only', license: { state: 'unknown' }, redistribution: 'verify-package-terms' },
    compatibility: { platforms: { state: 'all' } },
    spec: { kind: 'service', protocol: 'http', authType: 'unknown', capabilities: ['query'] },
    ...overrides,
  }
}

function makeRegistry(entries, sidecars = new Map(), rootOverrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'registry-validator-'))
  temporaryRoots.push(root)
  cpSync(join(repoRoot, 'schemas'), join(root, 'schemas'), { recursive: true })
  const counts = {
    totalEntries: entries.length,
    dockerApps: entries.filter((entry) => entry.type === 'docker-app').length,
    mcpServices: entries.filter((entry) => entry.type === 'mcp').length,
    httpApis: entries.filter((entry) => entry.type === 'http-api').length,
  }
  writeFileSync(join(root, 'SCHEMA_VERSION'), '3.1.0\n')
  writeJson(join(root, 'manifest.json'), {
    $schema: 'http://json-schema.org/draft-07/schema#',
    id: 'desirecore-registry-manifest',
    version: '3.1.0',
    name: 'Test Registry',
    description: 'Test Registry',
    maintainer: 'Test',
    repository: 'https://example.com/registry',
    lastUpdated: '2026-08-31',
    stats: counts,
    dataVersion: '3.1.0',
    catalogMetadata: {
      version: '1.0.0',
      schema: 'schemas/catalog-metadata.v1.schema.json',
      sidecarPath: 'entries/<id>/catalog-metadata.v1.json',
      required: false,
      legacyFallback: true,
    },
    ...rootOverrides,
  })
  for (const entry of entries) {
    const entryDir = join(root, 'entries', entry.id)
    writeJson(join(entryDir, 'manifest.json'), entry)
    if (sidecars.has(entry.id)) writeJson(join(entryDir, 'catalog-metadata.v1.json'), sidecars.get(entry.id))
  }
  return root
}

function codes(report) {
  return report.errors.map((item) => item.code)
}

test('当前 21 个 legacy 条目保持可读，并报告缺失 sidecar', () => {
  const report = validateRegistry(repoRoot)
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2))
  assert.deepEqual(report.counts, {
    totalEntries: 21,
    dockerApps: 8,
    mcpServices: 8,
    httpApis: 5,
    sidecars: 0,
    legacyOnly: 21,
  })
  assert.equal(report.warnings.filter((item) => item.code === 'missing-sidecar').length, 21)
})

test('合法 listing-only App sidecar 通过', () => {
  const report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', appSidecar()]])))
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2))
  assert.equal(report.counts.sidecars, 1)
})

test('合法 MCP sidecar 保留 CalVer、能力和 toolCount', () => {
  const report = validateRegistry(makeRegistry([legacyMcp()], new Map([['demo-mcp', mcpSidecar()]])))
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2))
})

test('合法 HTTP sidecar 保留 opaque 版本、协议、鉴权 unknown 和能力', () => {
  const report = validateRegistry(makeRegistry([legacyHttp()], new Map([['demo-http', httpSidecar()]])))
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2))
})

test('stats 与实际目录不一致时失败', () => {
  const root = makeRegistry([legacyApp()], new Map(), { stats: { totalEntries: 99, dockerApps: 8, mcpServices: 0, httpApis: 0 } })
  const report = validateRegistry(root)
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes('stats-mismatch'))
})

test('目录名与 manifest.id 不一致时失败', () => {
  const root = makeRegistry([legacyApp()])
  const source = join(root, 'entries', 'demo-app')
  const target = join(root, 'entries', 'wrong-directory')
  cpSync(source, target, { recursive: true })
  rmSync(source, { recursive: true, force: true })
  const report = validateRegistry(root)
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes('directory-id-mismatch'))
})

test('legacy type-specific 必需字段缺失时失败', () => {
  const entry = legacyMcp()
  delete entry.connection
  const report = validateRegistry(makeRegistry([entry]))
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes('schema'))
})

test('sidecar 严格拒绝额外字段和正文 sourceId', () => {
  const sidecar = appSidecar({ sourceId: 'registry:official', unexpected: true })
  const report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.equal(report.ok, false)
  assert.ok(report.errors.filter((item) => item.code === 'schema').length >= 2)
})

test('sidecar 拒绝正文 official 治理声明', () => {
  const sidecar = appSidecar({
    governance: {
      availability: 'listing-only',
      stewardship: 'official',
      license: { state: 'unknown' },
      redistribution: 'verify-package-terms',
    },
  })
  const report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes('schema'))
})

test('i18n 必须包含默认语言且不能伪造重复翻译', () => {
  const missingDefault = appSidecar({
    presentation: { defaultLocale: 'en-US', i18n: { 'zh-CN': appSidecar().presentation.i18n['zh-CN'] } },
  })
  let report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', missingDefault]])))
  assert.ok(codes(report).includes('missing-default-locale'))

  const duplicated = appSidecar()
  duplicated.presentation.i18n['en-US'] = { ...duplicated.presentation.i18n['zh-CN'] }
  report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', duplicated]])))
  assert.ok(codes(report).includes('duplicate-translation'))
})

test('证据路径拒绝绝对路径和目录穿越', () => {
  const sidecar = appSidecar({
    provenance: { content: { kind: 'git', url: 'https://example.com/repo.git', ref: 'a'.repeat(40), path: '../secret' } },
    governance: {
      availability: 'listing-only',
      license: { state: 'unknown' },
      redistribution: 'verify-package-terms',
      compliance: {
        licenseEvidencePath: '/tmp/LICENSE',
        reviewedRef: 'a'.repeat(40),
        reviewedAt: '2026-08-31',
        reviewedBy: 'test',
        upstreamEndorsed: false,
      },
    },
  })
  const report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.equal(report.ok, false)
  assert.equal(codes(report).filter((code) => code === 'unsafe-evidence-path').length, 2)
})

test('mutable source 可 listing-only，但不能 installable', () => {
  const mutableSource = { kind: 'git', url: 'https://example.com/repo.git', ref: 'main' }
  let sidecar = appSidecar({ provenance: { content: mutableSource } })
  let report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2))

  sidecar = appSidecar({
    provenance: { content: mutableSource },
    timestamps: unknownTimestamps({ reviewedAt: { state: 'known', value: '2026-08-31', precision: 'day' } }),
    governance: {
      availability: 'installable',
      stewardship: 'pointer',
      license: { state: 'known', value: 'MIT', evidencePath: 'LICENSE' },
      redistribution: 'source-pointer-only',
      listingMaintainer: { name: 'DesireCore Team', verified: true },
      upstreamMaintainer: { name: 'Demo Org', verified: false },
      branding: { relationship: 'independent-listing', nameUsage: 'nominative', logoStatus: 'not-used' },
      compliance: {
        licenseEvidencePath: 'LICENSE',
        reviewedRef: 'main',
        reviewedAt: '2026-08-31',
        reviewedBy: 'catalog-review-v1',
        upstreamEndorsed: false,
      },
    },
  })
  report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes('installable-without-evidence'))
})

test('完整不可变来源与审核证据允许 installable', () => {
  const ref = 'a'.repeat(40)
  const sidecar = appSidecar({
    provenance: { content: { kind: 'git', url: 'https://example.com/repo.git', ref } },
    timestamps: unknownTimestamps({ reviewedAt: { state: 'known', value: '2026-08-31', precision: 'day' } }),
    governance: {
      availability: 'installable',
      stewardship: 'pointer',
      license: { state: 'known', value: 'MIT', evidencePath: 'LICENSE' },
      redistribution: 'source-pointer-only',
      listingMaintainer: { name: 'DesireCore Team', verified: true },
      upstreamMaintainer: { name: 'Demo Org', verified: false },
      branding: { relationship: 'independent-listing', nameUsage: 'nominative', logoStatus: 'not-used' },
      compliance: {
        licenseEvidencePath: 'LICENSE',
        reviewedRef: ref,
        reviewedAt: '2026-08-31',
        reviewedBy: 'catalog-review-v1',
        upstreamEndorsed: false,
      },
    },
  })
  const report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2))
})

test('审核 ref 和审核时间必须绑定同一来源与 timestamps', () => {
  const sidecar = appSidecar({
    provenance: { content: { kind: 'git', url: 'https://example.com/repo.git', ref: 'a'.repeat(40) } },
    timestamps: unknownTimestamps({ reviewedAt: { state: 'known', value: '2026-08-31', precision: 'day' } }),
    governance: {
      availability: 'listing-only',
      license: { state: 'unknown' },
      redistribution: 'verify-package-terms',
      compliance: {
        licenseEvidencePath: 'LICENSE',
        reviewedRef: 'b'.repeat(40),
        reviewedAt: '2026-08-30',
        reviewedBy: 'catalog-review-v1',
        upstreamEndorsed: false,
      },
    },
  })
  const report = validateRegistry(makeRegistry([legacyApp()], new Map([['demo-app', sidecar]])))
  assert.ok(codes(report).includes('review-ref-mismatch'))
  assert.ok(codes(report).includes('review-time-mismatch'))
})

test('--require-sidecars 等价策略会让 legacy-only 失败', () => {
  const report = validateRegistry(makeRegistry([legacyApp()]), { requireSidecars: true })
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes('missing-sidecar'))
})
