import {expect, test} from "@playwright/test";
import {resetAppState} from "../support/helpers";

test.beforeEach(async ({page}) => {
  await resetAppState(page);
});

test("opens the mobile drawer and selects a tool", async ({page}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile navigation behavior");
  await page.getByRole("button", {name: "Open navigation"}).first().click();
  const drawer = page.locator("aside").first();
  await expect(drawer).toBeVisible();
  await page.waitForTimeout(300);
  const jsonLink = drawer.getByRole("link", {name: "JSON Formatter"}).first();
  if (!(await jsonLink.isVisible())) {
    await drawer.getByText("Formatters", {exact: true}).first().click();
    await expect(jsonLink).toBeVisible({timeout: 10000});
  }
  await jsonLink.evaluate((el) => el.scrollIntoView({block: "center"}));
  await page.waitForTimeout(200);
  await jsonLink.click({force: true, timeout: 30000});
  await page.waitForURL(/\/tools\/json-formatter$/, {waitUntil: "domcontentloaded"});
  await expect(page.getByRole("heading", {name: "JSON Formatter"})).toBeVisible();
});
