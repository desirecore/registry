/** Publication-only policy. Keep the byte-pinned authored client schema unchanged. */
const dynamicFields = new Set([
  'stars', 'views', 'viewCount', 'visits', 'visitCount', 'downloads', 'downloadCount',
  'rating', 'ratings', 'ratingCount', 'averageRating', 'popularity', 'usageCount',
  'installCount', 'installedCount', 'activeUsers', 'installStatus', 'installedVersion',
  'healthScore', 'resourceUsage', 'lastHealthCheck',
])
export function findStaticMetrics(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const findings = []
  for (const [key, child] of Object.entries(value)) {
    if (dynamicFields.has(key)) findings.push(prefix + key)
    if (['metrics', 'statistics', 'stats', 'metadata'].includes(key)) {
      findings.push(...findStaticMetrics(child, prefix + key + '.'))
    }
  }
  return findings
}
