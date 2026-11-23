import { expect, test } from '@playwright/test'

import { signInFresh } from './helpers'

test.describe('operation log', () => {
  test('filters by outcome and keeps the filter in the URL', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/audit')

    await page.getByLabel('按结果筛选').click()
    await page.getByRole('option', { name: '失败' }).click()

    await expect(page).toHaveURL(/outcome=failure/)

    const rows = page.getByTestId('data-row')
    await expect(rows.first()).toContainText('失败')

    const count = await rows.count()
    for (let index = 0; index < count; index++) {
      await expect(rows.nth(index)).toContainText('失败')
    }

    await page.reload()
    await expect(page.getByTestId('data-row').first()).toContainText('失败')
  })

  test('opens a record detail and deep-links it', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/audit')

    await page.getByTestId('data-row').first().click()

    const detail = page.getByTestId('audit-detail')
    await expect(detail).toBeVisible()
    await expect(detail).toContainText('操作详情')
    await expect(detail).toContainText('来源 IP')

    const detailUrl = page.url()
    expect(detailUrl).toContain('detail=')

    await page.keyboard.press('Escape')
    await page.goto(detailUrl)

    await expect(page.getByTestId('audit-detail')).toBeVisible()
  })

  test('filters by date range', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/audit')

    await page.getByLabel('起始日期').fill('2020-01-01')
    await page.getByLabel('结束日期').fill('2020-01-02')

    await expect(page.getByText('共 0 条记录')).toBeVisible()
    await expect(page.getByText('没有匹配的操作记录')).toBeVisible()
  })

  test('exports the filtered log as CSV', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/audit')

    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('audit-export').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/^audit-\d{4}-\d{2}-\d{2}\.csv$/)
  })
})
