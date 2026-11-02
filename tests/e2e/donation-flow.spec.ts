import { test, expect } from '@playwright/test'

test.describe('Campaign Donation & Live Conversion Flow', () => {
  test('public campaigns page links to campaign detail and displays donation capabilities', async ({
    page,
  }) => {
    await page.goto('/campaigns')
    await expect(
      page.getByRole('heading', { level: 1, name: /Active Welfare Campaigns/i })
    ).toBeVisible()

    // Check if any campaign cards exist
    const campaignLinks = page.locator('a[href^="/campaigns/"]')
    const count = await campaignLinks.count()

    if (count > 0) {
      // Click into the first campaign
      await campaignLinks.first().click()
      await expect(page).toHaveURL(/\/campaigns\/[0-9a-fA-F-]+/)

      // Verify campaign detail layout
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(
        page.getByRole('region', { name: /Campaign fundraising progress/i })
      ).toBeVisible()

      // Verify recent supporters section
      await expect(
        page.getByRole('region', { name: /Recent supporters/i })
      ).toBeVisible()

      // If active, test donation modal interaction
      const donateBtn = page.getByRole('button', { name: /donate now/i })
      if (await donateBtn.isVisible()) {
        await donateBtn.click()

        const modalDialog = page.getByRole('dialog', { name: /Support this Campaign/i })
        await expect(modalDialog).toBeVisible()

        // Check currency selector and preset buttons
        const currencySelect = page.getByLabel(/select currency/i)
        await expect(currencySelect).toBeVisible()

        // Change currency to USD
        await currencySelect.selectOption('USD')

        // Verify conversion estimate is displayed
        await expect(page.getByText(/Estimated Credit to Campaign/i)).toBeVisible()

        // Test closing modal with Escape
        await page.keyboard.press('Escape')
        await expect(modalDialog).not.toBeVisible()
      }
    }
  })
})
