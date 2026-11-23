import { expect, test } from '@playwright/test'

import { expectNoHorizontalOverflow, signInFresh } from './helpers'

test.describe('desktop layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('has no horizontal overflow on the main pages', async ({ page }) => {
    await signInFresh(page, 'owner')

    for (const path of ['/', '/members', '/audit', '/settings', '/access']) {
      await page.goto(path)
      await expectNoHorizontalOverflow(page)
    }
  })

  test('collapses the sidebar and remembers the preference', async ({ page }) => {
    await signInFresh(page, 'owner')

    const sidebar = page.getByTestId('app-sidebar')
    await expect(sidebar).toHaveCSS('width', '256px')

    await page.getByTestId('sidebar-toggle').click()
    await expect(sidebar).toHaveCSS('width', '72px')
    await expect(sidebar.getByText('数据总览', { exact: true })).toHaveCount(0)

    await page.reload()

    await expect(sidebar).toHaveCSS('width', '72px')
  })

  test('stays usable at a narrow desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await signInFresh(page, 'admin')

    await page.goto('/members')
    await expectNoHorizontalOverflow(page)
    await expect(page.getByTestId('data-table')).toBeVisible()
  })
})
