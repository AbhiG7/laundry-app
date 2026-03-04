import { test, expect } from '@playwright/test'

test.describe('Claim machine flow', () => {
  test.beforeEach(async ({ page, request }) => {
    // Reset all machines to available before each test
    for (let i = 1; i <= 3; i++) {
      await request.post(`http://localhost:8080/api/machines/${i}/release`)
    }
    await page.goto('/')
    // Wait for machines to load and be available
    await expect(page.locator('[data-testid="claim-btn-1"]')).toBeVisible({ timeout: 10000 })
  })

  test('shows 3 machines on load', async ({ page }) => {
    await expect(page.locator('[data-testid="machine-row-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="machine-row-2"]')).toBeVisible()
    await expect(page.locator('[data-testid="machine-row-3"]')).toBeVisible()
  })

  test('all machines start as available', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      await expect(page.locator(`[data-testid="status-badge-${i}"]`)).toHaveText('AVAILABLE')
      await expect(page.locator(`[data-testid="claim-btn-${i}"]`)).toBeVisible()
    }
  })

  test('clicking Claim opens dialog for correct machine', async ({ page }) => {
    await page.click('[data-testid="claim-btn-2"]')
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="claim-dialog"]')).toContainText('Machine 2')
  })

  test('full claim flow transitions machine to in-use', async ({ page }) => {
    await page.click('[data-testid="claim-btn-1"]')
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible()

    await page.fill('[data-testid="input-name"]', 'Test User')
    await page.fill('[data-testid="input-apartment"]', '7C')
    // Duration defaults to 60 min

    await page.click('[data-testid="btn-claim-submit"]')

    // Dialog should close
    await expect(page.locator('[data-testid="claim-dialog"]')).not.toBeVisible()

    // Machine 1 should show as in use
    await expect(page.locator('[data-testid="status-badge-1"]')).toHaveText('IN USE')

    // User info should appear
    await expect(page.locator('[data-testid="user-name-1"]')).toHaveText('Test User')
    await expect(page.locator('[data-testid="machine-row-1"]')).toContainText('7C')

    // Countdown should be visible
    await expect(page.locator('[data-testid="countdown-1"]')).toBeVisible()
  })

  test('claim with phone number shows phone', async ({ page }) => {
    await page.click('[data-testid="claim-btn-1"]')

    await page.fill('[data-testid="input-name"]', 'Phone User')
    await page.fill('[data-testid="input-apartment"]', '3A')
    await page.fill('[data-testid="input-phone"]', '555-8888')
    await page.click('[data-testid="btn-claim-submit"]')

    await expect(page.locator('[data-testid="machine-row-1"]')).toContainText('555-8888')
  })

  test('closing dialog with X restores available state', async ({ page }) => {
    await page.click('[data-testid="claim-btn-1"]')
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible()

    await page.click('button[aria-label="Close dialog"]')

    await expect(page.locator('[data-testid="claim-dialog"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="claim-btn-1"]')).toBeVisible()
  })

  test('form validation prevents empty name submit', async ({ page }) => {
    await page.click('[data-testid="claim-btn-1"]')
    await page.fill('[data-testid="input-apartment"]', '3B')
    await page.click('[data-testid="btn-claim-submit"]')
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="claim-dialog"]')).toContainText('Name is required')
  })

  test('can release a claimed machine', async ({ page }) => {
    // Claim machine 1
    await page.click('[data-testid="claim-btn-1"]')
    await page.fill('[data-testid="input-name"]', 'Release Test')
    await page.fill('[data-testid="input-apartment"]', '1A')
    await page.click('[data-testid="btn-claim-submit"]')
    await expect(page.locator('[data-testid="status-badge-1"]')).toHaveText('IN USE')

    // Release it
    await page.click('[data-testid="release-btn-1"]')

    // Should return to available
    await expect(page.locator('[data-testid="status-badge-1"]')).toHaveText('AVAILABLE')
    await expect(page.locator('[data-testid="claim-btn-1"]')).toBeVisible()
  })
})
