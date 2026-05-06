import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, X } from "lucide-react";

/**
 * Site-wide banner that warns admins/editors when GitHub sync has failed.
 * Renders nothing for non-admins or when sync is healthy.
 * Dismissal is per-session (sessionStorage).
 */
export default function GitHubSyncBanner() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).maybeSingle();
      const role = (profile as any)?.role;
      if (!["admin", "editor"].includes(role)) return;

      const dismissedAt = sessionStorage.getItem("gh-sync-banner-dismissed");

      const { data } = await supabase
        .from("github_sync_status").select("status,last_error_message,last_failure_at")
        .eq("id", 1).maybeSingle();

      if (cancelled) return;
      if (data && (data as any).status === "error") {
        if (dismissedAt && (data as any).last_failure_at && new Date(dismissedAt) > new Date((data as any).last_failure_at)) {
          return; // user dismissed since the last failure
        }
        setMessage((data as any).last_error_message ?? "GitHub sync issue detected.");
        setShow(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!show) return null;

  return (
    <div className="bg-[#DB0043] text-white text-sm" role="alert">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="flex-1">
          <strong>GitHub sync issue:</strong> {message}{" "}
          <Link to="/admin/emails/queue" className="underline font-semibold">View details</Link>
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => { sessionStorage.setItem("gh-sync-banner-dismissed", new Date().toISOString()); setShow(false); }}
          className="opacity-80 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
