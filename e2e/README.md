# Playwright end-to-end tests

Visual regression specs live here. Baseline screenshots are committed under
`__snapshots__/<spec-file>/<name>.png` so CI can diff against them out of
the box.

## Running

```bash
npm run test:e2e          # run against committed baselines
npm run test:e2e:update   # regenerate baselines (commit the diff)
npm run test:e2e:ci       # CI reporter (github + html)
```

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
