import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/\| linkedin$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Two modes:
 * 1. Manual: POST { url: "https://linkedin.com/pulse/..." } → imports that single article
 * 2. Auto scan: POST {} → searches for recent articles via Firecrawl web search
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const adminClient = createClient(supabaseUrl, serviceKey);

    // MODE 1: Manual import of a specific URL
    if (body.url && body.url.includes("linkedin.com/pulse/")) {
      const result = await importSingleArticle(body.url, firecrawlKey, adminClient);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MODE 2: Automated search for new articles
    // Try multiple search queries to maximize discovery
    const queries = [
      '"amy yackowski" linkedin.com/pulse',
      "amy yackowski painted porch linkedin article",
      "amyyackowski linkedin newsletter",
    ];

    const allArticleUrls = new Set<string>();

    for (const query of queries) {
      try {
        const searchRes = await fetch("https://api.firecrawl.dev/v2/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, limit: 10, tbs: "qdr:m" }),
        });

        const searchData = await searchRes.json();
        if (searchRes.ok && searchData.success) {
          const webResults = searchData.data?.web || [];
          for (const r of webResults) {
            if (
              r.url &&
              r.url.includes("linkedin.com/pulse/") &&
              r.url.toLowerCase().includes("yackowski")
            ) {
              allArticleUrls.add(r.url);
            }
          }
        }
      } catch (e) {
        console.error(`Search query "${query}" failed:`, e);
      }
      // Rate limit between searches
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`Found ${allArticleUrls.size} unique article URLs via search`);

    if (allArticleUrls.size === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No new articles found via web search. Use manual import with { url: '...' } for specific articles.",
          imported: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check existing slugs
    const { data: existingPosts } = await adminClient
      .from("blog_posts")
      .select("slug");
    const existingSlugs = new Set((existingPosts || []).map((p: any) => p.slug));

    const imported: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const articleUrl of allArticleUrls) {
      const slugMatch = articleUrl.match(/\/pulse\/([^/?]+)/);
      if (!slugMatch) { skipped.push(articleUrl); continue; }

      let slug = slugMatch[1].replace(/-[a-z0-9]{5}$/, "").replace(/[^a-z0-9-]/g, "");
      if (existingSlugs.has(slug)) { skipped.push(articleUrl); continue; }

      const result = await importSingleArticle(articleUrl, firecrawlKey, adminClient);
      if (result.success) {
        imported.push(result.slug || slug);
        existingSlugs.add(result.slug || slug);
      } else {
        errors.push(`${articleUrl}: ${result.error}`);
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_found: allArticleUrls.size,
        imported: imported.length,
        skipped: skipped.length,
        errors: errors.length,
        imported_slugs: imported,
        error_details: errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Import a single LinkedIn article by URL */
async function importSingleArticle(
  articleUrl: string,
  firecrawlKey: string,
  adminClient: any
): Promise<{ success: boolean; slug?: string; error?: string }> {
  const slugMatch = articleUrl.match(/\/pulse\/([^/?]+)/);
  if (!slugMatch) return { success: false, error: "Invalid pulse URL" };

  let slug = slugMatch[1].replace(/-[a-z0-9]{5}$/, "").replace(/[^a-z0-9-]/g, "");

  // Check if already exists
  const { data: dup } = await adminClient
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (dup) return { success: false, slug, error: "Already imported" };

  // Scrape the article content
  let markdown = "";
  let metadata: any = {};

  let extractedTitle = "";
  let extractedCover: string | null = null;

  try {
    const scrapeRes = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: articleUrl,
        onlyMainContent: true,
        formats: [
          "markdown",
          {
            type: "json",
            prompt:
              "Extract ONLY the LinkedIn Pulse article. Return: 'title' (no '| LinkedIn' suffix), 'cover_image_url' (or null), and 'body_markdown' (FULL article body in clean markdown — every paragraph, heading, list, blockquote, inline link, in original order, verbatim). EXCLUDE author bio, follow widgets, reactions, comments, 'More from <author>', 'Others also viewed', sign-in prompts, related articles, navigation, footer, cookie notices, all LinkedIn UI chrome.",
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                cover_image_url: { type: ["string", "null"] },
                body_markdown: { type: "string" },
              },
              required: ["title", "body_markdown"],
            },
          },
        ],
      }),
    });

    const scrapeData = await scrapeRes.json();
    if (scrapeRes.ok && scrapeData.success) {
      const payload = scrapeData.data ?? scrapeData;
      const extracted = payload.json ?? {};
      metadata = payload.metadata ?? {};
      const fallbackMd: string = payload.markdown || "";
      markdown = (extracted.body_markdown || "").trim() || cleanLinkedInMarkdown(fallbackMd);
      extractedTitle = (extracted.title || "").replace(/ \| LinkedIn$/, "").trim();
      extractedCover = extracted.cover_image_url || null;
    } else {
      console.warn(`Firecrawl scrape failed for ${articleUrl}, status: ${scrapeRes.status}`);
    }
  } catch (e) {
    console.error(`Scrape error for ${articleUrl}:`, e);
  }

  if (!markdown) {
    return { success: false, slug, error: "Could not scrape article content. LinkedIn may be blocking scrapes." };
  }

  const title =
    extractedTitle ||
    metadata.title?.replace(/ \| LinkedIn$/, "").trim() ||
    markdown.match(/^#\s+(.+)/m)?.[1] ||
    "Untitled Import";

  if (extractedCover && !metadata.ogImage) {
    metadata.ogImage = extractedCover;
  }

  const bodyJson = simpleMarkdownToTiptap(markdown);
  const bodyText = extractText(bodyJson);
  const excerpt = bodyText.slice(0, 250).trim() + "...";

  const { error: insertErr } = await adminClient
    .from("blog_posts")
    .insert({
      title,
      slug,
      status: "pending",
      featured: false,
      excerpt,
      body_json: bodyJson,
      cover_image_url: metadata.ogImage || metadata.image || null,
      publish_date: new Date().toISOString(),
    });

  if (insertErr) {
    return { success: false, slug, error: insertErr.message };
  }

  console.log(`Imported article: ${slug}`);
  return { success: true, slug };
}

/** Remove LinkedIn cookie banners, nav, comments, and other boilerplate */
function cleanLinkedInMarkdown(md: string): string {
  const rawLines = md
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\u200B-\u200D\uFEFF]/g, "").trimEnd());

  const boilerplatePatterns = [
    /linkedin respects your privacy/i,
    /skip to main content/i,
    /agree & join/i,
    /join now/i,
    /sign in/i,
    /cookie policy/i,
    /user agreement/i,
    /privacy policy/i,
    /community guidelines/i,
    /language/i,
    /report this/i,
    /reply to comment/i,
    /load more comments/i,
    /react to this/i,
    /follow/i,
    /like$/i,
    /comment$/i,
    /share$/i,
    /copy link/i,
    /see more$/i,
    /show more$/i,
    /published by/i,
    /\d+ comments?$/i,
    /\d+ reactions?$/i,
    /sign in to view/i,
    /get the app/i,
  ];

  const endPatterns = [
    /^#+\s*comments?$/i,
    /^comments?$/i,
    /^add a comment/i,
    /^top comments?$/i,
    /^most relevant/i,
    /^what do you think\?/i,
    /^discover more from linkedin/i,
    /^explore topics/i,
    /^follow more creators/i,
    /^people also viewed/i,
    /^recommended for you/i,
    /^newsletter/i,
  ];

  const titleLine = rawLines.find((line) => /^#\s+/.test(line)) || "";
  const normalizedTitle = normalizeForComparison(titleLine.replace(/^#\s+/, ""));
  const cleaned: string[] = [];
  let contentStarted = false;
  let paragraphCount = 0;

  for (const originalLine of rawLines) {
    const line = originalLine.trim();

    if (!contentStarted) {
      if (!line || boilerplatePatterns.some((pattern) => pattern.test(line))) {
        continue;
      }
      contentStarted = true;
    }

    if (endPatterns.some((pattern) => pattern.test(line)) && paragraphCount >= 2) {
      break;
    }

    if (boilerplatePatterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    if (/^`+$/.test(line) || /^[-–—]{2,}$/.test(line)) {
      continue;
    }

    if (
      cleaned.length > 0 &&
      normalizedTitle &&
      normalizeForComparison(line.replace(/^#\s+/, "")) === normalizedTitle &&
      normalizeForComparison(cleaned[0].replace(/^#\s+/, "")) === normalizedTitle
    ) {
      continue;
    }

    if (line === "") {
      if (cleaned.length > 0 && cleaned[cleaned.length - 1] !== "") {
        cleaned.push("");
      }
      continue;
    }

    cleaned.push(line);
    if (!/^#/.test(line) && !/^[-*]\s+/.test(line) && line.length > 40) {
      paragraphCount += 1;
    }
  }

  while (cleaned[0] === "") cleaned.shift();
  while (cleaned[cleaned.length - 1] === "") cleaned.pop();

  return cleaned.join("\n").trim();
}

function simpleMarkdownToTiptap(markdown: string): any {
  const lines = markdown.split("\n");
  const content: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }
    if (/^---+$/.test(line.trim())) { content.push({ type: "horizontalRule" }); i++; continue; }

    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      content.push({
        type: "heading",
        attrs: { level: hMatch[1].length },
        content: [{ type: "text", text: hMatch[2].replace(/\*\*/g, "").trim() }],
      });
      i++; continue;
    }

    if (/^>\s+/.test(line.trim())) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s*/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      content.push({
        type: "blockquote",
        content: [{ type: "paragraph", content: [{ type: "text", text: quoteLines.join(" ").trim() }] }],
      });
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: any[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: lines[i].trim().replace(/^[-*]\s+/, "") }] }],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    content.push({
      type: "paragraph",
      content: [{ type: "text", text: line.trim() }],
    });
    i++;
  }

  return { type: "doc", content };
}

function extractText(node: any): string {
  if (!node) return "";
  let t = "";
  if (node.text) t += node.text;
  if (node.content) for (const c of node.content) t += extractText(c) + " ";
  return t.trim();
}
