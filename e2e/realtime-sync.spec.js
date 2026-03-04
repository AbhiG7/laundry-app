import { test, expect } from '@playwright/test'

test.describe('Real-time sync via WebSocket', () => {
  test('claiming on one tab updates other tab in real time', async ({ browser, request }) => {
    // Reset state
    for (let i = 1; i <= 3; i++) {
      await request.post(`http://localhost:8080/api/machines/${i}/release`)
    }

    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    await page1.goto('/')
    await page2.goto('/')

    // Wait for both pages to load and be available
    await expect(page1.locator('[data-testid="claim-btn-1"]')).toBeVisible({ timeout: 10000 })
    await expect(page2.locator('[data-testid="claim-btn-1"]')).toBeVisible({ timeout: 10000 })

    // Verify both start available
    await expect(page1.locator('[data-testid="status-badge-1"]')).toHaveText('AVAILABLE')
    await expect(page2.locator('[data-testid="status-badge-1"]')).toHaveText('AVAILABLE')

    // Claim on page1
    await page1.click('[data-testid="claim-btn-1"]')
    await page1.fill('[data-testid="input-name"]', 'Sync Test User')
    await page1.fill('[data-testid="input-apartment"]', '9D')
    await page1.click('[data-testid="btn-claim-submit"]')

    // Wait for page1 to show in-use
    await expect(page1.locator('[data-testid="status-badge-1"]')).toHaveText('IN USE')

    // page2 should see the update within 3 seconds (WebSocket)
    await expect(page2.locator('[data-testid="status-badge-1"]')).toHaveText('IN USE', { timeout: 5000 })
    await expect(page2.locator('[data-testid="user-name-1"]')).toHaveText('Sync Test User')

    await context1.close()
    await context2.close()
  })

  test('releasing on one tab updates other tab', async ({ browser, request }) => {
    // Reset state
    for (let i = 1; i <= 3; i++) {
      await request.post(`http://localhost:8080/api/machines/${i}/release`)
    }

    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    await page1.goto('/')
    await page2.goto('/')

    await expect(page1.locator('[data-testid="machine-row-2"]')).toBeVisible()
    await expect(page2.locator('[data-testid="machine-row-2"]')).toBeVisible()

    // Claim machine 2 on page1
    await page1.click('[data-testid="claim-btn-2"]')
    await page1.fill('[data-testid="input-name"]', 'Release Sync')
    await page1.fill('[data-testid="input-apartment"]', '2B')
    await page1.click('[data-testid="btn-claim-submit"]')
    await expect(page1.locator('[data-testid="status-badge-2"]')).toHaveText('IN USE')
    await expect(page2.locator('[data-testid="status-badge-2"]')).toHaveText('IN USE', { timeout: 5000 })

    // Release on page1
    await page1.click('[data-testid="release-btn-2"]')

    // Both pages should show available
    await expect(page1.locator('[data-testid="status-badge-2"]')).toHaveText('AVAILABLE')
    await expect(page2.locator('[data-testid="status-badge-2"]')).toHaveText('AVAILABLE', { timeout: 5000 })

    await context1.close()
    await context2.close()
  })
})
