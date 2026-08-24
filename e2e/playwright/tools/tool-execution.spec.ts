import {expect, test} from "@playwright/test";
import {resetAppState} from "../support/helpers";

test.beforeEach(async ({page}) => {
  await resetAppState(page);
});

test("opens and runs a local tool", async ({page}) => {
  await expect(page.getByRole("heading", {name: "All tools"})).toBeVisible();
  const openLink = page.getByRole("link", {name: "Open JSON Formatter"}).first();
  await expect(openLink).toBeVisible();
  await openLink.click();
  await page.waitForURL(/\/tools\/json-formatter$/, {waitUntil: "domcontentloaded"});
  await expect(page.getByRole("heading", {name: "JSON Formatter"})).toBeVisible();
  const input = page.getByRole("textbox", {name: "JSON Formatter input"}).first();
  await input.fill('{"ok":true}');
  const runBtn = page.getByRole("button", {name: "Run"}).first();
  await expect(runBtn).toBeVisible();
  await runBtn.click();
  await expect(page.getByText(/"ok": true/).first()).toBeVisible();
});
