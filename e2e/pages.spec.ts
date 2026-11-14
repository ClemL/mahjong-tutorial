import { expect, test } from "@playwright/test";
import { noErrors, watchErrors } from "./helpers";

const PAGES = [
  ["/", /Learn mahjong, one tile at a time/],
  ["/learn", /Seven short lessons/],
  ["/learn/tiles", /The tiles/],
  ["/learn/sets", /Sets and the pair/],
  ["/learn/winning-hand", /A winning hand/],
  ["/learn/turns", /Seats, the wall and a turn/],
  ["/learn/claims", /Claiming discards/],
  ["/learn/ready", /Being ready/],
  ["/learn/strategy", /First strategy/],
  ["/example", /Play your first hand/],
  ["/practice", /Play against the computer/],
  ["/scoring", /How a hand is scored/],
  ["/table-players", /Here is what is different/],
  ["/history", /From Qing parlors/],
] as const;

for (const [path, heading] of PAGES) {
  test(`${path} renders without errors and fits the screen`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    // Nothing may push the page sideways on a phone held upright.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await noErrors(errors);
  });
}

test("the lessons lead from one to the next", async ({ page }) => {
  await page.goto("/learn/tiles");
  await page.getByRole("link", { name: /Next.*Sets and the pair/ }).click();
  await expect(page).toHaveURL(/\/learn\/sets$/);
});

test("the Look menu switches the tile faces, as the game's setting does", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Look/ }).click();
  await page.getByRole("group", { name: "Tile faces" }).getByRole("button", { name: "Western" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tiles", "western");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-tiles", "western");
});

test("the explainer film opens and closes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Watch the film/ }).click();
  const dialog = page.getByRole("dialog", { name: "How mahjong works" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).toBeHidden();
});
