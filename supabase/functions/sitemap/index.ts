import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/xml; charset=utf-8",
};

// Routes that bypass page_status overrides — auth, admin, sitemap, 404, contact.
// MUST stay in sync with ALWAYS_LIVE_PREFIXES in src/config/pageStatus.ts.
// (src/test/sitemap-draft-leakage.test.ts asserts every shared prefix is listed here.)
const ALWAYS_LIVE_PREFIXES = [
  "/admin",
  "/reset-password",
  "/sitemap",
  "/404",
  "/contact",
  "/resources/insights",
  "/resources/blog",
  "/blog",
];

function isAlwaysLive(path: string) {
  return ALWAYS_LIVE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

function getSiteUrl(req: Request) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const requestUrl = new URL(req.url);
  return requestUrl.origin;
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  // Service role key lets us see Draft overrides (anon RLS only exposes Live rows).
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? anonKey;
  const supabase = createClient(supabaseUrl, anonKey);
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const siteUrl = getSiteUrl(req);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, publish_date")
    .eq("status", "published")
    .order("publish_date", { ascending: false });

  // Whitelist approach: only emit paths explicitly marked Live in page_status,
  // or that bypass overrides via ALWAYS_LIVE_PREFIXES. Matches the frontend
  // PageGate default-to-draft behavior in src/config/pageStatus.ts so any
  // newly-added route not yet seeded into page_status is hidden from crawlers
  // until an admin flips it Live.
  const { data: liveRows } = await supabaseAdmin
    .from("page_status")
    .select("path")
    .eq("status", "live");
  const livePaths = new Set<string>((liveRows ?? []).map((r: { path: string }) => r.path));

  const isPublic = (path: string) => isAlwaysLive(path) || livePaths.has(path);

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/about", priority: "0.8", changefreq: "monthly" },
    { loc: "/about/approach", priority: "0.7", changefreq: "monthly" },
    { loc: "/about/impact", priority: "0.7", changefreq: "monthly" },
    { loc: "/partner", priority: "0.9", changefreq: "monthly" },
    { loc: "/partner/ignite", priority: "0.8", changefreq: "monthly" },
    { loc: "/partner/amplify", priority: "0.8", changefreq: "monthly" },
    { loc: "/partner/embody", priority: "0.8", changefreq: "monthly" },
    { loc: "/resources", priority: "0.8", changefreq: "weekly" },
    { loc: "/resources/insights", priority: "0.9", changefreq: "daily" },
    { loc: "/resources/free", priority: "0.7", changefreq: "monthly" },
    { loc: "/resources/youtube", priority: "0.6", changefreq: "weekly" },
    { loc: "/resources/faq", priority: "0.6", changefreq: "monthly" },
    { loc: "/media", priority: "0.6", changefreq: "monthly" },
    { loc: "/contact", priority: "0.8", changefreq: "monthly" },
    { loc: "/services", priority: "0.8", changefreq: "monthly" },
    { loc: "/business-programs", priority: "0.8", changefreq: "monthly" },
    { loc: "/programs", priority: "0.7", changefreq: "monthly" },
    { loc: "/for-leaders", priority: "0.8", changefreq: "monthly" },
    { loc: "/for-teams", priority: "0.8", changefreq: "monthly" },
    { loc: "/speaking", priority: "0.7", changefreq: "monthly" },
    { loc: "/start-here", priority: "0.9", changefreq: "monthly" },
    { loc: "/blue-door", priority: "0.9", changefreq: "monthly" },
    { loc: "/terms", priority: "0.3", changefreq: "yearly" },
    { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "/cookies", priority: "0.3", changefreq: "yearly" },
  ].filter((page) => isPublic(page.loc));

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const page of staticPages) {
    xml += `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  if (posts) {
    for (const post of posts) {
      if (!post.slug) continue;
      const path = `/resources/insights/${post.slug}`;
      if (!isPublic(path)) continue;
      const lastmod = (post.updated_at || post.publish_date || today).split("T")[0];
      xml += `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});
