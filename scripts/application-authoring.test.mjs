import assert from 'node:assert/strict'
import { readFileSync, cpSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { test, afterEach } from 'node:test'
import Ajv from 'ajv'
import { validateRegistry } from './catalog/validator.mjs'
import { validateApplicationReleaseContract } from './catalog/application-release-contract.mjs'

const source = join(dirname(fileURLToPath(import.meta.url)),'..')
const temporary = []
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root,{recursive:true,force:true}) })
const schema = JSON.parse(readFileSync(join(source,'schemas/registry-entry.schema.json'),'utf8'))
const validate = new Ajv({allErrors:true,strict:true,strictTypes:false,strictRequired:false,validateFormats:false}).compile(schema)
const load = id => JSON.parse(readFileSync(join(source,'fixtures/authoring/entries',id,'manifest.json'),'utf8'))

test('4.3只新增兼容与合成fixtures，正式目录仍无web-bundle或appRelease条目',() => {
  const root = JSON.parse(readFileSync(join(source,'manifest.json'),'utf8'))
  assert.equal(root.version,'4.3.0')
  assert.equal(root.stats.totalEntries,24)
  assert.equal(root.stats.webBundles,undefined)
})
test('静态与带服务合成目录三文件保持App语义，两个validator同样通过',() => {
  const root = mkdtempSync(join(tmpdir(),'registry-authoring-'));temporary.push(root)
  cpSync(join(source,'schemas'),join(root,'schemas'),{recursive:true})
  cpSync(join(source,'fixtures/authoring/entries'),join(root,'entries'),{recursive:true})
  const manifest = JSON.parse(readFileSync(join(source,'manifest.json'),'utf8'))
  manifest.stats={totalEntries:3,dockerApps:1,nativeApps:1,webBundles:1,mcpServices:0,httpApis:0,externalIntegrations:0}
  writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest));writeFileSync(join(root,'SCHEMA_VERSION'),'4.3.0\n')
  const report = validateRegistry(root)
  assert.equal(report.ok,true,JSON.stringify(report.errors))
  assert.equal(report.counts.webBundles,1)
  for (const id of ['static-workbench-example','service-workbench-example','docker-workbench-example']) {
    const item=load(id);assert.equal(validate(item),true,JSON.stringify(validate.errors))
    assert.deepEqual(validateApplicationReleaseContract(item),[])
    assert.equal(item.sourceId,undefined)
    assert.notEqual(item.appRelease.releaseDigest,item.source.sha256)
    assert.equal(item.availability,'listing-only')
  }
})
test('不能把完整HTML伪装成artifact、native-node或内部MCP服务',() => {
  const item=load('static-workbench-example')
  for (const change of [copy=>{copy.type='artifact'},copy=>{copy.install.method='native-node'},copy=>{copy.connection={transport:'stdio',command:'node'}},copy=>{copy.appRelease.materialRoot='/private'}]) {
    const copy=structuredClone(item);change(copy);assert.equal(validate(copy),false)
  }
})
test('未知能力、可变ref和私有凭据不成为正式分发事实',() => {
  const item=load('static-workbench-example')
  for (const change of [copy=>{copy.source.ref='latest'},copy=>{copy.source.url='https://credential@git.example.test/private.zip'},copy=>{copy.appRelease.requiredCapabilities=['app-authoring-v1']}]) {
    const copy=structuredClone(item);change(copy);assert.ok(validateApplicationReleaseContract(copy).length>0)
  }
})
test('保留既有native-node条目，新native release字段不污染旧分支',() => {
  const old=JSON.parse(readFileSync(join(source,'entries/desirecore-control/manifest.json'),'utf8'))
  assert.equal(validate(old),true,JSON.stringify(validate.errors))
  old.appRelease=load('service-workbench-example').appRelease
  assert.equal(validate(old),false)
})
test('Docker发布固定真实镜像内容引用，不把浮动tag或错误端口当成固定材料',() => {
  const item=load('docker-workbench-example')
  assert.equal(validate(item),true,JSON.stringify(validate.errors))
  assert.equal(item.install.method,'release');assert.equal(item.install.requirements.docker,true)
  for (const image of ['node:latest','registry.example.test/example/app:1.0.0','localhost:70000/app@sha256:'+'d'.repeat(64)]) {
    const copy=structuredClone(item);copy.appRelease.imageRefs=[image]
    assert.ok(!validate(copy) || validateApplicationReleaseContract(copy).length>0)
  }
})
