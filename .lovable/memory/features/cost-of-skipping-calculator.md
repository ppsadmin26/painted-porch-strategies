---
name: Cost-of-Skipping Calculator v2
description: Calculator component, edge function, GHL integration, and email template for the Blue Door / AMPLIFY cost calculator
type: feature
---

**Component:** `src/components/pps/blue-door/CostCalculatorDialog.tsx` — single dialog used on `/blue-door` (TruthSectionAlt, ProblemSectionAlt) AND `/partner/amplify` ROI section.

**Inputs:** Industry (8 presets), initiative size (S/M/E), duration (3/6/12/18/24 mo). Advanced expander: salary override + outside consultants toggle.

**Math:** Industry benchmarks in `src/data/calculatorBenchmarks.ts` (BLS 2024 salaries, McKinsey/Gartner/BCG overrun + failure rates). Phase Zero impact = 10–15% exposure reduction.

**Outputs:** 3 result cards (planned / overrun range / failure write-off) + hero "Blue Door de-risks $X–$Y" strip with cobalt CTA to `/blue-door`. Collapsible "How we calculated this" with sources via `<SourcedTooltip>`.

**Lead capture:**
- Inline email-me form → `supabase/functions/submit-calculator-results/index.ts`.
- Edge fn: upserts GHL contact, applies tag `calc-cost-of-skipping`, adds a contact **note** with full inputs + results, optionally subscribes to GHL workflow if `GHL_COST_CALC_WORKFLOW_ID` secret is set, then queues the `cost-calculator-results` transactional email.
- Email template: `supabase/functions/_shared/transactional-email-templates/cost-calculator-results.tsx`.

**To activate workflow subscription:** Build the GHL workflow in the GHL UI, copy its ID, add as Supabase secret `GHL_COST_CALC_WORKFLOW_ID`. No code change needed.

**Triggers:**
- Default: raspberry outline button "Calculate Your ROI" (Blue Door pages).
- AMPLIFY ROI section: gold outline variant ("Calculate your ROI") via `triggerClassName` prop.
