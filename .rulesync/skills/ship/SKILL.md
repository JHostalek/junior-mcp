---
name: ship
description: >-
  Bump version, build, verify, tag, and push @jhostalek/junior-mcp. CI handles
  npm publish automatically on tag push.
---
version_bump = $ARGUMENTS

## Pre-publish Checklist

- [ ] All changes committed (clean working tree)
- [ ] No console.log/print in production code
- [ ] No hardcoded secrets or API keys

## Execution

1. **Verify clean state**: `git status` — abort if uncommitted changes

2. **Quality gates** (abort on any failure):
   - Lint + Format: `bun run lint:fix`
   - Typecheck: `bun run typecheck`
   - Tests: `bun test`

3. **Version bump**:
   - If `version_bump` provided, use it (patch/minor/major)
   - If not provided, default to `patch`
   - Run: `npm version <version_bump> --no-git-tag-version`
   - Report old → new version

4. **Build npm bundle**: `bun run build:npm`
   - Verify `dist/index.js` exists
   - Verify shebang: first line must be `#!/usr/bin/env node`

5. **Dry run**: `npm pack --dry-run`
   - Verify only expected files: `dist/index.js`, `package.json`, `README.md`, `LICENSE`
   - Abort if unexpected files (src/, node_modules/, .env, secrets)
   - Report package size

6. **Confirm with user**: Show version, file list, size — ask for go/no-go

7. **Commit version bump**: commit `package.json` with message `chore: bump version to <new_version>`

8. **Tag and push**: `git tag v<new_version> && git push && git push --tags`

## Output

```
Tagged @jhostalek/junior-mcp@<version> — CI will publish to npm
npm: https://www.npmjs.com/package/@jhostalek/junior-mcp
npx: npx -y @jhostalek/junior-mcp
```
