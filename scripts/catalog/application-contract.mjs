import { isApplicationEntry, isAuthoredRegistryEntry } from './entry-schema.mjs'

/** 发布者关系声明的跨字段检查；不推导安装、权限或运行时健康。 */
export function validateApplicationContract(manifest) {
  if (!isApplicationEntry(manifest) && !isAuthoredRegistryEntry(manifest)) return []
  const errors = []
  if (isAuthoredRegistryEntry(manifest)) {
    if (!['web-bundle', 'native-app', 'docker-app'].includes(manifest.type)) errors.push('appRelease: unsupported delivery type')
    const required = manifest.appRelease?.requiredCapabilities
    if (!Array.isArray(required) || !required.includes('release') || (manifest.type === 'web-bundle' && !required.includes('web-bundle'))) {
      errors.push('appRelease: delivery capability handshake required')
    }
    const images = manifest.appRelease?.imageRefs
    // 镜像语法由严格 Schema 校验；端口范围属于同一跨字段合同。
    if (manifest.type === 'docker-app' && (!Array.isArray(images) || images.length === 0 || images.some(image =>
      typeof image !== 'string' || Number(image.split('/')[0].split(':')[1] ?? 0) > 65535))) errors.push('appRelease: Docker images must be pinned by digest')
    if (manifest.type !== 'docker-app' && images !== undefined) errors.push('appRelease: imageRefs belongs only to Docker release')
    const source = manifest.source
    if (!source || !['git', 'release'].includes(source.kind) ||
      typeof source.ref !== 'string' || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(source.ref) ||
      typeof source.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(source.sha256)) {
      errors.push('source: authored release requires immutable commit and archive sha256')
    }
    try {
      const url = new URL(String(source?.url))
      if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) errors.push('source: credential-free fixed HTTPS URL required')
    } catch { errors.push('source: invalid URL') }
    if (source?.kind === 'git' && (typeof source.path !== 'string' || !isPortablePath(source.path))) errors.push('source: git archive path must be canonical and relative')
  }
  const ids = new Set()
  for (const entrypoint of Array.isArray(manifest.entrypoints) ? manifest.entrypoints : []) {
    if (!entrypoint || typeof entrypoint !== 'object') continue
    if (ids.has(entrypoint.id)) errors.push('entrypoints: duplicate entrypoint id ' + entrypoint.id)
    ids.add(entrypoint.id)
    if (entrypoint.kind === 'builtin') errors.push('entrypoints: third-party Registry cannot declare builtin routes')
    if (/^(?:legacy|native)-port:/.test(entrypoint.serviceRef ?? '')) errors.push('entrypoints: reserved port references are minted only by the trusted client adapter')
  }
  ids.clear()
  for (const contribution of Array.isArray(manifest.extension?.contributes) ? manifest.extension.contributes : []) {
    if (!contribution || typeof contribution !== 'object') continue
    if (ids.has(contribution.id)) errors.push('extension.contributes: duplicate contribution id ' + contribution.id)
    ids.add(contribution.id)
  }
  return errors
}

function isPortablePath(value) {
  return value.length > 0 && value.length <= 512 &&
    !/[\\\x00-\x1f?#:]/.test(value) && !value.startsWith('/') &&
    value.split('/').every(part => part.length > 0 && part !== '.' && part !== '..')
}
