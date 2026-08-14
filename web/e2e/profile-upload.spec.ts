import { test, expect } from "@playwright/test";

async function login(page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();
  await page.waitForURL(/\/account|\/admin|\/$/);
}

test("profile photo upload persists", async ({ page }) => {
  test.setTimeout(120000);

  await page.context().clearCookies();
  await login(page, "student1@embark.local", "Password123");
  await page.goto("/account");
  await page.waitForURL("/account");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/student-profile-before.png" });

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("e2e/fixtures/test-avatar.png");

  await page.waitForTimeout(3000);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/student-profile-after-upload.png" });

  const toast = page.getByText(/uploaded|updated/i);
  await expect(toast.first()).toBeVisible({ timeout: 15000 });

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/student-profile-after-reload.png" });

  const img = page.locator('img[alt="Profile"]').first();
  await expect(img).toBeVisible({ timeout: 10000 });
  const src = await img.getAttribute("src");
  console.log("[PROFILE UPLOAD] Image src after reload:", src);
  expect(src).toMatch(/\.(png|jpe?g|webp|jpg)/i);
});
