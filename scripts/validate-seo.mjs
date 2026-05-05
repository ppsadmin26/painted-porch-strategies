import { chromium } from '@playwright/test';

const DEFAULT_SITE_URL = 'https://pps-website.lovable.app';
const DEFAULT_KEY_PAGES = ['/', '/about', '/contact', '/resources', '/resources/blog'];
const MAX_STATIC_PAGES = 8;
const MAX_BLOG_PAGES = 3;

function normalizeSiteUrl(value) {
  if (!value) return DEFAULT_SITE_URL;
  return value.replace(/\/$/, '');
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
      url.port = '';
    }
    return url.toString().replace(/\/$/, '') || url.origin;
  } catch {
    return value;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'pps-seo-validator/1.0',
      accept: 'text/plain,application/xml,text/xml,text/html,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseRobots(robotsText) {
  return robotsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSitemapUrls(xmlText) {
  const matches = [...xmlText.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((match) => match[1].trim()).filter(Boolean);
}

function buildDefaultKeyPages(siteUrl) {
  return DEFAULT_KEY_PAGES.map((path) => `${siteUrl}${path === '/' ? '' : path}`);
}

function buildKeyPages(allUrls, siteUrl) {
  const uniqueUrls = [...new Set(allUrls.map((url) => normalizeUrl(url)))];
  const preferredPaths = DEFAULT_KEY_PAGES;
  const preferredUrls = preferredPaths
    .map((path) => `${siteUrl}${path === '/' ? '' : path}`)
    .filter((url) => uniqueUrls.includes(normalizeUrl(url)));

  const staticPages = uniqueUrls
    .filter((url) => !url.includes('/resources/blog/'))
    .slice(0, MAX_STATIC_PAGES);

  const blogPages = uniqueUrls
    .filter((url) => url.includes('/resources/blog/'))
    .slice(0, MAX_BLOG_PAGES);

  const combined = [...new Set([...preferredUrls, ...staticPages, ...blogPages])];
  return combined.length > 0 ? combined : buildDefaultKeyPages(siteUrl);
}

function formatResultIcon(status) {
  return status === 'pass' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL';
}

async function validatePage(page, url, expectedSiteUrl) {
  const pageErrors = [];

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  const data = await page.evaluate(() => {
    const readMeta = (selector) => document.head.querySelector(selector)?.getAttribute('content') ?? null;
    const canonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;

    return {
      title: document.title,
      canonical,
      robots: readMeta('meta[name="robots"]'),
      ogUrl: readMeta('meta[property="og:url"]'),
      ogImage: readMeta('meta[property="og:image"]'),
      twitterImage: readMeta('meta[name="twitter:image"]'),
    };
  });

  const currentUrl = normalizeUrl(page.url());
  const expectedCanonical = normalizeUrl(url);
  const expectedOrigin = new URL(expectedSiteUrl).origin;

  if (!data.canonical) {
    pageErrors.push('Missing canonical link');
  } else if (normalizeUrl(data.canonical) !== expectedCanonical) {
    pageErrors.push(`Canonical mismatch: expected ${expectedCanonical}, found ${data.canonical}`);
  }

  if (!data.robots) {
    pageErrors.push('Missing robots meta');
  } else {
    const normalizedRobots = data.robots.toLowerCase();
    if (normalizedRobots.includes('noindex') || normalizedRobots.includes('nofollow')) {
      pageErrors.push(`Unexpected robots directive on public page: ${data.robots}`);
    }
  }

  if (!data.ogUrl) {
    pageErrors.push('Missing og:url meta');
  } else if (normalizeUrl(data.ogUrl) !== expectedCanonical) {
    pageErrors.push(`og:url mismatch: expected ${expectedCanonical}, found ${data.ogUrl}`);
  }

  if (!data.ogImage) {
    pageErrors.push('Missing og:image meta');
  } else if (!normalizeUrl(data.ogImage).startsWith(expectedOrigin)) {
    pageErrors.push(`og:image uses wrong domain: ${data.ogImage}`);
  }

  if (!data.twitterImage) {
    pageErrors.push('Missing twitter:image meta');
  } else if (!normalizeUrl(data.twitterImage).startsWith(expectedOrigin)) {
    pageErrors.push(`twitter:image uses wrong domain: ${data.twitterImage}`);
  }

  return {
    url: currentUrl,
    title: data.title,
    errors: pageErrors,
  };
}

async function main() {
  const expectedSiteUrl = normalizeSiteUrl(process.env.SITE_URL || process.env.VITE_SITE_URL || process.argv[2]);
  const robotsUrl = `${expectedSiteUrl}/robots.txt`;
  const sitemapUrl = `${expectedSiteUrl}/sitemap.xml`;

  const failures = [];
  const warnings = [];

  console.log(`SEO validation target: ${expectedSiteUrl}`);

  let robotsLines = [];
  try {
    const robotsText = await fetchText(robotsUrl);
    robotsLines = parseRobots(robotsText);
    const sitemapLines = robotsLines.filter((line) => /^sitemap:/i.test(line));

    if (sitemapLines.length !== 1) {
      failures.push(`robots.txt should contain exactly 1 Sitemap line, found ${sitemapLines.length}`);
    }

    const declaredSitemap = sitemapLines[0]?.replace(/^sitemap:\s*/i, '').trim();
    const resolvedSitemap = declaredSitemap ? new URL(declaredSitemap, `${expectedSiteUrl}/`).toString() : null;
    if (resolvedSitemap && normalizeUrl(resolvedSitemap) !== normalizeUrl(sitemapUrl)) {
      failures.push(`robots.txt sitemap mismatch: expected ${sitemapUrl}, found ${declaredSitemap}`);
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  let sitemapUrls = [];
  try {
    const sitemapXml = await fetchText(sitemapUrl);
    sitemapUrls = parseSitemapUrls(sitemapXml);

    if (sitemapUrls.length === 0) {
      failures.push('sitemap.xml did not contain any <loc> entries');
    }

    const wrongDomainUrls = sitemapUrls.filter((url) => !normalizeUrl(url).startsWith(expectedSiteUrl));
    if (wrongDomainUrls.length > 0) {
      failures.push(`sitemap.xml contains ${wrongDomainUrls.length} URL(s) outside ${expectedSiteUrl}`);
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  const keyPages = buildKeyPages(sitemapUrls, expectedSiteUrl);

  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/bin/chromium' });
  const page = await browser.newPage();

  const pageResults = [];
  for (const url of keyPages) {
    try {
      const result = await validatePage(page, url, expectedSiteUrl);
      pageResults.push(result);
      if (result.errors.length > 0) {
        failures.push(...result.errors.map((error) => `${url}: ${error}`));
      }
    } catch (error) {
      failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await browser.close();

  console.log('');
  console.log(`${formatResultIcon(failures.some((item) => item.includes('robots.txt')) ? 'fail' : 'pass')} robots.txt checked: ${robotsUrl}`);
  console.log(`${formatResultIcon(failures.some((item) => item.includes('sitemap.xml')) || failures.some((item) => item.includes('/sitemap.xml:')) ? 'fail' : 'pass')} sitemap checked: ${sitemapUrl} (${sitemapUrls.length} URLs)`);
  console.log(`${formatResultIcon(pageResults.every((item) => item.errors.length === 0) ? 'pass' : 'fail')} page metadata checked: ${pageResults.length} page(s)`);

  if (warnings.length > 0) {
    console.log('');
    console.log('Warnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (failures.length > 0) {
    console.log('');
    console.log('Failures:');
    for (const failure of failures) {
      console.log(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log('All SEO checks passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

