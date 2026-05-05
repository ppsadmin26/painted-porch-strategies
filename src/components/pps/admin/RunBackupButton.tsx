import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminSections } from "@/hooks/useAdminSections";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Header-mounted "Run Backup Now" button for admins only.
 * Triggers the auto-backup edge function and links to /admin/backups for history.
 */
export function RunBackupButton() {
  const { user } = useAuth();
  const { role, loading } = useAdminSections();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);

  if (loading || !user || role !== "admin") return null;

  const runBackup = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "run", kind: "manual" },
      });
      if (error) throw error;
      toast({
        title: "Backup started",
        description:
          "Running in the background (storage binaries can take a few minutes). Check history for status.",
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/admin/backups")}
          >
            View history
          </Button>
        ),
      });
    } catch (e: any) {
      toast({
        title: "Backup failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={runBackup}
      disabled={running}
      title="Run a manual backup now"
    >
      {running ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Database className="h-4 w-4 mr-1" />
      )}
      {running ? "Backing up..." : "Run Backup Now"}
    </Button>
  );
}
