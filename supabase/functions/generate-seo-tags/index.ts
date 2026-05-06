import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractTextFromTiptap(node: any): string {
  if (!node) return "";
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractTextFromTiptap).join(" ");
  return "";
}

async function generateTags(title: string, excerpt: string, bodyText: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("AI not configured");

  const prompt = `You are an SEO/AEO/GEO specialist for Painted Porch Strategies, an organizational change and transformation consultancy. Analyze this blog post and generate optimization metadata.

BLOG POST:
Title: ${title}
Excerpt: ${excerpt || "N/A"}
Body (truncated): ${bodyText}

Generate the following in JSON format (no markdown, just raw JSON):

{
  "seo_title": "Optimized page title under 60 characters with primary keyword",
  "seo_description": "Meta description under 160 characters, compelling, includes primary keyword and call-to-action feel",
  "seo_keywords": ["array", "of", "8-12", "relevant", "keywords", "including", "long-tail", "variations"],
  "aeo_tags": [
    "What question does this article answer?",
    "How question answered by this content?",
    "Why question this content addresses?",
    "Add 3-5 natural language questions that AI assistants and search engines would match this content to"
  ],
  "geo_tags": [
    "Geographic relevance tags - where this content is most applicable",
    "Include general tags like 'United States', 'Global', 'English-speaking markets'",
    "Add industry-specific geographic tags if relevant",
    "2-4 tags total"
  ]
}

GUIDELINES:
- SEO title should NOT start with "How to" unless the content is truly instructional
- Keywords should include: the primary topic, brand terms (Phase Zero, Painted Porch Strategies, organizational change) when relevant, and industry terms
- AEO tags should be natural questions someone would ask an AI assistant that this content answers
- GEO tags should reflect where this content's audience is located and where the business operates (primarily US-based, English-speaking business audiences)
- Keep everything professional and aligned with B2B executive/leadership audience`;

  const aiResponse = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    }
  );

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("AI Gateway error:", errText);
    throw new Error("AI generation failed");
  }

  const aiData = await aiResponse.json();
  const rawContent = aiData.choices?.[0]?.message?.content || "";
  const jsonMatch = rawContent.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(jsonMatch);
  } catch {
    console.error("Failed to parse AI response:", rawContent);
    throw new Error("Failed to parse AI response");
  }
}

async function saveTagsToPost(postId: string, tags: any) {
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { error } = await serviceClient
    .from("blog_posts")
    .update({
      seo_title: tags.seo_title || "",
      seo_description: tags.seo_description || "",
      seo_keywords: tags.seo_keywords || [],
      aeo_tags: tags.aeo_tags || [],
      geo_tags: tags.geo_tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: allow service_role OR authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isServiceRole = authHeader === `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` ||
      authHeader === `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`;

    if (!isServiceRole) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Only admins/editors can write SEO tags to posts
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile || !["admin", "editor"].includes(profile.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();

    // Batch mode: process multiple posts provided inline
    if (body.batch && Array.isArray(body.posts)) {
      const results: any[] = [];
      for (const post of body.posts) {
        try {
          const bodyText = extractTextFromTiptap(post.bodyJson).slice(0, 4000);
          const tags = await generateTags(post.title, post.excerpt, bodyText);
          if (post.postId) await saveTagsToPost(post.postId, tags);
          results.push({ postId: post.postId, title: post.title, status: "success", tags });
        } catch (err) {
          results.push({ postId: post.postId, title: post.title, status: "error", error: String(err) });
        }
        await new Promise(r => setTimeout(r, 1500));
      }
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch-all mode: fetch all published posts missing tags and process them
    if (body.batchAll) {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: posts, error: fetchErr } = await serviceClient
        .from("blog_posts")
        .select("id, title, excerpt, body_json")
        .eq("status", "published")
        .order("publish_date", { ascending: false });

      if (fetchErr) throw fetchErr;

      const needsTags = (posts || []).filter((p: any) => {
        const hasSeo = p.seo_keywords && p.seo_keywords.length > 0;
        const hasAeo = p.aeo_tags && p.aeo_tags.length > 0;
        return !(hasSeo && hasAeo);
      });

      console.log(`batchAll: ${needsTags.length} posts need tags out of ${(posts || []).length} total`);

      const results: any[] = [];
      for (const post of needsTags) {
        try {
          const bodyText = extractTextFromTiptap(post.body_json).slice(0, 4000);
          const tags = await generateTags(post.title, post.excerpt || "", bodyText);
          await saveTagsToPost(post.id, tags);
          results.push({ postId: post.id, title: post.title, status: "success" });
          console.log(`✅ ${post.title.slice(0, 50)}`);
        } catch (err) {
          results.push({ postId: post.id, title: post.title, status: "error", error: String(err) });
          console.error(`❌ ${post.title.slice(0, 50)}: ${err}`);
        }
        await new Promise(r => setTimeout(r, 2000));
      }

      return new Response(JSON.stringify({ total: (posts || []).length, processed: needsTags.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single post mode
    const { postId, title, excerpt, bodyJson, mode } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bodyText = extractTextFromTiptap(bodyJson).slice(0, 4000);
    const tags = await generateTags(title, excerpt, bodyText);

    if (mode === "save" && postId) {
      await saveTagsToPost(postId, tags);
    }

    return new Response(JSON.stringify(tags), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
