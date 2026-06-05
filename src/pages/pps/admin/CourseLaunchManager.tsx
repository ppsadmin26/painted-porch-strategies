import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bell, CheckCircle2, Clock, Loader2, Rocket } from "lucide-react";
import { format } from "date-fns";

interface CourseRow {
  slug: string;
  course_name: string;
  status: "coming_soon" | "live";
  checkout_url: string | null;
  course_path: string;
  notified_at: string | null;
  notified_count: number;
  last_notify_error: string | null;
  updated_at: string;
}

export default function CourseLaunchManager() {
  const { toast } = useToast();
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);
  const [confirmGoLive, setConfirmGoLive] = useState<CourseRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("course_launch_status")
      .select("*")
      .order("course_name");
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setRows((data || []) as CourseRow[]);
      const d: Record<string, string> = {};
      for (const r of (data || []) as CourseRow[]) d[r.slug] = r.checkout_url || "";
      setDrafts(d);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveCheckoutUrl = async (slug: string) => {
    setWorking(slug);
    const { error } = await supabase
      .from("course_launch_status")
      .update({ checkout_url: drafts[slug]?.trim() || null })
      .eq("slug", slug);
    setWorking(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Checkout URL updated." });
      load();
    }
  };

  const revertToComingSoon = async (slug: string) => {
    setWorking(slug);
    const { error } = await supabase
      .from("course_launch_status")
      .update({ status: "coming_soon" })
      .eq("slug", slug);
    setWorking(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reverted to Coming Soon" });
      load();
    }
  };

  const goLiveAndNotify = async (row: CourseRow) => {
    const url = (drafts[row.slug] || "").trim();
    if (!url) {
      toast({
        title: "Checkout URL required",
        description: "Add a checkout URL before going live.",
        variant: "destructive",
      });
      return;
    }
    setWorking(row.slug);
    try {
      // Save URL + flip status to live
      const { error: upErr } = await supabase
        .from("course_launch_status")
        .update({ checkout_url: url, status: "live" })
        .eq("slug", row.slug);
      if (upErr) throw upErr;

      // Fire notify (skips if already notified)
      if (!row.notified_at) {
        const { data, error: fnErr } = await supabase.functions.invoke("notify-course-launch", {
          body: { slug: row.slug },
        });
        if (fnErr) throw fnErr;
        toast({
          title: "Course is live",
          description: `Notified ${data?.sent ?? 0} of ${data?.total ?? 0} on the launch list.${
            data?.failed ? ` ${data.failed} failed.` : ""
          }`,
        });
      } else {
        toast({
          title: "Course is live",
          description: "Launch list was previously notified. Use Re-notify if you need to send again.",
        });
      }
    } catch (err: any) {
      toast({ title: "Action failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setWorking(null);
      setConfirmGoLive(null);
      load();
    }
  };

  const reNotify = async (slug: string) => {
    setWorking(slug);
    try {
      const { data, error } = await supabase.functions.invoke("notify-course-launch", {
        body: { slug, force: true },
      });
      if (error) throw error;
      toast({
        title: "Notifications sent",
        description: `${data?.sent ?? 0} of ${data?.total ?? 0} sent.${
          data?.failed ? ` ${data.failed} failed.` : ""
        }`,
      });
    } catch (err: any) {
      toast({ title: "Notify failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setWorking(null);
      load();
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-poppins font-bold text-navy">Course Launches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle a course from Coming Soon to Live. Going live automatically emails everyone on
          the launch list using the <code>course-launch-available</code> template, so the CTA on
          the course page and the notification can't get out of sync.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const busy = working === row.slug;
          const draftUrl = drafts[row.slug] ?? "";
          const isLive = row.status === "live";
          return (
            <Card key={row.slug} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-poppins font-semibold text-lg text-navy">
                      {row.course_name}
                    </h2>
                    {isLive ? (
                      <Badge className="bg-pps-lime/15 text-pps-lime border border-pps-lime/40">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" /> Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Slug: <code>{row.slug}</code> · Page:{" "}
                    <a href={row.course_path} className="text-pps-teal underline" target="_blank" rel="noreferrer">
                      {row.course_path}
                    </a>
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {row.notified_at ? (
                    <>
                      <div className="flex items-center gap-1 justify-end">
                        <Bell className="h-3 w-3" />
                        Notified {row.notified_count}{" "}
                        {row.notified_count === 1 ? "person" : "people"}
                      </div>
                      <div>{format(new Date(row.notified_at), "PP p")}</div>
                    </>
                  ) : (
                    <div>Launch list not yet notified</div>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end mb-3">
                <div>
                  <Label className="text-xs">Checkout URL (Stripe / course platform)</Label>
                  <Input
                    placeholder="https://buy.stripe.com/..."
                    value={draftUrl}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [row.slug]: e.target.value }))
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || draftUrl === (row.checkout_url || "")}
                  onClick={() => saveCheckoutUrl(row.slug)}
                >
                  Save URL
                </Button>
              </div>

              {row.last_notify_error && (
                <p className="text-xs text-raspberry mb-3">
                  Last notify error: {row.last_notify_error}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {!isLive ? (
                  <Button
                    onClick={() => setConfirmGoLive(row)}
                    disabled={busy}
                    className="bg-pps-lime text-white hover:bg-pps-lime/90"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                    Go Live &amp; Notify Launch List
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => reNotify(row.slug)}
                      disabled={busy}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                      Re-notify Launch List
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => revertToComingSoon(row.slug)}
                      disabled={busy}
                    >
                      Revert to Coming Soon
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!confirmGoLive} onOpenChange={(o) => !o && setConfirmGoLive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Go live with {confirmGoLive?.course_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will swap the course page from "Coming Soon" to a live Purchase button
              pointing at the checkout URL you entered, and immediately email everyone on the{" "}
              <code>course-launch-{confirmGoLive?.slug}</code> launch list using the{" "}
              <code>course-launch-available</code> template. This can't be undone for emails
              already sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmGoLive && goLiveAndNotify(confirmGoLive)}>
              Go Live &amp; Notify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
