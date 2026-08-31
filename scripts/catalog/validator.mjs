import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, relative, resolve, sep } from 'node:path'
import { validateJsonSchema } from './json-schema.mjs'

export const CATALOG_SIDECAR_FILENAME = 'catalog-metadata.v1.json'

const UNKNOWN_LICENSES = new Set(['', 'unknown', 'none', 'noassertion', 'unlicensed', 'proprietary-unknown'])
const IMMUTABLE_GIT_REF = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/i
const CONTAINER_DIGEST = /^sha256:[a-f0-9]{64}$/i
const SHA256 = /^[a-f0-9]{64}$/i
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const CALVER = /^(?:19|20)\d{2}\.(?:0?[1-9]|1[0-2])\.(?:0?[1-9]|[12]\d|3[01])(?:[-+][0-9A-Za-z.-]+)?$/

function diagnostic(level, code, file, path, message) {
  return { level, code, file, path, message }
}

function readJson(file, diagnostics) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    diagnostics.push(diagnostic('error', 'invalid-json', file, '$', error instanceof Error ? error.message : String(error)))
    return null
  }
}

function schemaDiagnostics(value, schema, file) {
  return validateJsonSchema(value, schema).map((error) =>
    diagnostic('error', 'schema', file, error.path, error.message),
  )
}

function safeRelativePath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.startsWith('\\') &&
    !value.split(/[\\/]+/u).includes('..') &&
    !/^[a-zA-Z]:[\\/]/u.test(value)
  )
}

function sameStringSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false
  return [...left].sort().join('\0') === [...right].sort().join('\0')
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function sourceIsImmutable(source) {
  if (!source || !isHttpsUrl(source.url) || !safeRelativePath(source.path ?? '.')) return false
  if (source.kind === 'git') return IMMUTABLE_GIT_REF.test(source.ref)
  if (source.kind === 'container') return CONTAINER_DIGEST.test(source.ref)
  if (['web', 'zip', 'release', 'package'].includes(source.kind)) return SHA256.test(source.sha256 ?? '')
  return false
}

function timestampShapeIsConsistent(timestamp) {
  if (!timestamp) return true
  if (timestamp.state === 'unknown') return true
  if (timestamp.state !== 'known') return false
  if (timestamp.precision === 'day') return /^\d{4}-\d{2}-\d{2}$/u.test(timestamp.value)
  if (timestamp.precision === 'second') return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(timestamp.value)
  return false
}

function validateSidecarSemantics(manifest, sidecar, file) {
  const errors = []
  const add = (code, path, message) => errors.push(diagnostic('error', code, file, path, message))
  const expectedKind = manifest.type === 'docker-app' ? 'app' : 'service'

  if (sidecar.identity?.id !== manifest.id) add('identity-mismatch', '$.identity.id', 'sidecar identity.id 必须与 legacy manifest.id 一致')
  if (sidecar.identity?.kind !== expectedKind) add('kind-mismatch', '$.identity.kind', `legacy ${manifest.type} 必须映射为 ${expectedKind}`)
  if (sidecar.spec?.kind !== expectedKind) add('spec-kind-mismatch', '$.spec.kind', 'spec.kind 必须与 identity.kind 一致')
  if (sidecar.release?.state !== 'known' || sidecar.release.version !== manifest.version) {
    add('version-mismatch', '$.release', 'Registry legacy manifest 已声明版本，sidecar 必须以 known 状态保留同一版本')
  }

  if (sidecar.release?.state === 'known' && sidecar.release.versionScheme === 'semver' && !SEMVER.test(sidecar.release.version)) {
    add('version-scheme', '$.release.version', '声明 semver 时必须是完整 SemVer')
  }
  if (sidecar.release?.state === 'known' && sidecar.release.versionScheme === 'calver' && !CALVER.test(sidecar.release.version)) {
    add('version-scheme', '$.release.version', '声明 calver 时必须是 YYYY.M.D 形状')
  }

  const defaultLocale = sidecar.presentation?.defaultLocale
  const locales = sidecar.presentation?.i18n ?? {}
  const defaultText = locales[defaultLocale]
  if (!defaultText) {
    add('missing-default-locale', '$.presentation.defaultLocale', 'defaultLocale 必须在 i18n 中存在')
  } else {
    if (defaultText.name !== manifest.name) add('i18n-legacy-mismatch', `$.presentation.i18n.${defaultLocale}.name`, '默认语言 name 必须与 legacy name 一致')
    if (defaultText.summary !== manifest.description) add('i18n-legacy-mismatch', `$.presentation.i18n.${defaultLocale}.summary`, '默认语言 summary 必须与 legacy description 一致')
    if (defaultText.description !== undefined && manifest.fullDesc !== undefined && defaultText.description !== manifest.fullDesc) {
      add('i18n-legacy-mismatch', `$.presentation.i18n.${defaultLocale}.description`, '默认语言 description 必须与 legacy fullDesc 一致')
    }
    for (const [locale, text] of Object.entries(locales)) {
      if (locale === defaultLocale) continue
      if (text.summary === defaultText.summary && (text.description ?? '') === (defaultText.description ?? '')) {
        add('duplicate-translation', `$.presentation.i18n.${locale}`, '不同 locale 不能用相同源文案伪装成已翻译内容')
      }
    }
  }
  if (!sameStringSet(sidecar.presentation?.tags, manifest.tags ?? [])) {
    add('presentation-mismatch', '$.presentation.tags', 'sidecar tags 必须与 legacy tags 集合一致')
  }

  for (const [name, timestamp] of Object.entries(sidecar.timestamps ?? {})) {
    if (!timestampShapeIsConsistent(timestamp)) add('timestamp-precision', `$.timestamps.${name}`, '时间值必须与 day/second precision 一致且使用 UTC')
  }

  const platforms = sidecar.compatibility?.platforms
  if (platforms?.state === 'known' && !sameStringSet(platforms.values, manifest.platformSupport ?? [])) {
    add('platform-mismatch', '$.compatibility.platforms.values', 'known 平台必须与 legacy platformSupport 集合一致')
  }
  if (platforms?.state === 'all' && !sameStringSet(manifest.platformSupport ?? [], ['macos', 'windows', 'linux'])) {
    add('platform-mismatch', '$.compatibility.platforms', 'all 只能用于 legacy 已显式声明三平台的条目')
  }

  if (expectedKind === 'app') {
    if (sidecar.spec?.category !== manifest.category) add('spec-mismatch', '$.spec.category', 'App category 必须与 legacy category 一致')
  } else {
    const expectedProtocol = manifest.type === 'mcp' ? 'mcp' : 'http'
    if (sidecar.spec?.protocol !== expectedProtocol) add('spec-mismatch', '$.spec.protocol', `Service protocol 必须是 ${expectedProtocol}`)
    if (!sameStringSet(sidecar.spec?.capabilities, manifest.capabilities)) add('spec-mismatch', '$.spec.capabilities', 'Service capabilities 必须与 legacy 集合一致')
    if (manifest.toolCount !== undefined && sidecar.spec?.toolCount !== manifest.toolCount) add('spec-mismatch', '$.spec.toolCount', 'toolCount 必须与 legacy 一致')
  }

  const source = sidecar.provenance?.content
  if (source?.path !== undefined && !safeRelativePath(source.path)) add('unsafe-evidence-path', '$.provenance.content.path', '内容 path 必须是安全相对路径')
  const compliance = sidecar.governance?.compliance
  for (const key of ['licenseEvidencePath', 'noticePath']) {
    if (compliance?.[key] !== undefined && !safeRelativePath(compliance[key])) {
      add('unsafe-evidence-path', `$.governance.compliance.${key}`, '证据路径必须是安全相对路径')
    }
  }
  if (sidecar.governance?.license?.state === 'known' && sidecar.governance.license.evidencePath !== undefined && !safeRelativePath(sidecar.governance.license.evidencePath)) {
    add('unsafe-evidence-path', '$.governance.license.evidencePath', '许可证证据路径必须是安全相对路径')
  }
  if (compliance && source && compliance.reviewedRef !== source.ref) {
    add('review-ref-mismatch', '$.governance.compliance.reviewedRef', '审核 ref 必须与内容来源 ref 完全一致')
  }
  if (compliance && sidecar.timestamps?.reviewedAt?.state !== 'known') {
    add('review-time-mismatch', '$.timestamps.reviewedAt', '存在 compliance 时 reviewedAt 必须是 known')
  } else if (compliance && compliance.reviewedAt !== sidecar.timestamps.reviewedAt.value) {
    add('review-time-mismatch', '$.governance.compliance.reviewedAt', '治理审核时间必须与 timestamps.reviewedAt 一致')
  }

  if (sidecar.governance?.availability === 'installable') {
    const missing = []
    if (!sourceIsImmutable(source)) missing.push('不可变 HTTPS 内容来源')
    if (!sidecar.governance.stewardship) missing.push('stewardship')
    if (
      sidecar.governance.license?.state !== 'known' ||
      UNKNOWN_LICENSES.has((sidecar.governance.license.value ?? '').trim().toLowerCase())
    ) missing.push('已知 license')
    if (!['allowed', 'source-pointer-only'].includes(sidecar.governance.redistribution)) missing.push('已复核 redistribution')
    if (!sidecar.governance.listingMaintainer?.name || !sidecar.governance.upstreamMaintainer?.name) missing.push('双维护者身份')
    if (!sidecar.governance.branding) missing.push('branding 证据')
    if (!compliance) missing.push('compliance 证据')
    if (missing.length > 0) add('installable-without-evidence', '$.governance.availability', `installable 缺少：${missing.join('、')}`)
  }

  return errors
}

function findEntryDirs(entriesDir) {
  if (!existsSync(entriesDir)) return []
  return readdirSync(entriesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => join(entriesDir, entry.name))
    .sort()
}

function relativeFile(root, file) {
  return relative(root, file).split(sep).join('/')
}

export function validateRegistry(repoRoot, options = {}) {
  const root = resolve(repoRoot)
  const diagnostics = []
  const manifestFile = join(root, 'manifest.json')
  const schemaVersionFile = join(root, 'SCHEMA_VERSION')
  const rootSchema = readJson(join(root, 'schemas', 'registry-manifest.v3.schema.json'), diagnostics)
  const entrySchema = readJson(join(root, 'schemas', 'registry-entry.v3.schema.json'), diagnostics)
  const externalEntrySchema = readJson(join(root, 'schemas', 'registry-entry.schema.json'), diagnostics)
  const sidecarSchema = readJson(join(root, 'schemas', 'catalog-metadata.v1.schema.json'), diagnostics)
  const rootManifest = readJson(manifestFile, diagnostics)
  const entryDirs = findEntryDirs(join(root, 'entries'))
  const counts = { totalEntries: 0, dockerApps: 0, mcpServices: 0, httpApis: 0, externalIntegrations: 0, sidecars: 0, legacyOnly: 0 }

  if (rootManifest && rootSchema) diagnostics.push(...schemaDiagnostics(rootManifest, rootSchema, relativeFile(root, manifestFile)))
  const schemaVersion = existsSync(schemaVersionFile) ? readFileSync(schemaVersionFile, 'utf8').trim() : ''
  if (!schemaVersion) diagnostics.push(diagnostic('error', 'missing-schema-version', 'SCHEMA_VERSION', '$', 'SCHEMA_VERSION 不能为空'))
  if (rootManifest?.version !== schemaVersion) diagnostics.push(diagnostic('error', 'schema-version-mismatch', 'manifest.json', '$.version', 'manifest.version 必须与 SCHEMA_VERSION 一致'))

  const seenIds = new Set()
  for (const entryDir of entryDirs) {
    const manifestPath = join(entryDir, 'manifest.json')
    const manifestRelative = relativeFile(root, manifestPath)
    if (!existsSync(manifestPath)) {
      diagnostics.push(diagnostic('error', 'missing-entry-manifest', relativeFile(root, entryDir), '$', 'entry 目录缺少 manifest.json'))
      continue
    }
    const entry = readJson(manifestPath, diagnostics)
    if (!entry) continue
    counts.totalEntries += 1
    if (entry.type === 'docker-app') counts.dockerApps += 1
    if (entry.type === 'mcp') counts.mcpServices += 1
    if (entry.type === 'http-api') counts.httpApis += 1
    if (entry.type === 'external-integration') counts.externalIntegrations += 1
    const effectiveEntrySchema = entry.type === 'external-integration' ? externalEntrySchema : entrySchema
    if (effectiveEntrySchema) diagnostics.push(...schemaDiagnostics(entry, effectiveEntrySchema, manifestRelative))
    if (entry.id !== basename(entryDir)) diagnostics.push(diagnostic('error', 'directory-id-mismatch', manifestRelative, '$.id', 'manifest.id 必须与 entries/<id> 目录名一致'))
    if (seenIds.has(entry.id)) diagnostics.push(diagnostic('error', 'duplicate-id', manifestRelative, '$.id', 'Registry 条目 ID 重复'))
    seenIds.add(entry.id)

    const sidecarPath = join(entryDir, CATALOG_SIDECAR_FILENAME)
    if (entry.type === 'external-integration') continue
    if (!existsSync(sidecarPath)) {
      counts.legacyOnly += 1
      const requireSidecars = options.requireSidecars ?? rootManifest?.catalogMetadata?.required ?? false
      diagnostics.push(diagnostic(requireSidecars ? 'error' : 'warning', 'missing-sidecar', manifestRelative, '$', `缺少可选 ${CATALOG_SIDECAR_FILENAME}，继续使用 legacy manifest`))
      continue
    }
    counts.sidecars += 1
    const sidecar = readJson(sidecarPath, diagnostics)
    if (!sidecar) continue
    const sidecarRelative = relativeFile(root, sidecarPath)
    if (sidecarSchema) diagnostics.push(...schemaDiagnostics(sidecar, sidecarSchema, sidecarRelative))
    diagnostics.push(...validateSidecarSemantics(entry, sidecar, sidecarRelative))
  }

  if (rootManifest?.stats) {
    for (const key of ['totalEntries', 'dockerApps', 'mcpServices', 'httpApis', 'externalIntegrations']) {
      if (rootManifest.stats[key] === undefined && key === 'externalIntegrations' && counts[key] === 0) continue
      if (rootManifest.stats[key] !== counts[key]) diagnostics.push(diagnostic('error', 'stats-mismatch', 'manifest.json', `$.stats.${key}`, `声明 ${rootManifest.stats[key]}，实际 ${counts[key]}`))
    }
  }

  diagnostics.sort((left, right) =>
    left.file.localeCompare(right.file) || left.path.localeCompare(right.path) || left.code.localeCompare(right.code),
  )
  const errors = diagnostics.filter((item) => item.level === 'error')
  const warnings = diagnostics.filter((item) => item.level === 'warning')
  return { ok: errors.length === 0, root, counts, errors, warnings, diagnostics }
}
