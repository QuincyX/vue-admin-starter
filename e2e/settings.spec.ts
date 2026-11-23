import { expect, test } from '@playwright/test'

import { DEMO, signInFresh } from './helpers'

test.describe('settings', () => {
  test('switches the theme and keeps it after a reload', async ({ page }) => {
    await signInFresh(page, 'viewer')
    await page.goto('/settings')

    await page.getByTestId('theme-dark').click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()

    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('theme-dark')).toHaveAttribute('aria-pressed', 'true')
  })

  test('updates the display name through the mock API', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/settings')

    const input = page.getByLabel('显示名称')
    await input.fill('林浅（测试）')
    await page.getByTestId('profile-save').click()

    await expect(page.getByTestId('toast').first()).toContainText('资料已保存')
    await expect(page.getByTestId('user-menu-trigger')).toContainText('林浅（测试）')

    // Restore the seeded name so repeated runs do not drift.
    await input.fill('林浅')
    await page.getByTestId('profile-save').click()
    await expect(page.getByTestId('toast').first()).toContainText('资料已保存')
  })

  test('checks the backend connection', async ({ page }) => {
    await signInFresh(page, 'viewer')
    await page.goto('/settings')

    await page.getByTestId('health-check').click()

    await expect(page.getByText(/连接正常（\d+ ms）/)).toBeVisible()
  })

  test('offers the demo reset to the owner only', async ({ page }) => {
    await signInFresh(page, 'viewer')
    await page.goto('/settings')

    await expect(page.getByTestId('reset-demo-data')).toHaveCount(0)
    await expect(page.getByText('需要系统管理权限')).toBeVisible()

    await signInFresh(page, 'owner')
    await page.goto('/settings')

    await page.getByTestId('reset-demo-data').click()
    await page.getByRole('button', { name: '确认恢复' }).click()

    await expect(page.getByTestId('toast').first()).toContainText('示例成员数据已恢复')
  })

  test('rejects a password mismatch without calling the API', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/settings')

    await page.getByLabel('当前密码').fill(DEMO.admin.password)
    await page.getByLabel('新密码', { exact: true }).fill('NewPassword123!')
    await page.getByLabel('确认新密码').fill('DifferentPassword123!')
    await page.getByTestId('password-submit').click()

    await expect(page.getByText('两次输入的新密码不一致')).toBeVisible()
    await expect(page).toHaveURL('/settings')
  })
})
