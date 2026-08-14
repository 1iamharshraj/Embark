import { test, expect } from "@playwright/test";

test.describe("hackathon public pages", () => {
  test("hackathons listing page loads", async ({ page }) => {
    const response = await page.goto("/hackathons");
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/hackathon/i);
  });

  test("legacy /competitions redirect to /hackathons", async ({ page }) => {
    await page.goto("/competitions");
    await expect(page).toHaveURL(/\/hackathons/);
  });
});
