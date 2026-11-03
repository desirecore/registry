import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, cpSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { validateMcpPackageReview, MCP_PACKAGE_REVIEWER } from './automated-mcp-review.mjs'
import { validateRegistry } from './validator.mjs'

function fixture() {
  const manifest = JSON.parse(readFileSync(new URL('../../entries/rea-mcp/manifest.json', import.meta.url)))
  const catalog = JSON.parse(readFileSync(new URL('../../entries/rea-mcp/catalog-metadata.v1.json', import.meta.url)))
  manifest.version = '6.5.0'
  for (const config of [manifest.install, manifest.connection]) config.args = config.args.map(arg => arg.replace('rea-agents@6.4.0', 'rea-agents@6.5.0'))
  catalog.release.version = manifest.version
  catalog.provenance.content.ref = manifest.version
  catalog.provenance.content.sha256 = 'a'.repeat(64)
  catalog.governance.compliance.reviewedRef = manifest.version
  catalog.governance.compliance.reviewedBy = MCP_PACKAGE_REVIEWER
  catalog.governance.compliance.reviewedAt = '2026-10-31'
  catalog.timestamps.reviewedAt = { state: 'known', value: '2026-10-31', precision: 'day' }
  const checks = ['publishedIntegrity', 'previousCatalogDigest', 'boundedOrdinaryFiles', 'licenseAndNoticeUnchanged', 'structuredPrerequisitesUnchanged', 'pinnedLaunchSelectors']
  const receipt = { schemaVersion: 1, reviewer: MCP_PACKAGE_REVIEWER, reviewedAt: '2026-10-31T08:00:00Z', entryId: 'rea-mcp', previousVersion: '6.4.0', version: '6.5.0', packageName: 'rea-agents', ecosystem: 'npm', sourceUrl: catalog.provenance.content.url, artifactUrl: 'https://registry.npmjs.org/rea-agents/-/rea-agents-6.5.0.tgz', contentSha256: 'a'.repeat(64), licenseEvidenceSha256: { LICENSE: 'b'.repeat(64) }, checks: Object.fromEntries(checks.map(key => [key, true])), limitations: ['Source verification only; no runtime/security acceptance'] }
  return { manifest, catalog, receipt }
}

test('machine receipt binds package version, archive digest, review time and required checks', () => {
  const { manifest, catalog, receipt } = fixture()
  assert.deepEqual(validateMcpPackageReview(manifest, catalog, receipt), [])
  for (const patch of [{ entryId: 'other' }, { contentSha256: 'c'.repeat(64) }, { reviewedAt: '2026-10-30T08:00:00Z' }, { reviewedAt: '2026-02-31T08:00:00Z' }, { checks: {} }, { licenseEvidenceSha256: {} }, { artifactUrl: 'https://attacker.invalid/file' }, { previousVersion: null }]) {
    assert.ok(validateMcpPackageReview(manifest, catalog, { ...receipt, ...patch }).length)
  }
  assert.ok(validateMcpPackageReview(manifest, catalog, null).length)
})

test('real catalog validator accepts bound evidence and rejects missing or tampered evidence', () => {
  const root = mkdtempSync(join(tmpdir(), 'mcp-review-'))
  try {
    for (const name of ['entries', 'schemas', 'manifest.json', 'SCHEMA_VERSION']) cpSync(new URL('../../' + name, import.meta.url), join(root, name), { recursive: true })
    const { manifest, catalog, receipt } = fixture()
    const folder = join(root, 'entries/rea-mcp')
    const write = (name, value) => writeFileSync(join(folder, name), JSON.stringify(value))
    write('manifest.json', manifest); write('catalog-metadata.v1.json', catalog); write('upstream-audit.v1.json', receipt)
    assert.equal(validateRegistry(root, { requireSidecars: true }).ok, true)
    write('upstream-audit.v1.json', { ...receipt, contentSha256: '0'.repeat(64) })
    assert.ok(validateRegistry(root).errors.some(issue => issue.code === 'automated-mcp-review'))
    rmSync(join(folder, 'upstream-audit.v1.json'))
    assert.ok(validateRegistry(root).errors.some(issue => issue.code === 'automated-mcp-review'))
  } finally { rmSync(root, { recursive: true, force: true }) }
})
