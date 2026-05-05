#!/usr/bin/env node
/**
 * Repo guardrail: blocks large or video files from entering git history.
 *
 * - Disallows ANY of these extensions in tracked files:
 *     .mp4 .mov .webm .avi .mkv .m4v
 * - Disallows any tracked file > MAX_FILE_SIZE_MB (default 5 MB)
 *
 * Wire-up:
 *   1. CI: run `npm run repo:check-large-files` in your pipeline.
 *   2. Local pre-commit: same script — fails the commit on violation.
 *
 * Why: oversized videos in src/assets/ previously blocked GitHub sync.
 * Videos now live in the `site-videos` Cloud Storage bucket and are managed
 * via /admin/videos. Source files do not belong in git.
 */
import { execSync } from "node:child_process";
import { statSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);
const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Blocked outright regardless of size — these belong in Cloud Storage
const BLOCKED_EXTENSIONS = new Set([
  ".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v",
]);

// Files that may legitimately exceed the size threshold (rare).
// Add explicit allow-list entries here with a justification comment.
const SIZE_ALLOWLIST = new Set([
  // Lead-magnet PDFs served from /downloads — must ship with the static build.
  "public/downloads/From_Passenger_to_Pilot_Flight_Plan.pdf",
  "public/downloads/kick-the-habit-action-guide.pdf",
]);

function listTrackedFiles() {
  const out = execSync("git ls-files", { cwd: projectRoot, encoding: "utf8" });
  return out.split("\n").filter(Boolean);
}

function extOf(path) {
  const i = path.lastIndexOf(".");
  return i === -1 ? "" : path.slice(i).toLowerCase();
}

const violations = { videos: [], oversize: [] };

let files;
try {
  files = listTrackedFiles();
} catch (err) {
  // If git isn't initialized yet (fresh sandbox), exit cleanly.
  console.warn("⚠️  Could not list git-tracked files — skipping check.");
  process.exit(0);
}

for (const rel of files) {
  const abs = resolve(projectRoot, rel);
  if (!existsSync(abs)) continue;
  const ext = extOf(rel);

  if (BLOCKED_EXTENSIONS.has(ext)) {
    violations.videos.push(rel);
    continue;
  }

  let size = 0;
  try {
    size = statSync(abs).size;
  } catch {
    continue;
  }
  if (size > MAX_BYTES && !SIZE_ALLOWLIST.has(rel)) {
    violations.oversize.push({ path: rel, mb: (size / 1024 / 1024).toFixed(2) });
  }
}

if (violations.videos.length === 0 && violations.oversize.length === 0) {
  console.log("✅ No oversized or video files in git history.");
  process.exit(0);
}

console.error("\n❌ Repo guard: forbidden files detected in git history.\n");

if (violations.videos.length) {
  console.error("Video files (must live in the `site-videos` Cloud Storage bucket — manage via /admin/videos):");
  for (const v of violations.videos) console.error(`  • ${v}`);
  console.error("");
}

if (violations.oversize.length) {
  console.error(`Files larger than ${MAX_FILE_SIZE_MB} MB:`);
  for (const v of violations.oversize) console.error(`  • ${v.path} (${v.mb} MB)`);
  console.error(
    "\nIf one of these is genuinely required in the repo, add it to SIZE_ALLOWLIST in scripts/check-large-files.mjs with a justification.\n"
  );
}

console.error(
  "Fix: `git rm --cached <file>` (and delete locally if it's a video), then re-commit.\n"
);
process.exit(1);
