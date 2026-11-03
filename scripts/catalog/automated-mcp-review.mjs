/** MCP 机器审核记录的绑定契约；仅机械核验，不授予运行权限。 */
import { readFileSync } from 'node:fs'
import { validateJsonSchema } from './json-schema.mjs'
const schema = JSON.parse(readFileSync(new URL('../../schemas/mcp-package-review.v1.schema.json', import.meta.url), 'utf8'))
export const MCP_PACKAGE_REVIEWER = schema.properties.reviewer.const
const checks = schema.properties.checks.required

export function validateMcpPackageReview(manifest, catalog, record) {
  const content = catalog.provenance?.content
  const compliance = catalog.governance?.compliance
  const errors = validateJsonSchema(record, schema).map(error => `${error.path}: ${error.message}`)
  if (errors.length) return errors
  if (manifest.type !== 'mcp' || content?.kind !== 'package' || record.schemaVersion !== 1
      || record.reviewer !== MCP_PACKAGE_REVIEWER || record.entryId !== manifest.id
      || record.version !== manifest.version || record.version !== content.ref
      || record.sourceUrl !== content.url || record.contentSha256 !== content.sha256
      || !/^[a-f0-9]{64}$/.test(record.contentSha256 ?? '')
      || record.packageName !== manifest.install?.packageName
      || !['npm', 'pypi'].includes(record.ecosystem)
      || typeof record.previousVersion !== 'string' || record.previousVersion === record.version) errors.push('机器审核必须绑定当前 MCP 包身份、版本和摘要')
  const expectedMethod = record.ecosystem === 'npm' ? ['npx'] : ['uvx', 'pip']
  const expectedUrl = record.ecosystem === 'npm' ? 'https://www.npmjs.com/package/' + record.packageName : 'https://pypi.org/project/' + record.packageName
  if (!expectedMethod.includes(manifest.install?.method) || content?.url?.replace(/\/$/, '') !== expectedUrl) errors.push('包生态与目录来源不一致')
  const separator = record.ecosystem === 'npm' ? '@' : '=='
  const selector = record.packageName + separator + record.version
  for (const config of [manifest.install, manifest.connection]) {
    if (!Array.isArray(config?.args) || !config.args.includes(selector)
        || config.args.filter(arg => typeof arg === 'string' && (arg === record.packageName || arg.startsWith(record.packageName + separator))).length !== 1) errors.push('启动配置未唯一固定到审核版本')
  }
  if (checks.some(key => record.checks?.[key] !== true)) errors.push('机器审核检查不完整')
  if (typeof record.reviewedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(record.reviewedAt)
      || !Number.isFinite(Date.parse(record.reviewedAt)) || new Date(record.reviewedAt).toISOString().replace('.000Z', 'Z') !== record.reviewedAt || record.reviewedAt.slice(0, 10) !== compliance?.reviewedAt
      || compliance?.reviewedBy !== MCP_PACKAGE_REVIEWER) errors.push('机器审核身份和日期不一致')
  const evidence = record.licenseEvidenceSha256
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence) || !Object.keys(evidence).length
      || Object.values(evidence).some(value => typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))) errors.push('缺少许可及 Notice 摘要')
  for (const path of [compliance?.licenseEvidencePath, compliance?.noticePath].filter(Boolean)) {
    if (!evidence?.[path]) errors.push('未绑定声明的许可证据路径')
  }
  if (!Array.isArray(record.limitations) || !record.limitations.length) errors.push('缺少核验范围披露')
  try {
    const url = new URL(record.artifactUrl)
    const host = record.ecosystem === 'npm' ? 'registry.npmjs.org' : 'files.pythonhosted.org'
    if (url.protocol !== 'https:' || url.hostname !== host || url.username || url.password) throw new Error()
  } catch { errors.push('固定制品来源无效') }
  return errors
}
