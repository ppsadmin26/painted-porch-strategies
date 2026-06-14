import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = process.argv.slice(2);
const exec = process.env.CHROMIUM_BIN;
const browser = await chromium.launch({ executablePath: exec, args: ["--no-sandbox"] });
const ctx = await browser.newContext();
const page = await ctx.newPage();

for (const path of routes) {
  await page.goto("http://localhost:8080" + path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();
  const blocking = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  console.log(`\n=== ${path} === ${blocking.length} blocking`);
  for (const v of blocking) {
    console.log(`- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
    for (const n of v.nodes.slice(0, 3)) {
      console.log(`    target: ${n.target.join(" | ")}`);
      console.log(`    html:   ${(n.html || "").slice(0,250)}`);
    }
  }
}
await browser.close();
