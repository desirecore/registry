/** 作者 release 使用受审的新契约；普通条目仍由已发布 global Schema 校验。 */
export const AUTHORED_ENTRY_SCHEMA_FILENAME = 'registry-entry.v4.3.schema.json'

export function isAuthoredRegistryEntry(entry) {
  return entry?.type === 'web-bundle' || (entry !== null && typeof entry === 'object' && Object.hasOwn(entry, 'appRelease'))
}

export function isApplicationEntry(entry) {
  return ['docker-app', 'native-app', 'artifact', 'web-bundle'].includes(entry?.type)
}
