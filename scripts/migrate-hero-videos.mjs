#!/usr/bin/env node
/**
 * One-shot uploader: pushes the 5 hero .mp4 files from src/assets/ into the
 * `site-videos` storage bucket and inserts/updates the matching `site_videos`
 * row so each <LazyHeroVideo> slot resolves to a real URL.
 *
 * Run once:
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/migrate-hero-videos.mjs
 *
 * After it succeeds, the local .mp4 files can be deleted from src/assets/ —
 * the videos live in Cloud Storage from now on.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.\n" +
      "   Export them, then re-run:\n" +
      "   SUPABASE_URL=https://<ref>.supabase.co  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/migrate-hero-videos.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const HEROES = [
  { slot: "ignite-hero",      file: "src/assets/ignite-hero-flame.mp4" },
  { slot: "amplify-hero",     file: "src/assets/amplify-hero-lightbulb.mp4" },
  { slot: "embody-hero",      file: "src/assets/embody-hero-blueprint.mp4" },
  { slot: "partner-hub-hero", file: "src/assets/partner-hero-path.mp4" },
  { slot: "faq-hero",         file: "src/assets/faq-hero.mp4" },
];

const BUCKET = "site-videos";

async function uploadOne({ slot, file }) {
  const abs = resolve(projectRoot, file);
  if (!existsSync(abs)) {
    console.warn(`⚠️  ${slot}: source file not found (${file}) — skipping.`);
    return { slot, skipped: true };
  }

  const info = await stat(abs);
  const buf = await readFile(abs);
  const ext = file.split(".").pop();
  const stamp = Date.now();
  const path = `${slot}/${stamp}.${ext}`;

  console.log(`⬆️  ${slot}: uploading ${(info.size / 1024 / 1024).toFixed(1)} MB → ${path}`);

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, {
      cacheControl: "31536000",
      upsert: false,
      contentType: "video/mp4",
    });

  if (upErr) throw new Error(`upload ${slot}: ${upErr.message}`);

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  // Upsert by slot_key (clean out any prior row + storage objects)
  const { data: existing } = await supabase
    .from("site_videos")
    .select("id, storage_path, poster_path")
    .eq("slot_key", slot)
    .maybeSingle();

  if (existing) {
    const { error: updErr } = await supabase
      .from("site_videos")
      .update({
        video_url: publicUrl,
        storage_path: path,
        poster_url: null,
        poster_path: null,
      })
      .eq("slot_key", slot);
    if (updErr) throw new Error(`update ${slot}: ${updErr.message}`);

    const stale = [existing.storage_path, existing.poster_path].filter(Boolean);
    if (stale.length) {
      await supabase.storage.from(BUCKET).remove(stale);
    }
  } else {
    const { error: insErr } = await supabase.from("site_videos").insert({
      slot_key: slot,
      video_url: publicUrl,
      storage_path: path,
    });
    if (insErr) throw new Error(`insert ${slot}: ${insErr.message}`);
  }

  console.log(`✅ ${slot}: ${publicUrl}`);
  return { slot, url: publicUrl };
}

(async () => {
  console.log(`🚀 Migrating ${HEROES.length} hero videos to bucket "${BUCKET}"...\n`);
  const results = [];
  for (const h of HEROES) {
    try {
      results.push(await uploadOne(h));
    } catch (err) {
      console.error(`❌ ${h.slot}: ${err.message}`);
      results.push({ slot: h.slot, error: err.message });
    }
  }
  console.log("\n──────── Summary ────────");
  for (const r of results) {
    if (r.error) console.log(`  ❌ ${r.slot} — ${r.error}`);
    else if (r.skipped) console.log(`  ⏭️  ${r.slot} — skipped`);
    else console.log(`  ✅ ${r.slot}`);
  }
  const failed = results.filter((r) => r.error).length;
  process.exit(failed ? 1 : 0);
})();
