import { expect, test } from '@playwright/test'

import { DEMO, resetSession, signInFresh } from './helpers'

test.describe('authentication', () => {
  test('redirects an anonymous deep link to login and returns to it afterwards', async ({
    page,
  }) => {
    await resetSession(page)

    await page.goto('/audit?outcome=failure')

    await expect(page).toHaveURL(/\/login\?redirect=/)
    expect(new URL(page.url()).searchParams.get('redirect')).toBe('/audit?outcome=failure')

    await page.getByLabel('邮箱').fill(DEMO.admin.email)
    await page.getByLabel('密码', { exact: true }).fill(DEMO.admin.password)
    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL('/audit?outcome=failure')
    await expect(page.getByRole('heading', { name: '操作日志' })).toBeVisible()
  })

  test('shows an inline error for wrong credentials', async ({ page }) => {
    await resetSession(page)

    await page.getByLabel('邮箱').fill(DEMO.viewer.email)
    await page.getByLabel('密码', { exact: true }).fill('wrong-password')
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('login-error')).toContainText('邮箱或密码不正确')
    await expect(page).toHaveURL(/\/login/)
  })

  test('keeps the session across a reload', async ({ page }) => {
    await signInFresh(page, 'owner')

    await expect(page.getByTestId('current-role')).toHaveText('拥有者')

    await page.reload()

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('current-role')).toHaveText('拥有者')
  })

  test('fills the form from a demo account shortcut', async ({ page }) => {
    await resetSession(page)

    await page.getByTestId('demo-account-viewer').click()
    await expect(page.getByLabel('邮箱')).toHaveValue(DEMO.viewer.email)
    await expect(page.getByLabel('密码', { exact: true })).toHaveValue(DEMO.viewer.password)

    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL('/', { timeout: 15_000 })
    await expect(page.getByTestId('current-role')).toHaveText('观察员')
  })

  test('signs out from the account menu', async ({ page }) => {
    await signInFresh(page, 'admin')

    await page.getByTestId('user-menu-trigger').click()
    await page.getByTestId('sign-out').click()

    await expect(page).toHaveURL('/login')
    await page.reload()
    await expect(page).toHaveURL(/\/login/)
  })

  test('validates the login form before calling the API', async ({ page }) => {
    await resetSession(page)

    await page.getByTestId('login-submit').click()

    await expect(page.getByText('请输入邮箱')).toBeVisible()
    await expect(page.getByText('请输入密码')).toBeVisible()
  })
})
