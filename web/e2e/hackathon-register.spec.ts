import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();
  await page.waitForURL(/\/account|\/admin|\/$/);
}

test("student registers for hackathon and sees it on account", async ({ page }) => {
  test.setTimeout(120000);

  await page.context().clearCookies();
  await login(page, "student1@embark.local", "Password123");

  await page.goto("/hackathons");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/hackathons-list.png" });

  // Click the first hackathon card/link
  const hackathonLink = page.locator("a[href^='/hackathon/']").first();
  await expect(hackathonLink).toBeVisible({ timeout: 10000 });
  const slug = await hackathonLink.getAttribute("href");
  console.log("[HACKATHON] Navigating to", slug);
  await hackathonLink.click();
  await page.waitForURL(/\/hackathon\//);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/hackathon-detail.png" });

  const registerBtn = page.getByRole("link", { name: /register now/i }).first();
  if (await registerBtn.isVisible().catch(() => false)) {
    await registerBtn.click();
    await page.waitForURL(/\/hackathon\/.+\/register/);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/hackathon-register-form.png" });

    await page.locator('form input').first().fill("Team Alpha");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/registered successfully/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: "e2e/screenshots/hackathon-register-success.png" });
    console.log("[HACKATHON] Registered successfully");
  }

  await page.goto("/account");
  await page.waitForURL("/account");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/account-with-hackathon.png" });

  const myHackathons = page.locator("#hackathons");
  await expect(myHackathons).toBeVisible();
  await expect(myHackathons.getByText(/Team Alpha|dfgh/i).first()).toBeVisible({ timeout: 10000 });
  console.log("[HACKATHON] Registration visible on account page");
});
