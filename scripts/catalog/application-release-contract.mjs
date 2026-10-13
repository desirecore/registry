/** 作者材料的跨字段检查；身份与运行事实由客户端owner核验，不执行安装说明。 */
export function validateApplicationReleaseContract(manifest) {
  if (manifest.type !== 'web-bundle' && manifest.appRelease === undefined) return []
  const errors = []
  if (!['web-bundle', 'native-app', 'docker-app'].includes(manifest.type)) errors.push('appRelease: unsupported delivery type')
  if (!manifest.appRelease?.requiredCapabilities?.includes('app-authoring-v1')) errors.push('appRelease: app-authoring-v1 capability handshake required')
  if (!manifest.appRelease?.requiredCapabilities?.includes('release') ||
    (manifest.type === 'web-bundle' && !manifest.appRelease.requiredCapabilities.includes('web-bundle'))) errors.push('appRelease: delivery capability handshake required')
  const images = manifest.appRelease?.imageRefs
  if (manifest.type === 'docker-app' && (!Array.isArray(images) || !images.length || images.some(image =>
    typeof image !== 'string' || !/^[a-z0-9][a-z0-9._:/-]*@sha256:[a-f0-9]{64}$/.test(image) ||
    Number(image.split('/')[0].split(':')[1] ?? 0) > 65535))) errors.push('appRelease: Docker images must be pinned by digest')
  if (manifest.type !== 'docker-app' && images !== undefined) errors.push('appRelease: imageRefs belongs only to Docker release')
  const source = manifest.source
  if (!source || !['git', 'release'].includes(source.kind) ||
    !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(source.ref ?? '') || !/^[a-f0-9]{64}$/.test(source.sha256 ?? '')) {
    errors.push('source: authored release requires immutable commit and archive sha256')
  }
  try {
    const url = new URL(source?.url)
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) errors.push('source: credential-free fixed HTTPS URL required')
  } catch { errors.push('source: invalid URL') }
  if (source?.kind === 'git' && !isPortablePath(source.path)) errors.push('source: git archive path must be canonical and relative')
  if (!isPortablePath(manifest.appRelease?.definitionPath)) errors.push('appRelease: definitionPath must be canonical and relative')
  return errors
}

function isPortablePath(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 512 &&
    !/[\\\x00-\x1f?#:]/.test(value) && !value.startsWith('/') &&
    value.split('/').every(part => part.length > 0 && part !== '.' && part !== '..')
}
