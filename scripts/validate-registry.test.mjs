import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const validatorPath = join(scriptDirectory, 'validate-registry.mjs')

const createFixture = async () => {
  const root = await mkdtemp(join(tmpdir(), 'desirecore-registry-test-'))
  await Promise.all([
    cp(join(repositoryRoot, 'entries'), join(root, 'entries'), { recursive: true }),
    cp(join(repositoryRoot, 'schemas'), join(root, 'schemas'), { recursive: true }),
    cp(join(repositoryRoot, 'SCHEMA_VERSION'), join(root, 'SCHEMA_VERSION')),
    cp(join(repositoryRoot, 'manifest.json'), join(root, 'manifest.json')),
  ])
  return root
}

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')

const runValidator = (root) => spawnSync(
  process.execPath,
  [validatorPath, '--root', root],
  { cwd: repositoryRoot, encoding: 'utf8' },
)

const expectRejected = async (mutate, expectedMessage) => {
  const root = await createFixture()
  try {
    await mutate(root)
    const result = runValidator(root)
    assert.equal(result.status, 1, `validator unexpectedly passed:\n${result.stdout}`)
    assert.match(`${result.stdout}\n${result.stderr}`, expectedMessage)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('accepts the checked-in Registry fixture', async () => {
  const root = await createFixture()
  try {
    const result = runValidator(root)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /Registry validation passed: 22 entries/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejects an entry whose directory and id differ', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.id = 'different-id'
    await writeJson(path, manifest)
  }, /id must equal directory name/)
})

test('rejects client-injected sourceId in an upstream manifest', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.sourceId = 'untrusted-source'
    await writeJson(path, manifest)
  }, /sourceId is client-injected/)
})

test('rejects stale root statistics', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'manifest.json')
    const manifest = await readJson(path)
    manifest.stats.externalIntegrations = 0
    await writeJson(path, manifest)
  }, /stats\.externalIntegrations: expected 1, received 0/)
})

test('rejects an unknown external-integration id', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.id = 'unreviewed-bridge'
    await writeJson(path, manifest)
  }, /unknown external-integration id unreviewed-bridge/)
})

for (const kind of ['product', 'documentation', 'chrome-web-store', 'edge-add-ons', 'privacy', 'terms']) {
  test(`rejects a modified ${kind} official URL`, async () => {
    await expectRejected(async (root) => {
      const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
      const manifest = await readJson(path)
      const link = manifest.officialLinks.find((item) => item.kind === kind)
      link.url = `${link.url}/tampered`
      await writeJson(path, manifest)
    }, /URL must exactly equal/)
  })
}

test('rejects a browser-store extension id that does not match its URL path', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    const link = manifest.officialLinks.find((item) => item.kind === 'chrome-web-store')
    link.url = 'https://chromewebstore.google.com/detail/kimi-webbridge/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    await writeJson(path, manifest)
  }, /URL path must end with extensionId/)
})

test('rejects an incorrect structured extension id', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    const link = manifest.officialLinks.find((item) => item.kind === 'edge-addons')
      ?? manifest.officialLinks.find((item) => item.kind === 'edge-add-ons')
    link.extensionId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    await writeJson(path, manifest)
  }, /extensionId must equal bnlffdbcfnanfbknnlaflhlhkocccckg/)
})

test('rejects installation fields for listing-only integrations', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.install = { method: 'unsupported' }
    await writeJson(path, manifest)
  }, /forbidden field "install"/)
})

test('rejects an unverified or unexpected listing maintainer', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.listingMaintainer.url = 'https://github.com/example/registry'
    manifest.listingMaintainer.verified = false
    await writeJson(path, manifest)
  }, /listingMaintainer must be the verified DesireCore Registry URL/)
})

test('rejects a non-tools external category', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.category = 'browser'
    await writeJson(path, manifest)
  }, /must be equal to constant/)
})

test('rejects an unapproved external icon', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.icon = 'kimi-logo'
    await writeJson(path, manifest)
  }, /must be equal to one of the allowed values/)
})

test('rejects extra text files in an external-integration directory', async () => {
  await expectRejected(async (root) => {
    await writeFile(join(root, 'entries', 'kimi-webbridge', 'usage.md'), '# not allowed\n', 'utf8')
  }, /allows only manifest\.json; found file usage\.md/)
})

test('rejects extra directories in an external-integration directory', async () => {
  await expectRejected(async (root) => {
    await mkdir(join(root, 'entries', 'kimi-webbridge', 'assets'))
  }, /allows only manifest\.json; found directory assets/)
})

test('rejects symbolic links in an external-integration directory', { skip: process.platform === 'win32' }, async () => {
  await expectRejected(async (root) => {
    await symlink('manifest.json', join(root, 'entries', 'kimi-webbridge', 'alias.json'))
  }, /allows only manifest\.json; found symbolic link alias\.json/)
})

test('rejects a symbolic-link manifest', { skip: process.platform === 'win32' }, async () => {
  await expectRejected(async (root) => {
    const directory = join(root, 'entries', 'kimi-webbridge')
    const manifestPath = join(directory, 'manifest.json')
    const backupPath = join(directory, 'reviewed.json')
    await cp(manifestPath, backupPath)
    await rm(manifestPath)
    await symlink('reviewed.json', manifestPath)
  }, /manifest\.json: must be a regular file and not a symbolic link/)
})

test('rejects binary files in an external-integration directory', async () => {
  await expectRejected(async (root) => {
    await writeFile(join(root, 'entries', 'kimi-webbridge', 'payload.bin'), Buffer.from([0, 255, 1, 254]))
  }, /allows only manifest\.json; found file payload\.bin/)
})

test('rejects special filesystem entries in an external-integration directory', { skip: process.platform === 'win32' }, async () => {
  await expectRejected(async (root) => {
    const fifoPath = join(root, 'entries', 'kimi-webbridge', 'control.fifo')
    const result = spawnSync('mkfifo', [fifoPath], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
  }, /allows only manifest\.json; found FIFO control\.fifo/)
})

test('rejects an impossible compliance review date', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.compliance.reviewedAt = '2026-02-30'
    await writeJson(path, manifest)
  }, /compliance\.reviewedAt: expected a real YYYY-MM-DD calendar date/)
})

test('rejects an impossible artifact review date', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.compliance.artifactReviews[0].reviewedAt = '2026-13-01'
    await writeJson(path, manifest)
  }, /artifact macos\/arm64 reviewedAt: expected a real YYYY-MM-DD calendar date/)
})

test('rejects an artifact URL that is not pinned to its reviewed version', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.compliance.artifactReviews[0].url =
      'https://cdn.kimi.com/webbridge/unpinned/releases/kimi-webbridge-darwin-arm64'
    await writeJson(path, manifest)
  }, /URL must pin the reviewed version in its release path/)
})

test('rejects query parameters on an immutable artifact URL', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.compliance.artifactReviews[0].url += '?redirect=1'
    await writeJson(path, manifest)
  }, /URL must not contain query or fragment components/)
})

test('rejects unsupported universal artifact architecture', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    manifest.compliance.artifactReviews[0].architecture = 'universal'
    await writeJson(path, manifest)
  }, /must be equal to one of the allowed values/)
})

test('rejects a local daemon that omits Windows', async () => {
  await expectRejected(async (root) => {
    const path = join(root, 'entries', 'kimi-webbridge', 'manifest.json')
    const manifest = await readJson(path)
    const daemon = manifest.components.find((item) => item.kind === 'local-daemon')
    daemon.platforms = ['macos', 'linux']
    await writeJson(path, manifest)
  }, /local-daemon must declare at least Windows and macOS/)
})
