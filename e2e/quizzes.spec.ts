import { expect, test } from "@playwright/test";

test("the set quiz marks an answer right or wrong, in words", async ({ page }) => {
  await page.goto("/learn/sets");
  await page.getByRole("group", { name: "Your answer" }).getByRole("button", { name: /Chow/ }).click();
  await expect(page.locator(".verdict--right")).toContainText("Right");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("group", { name: "Your answer" }).getByRole("button", { name: /Chow/ }).click();
  await expect(page.locator(".verdict--wrong")).toContainText("Not quite");
});

test("the warm-up hand can be arranged into four sets and a pair", async ({ page }) => {
  await page.goto("/learn/winning-hand");
  const groups = [
    ["1 Characters", "2 Characters", "3 Characters"],
    ["4 Dots", "5 Dots", "6 Dots"],
    ["7 Bamboo", "8 Bamboo", "9 Bamboo"],
    ["Red Dragon", "Red Dragon", "Red Dragon"],
    ["East Wind", "East Wind"],
  ];
  for (const group of groups) {
    for (const name of group) {
      await page.getByRole("button", { name: new RegExp(`^${name}$`) }).first().click();
    }
    await page.getByRole("button", { name: "Make set" }).click();
  }
  await expect(page.getByText("Mahjong!")).toBeVisible();
});

test("the wait quiz checks the tiles you pick against the hand", async ({ page }) => {
  await page.goto("/learn/ready");
  const palette = page.getByRole("group", { name: "Candidate tiles" });
  await palette.getByRole("button", { name: /^3 Bamboo/ }).click();
  await palette.getByRole("button", { name: /^6 Bamboo/ }).click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".verdict--right")).toBeVisible();
});

test("the claim quiz knows a chow is only from the left", async ({ page }) => {
  await page.goto("/learn/claims");
  const calls = page.getByRole("group", { name: "Calls" });
  await calls.getByRole("button", { name: /Chow/ }).click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".verdict--right")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await calls.getByRole("button", { name: /Chow/ }).click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".verdict--wrong")).toContainText("Nothing");
});

test("the scoring lab rescores the hand when the winning tile is self-drawn", async ({ page }) => {
  await page.goto("/scoring#lab");
  const lab = page.locator(".lab");
  await expect(lab.locator(".breakdown__row--total")).toContainText("2 faan");
  await lab.getByRole("group", { name: "Winning tile" }).getByRole("button", { name: /Self-drawn/ }).click();
  await expect(lab.locator(".breakdown")).toContainText("Self Draw");
  await expect(lab.locator(".breakdown__row--total")).toContainText("3 faan");
});
