import { test, expect, Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();
  await page.waitForURL(/\/account|\/expert\/dashboard|\/admin|\/$/);
}

test.describe("Expert application flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("expert applies and admin verifies", async ({ page }) => {
    test.setTimeout(120000);

    const expertEmail = "expert1@embark.local";
    const adminEmail = "admin@embark.local";
    const password = "Password123";

    // 1. Expert logs in and applies
    await login(page, expertEmail, password);
    await page.screenshot({ path: "e2e/screenshots/expert-after-login.png" });
    console.log("[EXPERT FLOW] Logged in as", expertEmail);

    await page.goto("/become-a-speaker");
    await page.waitForURL("/become-a-speaker");
    await expect(page.locator("h1").filter({ hasText: /Share what you practice/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "e2e/screenshots/expert-application-form.png" });

    await page.locator('input[name="name"]').fill("Expert One");
    await page.locator('input[name="email"]').fill(expertEmail);
    await page.locator('input[name="role"]').fill("Product Manager");
    await page.locator('input[name="company"]').fill("TestCorp");
    await page.locator('input[name="linkedIn"]').fill("https://linkedin.com/in/expertone");
    await page.locator('select[name="experience"]').selectOption("6–10 years");
    await page.locator('select[name="vertical"]').selectOption("Product Management");
    await page.locator('input[name="city"]').fill("Chennai");
    await page.locator('select[name="format"]').selectOption("Both");
    await page.locator('textarea[name="topics"]').fill("Product strategy, growth, and analytics for MBA students.");

    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/application received/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: "e2e/screenshots/expert-application-submitted.png" });
    console.log("[EXPERT FLOW] Speaker application submitted");

    // 2. Admin logs in and verifies
    await page.context().clearCookies();
    await login(page, adminEmail, password);
    await page.screenshot({ path: "e2e/screenshots/admin-after-login.png" });
    console.log("[EXPERT FLOW] Logged in as", adminEmail);

    await page.goto("/admin/speaker-applications");
    await page.waitForURL("/admin/speaker-applications");
    await page.screenshot({ path: "e2e/screenshots/admin-speaker-applications.png" });

    const row = page.locator("table tbody tr").filter({ hasText: expertEmail }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText(/pending/i).first()).toBeVisible();
    console.log("[EXPERT FLOW] Application visible in admin panel");

    await row.getByRole("button", { name: /verify|approve/i }).first().click();
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/admin-after-verify.png" });

    await expect(row.getByText(/verified/i).first()).toBeVisible({ timeout: 15000 });
    console.log("[EXPERT FLOW] Application verified by admin");
  });
});
