/**
 * Build-time script: generate public/sitemap.xml with static routes + published blog posts.
 *
 * Queries the blog_posts table for published entries and outputs a
 * valid sitemap. Runs during prebuild / predev so the static file is
 * always in sync with the DB at deploy time.
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const BASE_URL = "https://onthepaintedporch.com";

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/about/approach", priority: "0.7", changefreq: "monthly" },
  { path: "/partner", priority: "0.9", changefreq: "monthly" },
  { path: "/partner/ignite", priority: "0.8", changefreq: "monthly" },
  { path: "/partner/ignite/courses", priority: "0.7", changefreq: "monthly" },
  { path: "/partner/ignite/assessments", priority: "0.7", changefreq: "monthly" },
  { path: "/partner/ignite/assessments/working-genius", priority: "0.6", changefreq: "monthly" },
  { path: "/partner/ignite/masterclasses", priority: "0.7", changefreq: "monthly" },
  { path: "/partner/amplify", priority: "0.8", changefreq: "monthly" },
  { path: "/partner/amplify/workshops", priority: "0.7", changefreq: "monthly" },
  { path: "/partner/amplify/sprints", priority: "0.7", changefreq: "monthly" },
  { path: "/partner/amplify/labs", priority: "0.7", changefreq: "monthly" },
  { path: "/partner/amplify/stractical-leader", priority: "0.8", changefreq: "monthly" },
  { path: "/partner/embody", priority: "0.8", changefreq: "monthly" },
  { path: "/resources", priority: "0.8", changefreq: "weekly" },
  { path: "/resources/insights", priority: "0.9", changefreq: "daily" },
  { path: "/resources/free", priority: "0.7", changefreq: "monthly" },
  { path: "/resources/youtube", priority: "0.6", changefreq: "weekly" },
  { path: "/resources/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/resources/stractical-mini", priority: "0.7", changefreq: "monthly" },
  { path: "/media", priority: "0.6", changefreq: "monthly" },
  { path: "/speaking", priority: "0.7", changefreq: "monthly" },
  { path: "/start-here", priority: "0.9", changefreq: "monthly" },
  { path: "/blue-door", priority: "0.9", changefreq: "monthly" },
  { path: "/blue-door/purchase", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/phase-zero", priority: "0.8", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/eq", priority: "0.7", changefreq: "monthly" },
  { path: "/eq-change-leader", priority: "0.7", changefreq: "monthly" },
  { path: "/kick-the-habit", priority: "0.7", changefreq: "monthly" },
  { path: "/kick-the-habit-watch", priority: "0.5", changefreq: "monthly" },
  { path: "/stoic-field-guide", priority: "0.7", changefreq: "monthly" },
  { path: "/stoic-field-guide-access", priority: "0.5", changefreq: "monthly" },
  { path: "/pilot-training", priority: "0.7", changefreq: "monthly" },
  { path: "/pilot-training-watch", priority: "0.5", changefreq: "monthly" },
  { path: "/6-communicator-styles", priority: "0.7", changefreq: "monthly" },
  { path: "/6-communicator-styles-watch", priority: "0.5", changefreq: "monthly" },
  { path: "/change-canvas", priority: "0.7", changefreq: "monthly" },
  { path: "/change-roadmap", priority: "0.7", changefreq: "monthly" },
  { path: "/change-comms", priority: "0.7", changefreq: "monthly" },
  { path: "/burnout", priority: "0.7", changefreq: "monthly" },
  { path: "/burnout-access", priority: "0.5", changefreq: "monthly" },
  { path: "/refund-request", priority: "0.3", changefreq: "yearly" },
];

async function fetchBlogPosts() {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.warn(
      "[generate-sitemap] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — skipping blog posts."
    );
    return [];
  }

  const url = new URL("/rest/v1/blog_posts", SUPABASE_URL);
  url.searchParams.set("status", "eq.published");
  url.searchParams.set("select", "slug,updated_at,publish_date");
  url.searchParams.set("order", "publish_date.desc");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });

  if (!res.ok) {
    console.warn(
      `[generate-sitemap] Blog posts query failed: ${res.status} ${res.statusText} — skipping blog posts.`
    );
    return [];
  }

  const rows = await res.json();
  return rows || [];
}

function generateSitemap(entries) {
  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${entry.path}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

async function fetchNonPublicPaths() {
  if (!SUPABASE_URL || !ANON_KEY) return new Set();
  const url = new URL("/rest/v1/page_status", SUPABASE_URL);
  url.searchParams.set("select", "path,category,status");
  const res = await fetch(url.toString(), {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) return new Set();
  const rows = await res.json();
  const skip = new Set();
  for (const r of rows || []) {
    if (!r.path) continue;
    if (r.status === "draft") skip.add(r.path);
    if (r.category === "internal" || r.category === "archived") skip.add(r.path);
  }
  return skip;
}

async function main() {
  const [posts, skipPaths] = await Promise.all([fetchBlogPosts(), fetchNonPublicPaths()]);
  const today = new Date().toISOString().split("T")[0];

  const entries = staticPages
    .filter((page) => !skipPaths.has(page.path))
    .map((page) => ({
      path: page.path,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    }));

  if (posts.length > 0) {
    for (const post of posts) {
      if (!post.slug) continue;
      const lastmod = (post.updated_at || post.publish_date || today).split("T")[0];
      entries.push({
        path: `/resources/insights/${post.slug}`,
        lastmod,
        changefreq: "monthly",
        priority: "0.7",
      });
    }
  }

  const xml = generateSitemap(entries);
  const outPath = resolve("public/sitemap.xml");
  writeFileSync(outPath, xml);
  console.log(
    `[generate-sitemap] Wrote ${outPath} (${entries.length} URLs, ${posts.length} blog posts, ${skipPaths.size} skipped as draft/internal/archived)`
  );
}

main().catch((err) => {
  console.error("[generate-sitemap] Failed:", err.message);
  process.exit(1);
});
