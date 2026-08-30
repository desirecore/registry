import { lstat, readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const rootArgumentIndex = process.argv.indexOf('--root')
if (rootArgumentIndex >= 0 && !process.argv[rootArgumentIndex + 1]) {
  throw new Error('--root requires a directory path')
}
const repositoryRoot = rootArgumentIndex >= 0
  ? resolve(process.argv[rootArgumentIndex + 1])
  : resolve(scriptDirectory, '..')
const entriesRoot = join(repositoryRoot, 'entries')
const errors = []

const addError = (message) => errors.push(message)

const readText = async (path) => {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    addError(`${relative(repositoryRoot, path)}: unable to read (${error.message})`)
    return null
  }
}

const readJson = async (path) => {
  const text = await readText(path)
  if (text === null) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    addError(`${relative(repositoryRoot, path)}: invalid JSON (${error.message})`)
    return null
  }
}

const formatAjvErrors = (validationErrors = []) =>
  validationErrors
    .map((error) => `${error.instancePath || '/'} ${error.message}`)
    .join('; ')

const sorted = (values) => [...values].sort()
const sameSet = (actual, expected) =>
  JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected))

const containsKey = (value, prohibitedKey) => {
  if (Array.isArray(value)) return value.some((item) => containsKey(item, prohibitedKey))
  if (!value || typeof value !== 'object') return false
  if (Object.hasOwn(value, prohibitedKey)) return true
  return Object.values(value).some((item) => containsKey(item, prohibitedKey))
}

const assertHttpsUrl = (rawUrl, context) => {
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'https:') addError(`${context}: URL must use HTTPS`)
    if (url.username || url.password) addError(`${context}: URL must not contain credentials`)
    return url
  } catch {
    addError(`${context}: invalid URL`)
    return null
  }
}

const requiredOfficialLinkKinds = [
  'product',
  'documentation',
  'chrome-web-store',
  'edge-add-ons',
  'privacy',
  'terms',
]

const admittedExternalIntegrationIds = new Set(['kimi-webbridge'])

const kimiOfficialLinkPolicy = {
  product: {
    url: 'https://www.kimi.ai/products/kimi-webbridge',
  },
  documentation: {
    url: 'https://www.kimi.ai/help/kimi-webbridge/kimi-webbridge-introduction',
  },
  'chrome-web-store': {
    url: 'https://chromewebstore.google.com/detail/kimi-webbridge/fldmhceldgbpfpkbgopacenieobmligc',
    extensionId: 'fldmhceldgbpfpkbgopacenieobmligc',
  },
  'edge-add-ons': {
    url: 'https://microsoftedge.microsoft.com/addons/detail/kimi-webbridge/bnlffdbcfnanfbknnlaflhlhkocccckg',
    extensionId: 'bnlffdbcfnanfbknnlaflhlhkocccckg',
  },
  privacy: {
    url: 'https://www.kimi.ai/user/agreement/userPrivacy?version=v2',
  },
  terms: {
    url: 'https://www.kimi.ai/user/agreement/modelUse?version=v2',
  },
}

const requiredKimiPermissions = [
  'tabs',
  'activeTab',
  'debugger',
  'storage',
  'alarms',
  'tabGroups',
  'windows',
]

const requiredAdmissionPrerequisites = [
  'stable-auditable-protocol',
  'integration-authorization',
  'deterministic-command-receipts',
  'user-interaction-pause-signal',
]

const isValidCalendarDate = (value) => {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

const describeFilesystemEntry = (entry) => {
  if (entry.isSymbolicLink()) return 'symbolic link'
  if (entry.isDirectory()) return 'directory'
  if (entry.isFile()) return 'file'
  if (entry.isBlockDevice()) return 'block device'
  if (entry.isCharacterDevice()) return 'character device'
  if (entry.isFIFO()) return 'FIFO'
  if (entry.isSocket()) return 'socket'
  return 'unsupported filesystem entry'
}

const validateExternalDirectoryLayout = async (entryDirectory, manifestId) => {
  const prefix = `entries/${manifestId}`
  const directoryEntries = await readdir(entryDirectory, { withFileTypes: true })
  for (const entry of directoryEntries) {
    if (entry.name !== 'manifest.json') {
      addError(`${prefix}: external-integration allows only manifest.json; found ${describeFilesystemEntry(entry)} ${entry.name}`)
      continue
    }
    if (!entry.isFile() || entry.isSymbolicLink()) {
      addError(`${prefix}/manifest.json: must be a regular file, not a ${describeFilesystemEntry(entry)}`)
    }
  }
  if (directoryEntries.length !== 1 || directoryEntries[0]?.name !== 'manifest.json') {
    addError(`${prefix}: external-integration directory must contain exactly one manifest.json regular file`)
  }
}

const validateExternalIntegration = async (entryDirectory, manifest) => {
  const prefix = `entries/${manifest.id}`
  await validateExternalDirectoryLayout(entryDirectory, manifest.id)
  if (!admittedExternalIntegrationIds.has(manifest.id)) {
    addError(`${prefix}/manifest.json: unknown external-integration id ${manifest.id}`)
  }
  const forbiddenFields = [
    'install',
    'entrypoints',
    'exposes',
    'endpoint',
    'connection',
    'auth',
    'operations',
    'source',
  ]
  for (const field of forbiddenFields) {
    if (Object.hasOwn(manifest, field)) addError(`${prefix}/manifest.json: forbidden field "${field}"`)
  }

  const linkKinds = manifest.officialLinks?.map((link) => link.kind) ?? []
  if (!sameSet(linkKinds, requiredOfficialLinkKinds)) {
    addError(`${prefix}/manifest.json: officialLinks must contain each required kind exactly once`)
  }
  for (const link of manifest.officialLinks ?? []) {
    const url = assertHttpsUrl(link.url, `${prefix}/manifest.json officialLinks.${link.kind}`)
    const policy = kimiOfficialLinkPolicy[link.kind]
    if (!policy || link.url !== policy.url) {
      addError(`${prefix}/manifest.json officialLinks.${link.kind}: URL must exactly equal ${policy?.url ?? 'an admitted URL'}`)
    }
    if (policy?.extensionId) {
      if (link.extensionId !== policy.extensionId) {
        addError(`${prefix}/manifest.json officialLinks.${link.kind}: extensionId must equal ${policy.extensionId}`)
      }
      if (url && url.pathname.split('/').filter(Boolean).at(-1) !== link.extensionId) {
        addError(`${prefix}/manifest.json officialLinks.${link.kind}: URL path must end with extensionId`)
      }
    } else if (Object.hasOwn(link, 'extensionId')) {
      addError(`${prefix}/manifest.json officialLinks.${link.kind}: extensionId is allowed only for browser stores`)
    }
  }

  if (manifest.id === 'kimi-webbridge') {
    for (const [field, expectedHost] of [
      ['listingMaintainer', 'github.com'],
      ['upstreamMaintainer', 'www.kimi.ai'],
    ]) {
      const url = assertHttpsUrl(manifest[field]?.url, `${prefix}/manifest.json ${field}.url`)
      if (url && url.hostname !== expectedHost) {
        addError(`${prefix}/manifest.json ${field}.url: hostname must be ${expectedHost}`)
      }
    }
  }

  if (manifest.listingMaintainer?.url !== 'https://github.com/desirecore/registry' || manifest.listingMaintainer?.verified !== true) {
    addError(`${prefix}/manifest.json: listingMaintainer must be the verified DesireCore Registry URL`)
  }
  if (manifest.upstreamMaintainer?.url !== 'https://www.kimi.ai/' || manifest.upstreamMaintainer?.verified !== true) {
    addError(`${prefix}/manifest.json: upstreamMaintainer must be the verified Kimi URL`)
  }

  const componentKinds = manifest.components?.map((component) => component.kind) ?? []
  if (!sameSet(componentKinds, ['browser-extension', 'local-daemon'])) {
    addError(`${prefix}/manifest.json: components must contain browser-extension and local-daemon exactly once`)
  }
  for (const component of manifest.components ?? []) {
    if (component.kind === 'browser-extension') {
      if (!sameSet(component.browsers ?? [], ['chrome', 'edge']) || Object.hasOwn(component, 'platforms')) {
        addError(`${prefix}/manifest.json: browser-extension must declare only Chrome and Edge browsers`)
      }
    }
    if (component.kind === 'local-daemon') {
      if (!Array.isArray(component.platforms) ||
        !component.platforms.includes('windows') ||
        !component.platforms.includes('macos') ||
        Object.hasOwn(component, 'browsers')) {
        addError(`${prefix}/manifest.json: local-daemon must declare at least Windows and macOS and no browsers`)
      }
    }
  }

  const apiPermissions = manifest.permissions?.browserExtension?.apiPermissions ?? []
  if (!sameSet(apiPermissions, requiredKimiPermissions)) {
    addError(`${prefix}/manifest.json: browser extension API permissions must match the audited Kimi permission set`)
  }
  const hostPermissions = manifest.permissions?.browserExtension?.hostPermissions ?? []
  if (!sameSet(hostPermissions, ['<all_urls>'])) {
    addError(`${prefix}/manifest.json: browser extension must disclose <all_urls>`)
  }

  if (!sameSet(manifest.admission?.missingPrerequisites ?? [], requiredAdmissionPrerequisites)) {
    addError(`${prefix}/manifest.json: blocked admission prerequisites are incomplete`)
  }

  const artifactIdentities = new Set()
  if (!isValidCalendarDate(manifest.compliance?.reviewedAt)) {
    addError(`${prefix}/manifest.json compliance.reviewedAt: expected a real YYYY-MM-DD calendar date`)
  }
  for (const artifact of manifest.compliance?.artifactReviews ?? []) {
    const artifactContext = `${prefix}/manifest.json artifact ${artifact.platform}/${artifact.architecture}`
    const url = assertHttpsUrl(artifact.url, artifactContext)
    if (url && url.hostname !== 'cdn.kimi.com') {
      addError(`${artifactContext}: hostname must be cdn.kimi.com`)
    }
    if (url && !url.pathname.includes(`/v${artifact.version}/releases/`)) {
      addError(`${artifactContext}: URL must pin the reviewed version in its release path`)
    }
    if (url && (url.search || url.hash)) {
      addError(`${artifactContext}: URL must not contain query or fragment components`)
    }
    if (!isValidCalendarDate(artifact.reviewedAt)) {
      addError(`${artifactContext} reviewedAt: expected a real YYYY-MM-DD calendar date`)
    }
    const identity = `${artifact.platform}/${artifact.architecture}`
    if (artifactIdentities.has(identity)) addError(`${artifactContext}: duplicate platform/architecture review`)
    artifactIdentities.add(identity)
  }

}

const schemaVersion = (await readText(join(repositoryRoot, 'SCHEMA_VERSION')))?.trim()
const rootManifest = await readJson(join(repositoryRoot, 'manifest.json'))
const entrySchema = await readJson(join(repositoryRoot, 'schemas', 'registry-entry.schema.json'))

if (!schemaVersion || !/^\d+\.\d+\.\d+$/.test(schemaVersion)) {
  addError('SCHEMA_VERSION: expected a semantic version')
}
if (rootManifest) {
  if (rootManifest.version !== schemaVersion) addError('manifest.json#version must equal SCHEMA_VERSION')
  if (rootManifest.dataVersion !== schemaVersion) addError('manifest.json#dataVersion must equal SCHEMA_VERSION')
}

let validateEntry = null
if (entrySchema) {
  try {
    const ajv = new Ajv({ allErrors: true, strict: true, validateFormats: false })
    validateEntry = ajv.compile(entrySchema)
  } catch (error) {
    addError(`schemas/registry-entry.schema.json: unable to compile (${error.message})`)
  }
}

const manifests = []
const seenIds = new Set()
for (const directoryEntry of await readdir(entriesRoot, { withFileTypes: true })) {
  if (!directoryEntry.isDirectory()) {
    addError(`entries/${directoryEntry.name}: entries root may contain directories only`)
    continue
  }

  const entryDirectory = join(entriesRoot, directoryEntry.name)
  const manifestPath = join(entryDirectory, 'manifest.json')
  let manifestStat
  try {
    manifestStat = await lstat(manifestPath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      addError(`entries/${directoryEntry.name}: missing manifest.json`)
      continue
    }
    throw error
  }
  if (!manifestStat.isFile() || manifestStat.isSymbolicLink()) {
    addError(`entries/${directoryEntry.name}/manifest.json: must be a regular file and not a symbolic link`)
    continue
  }
  const manifest = await readJson(manifestPath)
  if (!manifest) continue
  manifests.push(manifest)

  if (manifest.id !== directoryEntry.name) {
    addError(`entries/${directoryEntry.name}/manifest.json: id must equal directory name`)
  }
  if (seenIds.has(manifest.id)) addError(`entries/${directoryEntry.name}/manifest.json: duplicate id ${manifest.id}`)
  seenIds.add(manifest.id)

  for (const injectedField of ['sourceId', 'hasInstall']) {
    if (containsKey(manifest, injectedField)) {
      addError(`entries/${directoryEntry.name}/manifest.json: ${injectedField} is client-injected and must not be authored`)
    }
  }

  if (validateEntry && !validateEntry(manifest)) {
    addError(`entries/${directoryEntry.name}/manifest.json: ${formatAjvErrors(validateEntry.errors)}`)
  }
  if (manifest.type === 'external-integration') {
    await validateExternalIntegration(entryDirectory, manifest)
  }
}

if (rootManifest) {
  const expectedStats = {
    totalEntries: manifests.length,
    dockerApps: manifests.filter((entry) => entry.type === 'docker-app').length,
    mcpServices: manifests.filter((entry) => entry.type === 'mcp').length,
    httpApis: manifests.filter((entry) => entry.type === 'http-api').length,
    externalIntegrations: manifests.filter((entry) => entry.type === 'external-integration').length,
  }
  for (const [field, expected] of Object.entries(expectedStats)) {
    if (rootManifest.stats?.[field] !== expected) {
      addError(`manifest.json#stats.${field}: expected ${expected}, received ${rootManifest.stats?.[field]}`)
    }
  }
  const extraStats = Object.keys(rootManifest.stats ?? {}).filter((field) => !Object.hasOwn(expectedStats, field))
  if (extraStats.length > 0) addError(`manifest.json#stats: unknown fields ${extraStats.join(', ')}`)
}

for (const manifest of manifests) {
  if (manifest.sourceAppId && !seenIds.has(manifest.sourceAppId)) {
    addError(`entries/${manifest.id}/manifest.json: sourceAppId ${manifest.sourceAppId} does not exist`)
  }
}

if (errors.length > 0) {
  console.error(`Registry validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  const counts = rootManifest.stats
  console.log(
    `Registry validation passed: ${counts.totalEntries} entries ` +
    `(${counts.dockerApps} Docker, ${counts.mcpServices} MCP, ` +
    `${counts.httpApis} HTTP API, ${counts.externalIntegrations} external integration).`,
  )
}
