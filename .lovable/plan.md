## Goal

Commit baseline visual snapshots for the existing Playwright specs so visual diffs work out of the box in CI, without flaky cross-platform mismatches.

## Decisions (defaulted since you skipped questions)

- **Baseline source**: generate snapshots in this Linux sandbox and commit them. Pin Playwright to a single Chromium/Linux project so CI matches and macOS dev machines don't generate competing baselines.
- **Scope**: both existing specs — `ppshome-card-alignment.spec.ts` (3 viewports) and `video-fallback.spec.ts` (2 states). 5 PNGs total.

## Plan

1. **Pin snapshots to Linux/Chromium** in `playwright.config.ts` via `createLovableConfig` overrides:
   - `projects: [{ name: "chromium", use: devices["Desktop Chrome"] }]`
   - `snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{arg}{ext}"` (stable path, no `-chromium-linux` suffix sprawl)
   - `expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02 } }` (matches per-spec settings)

2. **Add npm scripts** to `package.json`:
   - `"test:e2e": "playwright test"`
   - `"test:e2e:update": "playwright test --update-snapshots"`
   - `"test:e2e:ci": "playwright test --reporter=github,html"`

3. **Generate baselines** in sandbox:
   - `npx playwright install --with-deps chromium`
   - `npm run test:e2e:update`
   - Verify 5 PNGs land under `e2e/__snapshots__/…`

4. **Ensure they commit**:
   - Add `!e2e/__snapshots__/**` allowlist (current `.gitignore` doesn't block them, but make intent explicit with a comment).
   - Keep `test-results/`, `playwright-report/` ignored (add to `.gitignore` if missing).

5. **CI notes** (README snippet in `e2e/README.md`):
   - Run on `ubuntu-latest` only for visual specs.
   - Use `npm run test:e2e:ci`.
   - If a UI change is intentional, contributor runs `npm run test:e2e:update` and commits updated PNGs.

## Risks

- Mocked Supabase route in `video-fallback.spec.ts` should produce a deterministic frame, but the loading state holds a request forever — the snapshot is taken after `Video unavailable…` text appears, which is the fallback path, so it's stable.
- macOS contributors running `test:e2e` locally will see tiny font-rendering diffs vs. the Linux baselines. The 2% diff ratio absorbs most of it; if it's still noisy, we mask text regions in a follow-up.

## Files touched

- `playwright.config.ts` — pin project + snapshot path
- `package.json` — 3 new scripts
- `.gitignore` — add `test-results/`, `playwright-report/`
- `e2e/__snapshots__/**` — 5 new PNG baselines (generated)
- `e2e/README.md` — short contributor doc