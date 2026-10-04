/** 发布者关系声明的跨字段检查；不推导安装、权限或运行时健康。 */
export function validateApplicationContract(manifest) {
  if (!['docker-app', 'native-app', 'artifact'].includes(manifest.type)) return []
  const errors = []
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
