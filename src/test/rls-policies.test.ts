/**
 * Verifies Supabase RLS + storage policies have not drifted from the
 * committed snapshot. Skips automatically when psql / PG* env vars are
 * unavailable (e.g. local checkouts without DB access).
 *
 * To regenerate after an intentional policy change:
 *   node scripts/verify-rls.mjs --update
 */
import { describe, it, expect } from "vitest";
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function hasPsql(): boolean {
  if (!process.env.PGHOST) return false;
  try {
    execSync("psql --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const SNAPSHOT = resolve(process.cwd(), "scripts/rls-snapshot.expected.json");

describe("Supabase RLS policy snapshot", () => {
  if (!hasPsql()) {
    it.skip("requires psql + PG* env vars (skipped in this environment)", () => {});
    return;
  }

  it("snapshot file exists", () => {
    expect(existsSync(SNAPSHOT)).toBe(true);
  });

  it("current policies, buckets, and RLS-enabled tables match snapshot", () => {
    const result = spawnSync("node", ["scripts/verify-rls.mjs"], {
      encoding: "utf8",
    });
    const output = (result.stdout || "") + (result.stderr || "");
    if (result.status !== 0) {
      throw new Error("RLS snapshot drift:\n" + output);
    }
    expect(result.status).toBe(0);
  });

  it("expected high-value tables have RLS enabled", () => {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
    const required = [
      "profiles",
      "blog_posts",
      "page_status",
      "site_videos",
      "backup_runs",
      "backup_settings",
      "access_tokens",
      "email_send_log",
      "suppressed_emails",
    ];
    for (const t of required) {
      expect(snap.rls_enabled_tables, `RLS missing on ${t}`).toContain(t);
    }
  });

  it("storage buckets have the expected public/private visibility", () => {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
    const byId = Object.fromEntries(
      snap.buckets.map((b: { id: string; public: boolean }) => [b.id, b.public]),
    );
    // Private (sensitive)
    expect(byId["backups"]).toBe(false);
    // Public (intentional — assets served via public URLs)
    expect(byId["blog-images"]).toBe(true);
    expect(byId["email-assets"]).toBe(true);
    expect(byId["site-videos"]).toBe(true);
  });

  it("admin/editor-only write policies are present on key tables", () => {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
    const policies = snap.policies as Array<{
      schemaname: string;
      tablename: string;
      policyname: string;
      cmd: string;
      qual: string | null;
      with_check: string | null;
    }>;

    function expectGuard(opts: {
      schema: string;
      table: string;
      cmd: "INSERT" | "UPDATE" | "DELETE";
      guardPattern: RegExp;
    }) {
      const matches = policies.filter(
        (p) =>
          p.schemaname === opts.schema &&
          p.tablename === opts.table &&
          p.cmd === opts.cmd,
      );
      expect(
        matches.length,
        `no ${opts.cmd} policy on ${opts.schema}.${opts.table}`,
      ).toBeGreaterThan(0);
      const guarded = matches.some((p) =>
        opts.guardPattern.test((p.with_check ?? "") + " " + (p.qual ?? "")),
      );
      expect(
        guarded,
        `${opts.cmd} on ${opts.schema}.${opts.table} not guarded by ${opts.guardPattern}`,
      ).toBe(true);
    }

    // site_videos write paths must be admin-or-editor only
    for (const cmd of ["INSERT", "UPDATE", "DELETE"] as const) {
      expectGuard({
        schema: "public",
        table: "site_videos",
        cmd,
        guardPattern: /is_admin_or_editor\(auth\.uid\(\)\)/,
      });
    }

    // page_status writes must be admin only
    for (const cmd of ["INSERT", "UPDATE", "DELETE"] as const) {
      expectGuard({
        schema: "public",
        table: "page_status",
        cmd,
        guardPattern: /is_admin\(auth\.uid\(\)\)/,
      });
    }

    // backups bucket writes (storage.objects) must be admin only
    for (const cmd of ["INSERT", "UPDATE", "DELETE"] as const) {
      const backupPols = policies.filter(
        (p) =>
          p.schemaname === "storage" &&
          p.tablename === "objects" &&
          p.cmd === cmd &&
          /bucket_id\s*=\s*'backups'/.test(
            (p.with_check ?? "") + " " + (p.qual ?? ""),
          ),
      );
      expect(
        backupPols.some((p) =>
          /is_admin\(auth\.uid\(\)\)/.test(
            (p.with_check ?? "") + " " + (p.qual ?? ""),
          ),
        ),
        `backups bucket ${cmd} not guarded by is_admin`,
      ).toBe(true);
    }
  });

  it("access_tokens is fully locked down from client roles", () => {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
    const pols = (snap.policies as any[]).filter(
      (p) => p.schemaname === "public" && p.tablename === "access_tokens",
    );
    expect(pols.length).toBeGreaterThan(0);
    for (const p of pols) {
      // Every policy on access_tokens must deny via `false`
      const expr = (p.qual ?? "") + " " + (p.with_check ?? "");
      expect(expr.trim()).toMatch(/\bfalse\b/);
    }
  });
});
