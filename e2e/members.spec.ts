import { expect, test } from '@playwright/test'

import { rowWithText, signInFresh } from './helpers'

test.describe('member management', () => {
  test('creates a member and shows it in the table', async ({ page }) => {
    await signInFresh(page, 'owner')
    await page.goto('/members')

    await expect(page.getByText('共 24 位成员')).toBeVisible()

    await page.getByTestId('member-create').click()
    await page.getByLabel('姓名', { exact: true }).fill('陆星河')
    await page.getByLabel('邮箱', { exact: true }).fill('lu.xinghe@aurora.dev')
    await page.getByLabel('职位', { exact: true }).fill('解决方案架构师')
    await page.getByTestId('member-submit').click()

    await expect(page.getByTestId('toast').first()).toContainText('成员已创建')
    await expect(rowWithText(page, '陆星河')).toHaveCount(1)
    await expect(page.getByText('共 25 位成员')).toBeVisible()
  })

  test('filters by search and keeps the filter in the URL across reload', async ({ page }) => {
    await signInFresh(page, 'owner')
    await page.goto('/members')

    await page.getByTestId('table-search').fill('陈思远')

    await expect(page.getByTestId('data-row')).toHaveCount(1)
    await expect(rowWithText(page, '陈思远')).toBeVisible()
    await expect(page).toHaveURL(/q=%E9%99%88%E6%80%9D%E8%BF%9C/)

    await page.reload()

    await expect(page.getByTestId('table-search')).toHaveValue('陈思远')
    await expect(page.getByTestId('data-row')).toHaveCount(1)
  })

  test('sorts by member name and reflects it in aria-sort and the URL', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/members')

    await page.getByRole('button', { name: '按成员排序' }).click()

    await expect(page.locator('th[aria-sort="ascending"]')).toHaveCount(1)
    await expect(page).toHaveURL(/sort=name:asc/)

    await page.getByRole('button', { name: '按成员排序' }).click()

    await expect(page.locator('th[aria-sort="descending"]')).toHaveCount(1)
    await expect(page).toHaveURL(/sort=name:desc/)
  })

  test('combines a role filter with the result count', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/members')

    await page.getByLabel('按角色筛选').click()
    await page.getByRole('option', { name: '拥有者' }).click()

    await expect(page.getByTestId('data-row')).toHaveCount(1)
    await expect(rowWithText(page, '陈思远')).toBeVisible()
    await expect(page.getByText('共 1 位成员')).toBeVisible()
  })

  test('removes a member through the row menu and confirmation', async ({ page }) => {
    await signInFresh(page, 'owner')
    await page.goto('/members')

    // Search first: the seeded roster spans several pages.
    await page.getByTestId('table-search').fill('白露')

    const target = rowWithText(page, '白露')
    await expect(target).toHaveCount(1)

    await page.getByRole('button', { name: '白露 的操作' }).click()
    await page.getByRole('menuitem', { name: '移除成员' }).click()
    await page.getByRole('button', { name: '确认移除' }).click()

    await expect(rowWithText(page, '白露')).toHaveCount(0)
    await expect(page.getByText('共 0 位成员')).toBeVisible()
    await expect(page.getByTestId('toast').first()).toContainText('成员已移除')
  })

  test('paginates and honours a page size from the URL', async ({ page }) => {
    await signInFresh(page, 'viewer')
    await page.goto('/members')

    const pagination = page.getByTestId('table-pagination')
    await expect(pagination).toContainText('共 24 条 · 第 1–10 条')

    await page.getByTestId('page-next').click()
    await expect(pagination).toContainText('第 11–20 条')

    // The page-size control writes the same URL parameter `useResourceList` reads,
    // so a deep link is an end-to-end check of it without driving the popper.
    await page.goto('/members?pageSize=20')

    await expect(pagination).toContainText('第 1–20 条')
    await expect(page.getByTestId('data-row')).toHaveCount(20)
  })
})
