# Playwright end-to-end tests

Visual regression specs live here. Baseline screenshots are committed under
`__snapshots__/<spec-file>/<name>.png` so CI can diff against them out of
the box.

## Running

```bash
npm run test:e2e            # all e2e specs against committed baselines
npm run test:e2e:update     # regenerate all baselines (commit the diff)
npm run test:e2e:ci         # CI reporter (github + html), all specs

npm run test:visual         # focused: Discover-cards visual regression
npm run test:visual:update  # regenerate just that spec's baselines
npm run test:visual:ci      # CI reporter, just that spec
```

The `visual-regression.yml` GitHub Actions workflow runs `test:visual:ci`
on PRs that touch `src/`, `e2e/`, or Playwright config, and uploads the
HTML report as an artifact on failure.


## Generating / updating baselines

Snapshots are pinned to **Chromium on Linux** (see `playwright.config.ts`)
so the committed PNGs are deterministic across environments. Always
regenerate from Linux:

- In CI: any Ubuntu runner is fine.
- Locally on macOS / Windows: run inside a Linux container, e.g.

  ```bash
  docker run --rm -it -v "$PWD:/work" -w /work \
    mcr.microsoft.com/playwright:v1.57.0-jammy \
    npm run test:e2e:update
  ```

After regenerating, commit the updated PNGs alongside the UI change so the
visual diff in CI passes.

## CI

Recommended GitHub Actions step (Ubuntu, single project):

```yaml
- run: npm ci
- run: npx playwright install --with-deps chromium
- run: npm run test:e2e:ci
- if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## Cross-browser keyboard / a11y suite (Firefox + WebKit)

The Nix dev sandbox can't launch Firefox or WebKit (missing `libX11-xcb`,
`libatk`, NSS, etc.). Use the bundled Playwright image instead — it ships all
three browsers with system deps preinstalled.

```bash
# One-off, full keyboard suite in all three browsers
docker run --rm -it -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.57.0-jammy \
  bash -lc "npm ci && npm run test:e2e:keyboard:all"

# Or build the project image (adds caching + sensible defaults)
docker build -f Dockerfile.playwright -t pps-playwright .
docker run --rm -it -v "$PWD:/work" -w /work pps-playwright \
  npm run test:e2e:keyboard:all
```

VS Code / Cursor users: "Reopen in Container" picks up
`.devcontainer/devcontainer.json`, which uses the same image and runs
`npx playwright install --with-deps chromium firefox webkit` on create.

