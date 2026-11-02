import { test, expect } from '@playwright/test'

test.describe('Public Campaign Browsing Journey', () => {
  test('home page navigates to /campaigns', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const viewCampaignsBtn = page.getByRole('link', { name: /View Campaigns/i })
    await expect(viewCampaignsBtn).toBeVisible()
    await viewCampaignsBtn.click()

    await expect(page).toHaveURL('/campaigns')
    await expect(page.getByRole('heading', { level: 1, name: /Active Welfare Campaigns/i })).toBeVisible()
  })

  test('public campaigns page renders header and nav', async ({ page }) => {
    await page.goto('/campaigns')
    await expect(page.getByRole('navigation', { name: /Public Navigation/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /Active Welfare Campaigns/i })).toBeVisible()
  })
})
