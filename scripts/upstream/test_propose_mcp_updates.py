"""发布与失败报告的单文件回归；GitHub/Git 使用替身，不发送真实 PR。"""
import copy
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import propose_mcp_updates as publisher
from mcp_updates import AuditBlocked


class ProposalTests(unittest.TestCase):
    def setUp(self):
        self.manifest={'id':'demo-mcp','type':'mcp','version':'1.0.0'}
        self.metadata={'governance':{'compliance':{'reviewedRef':'1.0.0','reviewedBy':'previous-reviewer'}}}
        self.result={'id':'demo-mcp','listedVersion':'1.0.0','latestVersion':'1.1.0','status':'outdated','metadataUrl':'https://registry.npmjs.org/demo-mcp/latest'}

    def publish(self, blocked=False, validation_failure=False):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);folder=root/'entries/demo-mcp';folder.mkdir(parents=True)
            (folder/'manifest.json').write_text(json.dumps(self.manifest));(folder/'catalog-metadata.v1.json').write_text(json.dumps(self.metadata))
            seen={}
            def run(*args,cwd=None):
                if args[:3]==('gh','pr','list'):return '[]'
                if args[:3]==('git','worktree','add'):shutil.copytree(root/'entries',Path(args[4])/'entries')
                if args[:2]==('git','restore'):
                    shutil.copyfile(folder/'manifest.json',cwd/'entries/demo-mcp/manifest.json')
                    shutil.copyfile(folder/'catalog-metadata.v1.json',cwd/'entries/demo-mcp/catalog-metadata.v1.json')
                if args[0]=='node' and validation_failure:raise subprocess.CalledProcessError(1,args)
                if args[:3]==('gh','pr','create'):
                    seen['draft']='--draft' in args
                    seen['manifest']=json.loads((cwd/'entries/demo-mcp/manifest.json').read_text())
                    seen['metadata']=json.loads((cwd/'entries/demo-mcp/catalog-metadata.v1.json').read_text())
                    seen['candidate']=(cwd/'entries/demo-mcp/upstream-update-candidate.json').exists()
                return ''
            updated={**self.manifest,'version':'1.1.0'}
            with patch.object(publisher,'ROOT',root),patch.object(publisher,'run',side_effect=run),patch.object(publisher,'prepare_update',return_value=(updated,self.metadata,{'reviewer':'automated:test'}),side_effect=AuditBlocked('license changed') if blocked else None):
                result=copy.deepcopy(self.result)
                self.assertTrue(publisher.publish(root,self.manifest,self.metadata,result,'fixture-user','desirecore/registry'))
                seen['result']=result
            return seen

    def test_successful_audit_and_validators_open_a_normal_pr(self):
        result=self.publish();self.assertFalse(result['draft']);self.assertFalse(result['candidate']);self.assertEqual(result['manifest']['version'],'1.1.0')

    def test_blocked_audit_only_opens_a_candidate_draft_without_changing_old_facts(self):
        result=self.publish(blocked=True);self.assertTrue(result['draft']);self.assertTrue(result['candidate'])
        self.assertEqual(result['manifest'],self.manifest);self.assertEqual(result['metadata'],self.metadata)
        self.assertEqual(result['result']['status'],'review-blocked')

    def test_failed_catalog_validation_restores_old_metadata_before_draft(self):
        result=self.publish(validation_failure=True);self.assertTrue(result['draft']);self.assertEqual(result['manifest'],self.manifest)

    def test_existing_branch_without_pr_is_recovered_as_a_draft_without_overwriting(self):
        calls=[]
        def run(*args,**kwargs):
            calls.append(args)
            if args[:3]==('gh','pr','list'):return '[]'
            if args[:2]==('gh','api'):return 'a'*40
            return ''
        with patch.object(publisher,'run',side_effect=run),patch.object(publisher,'prepare_update') as prepare:
            result=copy.deepcopy(self.result)
            self.assertTrue(publisher.publish(Path('/unused'),self.manifest,self.metadata,result,'fixture-user','desirecore/registry'))
        self.assertTrue(any(args[:3]==('gh','pr','create') and '--draft' in args for args in calls))
        self.assertFalse(any(args[0]=='git' for args in calls))
        prepare.assert_not_called()

    def test_existing_candidates_do_not_consume_the_daily_new_candidate_budget(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary)
            for name in ['a-mcp','b-mcp']:
                folder=root/'entries'/name;folder.mkdir(parents=True)
                (folder/'manifest.json').write_text(json.dumps({**self.manifest,'id':name}))
                (folder/'catalog-metadata.v1.json').write_text(json.dumps(self.metadata))
            calls=[]
            def publish(*args):
                calls.append(args[1]['id']);return len(calls)>1
            with patch.object(publisher,'ROOT',root),patch.object(publisher,'discover',side_effect=lambda item,**kwargs:{**self.result,'id':item['id']}),patch.object(publisher,'publish',side_effect=publish),patch.dict(os.environ,{'GITHUB_REPOSITORY':'desirecore/registry','GITHUB_ACTOR':'fixture-user'}),patch('sys.argv',['propose','--publish','--limit','1','--report',str(root/'report.json')]):
                publisher.main()
            self.assertEqual(calls,['a-mcp','b-mcp'])

    def test_check_failure_is_reported_and_other_sources_still_run(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary)
            for name in ['a-mcp','b-mcp']:
                folder=root/'entries'/name;folder.mkdir(parents=True)
                (folder/'manifest.json').write_text(json.dumps({**self.manifest,'id':name}))
            with patch.object(publisher,'ROOT',root),patch.object(publisher,'discover',side_effect=[OSError('offline'),{'id':'b-mcp','status':'remote-managed'}]),patch('sys.argv',['propose','--report',str(root/'report.json')]):
                with self.assertRaises(SystemExit):publisher.main()
            rows=json.loads((root/'report.json').read_text())
            self.assertEqual([row['status'] for row in rows],['check-failed','remote-managed'])
            self.assertTrue((root/'report.md').is_file())


if __name__=='__main__':unittest.main()
