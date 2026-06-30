import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Info } from "lucide-react";
import { routingSummaryForTier } from "@/lib/quizRoutingSummary";

/**
 * Placeholder admin page documenting the full P.A.T.H.finder quiz routing
 * logic. Source of truth lives in code (src/data/pathFinderQuiz.ts and
 * src/integrations/op-platform/personaMap.ts) — this page mirrors it so
 * non-engineers can audit how a quiz answer becomes a recommendation list.
 *
 * If you change routing logic in code, update this page and the per-tier
 * helper at src/lib/quizRoutingSummary.ts.
 */

const TIERS = [
  "Free",
  "Speaking",
  "Workshop",
  "Blue Door",
  "IGNITE",
  "AMPLIFY",
  "Assessment",
] as const;

const PERSONAS = [
  { id: "b2c_individual", label: "B2C individual", note: "B2C track respondents." },
  { id: "b2b_leader",     label: "B2B leader",     note: "Single-leader org track." },
  { id: "b2b_exec",       label: "B2B exec",       note: "C-suite / strategic decision-maker." },
  { id: "b2b_team",       label: "B2B team",       note: "Team / department scope." },
  { id: "b2b_org",        label: "B2B org",        note: "Whole-org / multi-team scope." },
];

const SCORING_FLOW = [
  { step: "Q0 Track", out: "B2C → RT1–RT6 path · B2B → branch selection (Team, Change, Cap, Strategic)" },
  { step: "Branch Q1–Q3", out: "Scores accumulate per branch; ties resolved by Q1 anchor." },
  { step: "Q4 Decision-maker", out: "B2B only. Q4DM=A triggers Scout Mode reroute." },
  { step: "Score → RT", out: "B2C: 1–3 → RT1, 4–6 → RT2 … 16+ → RT6. B2B: branch winner → RT-A/B/C/D/E." },
  { step: "RT → tier placement", out: "Hard-coded in pathFinderQuiz.ts. Workshops/Labs/Blue Door auto-placed. Free + Speaking sourced from RT pools." },
  { step: "Eligibility filter", out: "Drop any offering not (Published ∧ host page Live ∧ has URL/anchor). Apply SAFE_B2B_FALLBACK if primary is empty." },
  { step: "Op Platform merge", out: "fetchOpPlatformRecommendations() pulls catalog by persona/format/segment. Used to populate 'More from the Porch'." },
  { step: "Render", out: "Pin-to-top promotes featured offering to position 1 within its existing group. Supplemental capped at 4." },
];

export default function QuizRoutingRules() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="bg-bluedoor/10 text-bluedoor border-bluedoor/40">Placeholder</Badge>
          <Badge variant="outline">Read-only · code-sourced</Badge>
        </div>
        <h1 className="text-2xl font-poppins font-bold text-navy">P.A.T.H.finder Quiz Routing Rules</h1>
        <p className="text-sm text-muted-foreground mt-1">
          How every answer becomes a recommendation. Source of truth lives in <code>src/data/pathFinderQuiz.ts</code> and{" "}
          <code>src/integrations/op-platform/personaMap.ts</code>. Per-offering routing also shows on each card in{" "}
          <Link to="/admin/offerings" className="text-bluedoor underline">/admin/offerings</Link>.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-poppins font-semibold text-navy mb-3">1 · Scoring flow (top to bottom)</h2>
        <ol className="space-y-2">
          {SCORING_FLOW.map((s, i) => (
            <li key={s.step} className="grid grid-cols-[2rem_minmax(160px,200px)_1fr] gap-3 text-sm">
              <span className="font-mono text-muted-foreground">{i + 1}.</span>
              <span className="font-poppins font-semibold text-navy">{s.step}</span>
              <span className="text-foreground/80">{s.out}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-poppins font-semibold text-navy mb-1">2 · Tier-by-tier placement</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Whether an offering is admin-controlled (RT-pool checkboxes) or engine-placed depends on its tier.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {TIERS.map((tier) => {
            const r = routingSummaryForTier(tier);
            return (
              <div key={tier} className="rounded-md border border-dashed border-navy/30 bg-navy/5 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-poppins font-semibold text-navy">{tier}</span>
                  <Badge variant="outline" className="text-[10px]">{r.placement}</Badge>
                </div>
                <p className="text-xs font-medium text-navy/80 mb-2">{r.headline}</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-foreground/80">
                  {r.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                </ul>
                {r.personas.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Personas: {r.personas.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-poppins font-semibold text-navy mb-3">3 · Scout Mode reroute (B2B individual)</h2>
        <p className="text-sm text-foreground/80 mb-2">
          When a B2B respondent picks <code>Q4DM=A</code> ("Just me — exploring options before bringing a recommendation"),
          the engine treats them as an individual scout:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
          <li>Picks a relevant AMPLIFY Lab as the primary via <code>pickScoutLab(rt, answers)</code>.</li>
          <li>Demotes workshops to "pitch to your team when you're ready".</li>
          <li>Reframes Blue Door as the "when you're ready to go deeper" option.</li>
          <li>Persona for Op Platform fetch is rewritten from B2B → <code>b2c_individual</code>.</li>
          <li>Original B2B result type is preserved (contact prefill, topic area, scope all stay org-level).</li>
        </ul>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-poppins font-semibold text-navy mb-3">4 · Personas → Op Platform filters</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Used by <code>useOpPlatformRecommendations</code> to fetch supplemental "More from the Porch" cards.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2 px-2">Persona</th>
                <th className="text-left py-2 px-2">Source</th>
                <th className="text-left py-2 px-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {PERSONAS.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 px-2"><code>{p.id}</code></td>
                  <td className="py-2 px-2">{p.label}</td>
                  <td className="py-2 px-2 text-foreground/80">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-poppins font-semibold text-navy mb-3">5 · Eligibility gate</h2>
        <p className="text-sm text-foreground/80 mb-2">
          An offering can only render in a quiz result when ALL of the following are true (enforced in <code>src/lib/offeringVisibility.ts</code>):
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
          <li><strong>Published</strong> in the Op Platform mirror (<code>is_published</code> on path_finder_offerings).</li>
          <li>Host page is <strong>Live</strong> in <Link to="/admin/pages" className="text-bluedoor underline">/admin/pages</Link>.</li>
          <li>Has at least one of: Hub URL, Dedicated URL, or anchor.</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          If the matched primary list ends up empty after this filter, B2B falls back to <code>SAFE_B2B_FALLBACK</code> so the result never goes blank.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-poppins font-semibold text-navy mb-3">6 · Where to change what</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" /><span><strong>RT-pool membership (Free + Speaking):</strong> per-card RT checkboxes in <Link to="/admin/offerings" className="text-bluedoor underline">/admin/offerings</Link>.</span></li>
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" /><span><strong>Pin to top in primary list:</strong> "Pin to top" switch per card.</span></li>
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" /><span><strong>Question text, scoring, RT → tier map, Scout Mode, fallback:</strong> code in <code>src/data/pathFinderQuiz.ts</code>.</span></li>
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" /><span><strong>Persona → Op Platform filters:</strong> code in <code>src/integrations/op-platform/personaMap.ts</code>.</span></li>
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" /><span><strong>Canonical narrative (name/blurb/tier/topic/facilitator/keynote/workshop):</strong> <a href="https://paintedporch-ops.lovable.app/admin/topics" target="_blank" rel="noopener noreferrer" className="text-bluedoor underline inline-flex items-center gap-1">PPS Op Platform <ExternalLink className="w-3 h-3" /></a>.</span></li>
        </ul>
      </section>
    </div>
  );
}
