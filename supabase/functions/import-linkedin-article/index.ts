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

/**
 * Final scrub pass — runs AFTER slicing and leading-strip so any chrome that
 * leaked through (because LLM boundary snippets missed, or because cleanup ran
 * before the slice was located) gets nuked. Operates on the FINAL markdown.
 */
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
    // Strip leading runs of backticks / escaped backticks / zero-width chars,
    // then re-evaluate. LinkedIn sometimes prefixes chrome lines with these.
    let line = raw
      .replace(/[\u200B-\u200D\uFEFF\u00a0]/g, " ")
      .replace(/^[\s`\\]+/, "")
      .replace(/[\s`\\]+$/, "");
    // Drop lines that are ONLY backticks/whitespace/punctuation after strip
    if (!line || /^[`\s\-–—_*]+$/.test(line)) {
      out.push("");
      continue;
    }
    if (bareBoilerplate.some((r) => r.test(line))) continue;
    // Drop the cover image anywhere in body (not only leading)
    const img = line.match(/^!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/);
    if (img) {
      const src = img[1];
      if (coverUrl && (src === coverUrl || src.split("?")[0] === coverBase)) continue;
    }
    out.push(line);
  }
  // Collapse consecutive blanks
  const collapsed: string[] = [];
  for (const l of out) {
    if (l === "" && collapsed[collapsed.length - 1] === "") continue;
    collapsed.push(l);
  }
  while (collapsed[0] === "") collapsed.shift();
  while (collapsed[collapsed.length - 1] === "") collapsed.pop();
  return collapsed.join("\n");
}

/**
 * LinkedIn frequently embeds "Recommended next", "Explore topics",
 * "More like this", or "Related articles" widgets MID-BODY — not at the end.
 * They render as a heading-ish line followed by a cluster of article-card
 * fragments: ![cover](img) + [Title](pulse-url) + author + date.
 *
 * This pass scans the body and removes those clusters in-place, then resumes
 * normal article content. Operates on already-cleaned markdown.
 */
function stripInlineRelatedSections(md: string): string {
  const lines = md.split("\n");
  const headerRe =
    /^(#{1,6}\s+)?\s*(recommended (next|reading|for you|articles)|explore (topics|more)|related (articles|posts|reading)|more (like this|articles by|from)|you (might|may) (also )?(like|enjoy)|keep reading|see also|further reading|published by)\b/i;
  const cardLineRe = [
    /^!\[[^\]]*\]\([^)]+\)\s*$/, // standalone image
    /^\[[^\]]+\]\(https?:\/\/(www\.)?linkedin\.com\/[^)]+\)\s*$/i, // linkedin link line
    /^\[[^\]]+\]\(https?:\/\/[^)]+\)\s*$/i, // bare link line
    /^\d+\s+(min read|minute read|reactions?|comments?|followers?)\s*$/i,
    /^(by\s+)?[A-Z][\w .'’-]{1,80}\s*$/, // author byline (capitalized words)
    /^\w{3,9}\.?\s+\d{1,2},?\s+\d{4}\s*$/i, // date line "Jan 5, 2024"
    /^\d+\s+(likes?|views?)\s*$/i,
  ];

  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (headerRe.test(t)) {
      // Skip the header line plus any following card-fragment lines (and blanks),
      // until we hit something that looks like real prose again.
      i++;
      let consumed = 0;
      while (i < lines.length) {
        const u = lines[i].trim();
        if (u === "") { i++; continue; }
        const isCard = cardLineRe.some((r) => r.test(u));
        if (isCard) { i++; consumed++; continue; }
        // If we never consumed any card lines, treat header as a real heading
        // and don't eat it — but we already skipped it. Push it back to be safe.
        if (consumed === 0) {
          out.push(lines[i - 1]); // re-emit the header we skipped
        }
        break;
      }
      // ensure spacing
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  // collapse trailing/leading/duplicate blanks
  const collapsed: string[] = [];
  for (const l of out) {
    if (l.trim() === "" && collapsed[collapsed.length - 1]?.trim() === "") continue;
    collapsed.push(l);
  }
  while (collapsed[0]?.trim() === "") collapsed.shift();
  while (collapsed[collapsed.length - 1]?.trim() === "") collapsed.pop();
  return collapsed.join("\n");
}

/**
 * Walk a Tiptap doc and rewrite link marks pointing at LinkedIn Pulse articles
 * to local blog routes WHEN the target slug already exists in blog_posts.
 * Mutates the doc in place and returns the count of rewritten links.
 */
async function rewriteLinkedInLinksToLocal(doc: any, adminClient: any): Promise<number> {
  // Collect all pulse URLs first
  const urls = new Set<string>();
  const walk = (n: any) => {
    if (!n) return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.marks) {
      for (const m of n.marks) {
        if (m.type === "link" && m.attrs?.href && /linkedin\.com\/pulse\//i.test(m.attrs.href)) {
          urls.add(m.attrs.href);
        }
      }
    }
    if (n.content) walk(n.content);
  };
  walk(doc);
  if (urls.size === 0) return 0;

  // Map each URL → candidate slug → existing post slug (if any)
  const urlToSlug = new Map<string, string>();
  const candidateSlugs = new Set<string>();
  for (const u of urls) {
    const s = slugFromUrl(u);
    if (s) {
      urlToSlug.set(u, s);
      candidateSlugs.add(s);
    }
  }
  if (candidateSlugs.size === 0) return 0;

  const { data: rows } = await adminClient
    .from("blog_posts")
    .select("slug")
    .in("slug", Array.from(candidateSlugs));
  const existing = new Set<string>((rows || []).map((r: any) => r.slug));
  if (existing.size === 0) return 0;

  let rewrote = 0;
  const walk2 = (n: any) => {
    if (!n) return;
    if (Array.isArray(n)) { n.forEach(walk2); return; }
    if (n.marks) {
      for (const m of n.marks) {
        if (m.type === "link" && m.attrs?.href) {
          const href = m.attrs.href;
          const slug = urlToSlug.get(href);
          if (slug && existing.has(slug)) {
            m.attrs.href = `/resources/blog/${slug}`;
            rewrote++;
          }
        }
      }
    }
    if (n.content) walk2(n.content);
  };
  walk2(doc);
  return rewrote;
}

function cleanLinkedInMarkdown(markdown: string, titleHint?: string): string {
  const rawLines = truncateAtArticleEnd(markdown)
    .replace(/`{3,}/g, "") // strip ``` fence runs that LinkedIn scatters across the page
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
  let start = findLineIndex(normLines, firstSnippet);
  if (start < 0) return "";
  // Use LAST occurrence so callback phrases earlier in the article don't truncate the slice.
  let end = findLastLineIndex(normLines, lastSnippet, start);
  if (end < 0) return "";

  // Walk START backward to include leading epigraph/blockquote/italic intro lines
  // (e.g. opening pull-quotes the LLM tends to skip when picking first_paragraph).
  // Stop at the article title (# heading), cover image, or article chrome.
  let s = start - 1;
  while (s >= 0) {
    const raw = lines[s];
    const t = raw.trim();
    if (t === "") { s--; continue; }
    // Stop on a top-level heading (article title) or any standalone image (cover).
    if (/^#{1,2}\s+\S/.test(t)) break;
    if (/^!\[[^\]]*\]\([^)\s]+/.test(t)) break;
    // Include blockquotes and italic/quoted intros.
    if (/^>\s?/.test(t) || /^[*_].+[*_]\s*$/.test(t) || /^["“”].+["“”]\s*$/.test(t)) {
      start = s; s--; continue;
    }
    // Otherwise stop — don't pull in unrelated chrome.
    break;
  }

  // Walk END forward to include trailing sign-off lines like "~ Amy Yack",
  // "— Amy", "-Amy", etc., up until we hit chrome/truncation.
  const signoffRe = /^\s*[~\-–—]+\s*[A-Za-z][\w .'’-]{0,60}\s*$/;
  let e = end + 1;
  while (e < lines.length) {
    const t = lines[e].trim();
    if (t === "") { e++; continue; }
    if (signoffRe.test(t) || /^_.+_$|^\*.+\*$/.test(t)) {
      end = e; e++; continue;
    }
    break;
  }

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

function unescapeMd(s: string): string {
  return s.replace(/\\([\\`*_{}\[\]()#+\-.!>])/g, "$1");
}

function parseInlineMarks(text: string): any[] {
  text = unescapeMd(text);
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

    const { url, reimport } = await req.json();
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
              "You are locating the SINGLE LinkedIn Pulse article at the requested URL within page markdown. Return: 'title' (article title, no '| LinkedIn' suffix), 'cover_image_url' (article hero/cover image URL if present, otherwise null), 'first_paragraph_snippet' (verbatim ~120 chars of the article's FIRST line of body content after the title — this INCLUDES any opening epigraph, pull-quote, italicized intro, or blockquote that appears before the first regular paragraph; do NOT skip them), 'last_paragraph_snippet' (verbatim ~120 chars of the article's FINAL line of body content before any LinkedIn chrome — this INCLUDES any sign-off line such as '~ Amy Yack', '— Amy', author signature, or closing italic note; do NOT stop before the sign-off), and 'body_markdown' (FALLBACK ONLY — full article body in clean markdown with bold **text**, italic *text*, blockquotes > , links [text](url), and in-body images ![alt](https-url) preserved verbatim; exclude cover image, comments, follow widgets, 'More articles by', newsletter chrome, sign-in prompts, navigation, footer). Snippets MUST appear verbatim in the page text. Do NOT paraphrase.",
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
      markdown = stripInlineRelatedSections(markdown);
      markdown = scrubResidualChrome(markdown, coverUrlForStrip);
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

    // Rewrite any LinkedIn Pulse links in the body to local blog URLs when
    // the target article already exists in our blog library.
    const adminClient = createClient(supabaseUrl, serviceKey);
    try {
      const rewrote = await rewriteLinkedInLinksToLocal(bodyJson, adminClient);
      if (rewrote > 0) console.log(`Rewrote ${rewrote} LinkedIn link(s) to local blog URLs`);
    } catch (e) {
      console.warn("Link rewrite skipped:", e);
    }

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
            model: "google/gemini-2.5-flash",
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

    // Check for duplicate slug (adminClient created above for link rewriting)
    const { data: existing } = await adminClient
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing && !reimport) {
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

    let newPost: { id: string; slug: string } | null = null;

    if (existing && reimport) {
      // Overwrite content fields but preserve status/featured/author so admin
      // edits to publishing state aren't clobbered by a re-import.
      const { data: updated, error: updateError } = await adminClient
        .from("blog_posts")
        .update({
          title,
          excerpt,
          body_json: bodyJson,
          cover_image_url: metadata.ogImage || metadata.image || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id, slug")
        .single();

      if (updateError) {
        console.error("Re-import update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to re-import article", detail: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      newPost = updated;
    } else {
      const { data: inserted, error: insertError } = await adminClient
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
      newPost = inserted;
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
