#!/usr/bin/env node
/**
 * `ray publish` with git-lfs filters disabled.
 *
 * `ray publish` copies the extension directory (excluding only .git /
 * .github / node_modules / raycast-env.d.ts) into a local clone of the
 * raycast/extensions fork and commits it with the system `git add .`
 * (verified from @raycast/api CLI source). Because our .gitattributes is
 * copied along and this machine has global git-lfs filters configured,
 * a plain publish would stage every image as an LFS pointer file and
 * break the store PR.
 *
 * `GIT_CONFIG_*` environment variables act like `git -c` (highest
 * precedence, inherited by every git invocation the CLI spawns), so we
 * neutralize the lfs filter for the publish subprocess only — images are
 * committed as real binaries; no files need to be moved around.
 *
 * Secrets need no shielding here: .env.test is filtered by the
 * raycast/extensions repo's own .gitignore during `git add .`.
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(fileURLToPath(import.meta.url), '../../..')

const gitConfig = [
  ['filter.lfs.clean', 'cat'],
  ['filter.lfs.smudge', 'cat'],
  ['filter.lfs.process', ''],
  ['filter.lfs.required', 'false'],
]

const env = {
  ...process.env,
  GIT_CONFIG_COUNT: String(gitConfig.length),
  ...Object.fromEntries(
    gitConfig.flatMap(([key, value], index) => [
      [`GIT_CONFIG_KEY_${index}`, key],
      [`GIT_CONFIG_VALUE_${index}`, value],
    ]),
  ),
}

const { status } = spawnSync('npx', ['@raycast/api@latest', 'publish'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env,
})

process.exit(status ?? 1)
