import { expect, type Page } from '@playwright/test'

/** Must match `src/constants/demoAccounts.ts` and `server/admin-api-mock.ts`. */
export const DEMO = {
  owner: { email: 'owner@aurora.dev', password: 'AuroraOwner123!', label: '拥有者' },
  admin: { email: 'admin@aurora.dev', password: 'AuroraAdmin123!', label: '管理员' },
  viewer: { email: 'viewer@aurora.dev', password: 'AuroraViewer123!', label: '观察员' },
} as const

export type DemoRole = keyof typeof DEMO

/** Start from a signed-out browser so persisted demo data cannot leak between tests. */
export async function resetSession(page: Page): Promise<void> {
  await page.goto('/login')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

export async function loginAs(page: Page, role: DemoRole = 'owner'): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('邮箱').fill(DEMO[role].email)
  await page.getByLabel('密码', { exact: true }).fill(DEMO[role].password)
  await page.getByTestId('login-submit').click()

  // The mock server hashes with scrypt on every login; with several workers the
  // redirect can take longer than the default 5s expectation timeout.
  await expect(page).toHaveURL('/', { timeout: 15_000 })
}

export async function signInFresh(page: Page, role: DemoRole = 'owner'): Promise<void> {
  await resetSession(page)
  await loginAs(page, role)
}

/** A data row by its visible text (member name or audit target). */
export function rowWithText(page: Page, text: string) {
  return page.getByTestId('data-row').filter({ hasText: text })
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth - root.clientWidth
  })

  expect(overflow).toBeLessThanOrEqual(1)
}
