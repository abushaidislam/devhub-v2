import { chromium } from "playwright";
import { mkdirSync } from "fs";

const dir = new URL("./.tmp-qa/", import.meta.url);
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();

async function shot(width, height, name, extra) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle" });
  if (extra) await extra(page);
  await page.screenshot({ path: new URL(name, dir), fullPage: false });
  await page.close();
}

await shot(1440, 900, "dash-1440.png");
await shot(1440, 900, "dash-1440-hover.png", async (page) => {
  await page.getByRole("link", { name: "Open JSON Formatter" }).hover();
});
await shot(1024, 768, "dash-1024.png");
await shot(390, 844, "dash-390.png");

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle" });
const iconColor = await page.locator("section[aria-labelledby='smart-detect-title'] header > div").first().evaluate((el) => getComputedStyle(el).color);
const iconBg = await page.locator("section[aria-labelledby='smart-detect-title'] header > div").first().evaluate((el) => getComputedStyle(el).backgroundColor);
const titlePos = await page.locator("header h1").evaluate((el) => {
  const r = el.getBoundingClientRect();
  const lead = el.previousElementSibling?.getBoundingClientRect();
  const actions = el.nextElementSibling?.getBoundingClientRect();
  return { title: { x: r.x, w: r.width }, leadRight: lead?.right, actionsLeft: actions?.left, overlapLead: lead ? r.x < lead.right - 4 : null, overlapActions: actions ? r.x + r.width > actions.left + 4 : null };
});
console.log({ iconColor, iconBg, titlePos });
await page.close();
await browser.close();
