"""MCP 来源发现与固定制品审核的相关单文件测试；不执行上游代码。"""
import base64
import copy
import hashlib
import io
import json
import tarfile
import tempfile
import subprocess
import unittest
import zipfile
from pathlib import Path
from mcp_updates import discover, prepare_update, AuditBlocked, inspect_archive, fixed_artifact


def archive(version='1.0.0', dependencies=None, license_text=b'MIT previously reviewed', link=False):
    manifest={'name':'example-mcp','version':version,'license':'MIT','engines':{'node':'>=22'},'dependencies':dependencies or {'example':'1.0.0'}}
    output=io.BytesIO()
    with tarfile.open(fileobj=output,mode='w:gz') as tar:
        for name,body in {'package/package.json':json.dumps(manifest).encode(),'package/LICENSE':license_text,'package/main.js':b'throw new Error("must not execute")'}.items():
            info=tarfile.TarInfo(name);info.size=len(body);tar.addfile(info,io.BytesIO(body))
        if link:
            info=tarfile.TarInfo('package/alias');info.type=tarfile.SYMTYPE;info.linkname='/etc/passwd';tar.addfile(info)
    return output.getvalue()


def published(version, body):
    return {'name':'example-mcp','version':version,'dist':{'tarball':f'https://registry.npmjs.org/example-mcp/-/example-mcp-{version}.tgz','integrity':'sha512-'+base64.b64encode(hashlib.sha512(body).digest()).decode()}}


class McpUpdatesTests(unittest.TestCase):
    def setUp(self):
        self.old=archive();self.new=archive('1.1.0')
        self.manifest={'id':'demo-mcp','name':'Demo','type':'mcp','version':'1.0.0','description':'Example service','install':{'method':'npx','packageName':'example-mcp','command':'npx','args':['--yes','--ignore-scripts','example-mcp@1.0.0']},'connection':{'transport':'stdio','command':'npx','args':['--yes','--ignore-scripts','example-mcp@1.0.0']}}
        self.sidecar={'identity':{'kind':'service','id':'demo-mcp'},'presentation':{'i18n':{'zh-CN':{'summary':'示例服务'}}},'release':{'state':'known','version':'1.0.0','versionScheme':'semver'},'provenance':{'content':{'kind':'package','url':'https://www.npmjs.com/package/example-mcp','ref':'1.0.0','sha256':hashlib.sha256(self.old).hexdigest(),'path':'package'}},'governance':{'availability':'installable','license':{'state':'known','value':'MIT','evidencePath':'LICENSE'},'redistribution':'allowed','compliance':{'reviewedRef':'1.0.0','reviewedAt':'2026-10-01','reviewedBy':'previous-reviewer','licenseEvidencePath':'LICENSE','upstreamEndorsed':False}},'timestamps':{}}
        self.documents={'https://registry.npmjs.org/example-mcp/latest':published('1.1.0',self.new),'https://registry.npmjs.org/example-mcp/1.0.0':published('1.0.0',self.old)}
        self.artifacts={published('1.0.0',self.old)['dist']['tarball']:self.old,published('1.1.0',self.new)['dist']['tarball']:self.new}

    def prepare(self):
        result=discover(self.manifest,self.documents.__getitem__)
        return prepare_update(self.manifest,self.sidecar,result,self.documents.__getitem__,self.artifacts.__getitem__,'2026-10-31T08:00:00Z')

    def test_discovers_npm_and_never_executes_the_package(self):
        result=discover(self.manifest,self.documents.__getitem__)
        self.assertEqual(result['status'],'outdated');self.assertEqual(result['latestVersion'],'1.1.0')
        manifest,sidecar,audit=self.prepare()
        self.assertEqual(manifest['connection']['args'][-1],'example-mcp@1.1.0')
        self.assertEqual(sidecar['governance']['compliance']['reviewedRef'],'1.1.0')
        self.assertTrue(sidecar['governance']['compliance']['reviewedBy'].startswith('automated:'))
        self.assertFalse(sidecar['governance']['compliance']['upstreamEndorsed'])
        self.assertEqual(audit['contentSha256'],hashlib.sha256(self.new).hexdigest())
        self.assertNotIn('source',manifest)
        # Python 实际生成的回执交给 Node 真实共享契约，不用另造成功回执冒充组合验收。
        with tempfile.TemporaryDirectory() as temporary:
            payload=Path(temporary)/'receipt.json';payload.write_text(json.dumps({'manifest':manifest,'catalog':sidecar,'receipt':audit}))
            code="import fs from 'node:fs'; import {validateMcpPackageReview} from './scripts/catalog/automated-mcp-review.mjs'; const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const errors=validateMcpPackageReview(p.manifest,p.catalog,p.receipt); if(errors.length) throw new Error(errors.join(';'));"
            subprocess.run(['node','--input-type=module','-e',code,str(payload)],cwd=Path(__file__).resolve().parents[2],check=True,capture_output=True,text=True)


    def test_current_and_rollback_are_distinct(self):
        self.documents['https://registry.npmjs.org/example-mcp/latest']=published('1.0.0',self.old)
        self.assertEqual(discover(self.manifest,self.documents.__getitem__)['status'],'current')
        self.documents['https://registry.npmjs.org/example-mcp/latest']=published('0.9.0',self.old)
        self.assertEqual(discover(self.manifest,self.documents.__getitem__)['status'],'upstream-version-behind')

    def test_remote_and_parent_app_are_not_local_updates(self):
        self.assertEqual(discover({'id':'hosted','type':'mcp','version':'1.0','connection':{'transport':'streamable-http','url':'https://example.com/mcp'}},lambda _:None)['status'],'remote-managed')
        self.assertEqual(discover({'id':'app','type':'mcp','version':'1.0','sourceAppId':'example','connection':{'transport':'stdio'}},lambda _:None)['status'],'app-managed')

    def test_version_scheme_mismatch_is_not_reported_as_current_or_downgraded(self):
        manifest={**self.manifest,'version':'2026.1.26'}
        result=discover(manifest,lambda url:published('2.0.1',self.new),version_scheme='calver')
        self.assertEqual(result['status'],'version-scheme-mismatch')
        self.assertEqual(discover(self.manifest,lambda url:published('1.1.0',self.new),version_scheme='opaque')['status'],'manual-review-required')

    def test_malformed_registry_payload_is_a_reportable_audit_block(self):
        with self.assertRaises(AuditBlocked):discover(self.manifest,lambda url:[])
        for payload in [{'urls':None},{'urls':[None]},{'urls':[{'filename':'x-none-any.whl','digests':None}]}]:
            with self.subTest(payload=payload),self.assertRaises(AuditBlocked):fixed_artifact(payload,'pypi')

    def test_changed_license_paths_are_available_for_review_without_copying_sources(self):
        body=archive('1.1.0',license_text=b'changed terms')
        self.documents['https://registry.npmjs.org/example-mcp/latest']=published('1.1.0',body)
        self.artifacts[published('1.1.0',body)['dist']['tarball']]=body
        with self.assertRaises(AuditBlocked) as raised:self.prepare()
        self.assertEqual(raised.exception.findings,{'licenseOrNoticePaths':['LICENSE']})

    def test_pypi_discovery_and_unsupported_feed_are_explicit(self):
        manifest={**self.manifest,'install':{'method':'uvx','packageName':'example-mcp'}}
        result=discover(manifest,lambda url:{'info':{'name':'example-mcp','version':'1.2.0'},'urls':[]})
        self.assertEqual(result['latestVersion'],'1.2.0');self.assertEqual(result['ecosystem'],'pypi')
        manifest['install']={'method':'docker','packageName':'ghcr.io/example/server'}
        self.assertEqual(discover(manifest,lambda _:None)['status'],'requires-version-feed')

    def test_license_dependency_link_and_digest_changes_block_automatic_approval(self):
        for body in [archive('1.1.0',license_text=b'new terms'),archive('1.1.0',dependencies={'example':'2'}),archive('1.1.0',link=True)]:
            with self.subTest(sha=hashlib.sha256(body).hexdigest()):
                self.new=body;self.documents['https://registry.npmjs.org/example-mcp/latest']=published('1.1.0',body);self.artifacts[published('1.1.0',body)['dist']['tarball']]=body
                with self.assertRaises(AuditBlocked):self.prepare()
        self.new=archive('1.1.0');self.documents['https://registry.npmjs.org/example-mcp/latest']=published('1.1.0',self.new)
        self.artifacts[published('1.1.0',self.new)['dist']['tarball']]=b'corrupt'
        with self.assertRaises(AuditBlocked):self.prepare()

    def test_listing_only_is_not_promoted(self):
        self.sidecar['governance']['availability']='listing-only'
        with self.assertRaisesRegex(AuditBlocked,'准入'):self.prepare()
        self.assertEqual(self.sidecar['governance']['availability'],'listing-only')

    def test_runtime_claims_need_new_evidence(self):
        self.sidecar['presentation']['i18n']['zh-CN']['description']='版本 1.0.0 已进行真实运行验收'
        with self.assertRaisesRegex(AuditBlocked,'版本相关'):self.prepare()

    def test_github_container_feed_is_discovered_without_pulling_images(self):
        manifest={**self.manifest,'id':'github-mcp','install':{'method':'docker','packageName':'ghcr.io/github/github-mcp-server'}}
        result=discover(manifest,lambda url:{'tag_name':'v1.2.0'})
        self.assertEqual(result['status'],'outdated')
        self.assertEqual(result['ecosystem'],'github-release')
        with self.assertRaisesRegex(AuditBlocked,'容器'):prepare_update(manifest,self.sidecar,result)

    def test_pypi_wheel_is_verified_and_versioned_license_path_advances(self):
        def wheel(version,dependency='example==1'):
            output=io.BytesIO()
            with zipfile.ZipFile(output,'w') as bundle:
                bundle.writestr(f'example_mcp-{version}.dist-info/METADATA',f'Name: example-mcp\nVersion: {version}\nLicense: MIT\nRequires-Python: >=3.10\nRequires-Dist: {dependency}\n')
                bundle.writestr(f'example_mcp-{version}.dist-info/licenses/LICENSE','previously reviewed license')
                bundle.writestr('example_mcp/main.py','raise Exception("must not execute")')
            return output.getvalue()
        def metadata(version,body):
            return {'info':{'name':'example-mcp','version':version},'urls':[{'filename':f'example_mcp-{version}-py3-none-any.whl','url':f'https://files.pythonhosted.org/example_mcp-{version}-py3-none-any.whl','digests':{'sha256':hashlib.sha256(body).hexdigest()}}]}
        old,new=wheel('1.0.0'),wheel('1.1.0')
        manifest=copy.deepcopy(self.manifest)
        for config in [manifest['install'],manifest['connection']]:config.update(command='uvx',args=['example-mcp==1.0.0'])
        manifest['install']['method']='uvx'
        sidecar=copy.deepcopy(self.sidecar)
        sidecar['provenance']['content'].update(url='https://pypi.org/project/example-mcp/',sha256=hashlib.sha256(old).hexdigest())
        sidecar['provenance']['content'].pop('path',None)
        path='example_mcp-1.0.0.dist-info/licenses/LICENSE'
        sidecar['governance']['license']['evidencePath']=path
        sidecar['governance']['compliance']['licenseEvidencePath']=path
        result=discover(manifest,lambda url:metadata('1.1.0',new))
        result['metadata']=metadata('1.1.0',new)
        artifacts={metadata('1.0.0',old)['urls'][0]['url']:old,metadata('1.1.0',new)['urls'][0]['url']:new}
        updated,catalog,receipt=prepare_update(manifest,sidecar,result,lambda url:metadata('1.0.0',old),artifacts.__getitem__)
        self.assertEqual(updated['connection']['args'],['example-mcp==1.1.0'])
        self.assertIn('example_mcp-1.1.0.dist-info/licenses/LICENSE',receipt['licenseEvidenceSha256'])
        self.assertEqual(catalog['governance']['compliance']['licenseEvidencePath'],'example_mcp-1.1.0.dist-info/licenses/LICENSE')
        # 所需 Python 或依赖变化不能机械继承。
        changed=wheel('1.1.0',dependency='example==2')
        result['metadata']=metadata('1.1.0',changed);artifacts[result['metadata']['urls'][0]['url']]=changed
        with self.assertRaisesRegex(AuditBlocked,'依赖'):prepare_update(manifest,sidecar,result,lambda url:metadata('1.0.0',old),artifacts.__getitem__)

    def test_package_identity_and_foreign_urls_cannot_be_rewritten(self):
        self.manifest['connection']['args']=['another-package@1.0.0']
        with self.assertRaises(AuditBlocked):self.prepare()
        self.manifest['install']['packageName']='https://attacker.invalid/file'
        self.assertEqual(discover(self.manifest,lambda _:None)['status'],'invalid-package-identity')


if __name__=='__main__':unittest.main()
