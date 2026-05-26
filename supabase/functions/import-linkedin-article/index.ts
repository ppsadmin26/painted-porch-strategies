import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Known author-name suffixes that LinkedIn appends to Pulse slugs.
// Add new ones here as new authors publish.
const KNOWN_AUTHOR_SUFFIXES = [
  "amy-yackowski",
  "rob-hunter",
  "sierra-ramm-cantrell",
  "sierra-cantrell",
];

function slugFromUrl(url: string): string {
  const match = url.match(/\/pulse\/([^/?]+)/);
  if (!match) return "";
  let slug = match[1];
  // LinkedIn slugs end with "-authorname-XXXXX" - strip the trailing 5-char ID first
  slug = slug.replace(/-[a-z0-9]{5}$/, "");
  // Then strip any known author-name suffix
  for (const suffix of KNOWN_AUTHOR_SUFFIXES) {
    if (slug.endsWith(`-${suffix}`)) {
      slug = slug.slice(0, -1 - suffix.length);
      break;
    }
  }
  return slug.replace(/[^a-z0-9-]/g, "");
}

function extractTextFromTiptap(node: any): string {
  if (!node) return "";
  let text = "";
  if (node.text) text += node.text;
  if (node.content) {
    for (const child of node.content) {
      text += extractTextFromTiptap(child) + " ";
    }
  }
  return text.trim();
}

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/\| linkedin$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Hard-truncate raw LinkedIn markdown at the first strong "post-article" marker
 * (newsletter widget, comments section, "More articles by", etc.) so chrome
 * downstream of the body is never even considered for inclusion.
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
  // Walk back over newsletter-widget remnants (trailing headings / bare links / blanks / fences).
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
 * (matching the cover URL, or the very first image before any prose) from the
 * final body markdown — those are stored separately on the post.
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

function cleanLinkedInMarkdown(markdown: string, titleHint?: string): string {
  const rawLines = truncateAtArticleEnd(markdown)
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\u200B-\u200D\uFEFF]/g, "").trimEnd());

  // IMPORTANT: anchor with ^…$ so we only filter standalone LinkedIn UI label
  // lines. Previously these were substring matches, which silently dropped
  // article sentences ending in "like", "follow", "share", etc. (e.g. the
  // bullet "what good work looks like" was getting nuked by /like$/i).
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
    /^\d+\s+followers?$/i,
    /^\\?\+\s*subscribe/i,
    /^#+\s*more articles by /i,
    /^more articles by /i,
    /^more from /i,
    /^published on linkedin/i,
    /^to view or add a comment/i,
    /^see all (articles|posts|newsletters)/i,
    /^subscribe to (this )?newsletter/i,
  ];

  const normalizedTitle = titleHint ? normalizeForComparison(titleHint) : "";
  let startIndex = 0;

  if (normalizedTitle) {
    const matchedTitleIndex = rawLines.findIndex((line) => {
      const normalizedLine = normalizeForComparison(line.replace(/^#\s+/, ""));
      return normalizedLine && normalizedLine === normalizedTitle;
    });

    if (matchedTitleIndex >= 0) {
      startIndex = matchedTitleIndex;
    }
  }

  const cleaned: string[] = [];
  let contentStarted = false;
  let paragraphCount = 0;

  for (let i = startIndex; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

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

/** Normalize text for fuzzy line matching (boundary snippets vs. raw markdown lines). */
function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // strip image markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // unwrap link markdown to text
    .replace(/[*_`>#]+/g, " ") // strip md emphasis/heading markers
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

/** Find the LAST occurrence — important for closing-snippet matching since Amy often
 *  echoes earlier phrasing in callbacks/conclusions. Matching the first hit would
 *  truncate the article. */
function findLastLineIndex(normLines: string[], snippet: string, fromIndex = 0): number {
  const needle = normalizeText(snippet).slice(0, 60);
  if (!needle || needle.length < 8) return -1;
  for (let i = normLines.length - 1; i >= fromIndex; i--) {
    if (normLines[i] && normLines[i].includes(needle)) return i;
  }
  return -1;
}

/**
 * Slice the raw (cleaned) markdown between two boundary snippets so that
 * deterministic inline formatting (bold/italic/links) and in-body images
 * survive. Returns "" when boundaries can't be located.
 */
function sliceRawByBoundaries(rawMarkdown: string, firstSnippet: string, lastSnippet: string): string {
  if (!rawMarkdown || !firstSnippet || !lastSnippet) return "";
  const lines = rawMarkdown.split("\n");
  const normLines = lines.map(normalizeText);
  const start = findLineIndex(normLines, firstSnippet);
  if (start < 0) return "";
  // Use LAST occurrence so callback phrases earlier in the article don't truncate the slice.
  const end = findLastLineIndex(normLines, lastSnippet, start);
  if (end < 0) return "";
  return lines.slice(start, end + 1).join("\n").trim();
}

/** Split lines so inline images become their own block-level lines. */
function splitInlineImageLines(markdown: string): string {
  const imgRe = /!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)/g;
  return markdown
    .split("\n")
    .flatMap((line) => {
      if (!imgRe.test(line) || /^!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)$/.test(line.trim())) {
        return [line];
      }
      // Split on image tokens, keep images as standalone lines
      const parts = line.split(/(!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\))/g);
      return parts.map((p) => p.trim()).filter((p) => p.length > 0);
    })
    .join("\n");
}

function markdownToTiptap(markdown: string): any {
  const lines = splitInlineImageLines(markdown).split("\n");
  const content: any[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Standalone image line: ![alt](url)
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
    if (imageMatch) {
      content.push({
        type: "image",
        attrs: { src: imageMatch[2], alt: imageMatch[1] || null },
      });
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      content.push({
        type: "heading",
        attrs: { level },
        content: parseInlineMarks(text),
      });
      i++;
      continue;
    }

    // Bullet list items
    if (/^[-*]\s+/.test(line.trim())) {
      const items: any[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarks(itemText),
            },
          ],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Ordered list items
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: any[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarks(itemText),
            },
          ],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInlineMarks(quoteLines.join(" ")),
          },
        ],
      });
      continue;
    }

    // Regular paragraph
    content.push({
      type: "paragraph",
      content: parseInlineMarks(line.trim()),
    });
    i++;
  }

  return { type: "doc", content };
}

function parseInlineMarks(text: string): any[] {
  const nodes: any[] = [];
  // Simple regex-based inline parsing for bold, italic, links
  const regex =
    /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      nodes.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      // Bold+italic ***text***
      nodes.push({
        type: "text",
        marks: [{ type: "bold" }, { type: "italic" }],
        text: match[2],
      });
    } else if (match[3]) {
      // Bold **text**
      nodes.push({
        type: "text",
        marks: [{ type: "bold" }],
        text: match[3],
      });
    } else if (match[4]) {
      // Italic *text*
      nodes.push({
        type: "text",
        marks: [{ type: "italic" }],
        text: match[4],
      });
    } else if (match[5]) {
      // Italic _text_
      nodes.push({
        type: "text",
        marks: [{ type: "italic" }],
        text: match[5],
      });
    } else if (match[6] && match[7]) {
      // Link [text](url)
      nodes.push({
        type: "text",
        marks: [{ type: "link", attrs: { href: match[7] } }],
        text: match[6],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push({ type: "text", text: text.slice(lastIndex) });
  }

  if (nodes.length === 0) {
    nodes.push({ type: "text", text: text || " " });
  }

  return nodes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { url } = await req.json();
    if (!url || !url.includes("linkedin.com/pulse/")) {
      return new Response(
        JSON.stringify({ error: "Valid LinkedIn article URL required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Scrape the article
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use Firecrawl v2 with LLM-powered JSON extraction to grab ONLY the article
    // body. This mirrors how a human (or LLM) reading the page would isolate
    // the actual article content from LinkedIn's surrounding chrome (comments,
    // "more from this author", recommended posts, sign-in prompts, footer, etc.)
    const scrapeRes = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        onlyMainContent: true,
        formats: [
          "markdown",
          {
            type: "json",
            prompt:
              "You are locating the SINGLE LinkedIn Pulse article at the requested URL within page markdown. Return: 'title' (article title, no '| LinkedIn' suffix), 'cover_image_url' (article hero/cover image URL if present, otherwise null), 'first_paragraph_snippet' (the first ~120 characters of the article's first real body paragraph or heading after the title — verbatim plain text, no markdown markers), 'last_paragraph_snippet' (the last ~120 characters of the article's final body paragraph before any 'More articles by', newsletter masthead, comments, or LinkedIn chrome — verbatim plain text, no markdown markers), and 'body_markdown' (FALLBACK ONLY — full article body in clean markdown with bold **text**, italic *text*, links [text](url), and in-body images ![alt](https-url) preserved verbatim; exclude cover image, comments, follow widgets, 'More articles by', newsletter chrome, sign-in prompts, navigation, footer). The snippets MUST appear verbatim in the page text so a downstream slicer can locate them. Do NOT paraphrase the snippets.",
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
    if (!scrapeRes.ok || !scrapeData.success) {
      return new Response(
        JSON.stringify({
          error: "Failed to scrape article",
          detail: scrapeData.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload = scrapeData.data ?? scrapeData;
    const extracted = payload.json ?? {};
    const metadata = payload.metadata ?? {};
    const fallbackMarkdown: string = payload.markdown || "";

    let title: string =
      (extracted.title || "").replace(/ \| LinkedIn$/, "").trim() ||
      metadata.title?.replace(/ \| LinkedIn$/, "").trim() ||
      fallbackMarkdown.match(/^#\s+(.+)/m)?.[1] ||
      "Untitled Import";

    if (extracted.cover_image_url && !metadata.ogImage) {
      metadata.ogImage = extracted.cover_image_url;
    }

    // PREFERRED PATH: slice raw markdown between LLM-located boundaries so
    // bold/italic/links/in-body images survive (LLM body_markdown tends to
    // flatten inline marks and drop images). Falls back to LLM body_markdown
    // if the boundaries can't be found in the raw scrape.
    const cleanedRaw = fallbackMarkdown ? cleanLinkedInMarkdown(fallbackMarkdown, title) : "";
    const coverUrlForStrip: string | null =
      metadata.ogImage || metadata.image || extracted.cover_image_url || null;

    // PREFERRED PATH: slice raw markdown between LLM-located boundaries so
    // bold/italic/links/in-body images survive (LLM body_markdown tends to
    // flatten inline marks, drop images, AND silently summarize the body —
    // which is why we no longer fall back to it).
    let markdown = sliceRawByBoundaries(
      cleanedRaw,
      extracted.first_paragraph_snippet || "",
      extracted.last_paragraph_snippet || ""
    );

    // If the boundary slice couldn't be located, trust the cleaned raw scrape.
    // truncateAtArticleEnd + cleanLinkedInMarkdown already strip the newsletter
    // widget, comments, and footer. We deliberately do NOT use the LLM's
    // body_markdown — it has been observed to summarize the article (literally
    // inserting "...and so on..." mid-body) and to flatten inline formatting.
    if (!markdown) {
      markdown = cleanedRaw;
    }

    // Strip leading H1 (title) and leading cover image — they're stored on the
    // post record separately, so leaving them in the body causes duplicates.
    if (markdown) {
      markdown = stripLeadingTitleAndCover(markdown, title, coverUrlForStrip);
    }


    if (!markdown) {
      return new Response(
        JSON.stringify({ error: "No article body found after cleanup" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate slug from URL
    let slug = slugFromUrl(url);
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
    }

    // Convert markdown to Tiptap JSON
    const bodyJson = markdownToTiptap(markdown);

    // Generate an AI summary for the excerpt (falls back to first sentences if AI fails)
    const bodyText = extractTextFromTiptap(bodyJson);
    let excerpt = bodyText.slice(0, 250).trim() + "...";
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey) {
      try {
        const summaryRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  "You write the short summary that appears at the top of a Painted Porch Strategies blog post. It should read like an SEO meta description: ONE compelling paragraph, 2-3 sentences, max 280 characters. Capture the article's core argument, hint at what the reader will gain, and include a subtle call-to-action feel (curiosity, benefit, or invitation to read on). Use plain English at a 6th-grade level. Reference brand terms (Phase Zero, P.A.T.H., organizational change, shIFt) only when the article does. Plain text only — no quotes, markdown, hashtags, or em-dashes. Do NOT start with the title or 'In this post'.",
              },
              {
                role: "user",
                content: `Title: ${title}\n\nArticle:\n${bodyText.slice(0, 6000)}`,
              },
            ],
          }),
        });
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const aiExcerpt = summaryData?.choices?.[0]?.message?.content?.trim();
          if (aiExcerpt) {
            excerpt = aiExcerpt.replace(/^["']|["']$/g, "").replace(/\s+/g, " ").trim();
          }
        } else {
          console.warn("Excerpt AI call failed:", summaryRes.status, await summaryRes.text());
        }
      } catch (e) {
        console.warn("Excerpt generation error:", e);
      }
    }

    // Check for duplicate slug
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: existing } = await adminClient
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          error: "Article already imported",
          slug,
          postId: existing.id,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert as "pending" (ready for editorial review)
    const { data: newPost, error: insertError } = await adminClient
      .from("blog_posts")
      .insert({
        title,
        slug,
        status: "pending",
        featured: false,
        excerpt,
        body_json: bodyJson,
        cover_image_url: metadata.ogImage || metadata.image || null,
        author_id: user.id,
        publish_date: new Date().toISOString(),
      })
      .select("id, slug")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save article", detail: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        postId: newPost.id,
        slug: newPost.slug,
        title,
        message: "Article imported as approved — ready for review",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
