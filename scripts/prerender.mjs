#!/usr/bin/env node
/**
 * Postbuild prerender: bake per-route SEO metadata + real content into
 * static HTML files under dist/ so crawlers (ChatGPT, Perplexity,
 * Google, Bing) see full content instead of the empty SPA shell.
 *
 * How it works:
 *   - Reads the built dist/index.html as a template.
 *   - For each route in scripts/prerender-content.mjs, produces
 *     dist/<route>/index.html with:
 *       • rewritten <title>, meta description, canonical, og:*, twitter:*
 *       • real HTML content injected into <div id="root"> (H1, intro,
 *         section headings, key links)
 *   - Real users still get the SPA. main.tsx uses createRoot (not
 *     hydrateRoot), so React replaces the #root children on mount —
 *     no hydration mismatch warnings.
 *
 * Failures are non-fatal: warnings logged, build continues.
 * Skip entirely with PRERENDER=0.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes, SITE } from "./prerender-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

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
  console.log("[prerender] no dist/ — skipping");
  process.exit(0);
}

// Never fail the build on prerender errors.
process.on("uncaughtException", (err) => {
  console.warn(`[prerender] uncaught: ${err.message}`);
  process.exit(0);
});
process.on("unhandledRejection", (err) => {
  console.warn(`[prerender] rejection: ${err?.message ?? err}`);
  process.exit(0);
});

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const escapeAttr = escapeHtml;

const template = await readFile(path.join(DIST, "index.html"), "utf8");

/**
 * Replace the first matching tag in the HTML document.
 * Returns unchanged HTML if the pattern doesn't match (never throws).
 */
function replaceTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html;
}

function renderBody(route) {
  const url = SITE + (route.path === "/" ? "" : route.path);
  const sections = (route.sections ?? [])
    .map(
      (s) =>
        `      <section><h2>${escapeHtml(s.h2)}</h2><p>${escapeHtml(
          s.body,
        )}</p></section>`,
    )
    .join("\n");
  const links = (route.links ?? [])
    .map(
      (l) =>
        `        <li><a href="${escapeAttr(l.href)}">${escapeHtml(l.label)}</a></li>`,
    )
    .join("\n");

  // This content lives inside <div id="root">. Since main.tsx uses
  // createRoot (not hydrateRoot), React replaces these children on
  // mount — no hydration warnings, no visual flash for users because
  // the SPA styles hide untyped body content behind the app shell.
  return `<div style="max-width:760px;margin:2rem auto;padding:1.5rem;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a2e">
      <h1>${escapeHtml(route.h1)}</h1>
      <p>${escapeHtml(route.intro)}</p>
${sections}
${
  links
    ? `      <nav aria-label="Explore"><h2>Explore</h2><ul>\n${links}\n        </ul></nav>`
    : ""
}
      <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
    </div>`;
}

function buildHtml(route) {
  const url = SITE + (route.path === "/" ? "" : route.path);
  let html = template;

  // Title & meta description
  html = replaceTag(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(route.title)}</title>`,
  );
  html = replaceTag(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeAttr(route.description)}">`,
  );

  // Canonical
  html = replaceTag(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
  );

  // Open Graph
  html = replaceTag(
    html,
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapeAttr(route.title)}">`,
  );
  html = replaceTag(
    html,
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapeAttr(route.description)}">`,
  );

  // Twitter
  html = replaceTag(
    html,
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapeAttr(route.title)}">`,
  );
  html = replaceTag(
    html,
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}">`,
  );

  // Inject body content inside #root. Preserves everything after it
  // (noscript, script tags).
  html = replaceTag(
    html,
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${renderBody(route)}</div>`,
  );

  return html;
}

let ok = 0;
let failed = 0;

for (const route of routes) {
  try {
    const html = buildHtml(route);
    const outDir =
      route.path === "/" ? DIST : path.join(DIST, route.path.replace(/^\//, ""));
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html, "utf8");
    console.log(`[prerender] ✓ ${route.path}`);
    ok++;
  } catch (err) {
    console.warn(`[prerender] ✗ ${route.path} — ${err.message}`);
    failed++;
  }
}

// ── Dynamic: prerender blog posts from Supabase ─────────────────────
// Pulls published + scheduled posts and generates
// dist/resources/insights/<slug>/index.html for each one. Non-fatal
// on any error (network, missing env, schema drift).
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

async function prerenderBlogPosts() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.log("[prerender] blog: no Supabase env — skipping");
    return { ok: 0, failed: 0 };
  }
  let posts = [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,cover_image_url,publish_date&status=in.(published,scheduled)&order=publish_date.desc&limit=500`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON, authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) {
      console.warn(`[prerender] blog: fetch ${res.status} — skipping`);
      return { ok: 0, failed: 0 };
    }
    posts = await res.json();
  } catch (err) {
    console.warn(`[prerender] blog: fetch failed — ${err.message}`);
    return { ok: 0, failed: 0 };
  }

  let ok = 0;
  let failed = 0;
  for (const post of posts) {
    if (!post?.slug) continue;
    try {
      const path_ = `/resources/insights/${post.slug}`;
      const title = post.title
        ? `${post.title} | Painted Porch Strategies`
        : "Insight | Painted Porch Strategies";
      const description =
        post.excerpt ||
        "Insight from Painted Porch Strategies on change origination, Phase Zero™ strategy, and Stoic leadership.";
      const route = {
        path: path_,
        title,
        description,
        h1: post.title || "Insight",
        intro: post.excerpt || description,
        ogImage: post.cover_image_url || undefined,
        sections: [],
        links: [
          { href: "/resources/insights", label: "All insights" },
          { href: "/resources", label: "Resources hub" },
          { href: "/blue-door", label: "The Blue Door" },
          { href: "/contact", label: "Contact us" },
        ],
      };
      const html = buildHtml(route);
      const outDir = path.join(DIST, path_.replace(/^\//, ""));
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, "index.html"), html, "utf8");
      ok++;
    } catch (err) {
      console.warn(`[prerender] blog ✗ ${post.slug} — ${err.message}`);
      failed++;
    }
  }
  console.log(`[prerender] blog — ${ok} ok, ${failed} failed`);
  return { ok, failed };
}

const blog = await prerenderBlogPosts();

console.log(
  `[prerender] done — ${ok + blog.ok} ok, ${failed + blog.failed} failed`,
);
process.exit(0);
