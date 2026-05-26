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
      // Prefer raw-markdown slice between LLM boundaries — preserves bold/italic/links/images
      markdown = sliceRawByBoundaries(
        cleanedRaw,
        extracted.first_paragraph_snippet || "",
        extracted.last_paragraph_snippet || ""
      );
      // Avoid truncation when closing snippet matches an earlier callback phrase
      if (
        markdown &&
        cleanedRaw &&
        markdown.length < cleanedRaw.length * 0.6 &&
        cleanedRaw.length > 500
      ) {
        markdown = cleanedRaw;
      }
      if (!markdown) {
        markdown = (extracted.body_markdown || "").trim();
        if (markdown) markdown = cleanLinkedInMarkdown(markdown);
      }
      if (!markdown) markdown = cleanedRaw;
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

function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
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

function sliceRawByBoundaries(rawMarkdown: string, firstSnippet: string, lastSnippet: string): string {
  if (!rawMarkdown || !firstSnippet || !lastSnippet) return "";
  const lines = rawMarkdown.split("\n");
  const normLines = lines.map(normalizeText);
  const start = findLineIndex(normLines, firstSnippet);
  if (start < 0) return "";
  const end = findLineIndex(normLines, lastSnippet, start);
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
