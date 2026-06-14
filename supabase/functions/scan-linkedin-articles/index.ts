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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    // === AuthN + AuthZ: admin/editor only ===
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const adminClientAuth = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await adminClientAuth
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
              "You are locating the SINGLE LinkedIn Pulse article at the requested URL within page markdown. Return: 'title' (no '| LinkedIn' suffix), 'cover_image_url' (or null), 'first_paragraph_snippet' (the first ~120 characters of the article's first real body paragraph or heading after the title — verbatim plain text, no markdown markers), 'last_paragraph_snippet' (the last ~120 characters of the article's final body paragraph before any 'More articles by', newsletter masthead, comments, or LinkedIn chrome — verbatim plain text, no markdown markers), and 'body_markdown' (FALLBACK ONLY — full article body in clean markdown with bold **text**, italic *text*, links [text](url), and in-body images ![alt](url) preserved verbatim; exclude author bio, follow widgets, reactions, comments, 'More from <author>', 'Others also viewed', sign-in prompts, related articles, navigation, footer, cookie notices, all LinkedIn UI chrome). Snippets MUST appear verbatim in the page text so a slicer can locate them.",
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                cover_image_url: { type: ["string", "null"] },
                first_paragraph_snippet: { type: "string" },
                last_paragraph_snippet: { type: "string" },
                body_markdown: { type: "string" },
              },
              required: ["title", "first_paragraph_snippet", "last_paragraph_snippet", "body_markdown"],
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
      const cleanedRaw = fallbackMd ? cleanLinkedInMarkdown(fallbackMd) : "";
      extractedTitle = (extracted.title || "").replace(/ \| LinkedIn$/, "").trim();
      extractedCover = extracted.cover_image_url || null;
      const coverForStrip = metadata.ogImage || metadata.image || extractedCover || null;

      const slicedRawMarkdown = sliceRawByBoundaries(
        cleanedRaw,
        extracted.first_paragraph_snippet || "",
        extracted.last_paragraph_snippet || ""
      );
      markdown = chooseFormattedBodyMarkdown(
        slicedRawMarkdown || cleanedRaw,
        extracted.body_markdown || "",
        extractedTitle,
        coverForStrip,
        extracted.first_paragraph_snippet || "",
        extracted.last_paragraph_snippet || ""
      );

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

/**
 * Hard-truncate raw LinkedIn markdown at the first strong "post-article" marker
 * (newsletter widget, comments section, "More articles by", etc.).
 */
function truncateAtArticleEnd(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const stopRegex = [
    /^\s*\[?\s*\+\s*subscribe\b/i,
    /^#{1,6}\s+\d+\s+followers?\b/i,
    /^\s*\d+\s+followers?\s*$/i,
    /^\s*\[\s*\d+\s+comments?\s*\]/i,
    /^\s*\d+\s+comments?\s*$/i,
    /^\s*to view or add a comment/i,
    /^\s*more articles by\b/i,
    /^\s*more from\b/i,
    /^\s*people also viewed\b/i,
    /^\s*others also viewed\b/i,
    /^\s*recommended for you\b/i,
  ];
  let cut = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (stopRegex.some((r) => r.test(lines[i]))) { cut = i; break; }
  }
  while (cut > 0) {
    const prev = lines[cut - 1].trim();
    if (
      prev === "" ||
      /^`+$/.test(prev) ||
      /^#{1,6}\s+\S/.test(prev) ||
      /^\[[^\]]+\]\([^)]+\)\s*$/.test(prev)
    ) {
      cut--;
    } else break;
  }
  return lines.slice(0, cut).join("\n");
}

/**
 * Strip a leading H1 (matching the article title) and/or a leading cover image
 * (matching the cover URL) from final body markdown — they're stored separately.
 */
function stripLeadingTitleAndCover(md: string, title: string, coverUrl: string | null): string {
  const lines = md.split("\n");
  const normTitle = normalizeForComparison(title || "");
  const coverBase = (coverUrl || "").split("?")[0];
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  let removed = true;
  while (removed && i < lines.length) {
    removed = false;
    const line = lines[i].trim();
    const h = line.match(/^#{1,2}\s+(.+)$/);
    if (h && normTitle && normalizeForComparison(h[1]) === normTitle) {
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;
      removed = true;
      continue;
    }
    const img = line.match(/^!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
    if (img) {
      const src = img[1];
      if (!coverUrl || src === coverUrl || src.split("?")[0] === coverBase) {
        i++;
        while (i < lines.length && lines[i].trim() === "") i++;
        removed = true;
        continue;
      }
    }
  }
  return lines.slice(i).join("\n").trim();
}

function scrubResidualChrome(md: string, coverUrl: string | null): string {
  const coverBase = (coverUrl || "").split("?")[0];
  const bareBoilerplate = [
    /^\[?\s*skip to main content/i,
    /^image (imagined|generated|created) (via|by|with)\b/i,
    /^image (credit|source|by)[:\s]/i,
    /^photo (credit|source|by)[:\s]/i,
    /^\[?\s*\+\s*subscribe\b/i,
    /^subscribe\b.*newsletter/i,
    /^\d+\s+(followers?|comments?|reactions?)\s*$/i,
    /^like\s*$/i,
    /^comment\s*$/i,
    /^share\s*$/i,
    /^report this\b/i,
    /^to view or add a comment/i,
  ];
  const out: string[] = [];
  for (const raw of md.split("\n")) {
    let line = raw
      .replace(/[\u200B-\u200D\uFEFF\u00a0]/g, " ")
      .replace(/^[\s`\\]+/, "")
      .replace(/[\s`\\]+$/, "");
    if (!line || /^[`\s\-–—_*]+$/.test(line)) { out.push(""); continue; }
    if (bareBoilerplate.some((r) => r.test(line))) continue;
    const img = line.match(/^!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/);
    if (img) {
      const src = img[1];
      if (coverUrl && (src === coverUrl || src.split("?")[0] === coverBase)) continue;
    }
    out.push(line);
  }
  const collapsed: string[] = [];
  for (const l of out) {
    if (l === "" && collapsed[collapsed.length - 1] === "") continue;
    collapsed.push(l);
  }
  while (collapsed[0] === "") collapsed.shift();
  while (collapsed[collapsed.length - 1] === "") collapsed.pop();
  return collapsed.join("\n");
}

function stripInlineRelatedSections(md: string): string {
  const lines = md.split("\n");
  const headerRe =
    /^(#{1,6}\s+)?\s*(recommended (next|reading|for you|by linkedin|articles)|explore (topics|more)|related (articles|posts|reading)|more (like this|articles by|from)|you (might|may) (also )?(like|enjoy)|keep reading|see also|further reading|published by)\b/i;
  const cardLineRe = [
    /^!\[[^\]]*\]\([^)]+\)\s*$/,
    /^\[[^\]]+\]\(https?:\/\/(www\.)?linkedin\.com\/[^)]+\)\s*$/i,
    /^\[[^\]]+\]\(https?:\/\/[^)]+\)\s*$/i,
    /^\[[^\]]+$/i,
    /^[^\[]+\]\(https?:\/\/[^)]+\)\s*$/i,
    /^\d+\s+(min read|minute read|reactions?|comments?|followers?)\s*$/i,
    /^\d+\s+(day|week|month|year)s?\s+ago\s*$/i,
    /^\d+\s+(day|week|month|year)s?\s+ago\]\(https?:\/\/[^)]+\)\s*$/i,
    /^(by\s+)?[A-Z][\w .'’-]{1,80}\s*$/,
    /^\w{3,9}\.?\s+\d{1,2},?\s+\d{4}\s*$/i,
    /^\d+\s+(likes?|views?)\s*$/i,
  ];
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (headerRe.test(t)) {
      i++;
      let consumed = 0;
      while (i < lines.length) {
        const u = lines[i].trim();
        if (u === "") { i++; continue; }
        if (cardLineRe.some((r) => r.test(u))) { i++; consumed++; continue; }
        if (consumed === 0) out.push(lines[i - 1]);
        break;
      }
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  const collapsed: string[] = [];
  for (const l of out) {
    if (l.trim() === "" && collapsed[collapsed.length - 1]?.trim() === "") continue;
    collapsed.push(l);
  }
  while (collapsed[0]?.trim() === "") collapsed.shift();
  while (collapsed[collapsed.length - 1]?.trim() === "") collapsed.pop();
  return collapsed.join("\n");
}

/** Remove LinkedIn cookie banners, nav, comments, and other boilerplate */
function cleanLinkedInMarkdown(md: string): string {
  const rawLines = truncateAtArticleEnd(md)
    .replace(/`{3,}/g, "") // strip ``` fence runs that LinkedIn scatters across the page
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\u200B-\u200D\uFEFF]/g, "").trimEnd());

  // Anchored with ^…$ so we only filter standalone LinkedIn UI labels, not
  // article sentences that happen to end in "like", "follow", "share", etc.
  const boilerplatePatterns = [
    /^linkedin respects your privacy/i,
    /^by clicking continue/i,
    /^\[?skip to main content/i,
    /^agree & join/i,
    /^join now$/i,
    /^sign in$/i,
    /^cookie policy$/i,
    /^user agreement$/i,
    /^privacy policy$/i,
    /^community guidelines$/i,
    /^language$/i,
    /^report this( post| comment| article)?$/i,
    /^reply to comment/i,
    /^load more comments/i,
    /^react to this/i,
    /^follow$/i,
    /^\+\s*subscribe$/i,
    /^subscribe$/i,
    /^like$/i,
    /^comment$/i,
    /^share$/i,
    /^copy link$/i,
    /^see more$/i,
    /^show more$/i,
    /^published by/i,
    /^\d+\s+comments?$/i,
    /^\d+\s+reactions?$/i,
    /^\d+\s+followers?$/i,
    /^sign in to view/i,
    /^get the app$/i,
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

function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/<\/?(strong|b|em|i|mark)[^>]*>/gi, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function findLineIndex(normLines: string[], snippet: string, fromIndex = 0): number {
  const needle = normalizeText(snippet).slice(0, 60);
  if (!needle || needle.length < 8) return -1;
  for (let i = fromIndex; i < normLines.length; i++) {
    if (normLines[i] && normLines[i].includes(needle)) return i;
  }
  return -1;
}

function findLastLineIndex(normLines: string[], snippet: string, fromIndex = 0): number {
  const needle = normalizeText(snippet).slice(0, 60);
  if (!needle || needle.length < 8) return -1;
  for (let i = normLines.length - 1; i >= fromIndex; i--) {
    if (normLines[i] && normLines[i].includes(needle)) return i;
  }
  return -1;
}

function sliceRawByBoundaries(rawMarkdown: string, firstSnippet: string, lastSnippet: string): string {
  if (!rawMarkdown || !firstSnippet || !lastSnippet) return "";
  const lines = rawMarkdown.split("\n");
  const normLines = lines.map(normalizeText);
  const start = findLineIndex(normLines, firstSnippet);
  if (start < 0) return "";
  // Use last occurrence so callback phrases earlier in the article don't truncate the slice.
  const end = findLastLineIndex(normLines, lastSnippet, start);
  if (end < 0) return "";
  return lines.slice(start, end + 1).join("\n").trim();
}

function splitInlineImageLines(markdown: string): string {
  const imgRe = /!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)/g;
  return markdown
    .split("\n")
    .flatMap((line) => {
      if (!imgRe.test(line) || /^!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)$/.test(line.trim())) {
        return [line];
      }
      const parts = line.split(/(!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\))/g);
      return parts.map((p) => p.trim()).filter((p) => p.length > 0);
    })
    .join("\n");
}

function normalizeInlineHtmlFormatting(text: string): string {
  return text
    .replace(/<\s*(strong|b)\b[^>]*>(.*?)<\s*\/\s*\1\s*>/gis, "**$2**")
    .replace(/<\s*(em|i)\b[^>]*>(.*?)<\s*\/\s*\1\s*>/gis, "*$2*")
    .replace(/<\s*mark\b[^>]*>(.*?)<\s*\/\s*mark\s*>/gis, "$1");
}

function countFormattingSignals(markdown: string): number {
  const normalized = normalizeInlineHtmlFormatting(markdown || "");
  return (
    normalized.match(/\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|(?<!\*)\*[^*]+\*(?!\*)|_[^_]+_/g) || []
  ).length;
}

function hasChromeLeak(markdown: string): boolean {
  return /recommended by linkedin|more articles for you|more articles by|people also viewed|others also viewed|to view or add a comment|add a comment|\bcomments?\s*⚙/i.test(markdown || "");
}

function prepareBodyMarkdown(markdown: string, title: string, coverUrl: string | null): string {
  if (!markdown) return "";
  let prepared = normalizeInlineHtmlFormatting(markdown);
  prepared = stripLeadingTitleAndCover(prepared, title, coverUrl);
  prepared = stripInlineRelatedSections(prepared);
  prepared = scrubResidualChrome(prepared, coverUrl);
  return prepared.trim();
}

function chooseFormattedBodyMarkdown(
  rawMarkdown: string,
  candidateMarkdown: string,
  title: string,
  coverUrl: string | null,
  firstSnippet: string,
  lastSnippet: string
): string {
  const raw = prepareBodyMarkdown(rawMarkdown, title, coverUrl);
  const candidate = prepareBodyMarkdown(candidateMarkdown || "", title, coverUrl);
  if (!raw) return candidate;
  if (!candidate || hasChromeLeak(candidate)) return raw;

  const rawNorm = normalizeText(raw);
  const candidateNorm = normalizeText(candidate);
  if (candidateNorm.length < rawNorm.length * 0.75) return raw;

  const firstNeedle = normalizeText(firstSnippet).slice(0, 40);
  const lastNeedle = normalizeText(lastSnippet).slice(0, 40);
  if (firstNeedle && !candidateNorm.includes(firstNeedle)) return raw;
  if (lastNeedle && !candidateNorm.includes(lastNeedle)) return raw;

  return countFormattingSignals(candidate) > countFormattingSignals(raw) ? candidate : raw;
}

function parseInlineMarks(text: string): any[] {
  const nodes: any[] = [];
  const regex =
    /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    if (match[2]) nodes.push({ type: "text", marks: [{ type: "bold" }, { type: "italic" }], text: match[2] });
    else if (match[3]) nodes.push({ type: "text", marks: [{ type: "bold" }], text: match[3] });
    else if (match[4]) nodes.push({ type: "text", marks: [{ type: "italic" }], text: match[4] });
    else if (match[5]) nodes.push({ type: "text", marks: [{ type: "italic" }], text: match[5] });
    else if (match[6] && match[7]) {
      nodes.push({ type: "text", marks: [{ type: "link", attrs: { href: match[7] } }], text: match[6] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push({ type: "text", text: text.slice(lastIndex) });
  if (nodes.length === 0) nodes.push({ type: "text", text: text || " " });
  return nodes;
}

function simpleMarkdownToTiptap(markdown: string): any {
  const lines = splitInlineImageLines(markdown).split("\n");
  const content: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }
    if (/^---+$/.test(line.trim())) { content.push({ type: "horizontalRule" }); i++; continue; }

    // Standalone image
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
    if (imageMatch) {
      content.push({ type: "image", attrs: { src: imageMatch[2], alt: imageMatch[1] || null } });
      i++; continue;
    }

    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      content.push({
        type: "heading",
        attrs: { level: hMatch[1].length },
        content: parseInlineMarks(hMatch[2].trim()),
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
        content: [{ type: "paragraph", content: parseInlineMarks(quoteLines.join(" ").trim()) }],
      });
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: any[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInlineMarks(itemText) }],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items: any[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInlineMarks(itemText) }],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    content.push({ type: "paragraph", content: parseInlineMarks(line.trim()) });
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
