import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders home view', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/LandChain/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Connect Wallet/i })).toBeVisible();
    // Main hero register CTA (avoid matching the nav link)
    await expect(
      page.getByRole('main').getByRole('button', { name: /Register Land/i })
    ).toBeVisible();
  });
});
