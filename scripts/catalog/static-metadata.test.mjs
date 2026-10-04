import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { findStaticMetrics } from './static-metadata.mjs'

test('metrics are rejected without interpreting examples or configuration parameters as analytics', () => {
  assert.deepEqual(findStaticMetrics({ stars: 99, metrics: { downloads: 3 }, installStatus: 'installed' }), ['stars', 'metrics.downloads', 'installStatus'])
  assert.deepEqual(findStaticMetrics({ description: 'downloads files', toolCount: 13, configSchema: { properties: { rating: { type: 'number' } } } }), [])
})

test('Registry 4.2 keeps the exact reviewed client schema identity', () => {
  const version = readFileSync(new URL('../../SCHEMA_VERSION', import.meta.url), 'utf8').trim()
  assert.equal(version, '4.2.0')
  const bytes = readFileSync(new URL('../../schemas/registry-entry.schema.json', import.meta.url))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '4e585cff3505cd4af875a9065b6e0d4012272cbb843d500fec1ae74928f18cb2')
})
