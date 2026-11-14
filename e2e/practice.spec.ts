import { expect, test } from "@playwright/test";
import { noErrors, watchErrors } from "./helpers";

test("a practice hand is dealt and the computer plays on after your discard", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/practice");
  // You deal, so the first move is yours.
  const tiles = page.getByRole("group", { name: "Your hand" }).getByRole("button");
  await expect(tiles).toHaveCount(14, { timeout: 15_000 });
  await page.getByRole("button", { name: "Suggest a discard" }).click();
  await expect(page.locator(".tile--hint")).toHaveCount(1);
  await page.locator(".tile--hint").click();
  await page.locator(".tile--picked").click();
  // South draws and throws within a couple of beats.
  await expect(page.locator(".playlog__item--new")).toContainText(/South|You win|claims/, { timeout: 15_000 });
  await noErrors(errors);
});
