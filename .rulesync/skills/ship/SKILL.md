---
name: ship
description: >-
  Bump version and create a release PR for @jhostalek/junior-mcp. On merge, CI
  auto-tags and publishes to npm.
---
version_bump = $ARGUMENTS

## Pre-publish Checklist

- [ ] All changes committed (clean working tree)
- [ ] On `main` branch
- [ ] No console.log/print in production code
- [ ] No hardcoded secrets or API keys

## Execution

1. **Verify clean state**: `git status` — abort if uncommitted changes

2. **Verify on main**: `git branch --show-current` — abort if not on `main`

3. **Pull latest**: `git pull origin main`

4. **Quality gates** (abort on any failure):
   - Lint + Format: `bun run lint:fix`
   - Typecheck: `bun run typecheck`
   - Tests: `bun test`

5. **Version bump**:
   - If `version_bump` provided, use it (patch/minor/major)
   - If not provided, default to `patch`
   - Run: `npm version <version_bump> --no-git-tag-version`
   - Report old → new version

6. **Build npm bundle**: `bun run build:npm`
   - Verify `dist/index.js` exists
   - Verify shebang: first line must be `#!/usr/bin/env node`

7. **Dry run**: `npm pack --dry-run`
   - Verify only expected files: `dist/index.js`, `package.json`, `README.md`, `LICENSE`
   - Abort if unexpected files (src/, node_modules/, .env, secrets)
   - Report package size

8. **Confirm with user**: Show version, file list, size — ask for go/no-go

9. **Create release branch**: `git checkout -b release/v<new_version>`

10. **Commit version bump**: commit `package.json` with message `chore: bump version to <new_version>`

11. **Push and create PR**:
    - `git push -u origin release/v<new_version>`
    - Create PR targeting `main` with title `chore: release v<new_version>`

## Output

```
Release PR created for @jhostalek/junior-mcp@<version>
PR: <pr_url>

On merge, CI will auto-tag and publish to npm.
```
