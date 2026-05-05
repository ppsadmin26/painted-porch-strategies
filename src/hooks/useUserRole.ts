import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Returns the signed-in user's role (admin | editor | contributor | author | null).
 * `null` when signed out, undefined while loading.
 */
export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [user, authLoading]);

  return { role, isAdmin: role === "admin", loading: role === undefined };
}
