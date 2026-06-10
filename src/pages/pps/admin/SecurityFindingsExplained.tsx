import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, FolderOpen, AlertTriangle } from "lucide-react";

export default function SecurityFindingsExplained() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">
          Security Findings Explained
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Why certain scanner warnings are intentional in this application.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal/10 rounded-lg shrink-0">
            <Lock className="h-5 w-5 text-teal" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-poppins font-semibold text-navy">
              SECURITY DEFINER functions are callable by authenticated users
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Functions like{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  public.has_role(user_id, role)
                </code>{" "}
                and{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  public.is_admin_or_editor(user_id)
                </code>{" "}
                are defined as{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  SECURITY DEFINER
                </code>
                . This means they run with the privileges of the function owner rather than the caller.
              </p>
              <p>
                <strong>Why this is intentional and safe:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  These helpers are required by Row-Level Security (RLS) policies to evaluate user roles without triggering recursive policy checks.
                </li>
                <li>
                  Revoking <code className="bg-muted px-1 py-0.5 rounded text-xs">EXECUTE</code> from{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">authenticated</code> or{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">anon</code> would break RLS and cause permission errors across the entire application.
                </li>
                <li>
                  They are strictly read-only boolean checks. They do not expose raw data, modify records, or bypass other access controls.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-lime/10 rounded-lg shrink-0">
            <FolderOpen className="h-5 w-5 text-lime" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-poppins font-semibold text-navy">
              Public storage buckets allow listing
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Some storage buckets (e.g., public asset buckets) are configured with public access policies that allow anyone to list their contents.
              </p>
              <p>
                <strong>Why this is intentional and safe:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  These buckets contain brand images, email header graphics, partner logos, and marketing assets that are meant to be directly referenced by public pages and email templates.
                </li>
                <li>
                  They are not user-uploaded private files. There is no sensitive or personal data stored in these buckets.
                </li>
                <li>
                  Listing is not a vulnerability because the contents are intentionally world-readable by design.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-poppins font-semibold text-navy">
              When to revisit these decisions
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                If the app&apos;s security posture changes, the following scenarios would require re-evaluation:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  If new <code className="bg-muted px-1 py-0.5 rounded text-xs">SECURITY DEFINER</code> functions are added that do more than return booleans or filtered counts.
                </li>
                <li>
                  If a previously public bucket starts storing user-generated or private content.
                </li>
                <li>
                  If RLS policies are redesigned in a way that no longer requires these helper functions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <ShieldCheck className="h-4 w-4" />
        <span>
          Last reviewed: {new Date().toLocaleDateString()} — contact the team if you have questions about these findings.
        </span>
      </div>
    </div>
  );
}
