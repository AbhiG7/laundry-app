import { test, expect } from '@playwright/test'

test.describe('QR Code deep link', () => {
  test.beforeEach(async ({ request }) => {
    for (let i = 1; i <= 3; i++) {
      await request.post(`http://localhost:8080/api/machines/${i}/release`)
    }
  })

  test('visiting /?claim=1 auto-opens claim dialog for machine 1', async ({ page }) => {
    await page.goto('/?claim=1')
    // Wait for machines to fully load (WebSocket init) then dialog should appear
    await expect(page.locator('[data-testid="claim-btn-2"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-testid="claim-dialog"]')).toContainText('Machine 1')
  })

  test('visiting /?claim=2 auto-opens claim dialog for machine 2', async ({ page }) => {
    await page.goto('/?claim=2')
    await expect(page.locator('[data-testid="claim-btn-1"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-testid="claim-dialog"]')).toContainText('Machine 2')
  })

  test('visiting /?claim=3 auto-opens claim dialog for machine 3', async ({ page }) => {
    await page.goto('/?claim=3')
    await expect(page.locator('[data-testid="claim-btn-1"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-testid="claim-dialog"]')).toContainText('Machine 3')
  })

  test('visiting without claim param does not open dialog', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="machine-row-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="claim-dialog"]')).not.toBeVisible()
  })

  test('invalid claim param is ignored', async ({ page }) => {
    await page.goto('/?claim=99')
    await expect(page.locator('[data-testid="machine-row-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="claim-dialog"]')).not.toBeVisible()
  })

  test('QR code panel is visible and toggles', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="qr-panel"]')).toBeVisible()
    // QR codes are hidden initially
    await expect(page.locator('[data-testid="qr-code-1"]')).not.toBeVisible()

    // Click to expand
    await page.click('[data-testid="qr-panel"] button')
    await expect(page.locator('[data-testid="qr-code-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="qr-code-2"]')).toBeVisible()
    await expect(page.locator('[data-testid="qr-code-3"]')).toBeVisible()
  })

  test('can claim via QR deep link', async ({ page }) => {
    await page.goto('/?claim=1')
    await expect(page.locator('[data-testid="claim-dialog"]')).toBeVisible()

    await page.fill('[data-testid="input-name"]', 'QR User')
    await page.fill('[data-testid="input-apartment"]', '6F')
    await page.click('[data-testid="btn-claim-submit"]')

    await expect(page.locator('[data-testid="claim-dialog"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="status-badge-1"]')).toHaveText('IN USE')
    await expect(page.locator('[data-testid="user-name-1"]')).toHaveText('QR User')
  })
})
