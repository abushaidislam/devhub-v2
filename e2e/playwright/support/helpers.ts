import type {Page} from "@playwright/test";

export async function resetAppState(page: Page) {
  await page.goto("/dashboard", {waitUntil: "domcontentloaded"});
  await page.evaluate(() => localStorage.clear());
  await page.reload({waitUntil: "domcontentloaded"});
  await page.getByRole("heading", {name: "All tools"}).waitFor();
}

export async function openSidebarIfNeeded(page: Page) {
  const menu = page.getByRole("button", {name: "Open navigation"}).first();
  if (await menu.isVisible()) await menu.click();
}
