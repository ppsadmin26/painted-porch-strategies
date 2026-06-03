import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Mail } from "lucide-react";

type Section = "Terms" | "Privacy" | "Cookies";
const ALL_SECTIONS: Section[] = ["Terms", "Privacy", "Cookies"];

interface PastNotification {
  id: string;
  sent_at: string;
  sections: string[];
  summary: string;
  recipient_count: number;
  source: string;
}

export default function PolicyNotifications() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [summary, setSummary] = useState("");
  const [past, setPast] = useState<PastNotification[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    document.title = "Policy Notifications | Admin";
    void loadPast();
  }, []);

  async function loadPast() {
    const { data } = await supabase
      .from("policy_update_notifications")
      .select("id, sent_at, sections, summary, recipient_count, source")
      .order("sent_at", { ascending: false })
      .limit(25);
    if (data) setPast(data as PastNotification[]);
  }

  if (roleLoading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return <Navigate to="/admin" replace />;

  const toggleSection = (s: Section) =>
    setSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const canSubmit = sections.length > 0 && summary.trim().length >= 10;

  async function runPreview() {
    setPreviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-policy-update-notification", {
        body: { sections, summary: summary.trim(), dryRun: true },
      });
      if (error) throw error;
      setPreviewCount((data as any)?.recipient_count ?? 0);
      setConfirmOpen(true);
    } catch (e: any) {
      toast({ title: "Preview failed", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  }

  async function send() {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-policy-update-notification", {
        body: { sections, summary: summary.trim() },
      });
      if (error) throw error;
      const d = data as any;
      toast({
        title: "Notification queued",
        description: `Queued ${d?.queued ?? 0} of ${d?.recipient_count ?? 0} recipients.`,
      });
      setSections([]);
      setSummary("");
      setPreviewCount(null);
      setConfirmOpen(false);
      void loadPast();
    } catch (e: any) {
      toast({ title: "Send failed", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-poppins font-bold text-navy flex items-center gap-2">
          <Mail className="w-6 h-6" /> Policy Update Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send a one-time email to everyone we've previously emailed (minus unsubscribes) when Terms,
          Privacy, or Cookies changes. The system queues one send per recipient and skips suppressed addresses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send a new notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="text-sm font-semibold mb-2">Which sections changed?</div>
            <div className="flex flex-wrap gap-4">
              {ALL_SECTIONS.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={sections.includes(s)} onCheckedChange={() => toggleSection(s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2" htmlFor="summary">
              Plain-English summary (goes in the email)
            </label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Example: We merged Terms, Privacy, and Cookies onto one page and added detail for GDPR and CCPA."
            />
            <div className="text-xs text-muted-foreground mt-1">
              {summary.trim().length}/2000 — minimum 10 characters
            </div>
          </div>

          <Button onClick={runPreview} disabled={!canSubmit || previewing} className="bg-teal hover:bg-teal/90">
            {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Preview recipient count & send
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="divide-y">
              {past.map((p) => (
                <li key={p.id} className="py-3 text-sm">
                  <div className="flex justify-between items-baseline gap-4 flex-wrap">
                    <span className="font-semibold text-navy">
                      {new Date(p.sent_at).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      {p.recipient_count} recipients · {p.sections.join(", ")} · {p.source}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-3">{p.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send policy update notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will email <strong>{previewCount ?? 0}</strong> recipients (suppressed addresses
              already excluded). Each gets one email with a one-click unsubscribe footer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void send(); }} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send to {previewCount ?? 0}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
