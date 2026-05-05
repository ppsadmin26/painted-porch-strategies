import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  Copy,
  KeyRound,
  XCircle,
  PlugZap,
  MinusCircle,
} from "lucide-react";

type SecretItem = {
  name: string;
  category: string;
  description: string;
  required: boolean;
  present_in_source: boolean;
  length: number;
};

type SecretsStatusResponse = {
  ok: true;
  generated_at: string;
  items: SecretItem[];
};

type LocalState = "unchecked" | "ok" | "missing";

const LS_KEY = "pps.secrets-handoff.target-status.v1";

function loadLocal(): Record<string, LocalState> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveLocal(state: Record<string, LocalState>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export default function SecretsHandoff() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SecretItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [local, setLocal] = useState<Record<string, LocalState>>(() => loadLocal());

  type ProbeResult = {
    id: string;
    label: string;
    category: string;
    required_secret: string;
    status: "pass" | "fail" | "skipped";
    http_status?: number;
    latency_ms?: number;
    detail?: string;
    hint?: string;
  };
  type ProbeResponse = {
    ok: boolean;
    checked_at: string;
    summary: { total: number; pass: number; fail: number; skipped: number };
    results: ProbeResult[];
  };
  const [probing, setProbing] = useState(false);
  const [probingOne, setProbingOne] = useState<string | null>(null);
  const [probeReport, setProbeReport] = useState<ProbeResponse | null>(null);

  useEffect(() => {
    saveLocal(local);
  }, [local]);

  async function runProbes(only?: string[]) {
    if (only?.length === 1) setProbingOne(only[0]);
    else setProbing(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-integration-secrets", {
        body: only?.length ? { only } : {},
      });
      if (error) throw error;
      const res = data as ProbeResponse;
      // If running a single probe, merge into existing report
      if (only?.length && probeReport) {
        const merged: ProbeResponse = {
          ...res,
          results: probeReport.results.map(
            (r) => res.results.find((n) => n.id === r.id) ?? r,
          ),
        };
        // Add any new ones
        for (const n of res.results) {
          if (!merged.results.some((r) => r.id === n.id)) merged.results.push(n);
        }
        merged.summary = {
          total: merged.results.length,
          pass: merged.results.filter((r) => r.status === "pass").length,
          fail: merged.results.filter((r) => r.status === "fail").length,
          skipped: merged.results.filter((r) => r.status === "skipped").length,
        };
        setProbeReport(merged);
      } else {
        setProbeReport(res);
        // Auto-mark passing probes' secrets as ready in the target checklist
        setLocal((prev) => {
          const next = { ...prev };
          for (const r of res.results) {
            if (r.status === "pass" && r.required_secret && next[r.required_secret] !== "ok") {
              next[r.required_secret] = "ok";
            }
          }
          return next;
        });
      }
      const summary = res.summary;
      if (summary.fail > 0) {
        toast.warning(`${summary.fail} integration${summary.fail === 1 ? "" : "s"} failed · ${summary.pass} passed · ${summary.skipped} skipped`);
      } else {
        toast.success(`${summary.pass} passed · ${summary.skipped} skipped`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Integration probe failed");
    } finally {
      setProbing(false);
      setProbingOne(null);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "secrets-status" },
      });
      if (error) throw error;
      const res = data as SecretsStatusResponse;
      setItems(res.items ?? []);
      setGeneratedAt(res.generated_at ?? "");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load secrets status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, SecretItem[]>();
    for (const i of items) {
      const arr = m.get(i.category) ?? [];
      arr.push(i);
      m.set(i.category, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const requiredMissingInSource = items.filter((i) => i.required && !i.present_in_source);
  const targetReady = items.filter((i) => local[i.name] === "ok").length;
  const targetMissing = items.filter((i) => i.required && local[i.name] !== "ok").length;

  function setStatus(name: string, s: LocalState) {
    setLocal((prev) => ({ ...prev, [name]: s }));
  }
  function markAllReady() {
    const next: Record<string, LocalState> = { ...local };
    for (const i of items) next[i.name] = "ok";
    setLocal(next);
  }
  function clearAll() {
    setLocal({});
  }

  async function copyName(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(`Copied ${name}`);
    } catch {
      toast.error("Copy failed");
    }
  }
  async function copyAllNames() {
    try {
      await navigator.clipboard.writeText(items.map((i) => i.name).join("\n"));
      toast.success("Copied all secret names");
    } catch {
      toast.error("Copy failed");
    }
  }

  async function downloadChecklist() {
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "secrets-checklist" },
      });
      if (error) throw error;
      const content = (data as { content?: string })?.content ?? "";
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "secrets-checklist.md";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message ?? "Download failed");
    }
  }

  async function validateTarget() {
    const url = targetUrl.trim().replace(/\/+$/, "");
    if (!url) {
      toast.error("Enter your target Supabase project URL first");
      return;
    }
    setValidating(true);
    try {
      // The checklist itself is a public-ish health probe: hitting the project's
      // REST root with no creds returns 401 from a live project, not a network
      // error. We only confirm reachability here — secret presence in the
      // target must still be confirmed manually (no remote API exposes that).
      const probe = await fetch(`${url}/auth/v1/health`).catch(() => null);
      if (!probe) {
        toast.error("Could not reach target project. Check the URL.");
        return;
      }
      if (probe.ok) {
        toast.success("Target project is reachable.");
      } else {
        toast.message(`Target responded ${probe.status}. Reachable, but check auth config.`);
      }
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <KeyRound className="h-7 w-7" /> Secrets Handoff
          </h1>
          <p className="text-muted-foreground mt-1">
            Re-enter these environment variables in your external Supabase project.
            Values are never shown — only names and presence in the source project.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={copyAllNames}>
            <Copy className="h-4 w-4 mr-2" /> Copy all names
          </Button>
          <Button variant="outline" onClick={downloadChecklist}>
            <Download className="h-4 w-4 mr-2" /> Download .md
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Total secrets" value={items.length} />
          <Stat
            label="Present in source"
            value={items.filter((i) => i.present_in_source).length}
            tone="ok"
          />
          <Stat
            label="Required missing in source"
            value={requiredMissingInSource.length}
            tone={requiredMissingInSource.length ? "warn" : "ok"}
          />
          <Stat
            label="Marked ready in target"
            value={`${targetReady} / ${items.length}`}
            tone={targetMissing === 0 && items.length ? "ok" : "warn"}
          />
        </div>
        {generatedAt && (
          <p className="text-xs text-muted-foreground mt-3">
            Snapshot taken {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <Label htmlFor="target-url">Target Supabase project URL (optional)</Label>
        <div className="flex gap-2 flex-wrap">
          <Input
            id="target-url"
            placeholder="https://YOUR-PROJECT.supabase.co"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={validateTarget} disabled={validating}>
            {validating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reachability check
          </Button>
          <Button variant="outline" onClick={markAllReady}>Mark all as added</Button>
          <Button variant="ghost" onClick={clearAll}>Reset checklist</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Supabase does not expose secret values over the API, so target presence is tracked manually here.
          The reachability check only confirms the project URL responds.
        </p>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PlugZap className="h-5 w-5" /> Live integration tests
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Round-trips each integration with a single read-only call (Stripe balance, GHL location lookup,
              Resend domains, YouTube videos.list, Anthropic models, Lovable AI ping, Firecrawl credits, Supabase REST self-call).
              Run on the NEW project to confirm migrated secrets actually work. Passing probes auto-mark
              their secret as ready below.
            </p>
          </div>
          <Button onClick={() => runProbes()} disabled={probing}>
            {probing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlugZap className="h-4 w-4 mr-2" />}
            Run all integration tests
          </Button>
        </div>

        {probeReport && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Last run {new Date(probeReport.checked_at).toLocaleString()} ·{" "}
              <span className="text-green-700 font-medium">{probeReport.summary.pass} pass</span> ·{" "}
              <span className={probeReport.summary.fail ? "text-rose-700 font-medium" : ""}>
                {probeReport.summary.fail} fail
              </span>{" "}
              · {probeReport.summary.skipped} skipped
            </div>
            <div className="grid gap-2">
              {probeReport.results.map((r) => {
                const tone =
                  r.status === "pass"
                    ? "border-green-600/40 bg-green-600/5"
                    : r.status === "fail"
                      ? "border-rose-600/40 bg-rose-600/5"
                      : "border-muted bg-muted/30";
                const Icon =
                  r.status === "pass" ? CheckCircle2 : r.status === "fail" ? XCircle : MinusCircle;
                const iconColor =
                  r.status === "pass"
                    ? "text-green-600"
                    : r.status === "fail"
                      ? "text-rose-600"
                      : "text-muted-foreground";
                return (
                  <div key={r.id} className={`rounded border p-3 text-xs ${tone}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                        <span className="font-semibold text-sm">{r.label}</span>
                        <Badge variant="outline">{r.category}</Badge>
                        <code className="text-[10px] text-muted-foreground">{r.required_secret}</code>
                        {r.http_status !== undefined && (
                          <Badge variant="outline" className="text-[10px]">HTTP {r.http_status}</Badge>
                        )}
                        {r.latency_ms !== undefined && (
                          <span className="text-[10px] text-muted-foreground">{r.latency_ms}ms</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => runProbes([r.id])}
                        disabled={probingOne === r.id || probing}
                      >
                        {probingOne === r.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {r.detail && <div className="mt-1 text-muted-foreground break-words">{r.detail}</div>}
                    {r.hint && r.status === "fail" && (
                      <div className="mt-1 text-rose-700">Hint: {r.hint}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, list]) => (
            <Card key={category} className="p-4">
              <h2 className="font-semibold text-lg mb-3">{category}</h2>
              <div className="space-y-2">
                {list.map((item) => {
                  const status = local[item.name] ?? "unchecked";
                  return (
                    <div
                      key={item.name}
                      className="flex items-start gap-3 p-3 rounded border bg-card/40"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="font-mono text-sm">{item.name}</code>
                          {item.required ? (
                            <Badge variant="destructive">Required</Badge>
                          ) : (
                            <Badge variant="secondary">Optional</Badge>
                          )}
                          {item.present_in_source ? (
                            <Badge variant="outline" className="border-green-600 text-green-700">
                              In source
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-600 text-amber-700">
                              Not in source
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyName(item.name)}
                          title="Copy name"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "ok" ? "default" : "outline"}
                          onClick={() => setStatus(item.name, status === "ok" ? "unchecked" : "ok")}
                          title="Mark as added in target"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "missing" ? "destructive" : "outline"}
                          onClick={() =>
                            setStatus(item.name, status === "missing" ? "unchecked" : "missing")
                          }
                          title="Mark as still missing"
                        >
                          {status === "missing" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "ok"
      ? "text-green-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-foreground";
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
