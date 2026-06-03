/**
 * Build-time script: generate public/robots.txt with current Draft URLs disallowed.
 *
 * Queries the page_status table for explicit Draft entries and outputs a
 * Disallow rule for each.  Runs during `prebuild` so the static file is
 * always in sync with the DB at deploy time.
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL  (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchDraftPaths() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn(
      "[generate-robots-txt] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — skipping draft Disallow rules."
    );
    return [];
  }

  const url = new URL("/rest/v1/page_status", SUPABASE_URL);
  url.searchParams.set("status", "eq.draft");
  url.searchParams.set("select", "path");
  url.searchParams.set("order", "path.asc");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `page_status query failed: ${res.status} ${res.statusText}`
    );
  }

  const rows = await res.json();
  return (rows || []).map((r) => r.path).filter(Boolean);
}

async function main() {
  const draftPaths = await fetchDraftPaths();

  let content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /reset-password
`;

  if (draftPaths.length > 0) {
    content += "\n# Draft pages — hidden from search engines\n";
    for (const path of draftPaths) {
      content += `Disallow: ${path}\n`;
    }
  }

  content += "\nSitemap: /sitemap.xml\n";

  const outPath = resolve("public/robots.txt");
  writeFileSync(outPath, content);
  console.log(
    `[generate-robots-txt] Wrote ${outPath} (${draftPaths.length} draft Disallow rules)`
  );
}

main().catch((err) => {
  console.error("[generate-robots-txt] Failed:", err.message);
  process.exit(1);
});
