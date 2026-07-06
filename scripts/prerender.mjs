#!/usr/bin/env node
/**
 * Prerender key public routes into static HTML after `vite build`.
 *
 * How it works:
 *   1. Start `vite preview` against ./dist (SPA fallback built in).
 *   2. Launch headless Chromium (Playwright).
 *   3. For each route, navigate, wait for network idle + short settle,
 *      snapshot the fully hydrated HTML.
 *   4. Rewrite `dist/<route>/index.html` with the snapshot so crawlers
 *      see real content. Real users still get the SPA — React hydrates
 *      on top of the prerendered markup.
 *
 * Failures degrade gracefully: a bad route logs a warning and keeps the
 * original SPA shell. The build never fails on prerender issues.
 *
 * Skip with PRERENDER=0.
 */

import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

// Never fail the build on prerender errors.
process.on("uncaughtException", (err) => {
  console.warn(`[prerender] uncaught: ${err.message} — skipping`);
  process.exit(0);
});
process.on("unhandledRejection", (err) => {
  console.warn(`[prerender] unhandled rejection: ${err?.message ?? err} — skipping`);
  process.exit(0);
});

const ROUTES = [
  "/",
  "/about",
  "/about/approach",
  "/about/impact",
  "/amy",
  "/rob",
  "/sierra",
  "/blue-door",
  "/partner",
  "/partner/ignite",
  "/partner/amplify",
  "/partner/embody",
  "/resources",
  "/resources/free",
  "/resources/faq",
  "/resources/insights",
];

if (process.env.PRERENDER === "0") {
  console.log("[prerender] skipped (PRERENDER=0)");
  process.exit(0);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(DIST))) {
  console.log("[prerender] no dist/ directory — skipping");
  process.exit(0);
}

let playwright;
try {
  playwright = await import("playwright");
} catch {
  console.warn("[prerender] playwright not installed — skipping");
  process.exit(0);
}

// Start `vite preview` as a child process.
const preview = spawn(
  "npx",
  ["vite", "preview", "--port", String(PORT), "--strictPort"],
  { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } },
);

const killPreview = () => {
  try {
    preview.kill("SIGTERM");
  } catch {}
};
process.on("exit", killPreview);
process.on("SIGINT", () => {
  killPreview();
  process.exit(130);
});

async function waitForServer(url, timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

const ready = await waitForServer(BASE);
if (!ready) {
  console.warn("[prerender] preview server did not start — skipping");
  killPreview();
  process.exit(0);
}

async function launchBrowser() {
  try {
    return await playwright.chromium.launch({ headless: true });
  } catch (err) {
    if (!/Executable doesn't exist/i.test(err.message)) throw err;
    console.log("[prerender] installing Chromium (first run)…");
    await new Promise((resolve) => {
      const p = spawn("npx", ["playwright", "install", "chromium"], {
        cwd: ROOT,
        stdio: "inherit",
      });
      p.on("exit", resolve);
    });
    return await playwright.chromium.launch({ headless: true });
  }
}

let browser;
try {
  browser = await launchBrowser();
} catch (err) {
  console.warn(`[prerender] cannot launch Chromium — skipping (${err.message})`);
  killPreview();
  process.exit(0);
}
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (compatible; LovablePrerender/1.0)",
});


let ok = 0;
let failed = 0;

for (const route of ROUTES) {
  const url = BASE + route;
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 15_000 });
    // Small settle for late data or animations.
    await page.waitForTimeout(400);
    const html = await page.content();

    // Ensure hydration marker is present.
    if (!html.includes('id="root"')) {
      throw new Error("no #root in rendered HTML");
    }

    const outDir =
      route === "/" ? DIST : path.join(DIST, route.replace(/^\//, ""));
    await mkdir(outDir, { recursive: true });
    const outFile = path.join(outDir, "index.html");
    await writeFile(outFile, html, "utf8");
    console.log(`[prerender] ✓ ${route}`);
    ok++;
  } catch (err) {
    console.warn(`[prerender] ✗ ${route} — ${err.message}`);
    failed++;
  } finally {
    await page.close();
  }
}

await browser.close();
killPreview();

console.log(`[prerender] done — ${ok} ok, ${failed} failed`);
// Never fail the build on prerender errors.
process.exit(0);
