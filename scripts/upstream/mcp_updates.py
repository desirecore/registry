"""MCP 固定包来源的发现与机械核验。不安装包、不执行上游代码。"""
from __future__ import annotations

import base64
import copy
import hashlib
import io
import json
import re
import tarfile
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone
from email.parser import BytesParser
from pathlib import Path, PurePosixPath

REVIEW_SCHEMA = json.loads((Path(__file__).resolve().parents[2] / 'schemas/mcp-package-review.v1.schema.json').read_text())
REVIEWER = REVIEW_SCHEMA['properties']['reviewer']['const']
MAX_DOWNLOAD = 32 * 1024 * 1024
MAX_FILE = 16 * 1024 * 1024
MAX_EXPANDED = 128 * 1024 * 1024
MAX_FILES = 5000
NPM_NAME = re.compile(r'(?:@[a-z0-9_.-]+/)?[a-z0-9][a-z0-9_.-]*')
PYPI_NAME = re.compile(r'[A-Za-z0-9][A-Za-z0-9._-]*')
VERSION = re.compile(r'\d+(?:\.\d+){1,3}')



class AuditBlocked(ValueError):
    """证据不足时保持旧目录，不填写新审核通过记录。"""
    def __init__(self, message, findings=None):
        super().__init__(message)
        self.findings = findings or {}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def download(url: str, maximum=MAX_DOWNLOAD) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme != 'https' or parsed.hostname not in
            {'registry.npmjs.org', 'pypi.org', 'files.pythonhosted.org', 'api.github.com'}
            or parsed.username or parsed.password or parsed.port not in (None, 443)):
        raise AuditBlocked('仅获取固定官方包注册表 HTTPS 地址')
    request = urllib.request.Request(url, headers={'User-Agent': 'DesireCore-upstream-review/1.0'})
    chunks, total = [], 0
    with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
        while chunk := response.read(min(64 * 1024, maximum + 1 - total)):
            chunks.append(chunk); total += len(chunk)
            if total > maximum:
                raise AuditBlocked('制品超过自动核验下载预算')
    return b''.join(chunks)


def fetch_json(url):
    return json.loads(download(url, 2 * 1024 * 1024))


def identity(name, ecosystem):
    if not isinstance(name, str): raise AuditBlocked('上游包名称必须是字符串')
    return re.sub('[-_.]+', '-', name).lower() if ecosystem == 'pypi' else name


def discover(manifest: dict, fetch=fetch_json, version_scheme=None) -> dict:
    row = {'id': manifest['id'], 'listedVersion': manifest.get('version')}
    connection, install = manifest.get('connection', {}), manifest.get('install', {})
    if manifest.get('sourceAppId'):
        return {**row, 'status': 'app-managed', 'reason': '随关联应用维护，不独立升级此 MCP 入口'}
    if connection.get('transport') in ('streamable-http', 'sse') and not install:
        return {**row, 'status': 'remote-managed', 'reason': '由服务端维护；目录版本不是实际服务端版本'}
    method, package = install.get('method'), install.get('packageName', '')
    ecosystem = 'npm' if method == 'npx' else 'pypi' if method in ('pip', 'uvx') else None
    if method == 'docker' and manifest['id'] == 'github-mcp' and package == 'ghcr.io/github/github-mcp-server':
        url = 'https://api.github.com/repos/github/github-mcp-server/releases/latest'
        published = fetch(url)
        if not isinstance(published, dict): raise AuditBlocked('发行元数据必须是对象')
        latest, listed = str(published.get('tag_name', '')).removeprefix('v'), manifest.get('version', '')
        if not VERSION.fullmatch(latest) or not VERSION.fullmatch(listed):
            return {**row, 'status':'manual-review-required', 'reason':'容器发行标签不能可靠比较'}
        status = 'current' if latest == listed else 'outdated' if tuple(map(int, latest.split('.'))) > tuple(map(int, listed.split('.'))) else 'upstream-version-behind'
        return {**row,'status':status,'latestVersion':latest,'ecosystem':'github-release','packageName':package,'metadataUrl':url,'metadata':published,
                'reason':'已登记 GitHub 官方发行源；镜像 digest 和准入仍需核验，不自动拉取容器'}
    if ecosystem is None:
        return {**row, 'status': 'requires-version-feed', 'reason': '该交付类型尚无已登记的可靠新版发现与固定制品规则'}
    pattern = NPM_NAME if ecosystem == 'npm' else PYPI_NAME
    if not isinstance(package, str) or not pattern.fullmatch(package):
        return {**row, 'status': 'invalid-package-identity', 'reason': '缺少明确包身份，不能把任意 URL 或命令当作包名'}
    url = (f'https://registry.npmjs.org/{urllib.parse.quote(package, safe="@/")}/latest'
           if ecosystem == 'npm' else f'https://pypi.org/pypi/{package}/json')
    published = fetch(url)
    if not isinstance(published, dict): raise AuditBlocked('包元数据必须是对象')
    details = published if ecosystem == 'npm' else published.get('info')
    if not isinstance(details, dict): raise AuditBlocked('包发行身份必须是对象')
    if identity(details.get('name', ''), ecosystem) != identity(package, ecosystem):
        raise AuditBlocked('上游返回了不同包身份')
    latest, listed = details.get('version', ''), manifest.get('version', '')
    row.update(ecosystem=ecosystem, packageName=package, latestVersion=latest, metadataUrl=url)
    if not all(isinstance(value, str) and VERSION.fullmatch(value) for value in (latest, listed)):
        return {**row, 'status': 'manual-review-required', 'reason': '预发布、标签或不透明版本需单独复核'}
    looks_calver = lambda value: bool(re.fullmatch(r'(?:19|20)\d{2}\.\d{1,2}\.\d{1,2}', value))
    if (version_scheme == 'calver' or (version_scheme is None and looks_calver(listed))) != looks_calver(latest):
        return {**row, 'status':'version-scheme-mismatch', 'reason':'目录与包注册表的版本体系不同，需核对映射；不自动降级或推进'}
    if version_scheme == 'opaque' and latest != listed:
        return {**row, 'status':'manual-review-required', 'reason':'目录版本是不透明标识，不能自动进行数值排序'}
    latest_key, listed_key = (tuple(map(int, value.split('.'))) for value in (latest, listed))
    status = 'outdated' if latest_key > listed_key else 'current' if latest_key == listed_key else 'upstream-version-behind'
    return {**row, 'status': status, 'reason': '只比较公开发行版本，不声称本机已升级', 'metadata': published}


def inspect_archive(body: bytes, ecosystem='npm') -> dict[str, bytes]:
    files, expanded = {}, 0
    def accept(name, size, ordinary, reader):
        nonlocal expanded
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name or not ordinary:
            raise AuditBlocked('制品包含不安全路径、链接或特殊节点')
        if size > MAX_FILE or len(files) >= MAX_FILES or expanded + size > MAX_EXPANDED:
            raise AuditBlocked('制品超过自动核验展开预算')
        normalized = path.as_posix()
        if normalized in files: raise AuditBlocked('制品存在重复文件路径')
        content = reader()
        if len(content) != size: raise AuditBlocked('文件实际长度不匹配')
        files[normalized] = content; expanded += size
    if ecosystem == 'npm':
        with tarfile.open(fileobj=io.BytesIO(body), mode='r:gz') as archive:
            for number, member in enumerate(archive):
                if number >= MAX_FILES: raise AuditBlocked('制品节点数超过核验预算')
                path = PurePosixPath(member.name)
                if member.isdir():
                    if path.is_absolute() or '..' in path.parts or '\\' in member.name: raise AuditBlocked('目录路径不安全')
                    continue
                if not path.parts or path.parts[0] != 'package' or len(path.parts) < 2:
                    raise AuditBlocked('npm 制品必须以 package/ 为内容根')
                accept(PurePosixPath(*path.parts[1:]).as_posix(), member.size, member.isfile(), lambda: archive.extractfile(member).read())
    else:
        with zipfile.ZipFile(io.BytesIO(body)) as archive:
            for member in archive.infolist():
                if member.is_dir(): continue
                mode = member.external_attr >> 16
                accept(member.filename, member.file_size, mode & 0o170000 in (0, 0o100000), lambda: archive.read(member))
    if not files: raise AuditBlocked('制品为空')
    return files


def evidence(files):
    result = {}
    for path, body in files.items():
        parts = PurePosixPath(path).parts
        if parts[-1].upper().startswith(('LICENSE', 'NOTICE', 'COPYING')) or any(part.lower() == 'licenses' for part in parts[:-1]):
            result[path] = hashlib.sha256(body).hexdigest()
    return result


def package_contract(files, ecosystem):
    if ecosystem == 'npm':
        value = json.loads(files['package.json'])
        if not isinstance(value, dict): raise AuditBlocked('package.json 必须是对象')
        keys = ('name', 'license', 'dependencies', 'optionalDependencies', 'peerDependencies',
                'peerDependenciesMeta', 'engines', 'os', 'cpu', 'bin', 'scripts', 'type', 'exports', 'main', 'repository')
        return {key: value.get(key) for key in keys}, value.get('version')
    paths = [path for path in files if path.endswith('.dist-info/METADATA')]
    if len(paths) != 1: raise AuditBlocked('需要唯一的 Python wheel METADATA')
    metadata = BytesParser().parsebytes(files[paths[0]])
    keys = ('Name', 'Requires-Python', 'Requires-Dist', 'Provides-Extra', 'License', 'License-Expression', 'Classifier')
    return {key: sorted(metadata.get_all(key, [])) for key in keys}, metadata.get('Version')


def fixed_artifact(metadata, ecosystem, expected_sha=None):
    if ecosystem == 'npm':
        dist = metadata.get('dist', {})
        if not isinstance(dist, dict): raise AuditBlocked('npm dist 必须是对象')
        url, integrity = dist.get('tarball'), dist.get('integrity')
        if not isinstance(integrity, str) or not integrity.startswith('sha512-'):
            raise AuditBlocked('npm 缺少 SHA-512 integrity 证据')
        return url, integrity
    candidates = metadata.get('urls')
    if not isinstance(candidates, list) or any(not isinstance(item, dict) for item in candidates):
        raise AuditBlocked('PyPI 制品列表格式不正确')
    for item in candidates:
        if not isinstance(item.get('filename'), str) or not isinstance(item.get('digests'), dict):
            raise AuditBlocked('PyPI 制品名称或摘要格式不正确')
        if not re.fullmatch('[a-f0-9]{64}', str(item['digests'].get('sha256', ''))):
            raise AuditBlocked('PyPI 制品缺少有效 SHA-256')
    artifacts = [item for item in candidates if not item.get('yanked')
                 and item.get('filename', '').endswith('-none-any.whl')
                 and (expected_sha is None or item.get('digests', {}).get('sha256') == expected_sha)]
    if len(artifacts) != 1:
        raise AuditBlocked('需要唯一且匹配已审核摘要的通用 Python wheel；平台包需专项复核')
    return artifacts[0]['url'], 'sha256-' + base64.b64encode(bytes.fromhex(artifacts[0]['digests']['sha256'])).decode()


def verified_artifact(metadata, ecosystem, fetch_bytes, expected_sha=None):
    url, integrity = fixed_artifact(metadata, ecosystem, expected_sha)
    # 测试替身也必须满足官方来源约束，不能借注入 fetch 绕过来源规则。
    parsed = urllib.parse.urlsplit(url or '')
    host = 'registry.npmjs.org' if ecosystem == 'npm' else 'files.pythonhosted.org'
    if parsed.scheme != 'https' or parsed.hostname != host or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise AuditBlocked('固定制品不是对应官方包注册表 HTTPS 地址')
    body = fetch_bytes(url)
    if len(body) > MAX_DOWNLOAD: raise AuditBlocked('制品超过下载预算')
    algorithm, encoded = integrity.split('-', 1)
    if base64.b64encode(hashlib.new(algorithm, body).digest()).decode() != encoded:
        raise AuditBlocked('发布摘要与实际制品不一致')
    digest = hashlib.sha256(body).hexdigest()
    if expected_sha is not None and digest != expected_sha:
        raise AuditBlocked('旧包与目录已审核摘要不一致')
    try:
        files = inspect_archive(body, ecosystem)
    except (tarfile.TarError, zipfile.BadZipFile, EOFError) as error:
        raise AuditBlocked('固定制品格式损坏') from error
    return files, digest, url


def advance_selector(config, package, old, new, ecosystem):
    args = config.get('args')
    separator = '@' if ecosystem == 'npm' else '=='
    old_values = {package, package + separator + old, package + ('@latest' if ecosystem == 'npm' else '')}
    if not isinstance(args, list) or sum(arg in old_values for arg in args) != 1:
        raise AuditBlocked('启动选择器不能唯一绑定当前包，需专项复核')
    config['args'] = [package + separator + new if arg in old_values else arg for arg in args]


def prepare_update(manifest, sidecar, result, fetch=fetch_json, fetch_bytes=download, observed_at=None):
    if result.get('status') != 'outdated' or result['listedVersion'] != manifest['version']:
        raise AuditBlocked('新版检查快照已过期或不支持自动推进')
    old, new, ecosystem, package = manifest['version'], result['latestVersion'], result['ecosystem'], result['packageName']
    if ecosystem not in ('npm', 'pypi'):
        raise AuditBlocked('容器或二进制新版需要固定制品 digest 和许可准入证据；不自动拉取或运行')
    governance, content = sidecar.get('governance', {}), sidecar.get('provenance', {}).get('content', {})
    compliance = governance.get('compliance', {})
    if (governance.get('availability') != 'installable' or governance.get('license', {}).get('state') != 'known'
            or compliance.get('reviewedRef') != old or not compliance.get('reviewedBy') or not compliance.get('reviewedAt')
            or content.get('kind') != 'package' or content.get('ref') != old
            or not re.fullmatch('[0-9a-f]{64}', content.get('sha256', ''))):
        raise AuditBlocked('旧版本缺少完整准入与固定制品审核证据')
    expected_url = ('https://www.npmjs.com/package/' + package if ecosystem == 'npm' else 'https://pypi.org/project/' + package + '/')
    if content.get('url', '').rstrip('/') != expected_url.rstrip('/'):
        raise AuditBlocked('目录包来源与实际包身份不一致')
    old_url = (f'https://registry.npmjs.org/{urllib.parse.quote(package, safe="@/")}/{old}'
               if ecosystem == 'npm' else f'https://pypi.org/pypi/{package}/{old}/json')
    old_metadata, new_metadata = fetch(old_url), result['metadata']
    for metadata, version in ((old_metadata, old), (new_metadata, new)):
        if not isinstance(metadata, dict): raise AuditBlocked('固定版本元数据必须是对象')
        details = metadata if ecosystem == 'npm' else metadata.get('info')
        if not isinstance(details, dict): raise AuditBlocked('固定版本包身份必须是对象')
        if identity(details.get('name', ''), ecosystem) != identity(package, ecosystem) or details.get('version') != version:
            raise AuditBlocked('固定版本元数据身份不一致')
    old_files, _, _ = verified_artifact(old_metadata, ecosystem, fetch_bytes, content['sha256'])
    new_files, digest, artifact_url = verified_artifact(new_metadata, ecosystem, fetch_bytes)
    old_evidence, new_evidence = evidence(old_files), evidence(new_files)
    normalize_path = lambda path: re.sub(r'[^/]+\.dist-info/', 'PACKAGE.dist-info/', path, count=1)
    old_normalized = {normalize_path(path):value for path,value in old_evidence.items()}
    new_normalized = {normalize_path(path):value for path,value in new_evidence.items()}
    if not old_evidence or old_normalized != new_normalized:
        raise AuditBlocked('许可证或第三方 Notice 有变化，不能继承旧审核', {
            'licenseOrNoticePaths': sorted(path for path in old_normalized.keys() | new_normalized.keys()
                                          if old_normalized.get(path) != new_normalized.get(path))
        })
    for key in ('licenseEvidencePath', 'noticePath'):
        if compliance.get(key) and compliance[key] not in old_files:
            raise AuditBlocked('声明的许可证据文件不存在')
    evidence_paths = {}
    for path in {compliance.get('licenseEvidencePath'), compliance.get('noticePath'), governance.get('license', {}).get('evidencePath')} - {None}:
        matches = [candidate for candidate in new_evidence if normalize_path(candidate) == normalize_path(path)]
        if path not in old_evidence or len(matches) != 1:
            raise AuditBlocked('声明的许可证据无法绑定新包文件')
        evidence_paths[path] = matches[0]
    old_contract, old_version = package_contract(old_files, ecosystem)
    new_contract, new_version = package_contract(new_files, ecosystem)
    declared_name = new_contract.get('name') if ecosystem == 'npm' else (new_contract.get('Name') or [''])[0]
    if identity(declared_name or '', ecosystem) != identity(package, ecosystem):
        raise AuditBlocked('制品中的包名称与请求身份不同')
    if old_version != old or new_version != new or old_contract != new_contract:
        raise AuditBlocked('包身份、许可、依赖、启动入口或平台要求变化，需要复核')
    # 版本相关的运行验收说明不能随新包机械继承。
    presentation = json.dumps(sidecar.get('presentation', {}), ensure_ascii=False)
    if old in presentation or manifest.get('toolCount') is not None:
        raise AuditBlocked('版本相关说明或工具数量需要新版证据，不能冒充已完成运行验收')
    updated, catalog = copy.deepcopy(manifest), copy.deepcopy(sidecar)
    for config in (updated['install'], updated['connection']):
        advance_selector(config, package, old, new, ecosystem)
    updated['version'] = new
    catalog['release'] = {'state': 'known', 'version': new, 'versionScheme': sidecar['release']['versionScheme']}
    catalog['provenance']['content'].update(ref=new, sha256=digest)
    now = observed_at or datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    datetime.strptime(now, '%Y-%m-%dT%H:%M:%SZ')
    catalog['governance']['compliance'].update(reviewedRef=new, reviewedBy=REVIEWER, reviewedAt=now[:10])
    for key in ('licenseEvidencePath', 'noticePath'):
        if compliance.get(key): catalog['governance']['compliance'][key] = evidence_paths[compliance[key]]
    if governance.get('license', {}).get('evidencePath'):
        catalog['governance']['license']['evidencePath'] = evidence_paths[governance['license']['evidencePath']]
    catalog.setdefault('timestamps', {}).update({
        'catalogUpdatedAt': {'state':'known','value':now,'precision':'second'},
        'upstreamObservedAt': {'state':'known','value':now,'precision':'second'},
        'reviewedAt': {'state':'known','value':now[:10],'precision':'day'},
        'releasePublishedAt': {'state':'unknown'},
    })
    report = {'schemaVersion':1,'reviewer':REVIEWER,'reviewedAt':now,'entryId':manifest['id'],
              'previousVersion':old,'version':new,'packageName':package,'ecosystem':ecosystem,
              'sourceUrl':content['url'],'artifactUrl':artifact_url,'contentSha256':digest,
              'licenseEvidenceSha256':new_evidence,
              'checks':{'publishedIntegrity':True,'previousCatalogDigest':True,'boundedOrdinaryFiles':True,
                        'licenseAndNoticeUnchanged':True,'structuredPrerequisitesUnchanged':True,'pinnedLaunchSelectors':True},
              'limitations':['仅来源、制品、许可和结构化前置条件核验；未执行上游代码、MCP 握手、业务工具或跨平台验收。',
                             '包签名、供应链认证与非结构化行为变化不在本次机械核验范围；不自动合并。']}
    return updated, catalog, report
