# Repo guards

## Block large / video files from git history

Videos live in the `site-videos` Cloud Storage bucket and are managed via
`/admin/videos`. Source `.mp4` / `.mov` / `.webm` files do not belong in git
because they previously bloated the GitHub mirror and broke sync.

### What's enforced

`scripts/check-large-files.mjs`:

- ❌ Blocks any tracked `.mp4 .mov .webm .avi .mkv .m4v` file
- ❌ Blocks any tracked file larger than `MAX_FILE_SIZE_MB` (default **5 MB**)
- ✅ Has a `SIZE_ALLOWLIST` for rare legitimate exceptions

### CI

```bash
npm run repo:check-large-files
```

Wire this into the CI pipeline so PRs introducing forbidden files fail the build.

### Local pre-commit

A ready-to-use hook lives at `.githooks/pre-commit`. Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

After that, every `git commit` will run the same check and refuse to commit
forbidden files. Bypass with `git commit --no-verify` only when you know what
you're doing.
