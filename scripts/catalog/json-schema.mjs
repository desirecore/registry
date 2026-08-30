import { isDeepStrictEqual } from 'node:util'

function joinPath(base, segment) {
  if (typeof segment === 'number') return `${base}[${segment}]`
  return base === '$' ? `$.${segment}` : `${base}.${segment}`
}

function resolveRef(rootSchema, ref) {
  if (!ref.startsWith('#/')) throw new Error(`只支持本地 JSON Pointer $ref，收到 ${ref}`)
  return ref
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((current, part) => current?.[part], rootSchema)
}

function typeMatches(value, type) {
  if (type === 'null') return value === null
  if (type === 'array') return Array.isArray(value)
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value)
  if (type === 'integer') return Number.isInteger(value)
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value)
  return typeof value === type
}

function isUri(value) {
  try {
    const parsed = new URL(value)
    return Boolean(parsed.protocol && parsed.hostname)
  } catch {
    return false
  }
}

function validateNode(value, schema, rootSchema, path, errors) {
  if (schema === true) return
  if (schema === false) {
    errors.push({ path, message: 'Schema 明确拒绝该值' })
    return
  }
  if (!schema || typeof schema !== 'object') return

  if (schema.$ref) {
    const resolved = resolveRef(rootSchema, schema.$ref)
    if (!resolved) {
      errors.push({ path, message: `无法解析 $ref ${schema.$ref}` })
      return
    }
    validateNode(value, resolved, rootSchema, path, errors)
    return
  }

  if (Array.isArray(schema.allOf)) {
    for (const child of schema.allOf) validateNode(value, child, rootSchema, path, errors)
  }

  if (Array.isArray(schema.anyOf)) {
    const candidates = schema.anyOf.map((child) => {
      const childErrors = []
      validateNode(value, child, rootSchema, path, childErrors)
      return childErrors
    })
    if (!candidates.some((candidate) => candidate.length === 0)) {
      errors.push({ path, message: '值不匹配 anyOf 中的任何分支' })
    }
  }

  if (Array.isArray(schema.oneOf)) {
    const candidates = schema.oneOf.map((child) => {
      const childErrors = []
      validateNode(value, child, rootSchema, path, childErrors)
      return childErrors
    })
    const matches = candidates.filter((candidate) => candidate.length === 0).length
    if (matches !== 1) errors.push({ path, message: `值应且仅应匹配 oneOf 的一个分支，实际匹配 ${matches} 个` })
  }

  if (schema.not) {
    const childErrors = []
    validateNode(value, schema.not, rootSchema, path, childErrors)
    if (childErrors.length === 0) errors.push({ path, message: '值命中了 not 禁止的结构' })
  }

  if (schema.if) {
    const conditionErrors = []
    validateNode(value, schema.if, rootSchema, path, conditionErrors)
    const selected = conditionErrors.length === 0 ? schema.then : schema.else
    if (selected) validateNode(value, selected, rootSchema, path, errors)
  }

  if (schema.const !== undefined && !isDeepStrictEqual(value, schema.const)) {
    errors.push({ path, message: `必须等于 ${JSON.stringify(schema.const)}` })
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => isDeepStrictEqual(value, candidate))) {
    errors.push({ path, message: `必须是 ${schema.enum.map((candidate) => JSON.stringify(candidate)).join(' / ')}` })
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type]
    if (!allowed.some((type) => typeMatches(value, type))) {
      errors.push({ path, message: `类型必须是 ${allowed.join(' / ')}` })
      return
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path, message: `长度不能小于 ${schema.minLength}` })
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path, message: `长度不能大于 ${schema.maxLength}` })
    }
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      errors.push({ path, message: `不匹配 pattern ${schema.pattern}` })
    }
    if (schema.format === 'uri' && !isUri(value)) errors.push({ path, message: '必须是绝对 URI' })
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) {
      errors.push({ path, message: '必须是可解析的 date-time' })
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push({ path, message: `不能小于 ${schema.minimum}` })
    if (schema.maximum !== undefined && value > schema.maximum) errors.push({ path, message: `不能大于 ${schema.maximum}` })
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path, message: `元素数量不能少于 ${schema.minItems}` })
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({ path, message: `元素数量不能多于 ${schema.maxItems}` })
    }
    if (schema.uniqueItems) {
      for (let index = 0; index < value.length; index += 1) {
        if (value.slice(0, index).some((candidate) => isDeepStrictEqual(candidate, value[index]))) {
          errors.push({ path: joinPath(path, index), message: '数组元素必须唯一' })
        }
      }
    }
    if (schema.items) {
      value.forEach((item, index) => validateNode(item, schema.items, rootSchema, joinPath(path, index), errors))
    }
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const properties = schema.properties ?? {}
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push({ path: joinPath(path, required), message: '缺少必需字段' })
    }
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
      errors.push({ path, message: `字段数量不能少于 ${schema.minProperties}` })
    }
    for (const [key, childValue] of Object.entries(value)) {
      if (Object.hasOwn(properties, key)) {
        validateNode(childValue, properties[key], rootSchema, joinPath(path, key), errors)
      } else if (schema.additionalProperties === false) {
        errors.push({ path: joinPath(path, key), message: '不允许额外字段' })
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        validateNode(childValue, schema.additionalProperties, rootSchema, joinPath(path, key), errors)
      }
      if (schema.propertyNames?.pattern && !new RegExp(schema.propertyNames.pattern, 'u').test(key)) {
        errors.push({ path: joinPath(path, key), message: `字段名不匹配 pattern ${schema.propertyNames.pattern}` })
      }
    }
  }
}

export function validateJsonSchema(value, schema) {
  const errors = []
  validateNode(value, schema, schema, '$', errors)
  return errors
}
