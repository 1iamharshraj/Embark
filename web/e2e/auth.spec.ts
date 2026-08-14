import { test, expect } from "@playwright/test";

test.describe("auth pages", () => {
  test("login page loads with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Login|Embark/i);
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|login|log in/i })).toBeVisible();
  });

  test("register page loads with required fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /register|sign up|create account/i })).toBeVisible();
  });
});
