import { test } from "@playwright/test";

async function login(page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();
  await page.waitForURL(/\/account|\/admin|\/$/);
}

test("account UI screenshot", async ({ page }) => {
  await page.context().clearCookies();
  await login(page, "student1@embark.local", "Password123");
  await page.goto("/account");
  await page.waitForURL("/account");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/account-ui-final.png", fullPage: true });

  await page.goto("/account/profile");
  await page.waitForURL("/account/profile");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/profile-ui-final.png", fullPage: true });
});
