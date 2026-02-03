import { test, expect } from '@playwright/test';

test('landing page loads and navigates to create', async ({ page }) => {
  await page.goto('/');

  // Verify title/hero
  await expect(page).toHaveTitle(/SkySign/);
  
  // Custom components split text, so we check for the link instead to verify page load
  const startBtn = page.getByRole('link', { name: 'Start Signing Free' });
  await expect(startBtn).toBeVisible();

  // Test navigation to Create/App
  await startBtn.click();

  // Should navigate to /create (or /sign-in if protected, but /create is protected so it might redirect)
  // Checking URL to contain /create or sign-in
  await expect(page).toHaveURL(/.*(create|sign-in)/);
});
