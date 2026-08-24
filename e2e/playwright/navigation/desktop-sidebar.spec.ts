import {expect, test} from "@playwright/test";
import {resetAppState} from "../support/helpers";

test.beforeEach(async ({page}) => {
  await resetAppState(page);
});

test("keeps content centered after desktop sidebar collapse", async ({page}, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop sidebar behavior");
  await expect(page.getByRole("heading", {name: "All tools"})).toBeVisible();
  const hideBtn = page.getByRole("button", {name: "Hide navigation"}).first();
  await expect(hideBtn).toBeVisible();
  await hideBtn.click();
  await expect(page.getByRole("button", {name: "Show navigation"}).first()).toBeVisible();
  await page.waitForTimeout(800);
  const content = page.locator("main").last();
  await expect(content).toBeVisible();
  const box = await content.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(Math.abs((box!.x + box!.width / 2) - viewport!.width / 2)).toBeLessThan(20);
});
