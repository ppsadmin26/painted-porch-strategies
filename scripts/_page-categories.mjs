/**
 * Shared file-path category resolver for brand audit scripts.
 *
 * Audit scripts (validate-body-typography, validate-trademarks, etc.) walk
 * the filesystem, not URL routes, so they need their own heuristic that
 * mirrors src/config/pageCategories.ts but operates on file paths.
 *
 * The three categories match the runtime ones:
 *   public    — scanned + reported
 *   internal  — skipped (admin UIs, internal tooling)
 *   archived  — skipped (legacy / superseded source files)
 */

/** Category for a project-relative file path (e.g. "src/pages/pps/admin/AdminUsers.tsx"). */
export function getFileCategory(filePath) {
  const p = filePath.toLowerCase().replace(/\\/g, "/");
  // Archived source: _archive folders, *Archive*.tsx files, AltArchive variants.
  if (p.includes("_archive") || /archive\.tsx$|archive[a-z0-9]*\.tsx$/.test(p)) return "archived";
  if (/verbatim|homealt|heropreview/.test(p)) return "archived";
  // Internal: admin pages + admin-only components.
  if (p.includes("/admin/") || p.includes("/_admin/")) return "internal";
  return "public";
}

/** True when an audit should skip this file. */
export function shouldSkipFileForAudit(filePath) {
  return getFileCategory(filePath) !== "public";
}
