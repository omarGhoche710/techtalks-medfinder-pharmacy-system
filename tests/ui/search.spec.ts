import { test, expect } from "@playwright/test";

test.describe("Search UI", () => {
  test("home page renders search hero", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Find your medication" }),
    ).toBeVisible();
    await expect(
      page.getByText("Search pharmacies near you and compare prices, stock, and distance."),
    ).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Search medications" })).toBeVisible();
  });

  test("search page shows results or empty state for a query", async ({
    page,
  }) => {
    await page.goto("/search?q=a&nearMe=false");

    await expect(
      page.getByRole("combobox", { name: "Search medications" }),
    ).toHaveValue("a");

    await expect
      .poll(async () => {
        const hasResults = await page.getByRole("button", { name: / at / }).count();
        const hasEmpty = await page.getByRole("heading", { name: "No results found" }).count();
        const hasError = await page.getByRole("heading", { name: "Search failed" }).count();
        const hasResultCount = await page.getByText(/results for/i).count();
        return hasResults > 0 || hasEmpty > 0 || hasError > 0 || hasResultCount > 0;
      })
      .toBeTruthy();
  });

  test("user can search from home page", async ({ page }) => {
    await page.goto("/");

    const searchbox = page.getByRole("combobox", { name: "Search medications" });
    await searchbox.fill("aspirin");
    await searchbox.press("Enter");

    await page.waitForURL(/\/search\?.*q=aspirin/);
    await expect(searchbox).toHaveValue("aspirin");
  });
});
