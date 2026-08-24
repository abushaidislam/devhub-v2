import {expect, test} from "@playwright/test";
import {resetAppState} from "../support/helpers";

test.beforeEach(async ({page}) => {
  await resetAppState(page);
});

test("opens a tool through command search", async ({page}) => {
  await page.getByRole("button", {name: "Search tools"}).first().click();
  await expect(page.getByRole("dialog", {name: "Search developer tools"}).first()).toBeVisible();
  const input = page.getByRole("textbox", {name: "Search tools"}).first();
  await input.fill("hash");
  await page.waitForTimeout(250);
  const listbox = page.getByRole("listbox", {name: "Search developer tools"}).first();
  await expect(listbox).toBeVisible();
  const firstResult = listbox.getByRole("option").first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();
  await page.waitForURL(/\/tools\/hash-generator$/, {waitUntil: "domcontentloaded"});
  await expect(page.getByRole("heading", {name: "Hash Generator"})).toBeVisible();
});
