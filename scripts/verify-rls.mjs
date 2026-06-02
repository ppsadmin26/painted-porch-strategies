#!/usr/bin/env node
/**
 * Verify Supabase RLS policies, storage bucket visibility, and RLS-enabled
 * tables match the committed snapshot at scripts/rls-snapshot.expected.json.
 *
 * Requires `psql` on PATH and the standard PG* env vars (PGHOST, PGUSER,
 * PGPASSWORD, PGDATABASE, PGPORT) — already provided by the Lovable sandbox.
 *
 * Usage:
 *   node scripts/verify-rls.mjs           # verify (exit 1 on diff)
 *   node scripts/verify-rls.mjs --update  # rewrite the snapshot file
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = resolve(__dirname, "rls-snapshot.expected.json");
const UPDATE = process.argv.includes("--update");

const SQL = `
SELECT json_build_object(
  'policies', (SELECT json_agg(row_to_json(p) ORDER BY p.schemaname, p.tablename, p.policyname)
    FROM (SELECT schemaname, tablename, policyname, cmd,
                 (SELECT json_agg(r ORDER BY r) FROM unnest(roles) r) AS roles,
                 qual, with_check, permissive
          FROM pg_policies WHERE schemaname IN ('public','storage')) p),
  'buckets', (SELECT json_agg(row_to_json(b) ORDER BY b.id)
    FROM (SELECT id, name, public FROM storage.buckets) b),
  'rls_enabled_tables', (SELECT json_agg(c.relname ORDER BY c.relname)
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity)
)`;

function canRunPsql() {
  try {
    execSync("psql --version", { stdio: "ignore" });
    return !!process.env.PGHOST;
  } catch {
    return false;
  }
}

function dumpCurrent() {
  const out = execSync(`psql -t -A -c ${JSON.stringify(SQL)}`, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(out.trim());
}

function normalize(obj) {
  // Stable JSON for diffing (keys sorted, deterministic ordering already done in SQL).
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

function deepSortedStringify(value) {
  if (Array.isArray(value)) return value.map(deepSortedStringify);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, k) => {
        acc[k] = deepSortedStringify(value[k]);
        return acc;
      }, {});
  }
  return value;
}

function pretty(o) {
  return JSON.stringify(deepSortedStringify(o), null, 2);
}

if (!canRunPsql()) {
  console.warn(
    "[verify-rls] psql or PGHOST not available — skipping (set PG* env to run).",
  );
  process.exit(0);
}

const current = dumpCurrent();

if (UPDATE) {
  writeFileSync(SNAPSHOT_PATH, pretty(current) + "\n");
  console.log(`[verify-rls] snapshot updated → ${SNAPSHOT_PATH}`);
  process.exit(0);
}

if (!existsSync(SNAPSHOT_PATH)) {
  console.error(
    `[verify-rls] missing snapshot at ${SNAPSHOT_PATH}. Run with --update to create it.`,
  );
  process.exit(1);
}

const expected = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
const a = pretty(expected);
const b = pretty(current);

if (a === b) {
  console.log(
    `[verify-rls] ✅ ${current.policies.length} policies, ${current.buckets.length} buckets, ${current.rls_enabled_tables.length} RLS tables match snapshot.`,
  );
  process.exit(0);
}

// Compute high-level diff for a useful failure message.
function indexBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) m.set(keyFn(x), x);
  return m;
}

function diffPolicies(exp, act) {
  const key = (p) => `${p.schemaname}.${p.tablename}::${p.policyname}`;
  const E = indexBy(exp, key);
  const A = indexBy(act, key);
  const missing = [...E.keys()].filter((k) => !A.has(k));
  const added = [...A.keys()].filter((k) => !E.has(k));
  const changed = [];
  for (const k of E.keys()) {
    if (!A.has(k)) continue;
    if (pretty(E.get(k)) !== pretty(A.get(k))) changed.push(k);
  }
  return { missing, added, changed };
}

const polDiff = diffPolicies(expected.policies, current.policies);

console.error("[verify-rls] ❌ RLS snapshot drift detected");
if (polDiff.missing.length)
  console.error("  Missing policies (in snapshot, not in DB):\n   - " + polDiff.missing.join("\n   - "));
if (polDiff.added.length)
  console.error("  New policies (in DB, not in snapshot):\n   + " + polDiff.added.join("\n   + "));
if (polDiff.changed.length)
  console.error("  Changed policies (definition differs):\n   ~ " + polDiff.changed.join("\n   ~ "));

const bucketDiff = JSON.stringify(expected.buckets) !== JSON.stringify(current.buckets);
if (bucketDiff) {
  console.error("  Storage buckets differ:");
  console.error("    expected:", JSON.stringify(expected.buckets));
  console.error("    actual:  ", JSON.stringify(current.buckets));
}

const rlsDiff =
  JSON.stringify(expected.rls_enabled_tables) !==
  JSON.stringify(current.rls_enabled_tables);
if (rlsDiff) {
  const exp = new Set(expected.rls_enabled_tables);
  const act = new Set(current.rls_enabled_tables);
  const lostRls = [...exp].filter((t) => !act.has(t));
  const gainedRls = [...act].filter((t) => !exp.has(t));
  if (lostRls.length)
    console.error("  Tables that LOST RLS (security regression!):\n   - " + lostRls.join("\n   - "));
  if (gainedRls.length)
    console.error("  Tables that gained RLS:\n   + " + gainedRls.join("\n   + "));
}

console.error(
  "\nIf the change is intentional, regenerate with:\n  node scripts/verify-rls.mjs --update\n",
);
process.exit(1);
