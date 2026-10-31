#!/usr/bin/env python3
"""每日发现 MCP 新版；核验通过普通 PR，受阻只提交候选说明草稿。"""
import argparse
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path
from mcp_updates import discover, prepare_update, AuditBlocked

ROOT = Path(__file__).resolve().parents[2]


def run(*args, cwd=ROOT):
    return subprocess.run(args,cwd=cwd,check=True,capture_output=True,text=True).stdout.strip()


def write_report(rows, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    public = [{key:value for key,value in row.items() if key != 'metadata'} for row in rows]
    destination.write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n')
    lines=['| MCP | 目录版本 | 上游版本 | 状态 | 说明 |','|---|---|---|---|---|']
    for row in public:
        cell=lambda value:str(value or '').replace('|','/').replace('\n',' ')
        lines.append('| '+' | '.join(cell(row.get(key)) for key in ['id','listedVersion','latestVersion','status','reason'])+' |')
    destination.with_suffix('.md').write_text('\n'.join(lines)+'\n')


def publish(root, manifest, metadata, result, actor, repository):
    package = re.sub('[^a-zA-Z0-9_.-]','-',result['latestVersion'])
    branch = f"updates/mcp-{manifest['id']}-{package}"
    existing = json.loads(run('gh','pr','list','--repo',repository,'--state','all','--head',branch,'--json','number'))
    open_prs = json.loads(run('gh','pr','list','--repo',repository,'--state','open','--limit','1000','--json','headRefName'))
    if existing or any(pr['headRefName'].startswith(f"updates/mcp-{manifest['id']}-") for pr in open_prs):
        result.update(status='already-proposed',reason='已有候选或同快照记录，保留审核者修改');return False
    # push 已成功但创建 PR 的网络请求失败时，下一轮恢复待审入口，不覆盖既有分支。
    try:
        orphan = run('gh','api',f'repos/{repository}/git/ref/heads/{branch}','--jq','.object.sha')
    except subprocess.CalledProcessError as error:
        if '404' not in (error.stderr or ''): raise
        orphan = ''
    if orphan:
        run('gh','pr','create','--repo',repository,'--base','main','--head',branch,'--draft',
            '--title',f"chore(registry): 恢复 {manifest['id']} 新版候选审核",
            '--body','发现已有候选分支但没有 PR。仅恢复草稿审核入口，未重新核验分支内容；合并前须复核来源、摘要及目录校验。\n\nRecovered an existing candidate branch as a draft; no new review or auto-merge.')
        result.update(status='review-blocked',reason='恢复已有候选分支的草稿；未重新核验其内容，不覆盖维护者修改')
        return True
    proposal, receipt, reason, findings = None, None, None, {}
    try:
        updated, sidecar, receipt = prepare_update(manifest,metadata,result)
        proposal = (updated,sidecar)
    except (AuditBlocked, OSError, ValueError, KeyError, RuntimeError) as error:
        reason=str(error)[:500]
        findings=getattr(error,'findings',{})
    with tempfile.TemporaryDirectory(prefix='mcp-update-') as temporary:
        checkout=Path(temporary)/'checkout'
        run('git','worktree','add','--detach',str(checkout),'HEAD')
        try:
            run('git','switch','-c',branch,cwd=checkout)
            folder=checkout/'entries'/manifest['id'];paths=[]
            def write(name,value):
                (folder/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
                paths.append(str((folder/name).relative_to(checkout)))
            if proposal:
                write('manifest.json',proposal[0]);write('catalog-metadata.v1.json',proposal[1]);write('upstream-audit.v1.json',receipt)
                try:
                    run('node','scripts/validate-registry.mjs',cwd=checkout)
                    run('node','scripts/catalog/validate-registry.mjs','--require-sidecars',cwd=checkout)
                except subprocess.CalledProcessError:
                    run('git','restore','--',*paths[:2],cwd=checkout)
                    (folder/'upstream-audit.v1.json').unlink();paths=[];receipt=None
                    reason='目录校验未通过；保留现有版本、审核及运行事实'
            if not receipt:
                write('upstream-update-candidate.json',{
                    'schemaVersion':1,'entryId':manifest['id'],'listedVersion':manifest['version'],
                    'observedVersion':result['latestVersion'],'metadataUrl':result['metadataUrl'],
                    'reason':reason,'reviewPassed':False,
                    'findings':findings,
                    'note':'仅候选说明，不修改当前 manifest、sidecar、审核结论或安装状态。',
                })
            run('git','add','--',*paths,cwd=checkout)
            run('git','-c',f'user.name={actor}','-c',f'user.email={actor}@users.noreply.github.com','commit','-m',f"chore(registry): 更新 {manifest['id']} 候选 {result['latestVersion']}",cwd=checkout)
            run('git','push','origin',f'HEAD:refs/heads/{branch}',cwd=checkout)
            body=Path(temporary)/'body.md'
            body.write_text(f"{manifest['id']}: {manifest['version']} → {result['latestVersion']}\n\n"
                +( '来源、旧摘要、发布摘要、许可与结构化前置条件核验通过，附机器记录。\n' if receipt else '核验受阻：'+str(reason)+'。仅提交候选说明，旧目录与审核不变。\n')
                +'\n未运行上游安装脚本、MCP 握手或业务工具，不代表安全认证或新版运行验收。不自动合并。\n\n'
                +'Automated package-source verification only; no upstream execution, runtime/security acceptance or auto-merge.\n')
            args=['gh','pr','create','--repo',repository,'--base','main','--head',branch,'--title',f"chore(registry): 更新 {manifest['id']} 至 {result['latestVersion']}",'--body-file',str(body)]
            if not receipt:args.append('--draft')
            run(*args,cwd=checkout)
            result.update(status='proposed' if receipt else 'review-blocked',reason=reason or '机器核验通过，已提交普通 PR；未合并或升级用户服务')
            return True
        finally:
            run('git','worktree','remove','--force',str(checkout))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--publish',action='store_true')
    parser.add_argument('--limit',type=int,default=5)
    parser.add_argument('--report',type=Path,default=Path('mcp-upstream-report.json'))
    args=parser.parse_args()
    if args.limit<1:parser.error('limit 必须大于零')
    repository=os.environ.get('GITHUB_REPOSITORY','desirecore/registry');actor=os.environ.get('GITHUB_ACTOR','')
    if args.publish and (repository!='desirecore/registry' or not re.fullmatch('[A-Za-z0-9-]+',actor)):
        parser.error('仅允许官方仓库使用触发用户身份发布')
    rows=[];failed=False;count=0
    try:
        for path in sorted((ROOT/'entries').glob('*/manifest.json')):
            manifest=json.loads(path.read_text())
            if manifest.get('type')!='mcp':continue
            try:
                sidecar_path=path.parent/'catalog-metadata.v1.json'
                metadata=json.loads(sidecar_path.read_text()) if sidecar_path.exists() else {}
                result=discover(manifest,version_scheme=metadata.get('release',{}).get('versionScheme'))
            except (OSError,ValueError,KeyError,RuntimeError) as error:
                result={'id':manifest['id'],'listedVersion':manifest['version'],'status':'check-failed','reason':str(error)[:300]};failed=True
            rows.append(result)
            if result['status']=='outdated' and args.publish and count<args.limit:
                try:
                    created = publish(ROOT,manifest,metadata,result,actor,repository)
                    if created: count+=1
                except (OSError,ValueError,KeyError,subprocess.SubprocessError) as error:
                    count+=1
                    result.update(status='publish-failed',reason=str(error)[:300]);failed=True
    finally:
        write_report(rows,args.report)
    if failed:raise SystemExit(1)


if __name__=='__main__':main()
