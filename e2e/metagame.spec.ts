import { expect, test } from "@playwright/test";
import { noErrors, watchErrors } from "./helpers";

test("speed or value: the Characters discard is right, and the routes it leaves are shown", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/learn/playing-for-faan");
  const quiz = page.locator(".quiz").first();
  await quiz.getByRole("button", { name: "Throw 4 Characters" }).click();
  await expect(quiz.locator(".verdict--right")).toBeVisible();
  await expect(quiz.locator(".routes__row--best")).toContainText("Flush in Dots");
  await noErrors(errors);
});

test("which winning tiles count: East wind yes, 9 Bamboo no", async ({ page }) => {
  await page.goto("/learn/playing-for-faan");
  const quiz = page.locator(".quiz").nth(1);
  await quiz.getByRole("button", { name: "East Wind" }).click();
  await quiz.getByRole("button", { name: "Check" }).click();
  await expect(quiz.locator(".verdict--right")).toBeVisible();
  await expect(quiz.locator(".declareq__table")).toContainText("9 Bamboo");
});

test("counting a tile explains where every copy you can see is", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/learn/reading-the-table");
  const group = page.getByRole("group", { name: "How many are unseen" });
  await group.getByRole("button", { name: "1", exact: true }).click();
  await expect(page.locator(".quiz").first().locator(".verdict")).toContainText("There are four of every tile");
  await page.getByRole("button", { name: "Another position" }).click();
  await expect(group.getByRole("button", { name: "0", exact: true })).toBeEnabled();
  await noErrors(errors);
});

test("reading an opponent: North is on a Bamboo flush", async ({ page }) => {
  await page.goto("/learn/reading-the-table");
  await page.getByRole("group", { name: "What they are collecting" }).getByRole("button", { name: "A Bamboo flush" }).click();
  await expect(page.locator(".quiz").nth(1).locator(".verdict--right")).toBeVisible();
});

test("defense: the Bamboo tile is the one to keep, and the hidden hands are revealed", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/learn/defense");
  await page.getByRole("group", { name: "Candidate tiles" }).getByRole("button", { name: "6 Bamboo" }).click();
  const quiz = page.locator(".quiz").first();
  await expect(quiz.locator(".verdict--right")).toBeVisible();
  await expect(quiz.locator(".defenseq__list")).toContainText("North wins on it.");
  await noErrors(errors);
});

test("the faan drill marks an answer and shows the engine's count", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/scoring#drill");
  const drill = page.locator("#drill .quiz");
  await drill.getByRole("group", { name: "Faan" }).getByRole("button", { name: "1", exact: true }).click();
  await expect(drill.locator(".verdict")).toBeVisible();
  await expect(drill.locator(".breakdown__row--total")).toContainText("faan");
  await noErrors(errors);
});

test("the practice coach shows the routes to a win and previews a discard", async ({ page }) => {
  await page.goto("/practice");
  const routes = page.locator(".coach__routes");
  await expect(routes).toContainText("Routes to a win", { timeout: 15_000 });
  await expect(routes.locator(".routes__row")).not.toHaveCount(0);
  await page.getByRole("group", { name: "Your hand" }).getByRole("button").first().click();
  await expect(routes.locator(".routes__caption")).toContainText("If you throw the");
});
