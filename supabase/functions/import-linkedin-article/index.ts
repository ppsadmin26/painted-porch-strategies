import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function slugFromUrl(url: string): string {
  const match = url.match(/\/pulse\/([^/?]+)/);
  if (!match) return "";
  // Remove the author suffix (last segment after the last dash that contains the author name)
  let slug = match[1];
  // LinkedIn slugs end with "-authorname-XXXXX" - remove trailing ID
  slug = slug.replace(/-[a-z0-9]{5}$/, "");
  // Clean up
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

function cleanLinkedInMarkdown(markdown: string, titleHint?: string): string {
  const rawLines = markdown
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

function markdownToTiptap(markdown: string): any {
  const lines = markdown.split("\n");
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
              "Extract ONLY the LinkedIn Pulse article itself. Return: 'title' (the article title, with no '| LinkedIn' suffix), 'cover_image_url' (the article hero/cover image URL if present, otherwise null), and 'body_markdown' (the FULL article body in clean markdown — every paragraph, heading, list, blockquote, inline link, AND every in-body image from the article body, in original order). Preserve in-body images as standalone markdown image lines using the absolute https URL: ![alt text](https://...). Do NOT skip images, do NOT replace them with captions only, and do NOT include the cover/hero image in body_markdown (return that separately as cover_image_url). EXCLUDE: author bio, follow/subscribe widgets, reactions, comments, 'More from <author>', 'Others also viewed', 'Sign in / Join now' prompts, related articles, navigation, footer, cookie/privacy notices, and any LinkedIn UI chrome. Preserve inline links as standard markdown [text](url). Do not summarize or paraphrase — copy the article text verbatim.",
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

    let markdown: string = (extracted.body_markdown || "").trim();
    let title: string =
      (extracted.title || "").replace(/ \| LinkedIn$/, "").trim() ||
      metadata.title?.replace(/ \| LinkedIn$/, "").trim() ||
      fallbackMarkdown.match(/^#\s+(.+)/m)?.[1] ||
      "Untitled Import";

    if (extracted.cover_image_url && !metadata.ogImage) {
      metadata.ogImage = extracted.cover_image_url;
    }

    // Fallback: if LLM extraction returned nothing, fall back to markdown + cleaner
    if (!markdown) {
      markdown = cleanLinkedInMarkdown(fallbackMarkdown, title);
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

    // Extract excerpt (first ~200 chars of body text)
    const bodyText = extractTextFromTiptap(bodyJson);
    const excerpt = bodyText.slice(0, 250).trim() + "...";

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
