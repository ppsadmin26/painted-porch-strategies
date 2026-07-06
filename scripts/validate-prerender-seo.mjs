#!/usr/bin/env node
/**
 * Build-time SEO check for prerendered HTML.
 *
 * Scans every dist/**\/index.html and fails the build if any is missing:
 *   - <title> (non-empty, not a Lovable default)
 *   - <meta name="description"> (non-empty, not a Lovable default)
 *   - <link rel="canonical" href="..."> (absolute URL)
 *   - <h1> (non-empty text content)
 *
 * Runs after prerender in `postbuild`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const DEFAULT_TITLES = new Set(['lovable app', 'lovable generated project', 'vite + react + ts']);
const DEFAULT_DESCS = new Set(['lovable generated project', '']);

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'assets' || e.name === 'logos' || e.name === 'media') continue;
      await walk(p, out);
    } else if (e.isFile() && e.name === 'index.html') {
      out.push(p);
    }
  }
  return out;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractMetaDesc(html) {
  const m = html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
  if (!m) return null;
  const c = m[0].match(/content=["']([^"']*)["']/i);
  return c ? c[1].trim() : '';
}

function extractCanonical(html) {
  const m = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const c = m[0].match(/href=["']([^"']*)["']/i);
  return c ? c[1].trim() : '';
}

function extractH1(html) {
  // Match any <h1> in the rendered body; strip tags and whitespace.
  const matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  for (const m of matches) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return '';
}

function checkPage(html) {
  const errors = [];
  const title = extractTitle(html);
  if (!title) errors.push('missing <title>');
  else if (DEFAULT_TITLES.has(title.toLowerCase())) errors.push(`default <title> ("${title}")`);

  const desc = extractMetaDesc(html);
  if (desc === null) errors.push('missing <meta name="description">');
  else if (!desc) errors.push('empty meta description');
  else if (DEFAULT_DESCS.has(desc.toLowerCase())) errors.push(`default meta description ("${desc}")`);

  const canonical = extractCanonical(html);
  if (canonical === null) errors.push('missing <link rel="canonical">');
  else if (!canonical) errors.push('empty canonical href');
  else if (!/^https?:\/\//i.test(canonical)) errors.push(`canonical is not absolute ("${canonical}")`);

  const h1 = extractH1(html);
  if (!h1) errors.push('missing <h1> content');

  return errors;
}

async function main() {
  try {
    await stat(DIST);
  } catch {
    console.error(`[validate-prerender-seo] dist/ not found — skipping.`);
    return;
  }

  const files = await walk(DIST);
  if (files.length === 0) {
    console.error('[validate-prerender-seo] no index.html files found in dist/');
    process.exit(1);
  }

  const failures = [];
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const errs = checkPage(html);
    if (errs.length) failures.push({ file: relative('.', file), errs });
  }

  const total = files.length;
  const ok = total - failures.length;
  console.log(`[validate-prerender-seo] scanned ${total} prerendered pages — ${ok} passed, ${failures.length} failed`);

  if (failures.length) {
    console.error('');
    for (const { file, errs } of failures) {
      console.error(`  ✗ ${file}`);
      for (const e of errs) console.error(`      - ${e}`);
    }
    console.error('');
    console.error(`[validate-prerender-seo] FAIL — ${failures.length} prerendered page(s) missing required SEO tags.`);
    process.exit(1);
  }

  console.log('[validate-prerender-seo] OK — every prerendered page has title, description, canonical, and H1.');
}

main().catch((err) => {
  console.error('[validate-prerender-seo] unexpected error:', err);
  process.exit(1);
});
