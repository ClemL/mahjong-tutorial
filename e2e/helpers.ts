import { type Page, expect } from "@playwright/test";

/** Fail on anything the page throws or logs as an error. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

/** Discard a tile from the game table: pick it, then throw it. */
export async function discard(page: Page, name: string) {
  await page.getByRole("button", { name: new RegExp(`^Pick ${name} to discard$`) }).first().click();
  await page.getByRole("button", { name: /tap again to throw it/ }).click();
}

export async function noErrors(errors: string[]) {
  expect(errors, errors.join("\n")).toEqual([]);
}
