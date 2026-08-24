import {expect, test} from "@playwright/test";
import {openSidebarIfNeeded, resetAppState} from "../support/helpers";

test.beforeEach(async ({page}) => {
  await resetAppState(page);
});

test("persists a favorite in the dedicated workspace", async ({page}) => {
  await expect(page.getByRole("heading", {name: "All tools"})).toBeVisible();
  const favButton = page.getByRole("button", {name: "Add JSON Formatter to favorites"}).first();
  await expect(favButton).toBeVisible();
  await favButton.click();
  await expect(page.getByRole("button", {name: "Remove JSON Formatter from favorites"}).first()).toBeVisible();
  await openSidebarIfNeeded(page);
  const favLink = page.getByRole("link", {name: /Favorites/}).first();
  await expect(favLink).toBeVisible();
  await favLink.click();
  await page.waitForURL(/\/favorites$/, {waitUntil: "domcontentloaded"});
  await expect(page.getByRole("heading", {name: "Favorite tools", level: 1})).toBeVisible();
  await expect(page.getByRole("link", {name: "Open JSON Formatter"}).first()).toBeVisible();
  await page.reload({waitUntil: "domcontentloaded"});
  await expect(page.getByRole("link", {name: "Open JSON Formatter"}).first()).toBeVisible();
});
