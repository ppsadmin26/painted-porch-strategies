import { useEffect } from "react";
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
  useEffect(() => {
    const defaultSeo = getDefaultSeo();
    const resolvedCanonical = canonical ? toAbsoluteSiteUrl(canonical) : defaultSeo.canonical;
    const resolvedOgImage = ogImage ? toAbsoluteSiteUrl(ogImage) : defaultSeo.ogImage;

    document.title = title || defaultSeo.title;

    setMeta("name", "description", description || defaultSeo.description);
    setMeta("name", "keywords", keywords?.length ? keywords.join(", ") : "");
    setMeta("name", "robots", robots || defaultSeo.robots);
    setMeta("property", "og:title", ogTitle || title || defaultSeo.ogTitle);
    setMeta(
      "property",
      "og:description",
      ogDescription || description || defaultSeo.ogDescription,
    );
    setMeta("property", "og:type", ogType || defaultSeo.ogType);
    setMeta("property", "og:image", resolvedOgImage);
    setMeta("property", "og:url", resolvedCanonical);
    setMeta("name", "twitter:title", ogTitle || title || defaultSeo.ogTitle);
    setMeta(
      "name",
      "twitter:description",
      ogDescription || description || defaultSeo.ogDescription,
    );
    setMeta("name", "twitter:image", resolvedOgImage);
    setLink("canonical", resolvedCanonical);
    upsertJsonLd(jsonLd);

    return () => {
      const jsonLdScript = document.head.querySelector('script[data-lovable-seo="json-ld"]');
      jsonLdScript?.remove();
    };
  }, [title, description, keywords, canonical, robots, ogTitle, ogDescription, ogType, ogImage, jsonLd]);
}
