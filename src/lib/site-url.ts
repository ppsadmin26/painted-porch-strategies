const FALLBACK_SITE_URL = "https://pps-website.lovable.app";

export function getSiteUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return FALLBACK_SITE_URL;
}

export function getCurrentPageUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${window.location.pathname}`;
  }

  return `${FALLBACK_SITE_URL}/`;
}

export function toAbsoluteSiteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, `${getSiteUrl()}/`).toString();
}
