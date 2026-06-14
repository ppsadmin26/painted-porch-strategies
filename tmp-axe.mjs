import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = process.argv.slice(2);
if (!ROUTES.length) {
  console.error('usage: node axe-check.mjs /path1 /path2 ...');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const path of ROUTES) {
  await page.goto('http://localhost:8080' + path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast'])
    .exclude('iframe[src*="youtube.com"]')
    .exclude('iframe[src*="youtube-nocookie.com"]')
    .exclude('iframe[src*="leadconnectorhq.com"]')
    .exclude('iframe[src*="gohighlevel.com"]')
    .analyze();
  const blocking = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  console.log(`\n=== ${path} (${blocking.length} blocking) ===`);
  for (const v of blocking) {
    console.log(`[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
    for (const n of v.nodes.slice(0, 5)) {
      console.log('  target:', n.target.join(' '));
      console.log('  html:', n.html.slice(0, 240));
    }
  }
}
await browser.close();
