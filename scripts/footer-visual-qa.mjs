import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const checks = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

for (const check of checks) {
  const page = await browser.newPage({ viewport: { width: check.width, height: check.height } });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const footer = page.locator("footer");
  await footer.screenshot({ path: `artifacts/footer-${check.name}.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`${check.name}: footer=${await footer.isVisible()} overflow=${overflow} links=${await footer.getByRole("link").count()}`);
  await page.close();
}

await browser.close();
