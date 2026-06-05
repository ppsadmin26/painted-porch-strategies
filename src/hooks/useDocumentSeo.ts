import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPageUrl, getSiteUrl, toAbsoluteSiteUrl } from "@/lib/site-url";

type SeoConfig = {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

type SeoOverride = {
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical: string | null;
  keywords: string[] | null;
  robots: string | null;
  jsonld: Record<string, unknown> | Record<string, unknown>[] | null;
};

const DEFAULT_SEO = {
  title: "Painted Porch Strategies | Architect Extraordinary Outcomes",
  description:
    "Painted Porch Strategies partners with leaders to architect extraordinary outcomes through Phase Zero™ strategic positioning and organizational transformation.",
  robots: "index, follow",
  ogTitle: "Painted Porch Strategies | Architect Extraordinary Outcomes",
  ogDescription:
    "Painted Porch Strategies partners with leaders to architect extraordinary outcomes through Phase Zero strategic positioning and organizational transformation.",
  ogType: "website",
};

function getDefaultSeo() {
  const siteUrl = getSiteUrl();
  const pageUrl = getCurrentPageUrl();

  return {
    ...DEFAULT_SEO,
    canonical: pageUrl,
    ogImage: `${siteUrl}/og-image.jpg`,
    ogUrl: pageUrl,
  };
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(jsonLd?: SeoConfig["jsonLd"]) {
  const existing = document.head.querySelector('script[data-lovable-seo="json-ld"]');
  if (!jsonLd) {
    existing?.remove();
    return;
  }

  const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  let script = existing as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-lovable-seo", "json-ld");
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
}

// Tiny in-memory cache so we don't refetch the same path on every nav.
const overrideCache = new Map<string, SeoOverride | null>();

function useSeoOverride(pathname: string): SeoOverride | null {
  const [override, setOverride] = useState<SeoOverride | null>(
    overrideCache.has(pathname) ? overrideCache.get(pathname)! : null,
  );

  useEffect(() => {
    let cancelled = false;
    if (overrideCache.has(pathname)) {
      setOverride(overrideCache.get(pathname)!);
      return;
    }
    supabase
      .from("page_seo")
      .select("title,description,og_title,og_description,og_image,canonical,keywords,robots,jsonld")
      .eq("path", pathname)
      .maybeSingle()
      .then(({ data }) => {
        const value = (data as SeoOverride | null) ?? null;
        overrideCache.set(pathname, value);
        if (!cancelled) setOverride(value);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return override;
}

/** Clear cached SEO overrides — call after admin edits so the live site picks up changes. */
export function invalidateSeoOverrideCache(pathname?: string) {
  if (pathname) overrideCache.delete(pathname);
  else overrideCache.clear();
}

export function useDocumentSeo({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogType,
  ogImage,
  jsonLd,
}: SeoConfig) {
  const location = useLocation();
  const override = useSeoOverride(location.pathname);

  useEffect(() => {
    const defaultSeo = getDefaultSeo();

    // Resolution order: DB override > inline hook arg > default
    const resolvedTitle = override?.title || title || defaultSeo.title;
    const resolvedDescription = override?.description || description || defaultSeo.description;
    const resolvedOgTitle = override?.og_title || ogTitle || resolvedTitle;
    const resolvedOgDescription =
      override?.og_description || ogDescription || resolvedDescription;
    const resolvedOgType = ogType || defaultSeo.ogType;
    const resolvedKeywords = override?.keywords?.length
      ? override.keywords
      : keywords?.length
        ? keywords
        : null;
    const resolvedRobots = override?.robots || robots || defaultSeo.robots;
    const resolvedJsonLd = override?.jsonld ?? jsonLd;

    const canonicalSource = override?.canonical || canonical;
    const resolvedCanonical = canonicalSource
      ? toAbsoluteSiteUrl(canonicalSource)
      : defaultSeo.canonical;

    const ogImageSource = override?.og_image || ogImage;
    const resolvedOgImage = ogImageSource ? toAbsoluteSiteUrl(ogImageSource) : defaultSeo.ogImage;

    document.title = resolvedTitle;

    setMeta("name", "description", resolvedDescription);
    setMeta("name", "keywords", resolvedKeywords ? resolvedKeywords.join(", ") : "");
    setMeta("name", "robots", resolvedRobots);
    setMeta("property", "og:title", resolvedOgTitle);
    setMeta("property", "og:description", resolvedOgDescription);
    setMeta("property", "og:type", resolvedOgType);
    setMeta("property", "og:image", resolvedOgImage);
    setMeta("property", "og:url", resolvedCanonical);
    setMeta("name", "twitter:title", resolvedOgTitle);
    setMeta("name", "twitter:description", resolvedOgDescription);
    setMeta("name", "twitter:image", resolvedOgImage);
    setLink("canonical", resolvedCanonical);
    upsertJsonLd(resolvedJsonLd ?? undefined);

    return () => {
      const jsonLdScript = document.head.querySelector('script[data-lovable-seo="json-ld"]');
      jsonLdScript?.remove();
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogType,
    ogImage,
    jsonLd,
    override,
  ]);
}
