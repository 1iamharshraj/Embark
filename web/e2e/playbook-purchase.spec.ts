import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();
  await page.waitForURL(/\/account|\/admin|\/$/);
}

test("student buys a playbook and sees it in account", async ({ page }) => {
  test.setTimeout(120000);

  await page.context().clearCookies();
  await login(page, "student1@embark.local", "Password123");

  await page.goto("/playbook/shop-marketing");
  await page.waitForURL("/playbook/shop-marketing");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/playbook-detail.png" });

  const buyBtn = page.getByRole("button", { name: /buy for ₹|pay/i }).first();
  if (await buyBtn.isVisible().catch(() => false)) {
    await buyBtn.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log("[PLAYBOOK] Clicked buy button");
  } else {
    console.log("[PLAYBOOK] Already unlocked or no buy button");
  }
  await page.screenshot({ path: "e2e/screenshots/playbook-after-purchase.png" });

  // After mock payment the page should render the full playbook content.
  await expect(page.getByText(/stream playbook|this playbook is for you if/i).first()).toBeVisible({ timeout: 15000 });
  console.log("[PLAYBOOK] Purchase mocked as paid");

  await page.goto("/account");
  await page.waitForURL("/account");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/account-with-playbook.png" });

  const ordersSection = page.locator("#orders");
  await expect(ordersSection.getByText(/Marketing/i).first()).toBeVisible({ timeout: 10000 });
  console.log("[PLAYBOOK] Order visible on account page");
});
