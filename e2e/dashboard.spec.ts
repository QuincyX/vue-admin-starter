import { expect, test } from '@playwright/test'

import { signInFresh } from './helpers'

test.describe('dashboard', () => {
  test('renders the KPI cards and all three charts', async ({ page }) => {
    await signInFresh(page, 'owner')

    await expect(page.getByRole('heading', { name: '数据总览' })).toBeVisible()
    await expect(page.getByText('近 7 天访问量')).toBeVisible()
    await expect(page.getByText('24 小时失败操作')).toBeVisible()

    await expect(page.getByTestId('trend-chart')).toBeVisible()
    await expect(page.getByTestId('action-chart')).toBeVisible()
    await expect(page.getByTestId('role-chart')).toBeVisible()
  })

  test('switches the trend range through the URL', async ({ page }) => {
    await signInFresh(page, 'viewer')

    await page.getByRole('tab', { name: '30 天' }).click()

    await expect(page).toHaveURL(/range=30/)

    await page.reload()

    await expect(page.getByRole('tab', { name: '30 天' })).toHaveAttribute('data-state', 'active')
    await expect(page.getByTestId('trend-chart')).toBeVisible()
  })

  test('links a recent operation to its audit detail', async ({ page }) => {
    await signInFresh(page, 'admin')

    await page.getByTestId('data-row').first().click()

    await expect(page).toHaveURL(/\/audit\?detail=/)
    await expect(page.getByTestId('audit-detail')).toBeVisible()
  })

  test('shows the current role and its permissions', async ({ page }) => {
    await signInFresh(page, 'viewer')

    await expect(page.getByTestId('current-role')).toHaveText('观察员')
    await expect(page.getByText('查看成员')).toBeVisible()
    await expect(page.getByText('管理成员')).toBeVisible()
  })
})
