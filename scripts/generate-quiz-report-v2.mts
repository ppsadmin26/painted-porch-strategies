// Generates an expanded P.A.T.H.finder quiz routing report (v2):
// - Includes PRIMARY + SECONDARY (also-worth-exploring) + FREE resources
// - Uses live DB URL resolver (path_finder_offerings + page_status drafts)
// - Groups by full recommendation fingerprint so answer-driven variations surface
//
// REQUIRED ENUMERATION DIMENSIONS (see
// .lovable/memory/features/quiz/pq2-routing-and-scout-mode.md — do not remove):
//   B2C: PQ2 ∈ {current, aspiring} × Q1..Q6 ∈ {A,B,C,D}^6 = 8192 combos.
//        PQ2 only changes narrative, not recommendations, but MUST be in the
//        fingerprint or current/aspiring variants silently collapse.
//   B2B: every branch MUST enumerate all 4 Q4DM values (A/B/C/D), not just C.
//        Q4DM="A" triggers the Scout-Mode reroute (Lab primary, workshops
//        demoted). Dropping it from the loop hides scout variants entirely.
// The variant fingerprint includes PQ2 (B2C) and Q4DM (B2B) for the same reason.

import { buildResult, OFFERINGS, type Answers, type Track, type ResultType } from "../src/data/pathFinderQuiz";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const SUPABASE_URL = "https://dkpxjivoupqpmvzwxpef.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcHhqaXZvdXBxcG12end4cGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDc2MjAsImV4cCI6MjA5MzU4MzYyMH0.wYGKqj6Q7E1M_rQMNHuchOHAVV04WqyozEK937u1VBo";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadResolvedUrls(): Promise<Record<string, string>> {
  const [{ data: offs }, { data: drafts }] = await Promise.all([
    sb.from("path_finder_offerings").select("offering_key, current_url, dedicated_url, anchor_id, is_live"),
    sb.from("page_status").select("path").eq("status", "draft"),
  ]);
  const draftPaths = new Set<string>((drafts ?? []).map((r: any) => (r.path ?? "").trim()).filter(Boolean));
  const pathOf = (u: string | null) => {
    if (!u) return null;
    const t = u.trim();
    if (!t || /^https?:\/\//i.test(t)) return null;
    return t.split("#")[0].split("?")[0] || null;
  };
  const map: Record<string, string> = {};
  for (const row of offs ?? []) {
    const p = pathOf((row as any).dedicated_url);
    const dedicatedIsDraft = p ? draftPaths.has(p) : false;
    let url = (row as any).is_live && (row as any).dedicated_url && !dedicatedIsDraft
      ? (row as any).dedicated_url
      : (row as any).current_url;
    if (!url) continue;
    if ((row as any).anchor_id && !url.includes("#")) url = `${url}#${(row as any).anchor_id}`;
    map[(row as any).offering_key] = url;
  }
  return map;
}

const ANSWER_LABELS: Record<string, Record<string, string>> = {
  PQ2: { current: "Current leader", aspiring: "Aspiring leader" },
  Q1: { A: "Show up well (foundation)", B: "Message lands (communication)", C: "Lead a team (people)", D: "Lead change" },
  Q2: { A: "Foundation focus", B: "Communication focus", C: "Team focus", D: "Change focus" },
  Q3: { A: "Self-focus", B: "Collaboration gap", C: "Friction", D: "Depth on self" },
  Q4: { A: "Navigated, found footing", B: "Led, improvised", C: "Led, want architecture", D: "Led well, want depth" },
  Q5: { A: "Groundwork", B: "Active development", C: "Through complexity", D: "Integration point" },
  Q6: { A: "Exploring", B: "Self-paced ready", C: "Cohort ready", D: "Deepest engagement" },
  OrgPQ2: { A: "Team dynamics", B: "Change/transformation", C: "Leadership capability", D: "Strategic inflection" },
  OrgPQ3: { A: "Defined start (workshop)", B: "Deeper look first", C: "Not sure yet" },
  Q4DM: { A: "Just me", B: "Small group", C: "Leadership team", D: "Exec/board mandate" },
  Q1Team: { A: "Conflict/friction", B: "Collaboration gaps", C: "Inconsistent performance", D: "Team changing" },
  Q2Team: { A: "One team", B: "Leaders org-wide", C: "Whole org" },
  Q1Change: { A: "Specific initiative", B: "Velocity", C: "Not sticking", D: "AI adoption" },
  Q2Change: { A: "Leaders gap", B: "People resistance", C: "Communication", D: "Systemic" },
  Q1Cap: { A: "EQ", B: "Strategic thinking", C: "Communication", D: "Resilience" },
  Q2Cap: { A: "Single workshop", B: "Multi-session series", C: "Individual + team" },
  Q1Strategic: { A: "Identity/culture", B: "Leadership architecture", C: "Tech transformation", D: "Scale/restructure" },
};

function labelAnswer(qid: string, opt: string): string {
  if (Array.isArray(opt)) return "(multi)";
  return ANSWER_LABELS[qid]?.[opt] ?? opt;
}

interface Variant {
  resultType: ResultType;
  headline: string;
  primaryKeys: string[];
  secondaryKeys: string[];
  freeKeys: string[];
  strongestKey?: string;
  count: number;
  sampleAnswers: Answers;
  drivers: string[]; // which answer values drove this variant
}

async function main() {
  const urls = await loadResolvedUrls();
  console.log(`Loaded ${Object.keys(urls).length} resolved URLs from DB`);

  const fingerprintGroups: Record<string, Map<string, Variant>> = { b2c: new Map(), b2b: new Map() };

  const recordResult = (track: Track, answers: Answers) => {
    const r = buildResult(track, answers);
    const primaryKeys = r.primaryGroup?.offerings.map((o) => o.key) ?? [];
    const alsoGroup = r.groups.find((g) => /also worth/i.test(g.heading) || /pick the lab/i.test(g.heading));
    const secondaryKeys = alsoGroup?.offerings.map((o) => o.key) ?? [];
    const freeGroup = r.groups.find((g) => /free/i.test(g.heading));
    const freeKeys = freeGroup?.offerings.map((o) => o.key) ?? [];
    const pq2Tag = track === "b2c" ? `|PQ2:${(answers as any).PQ2 ?? ""}` : "";
    const fp = `${r.resultType}${pq2Tag}|P:${primaryKeys.join(",")}|S:${secondaryKeys.join(",")}|F:${freeKeys.join(",")}|N:${r.strongestNextStep?.offering.key ?? ""}`;
    const bucket = fingerprintGroups[track];
    const existing = bucket.get(fp);
    if (existing) {
      existing.count += 1;
    } else {
      bucket.set(fp, {
        resultType: r.resultType,
        headline: r.headline,
        primaryKeys,
        secondaryKeys,
        freeKeys,
        strongestKey: r.strongestNextStep?.offering.key,
        count: 1,
        sampleAnswers: { ...answers },
        drivers: [],
      });
    }
  };

  // B2C: PQ2 (current/aspiring) × Q1..Q6 (2 × 4^6 = 8192)
  const OPTS = ["A", "B", "C", "D"];
  for (const pq2 of ["current", "aspiring"])
    for (const q1 of OPTS) for (const q2 of OPTS) for (const q3 of OPTS) for (const q4 of OPTS) for (const q5 of OPTS) for (const q6 of OPTS)
      recordResult("b2c", { PQ2: pq2, Q1: q1, Q2: q2, Q3: q3, Q4: q4, Q5: q5, Q6: q6 });

  // B2B branches
  for (const q1 of OPTS) for (const q2 of ["A","B","C"]) for (const q3 of ["comm","resilience","neither"]) for (const dm of OPTS) for (const pq3 of ["A","B","C"])
    recordResult("b2b", { OrgPQ2: "A", Q1Team: q1, Q2Team: q2, Q3Team: [q3], Q4DM: dm, OrgPQ3: pq3 });
  for (const q1 of OPTS) for (const q2 of OPTS) for (const q3 of ["comm","resilience","neither"]) for (const dm of OPTS) for (const pq3 of ["A","B","C"])
    recordResult("b2b", { OrgPQ2: "B", Q1Change: q1, Q2Change: q2, Q3Change: [q3], Q4DM: dm, OrgPQ3: pq3 });
  for (const q1 of OPTS) for (const q2 of ["A","B","C"]) for (const q3 of ["comm","resilience","neither"]) for (const dm of OPTS) for (const pq3 of ["A","B","C"])
    recordResult("b2b", { OrgPQ2: "C", Q1Cap: q1, Q2Cap: q2, Q3Cap: [q3], Q4DM: dm, OrgPQ3: pq3 });
  for (const q1 of OPTS) for (const q2 of ["comm","resilience","neither"]) for (const dm of OPTS) for (const pq3 of ["A","B","C"])
    recordResult("b2b", { OrgPQ2: "D", Q1Strategic: q1, Q2Strategic: [q2], Q4DM: dm, OrgPQ3: pq3 });

  // Render markdown
  const out: string[] = [];
  out.push("# P.A.T.H.finder Quiz — Routing Test Guide (v2)\n");
  out.push(`Generated: ${new Date().toISOString()}\n`);
  out.push("Each result type below shows the **complete recommendation slate**: primary picks, secondary (\"also worth exploring\"), free resources, and the strongest next step. Variants within a result type reflect answer-driven differences (e.g., cohort vs. self-paced).\n");
  out.push("URLs reflect the live DB resolver (`path_finder_offerings` + `page_status` drafts) — the same logic the site uses.\n");
  out.push("---\n");

  const fmtOffering = (key: string) => {
    const o = (OFFERINGS as any)[key];
    if (!o) return `\`${key}\` (UNKNOWN)`;
    const url = urls[key] ?? o.url ?? "(no url)";
    return `[${o.name}](${url}) — _${o.tier}_`;
  };

  const fmtAnswers = (a: Answers): string =>
    Object.entries(a).map(([k, v]) => {
      const lbl = Array.isArray(v) ? v.map((x) => labelAnswer(k, x)).join("+") : labelAnswer(k, v as string);
      return `**${k}**=${lbl}`;
    }).join(" · ");

  for (const track of ["b2c", "b2b"] as Track[]) {
    out.push(`\n## ${track.toUpperCase()} Results\n`);
    const variants = Array.from(fingerprintGroups[track].values());
    const byRt = new Map<ResultType, Variant[]>();
    for (const v of variants) {
      if (!byRt.has(v.resultType)) byRt.set(v.resultType, []);
      byRt.get(v.resultType)!.push(v);
    }
    const sortedRTs = Array.from(byRt.keys()).sort();
    for (const rt of sortedRTs) {
      const vList = byRt.get(rt)!.sort((a, b) => b.count - a.count);
      const total = vList.reduce((s, v) => s + v.count, 0);
      out.push(`\n### ${rt} — ${vList[0].headline}`);
      out.push(`*Total matching combinations:* **${total}** across **${vList.length}** distinct recommendation slate${vList.length > 1 ? "s" : ""}\n`);
      vList.forEach((v, i) => {
        const pq2 = (v.sampleAnswers as any).PQ2;
        const pq2Tag = track === "b2c" && pq2
          ? ` — _${pq2 === "aspiring" ? "Aspiring Leader" : "Current Leader"}_`
          : "";
        const q4dm = (v.sampleAnswers as any).Q4DM;
        const scoutTag = track === "b2b" && q4dm === "A" ? " — _Scout Mode (Q4DM=A)_" : "";
        out.push(`\n#### Variant ${i + 1} — ${v.count} combination${v.count > 1 ? "s" : ""}${pq2Tag}${scoutTag}`);
        out.push(`Triggered by answers like: ${fmtAnswers(v.sampleAnswers)}\n`);
        if (v.strongestKey) out.push(`**Strongest Next Step:** ${fmtOffering(v.strongestKey)}\n`);
        out.push(`**Primary Recommendations:**`);
        if (v.primaryKeys.length === 0) out.push(`- _(none)_`);
        for (const k of v.primaryKeys) out.push(`- ${fmtOffering(k)}`);
        out.push(`\n**Also Worth Exploring (Secondary):**`);
        if (v.secondaryKeys.length === 0) out.push(`- _(none)_`);
        for (const k of v.secondaryKeys) out.push(`- ${fmtOffering(k)}`);
        out.push(`\n**Free Resource(s) — Get Started:**`);
        if (v.freeKeys.length === 0) out.push(`- _(none — see Blue Door / contact)_`);
        for (const k of v.freeKeys) out.push(`- ${fmtOffering(k)}`);
        out.push("");
      });
    }
  }

  // Targeting concerns section
  out.push("\n---\n\n## Targeting Notes & Observations\n");
  out.push("Variants where the primary slate is **identical across many answer combinations** indicate the result type is recommending a *category* of offerings rather than narrowing to the specific signal.\n");
  const concerns: string[] = [];
  for (const track of ["b2c", "b2b"] as Track[]) {
    for (const v of fingerprintGroups[track].values()) {
      if (v.primaryKeys.length >= 4 && v.count >= 100) {
        concerns.push(`- **${track.toUpperCase()} ${v.resultType}** surfaces ${v.primaryKeys.length} primary picks for ${v.count} combinations — likely under-targeted. Primary: ${v.primaryKeys.join(", ")}`);
      }
    }
  }
  out.push(concerns.length ? concerns.join("\n") : "_No broad-recommendation flags detected._");
  out.push("");

  writeFileSync("/mnt/documents/quiz-routing-report-v2.md", out.join("\n"));
  console.log("Wrote /mnt/documents/quiz-routing-report-v2.md");
}

main().catch((e) => { console.error(e); process.exit(1); });
