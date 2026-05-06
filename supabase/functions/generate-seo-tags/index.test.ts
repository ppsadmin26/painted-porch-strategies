import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/generate-seo-tags`;

Deno.test("generate-seo-tags: missing Authorization returns 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "x" }),
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "Unauthorized");
});

Deno.test("generate-seo-tags: invalid bearer (anon, no user) returns 401", async () => {
  // Anon key without a user JWT — getUser returns no user => 401
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify({ title: "x" }),
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "Unauthorized");
});

Deno.test("generate-seo-tags: non-admin authenticated user returns 403", async () => {
  const email = Deno.env.get("TEST_NONADMIN_EMAIL");
  const password = Deno.env.get("TEST_NONADMIN_PASSWORD");
  if (!email || !password) {
    console.warn("Skipping 403 test: TEST_NONADMIN_EMAIL/PASSWORD not set");
    return;
  }
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify({ email, password }),
  });
  const signIn = await signInRes.json();
  const token = signIn.access_token;
  if (!token) {
    console.warn("Skipping 403 test: could not sign in test user");
    return;
  }
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: ANON,
    },
    body: JSON.stringify({ title: "x" }),
  });
  const body = await res.json();
  assertEquals(res.status, 403);
  assertEquals(body.error, "Forbidden");
});
