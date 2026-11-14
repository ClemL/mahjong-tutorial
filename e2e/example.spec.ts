import { expect, test } from "@playwright/test";
import { discard, noErrors, watchErrors } from "./helpers";

test("the example hand plays through with the coach to a 3-faan self-drawn win", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/example");
  await page.getByRole("button", { name: "Start the hand" }).click();

  // A wrong move is refused with a reason, and nothing is thrown.
  await discard(page, "Red Dragon");
  await expect(page.locator(".verdict--wrong")).toContainText("North Wind");

  await discard(page, "North Wind");
  await page.getByRole("button", { name: /^Chow/ }).click({ timeout: 20_000 });
  await discard(page, "1 Characters");
  await page.getByRole("button", { name: /^Pung/ }).click({ timeout: 20_000 });
  await discard(page, "7 Dots");
  await page.getByRole("button", { name: /^Pass$/ }).click({ timeout: 20_000 });
  await page.getByRole("button", { name: "Draw a tile" }).click({ timeout: 20_000 });
  await page.getByRole("button", { name: /^Win/ }).click({ timeout: 20_000 });

  const result = page.locator(".result");
  await expect(result).toContainText("You win");
  await expect(result).toContainText("3 faan = 8 pts");
  await expect(result.locator(".pay").first()).toContainText("+24");
  await noErrors(errors);
});

test("Show me points at the tile the coach means", async ({ page }) => {
  await page.goto("/example");
  await page.getByRole("button", { name: "Start the hand" }).click();
  await page.getByRole("button", { name: "Show me" }).click();
  await expect(page.locator(".tile--hint")).toHaveAttribute("aria-label", /North Wind/);
});
