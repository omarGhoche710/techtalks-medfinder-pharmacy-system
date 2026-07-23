import { expect, test } from "@playwright/test";

test.describe("Search flow", () => {
  test("homepage search with autocomplete navigates to results", async ({
    page,
  }) => {
    await page.goto("/");

    const searchInput = page.getByRole("combobox", {
      name: "Search medications",
    });
    await expect(searchInput).toBeVisible();

    const nearMeToggle = page.getByRole("switch", { name: "Near Me toggle" });
    await expect(nearMeToggle).toHaveAttribute("aria-checked", "true");

    await searchInput.fill("para");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByText("Paracetamol")).toBeVisible();

    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=para/);
    await expect(
      page.getByText(/result.*for.*para/i).or(page.getByText("Paracetamol"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("Near Me toggle can be turned off", async ({ page }) => {
    await page.goto("/");

    const nearMeToggle = page.getByRole("switch", { name: "Near Me toggle" });
    await nearMeToggle.click();
    await expect(nearMeToggle).toHaveAttribute("aria-checked", "false");
  });

  test("empty search shows no results state", async ({ page }) => {
    await page.goto("/search?q=zzzznonexistent");

    await expect(page.getByText("No results found")).toBeVisible({
      timeout: 10000,
    });
  });

  test("results page has filters and sort controls", async ({ page }) => {
    await page.goto("/search?q=paracetamol&nearMe=true");

    await expect(page.getByLabel("Filter by price")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByLabel("Sort results")).toBeVisible();
    await expect(page.getByLabel("Search results")).toBeVisible();
  });

  test("keyboard navigation works on search input", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByRole("combobox", {
      name: "Search medications",
    });
    await searchInput.fill("ibu");
    await searchInput.press("ArrowDown");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=/);
  });
});
