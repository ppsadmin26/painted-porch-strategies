import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const exec = process.env.CHROMIUM_BIN;
const browser = await chromium.launch({ executablePath: exec, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(()=>{});
const r = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).disableRules(["color-contrast"]).analyze();
const v = r.violations.filter(x=>x.impact==="critical"||x.impact==="serious");
for (const x of v) {
  console.log(`[${x.impact}] ${x.id} (${x.nodes.length})`);
  for (const n of x.nodes) console.log("  ", n.target.join(" | "), "::", (n.html||"").slice(0,180));
}
await browser.close();
