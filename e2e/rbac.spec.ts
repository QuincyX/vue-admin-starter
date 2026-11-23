import { expect, test } from '@playwright/test'

import { signInFresh } from './helpers'

test.describe('role-based access control', () => {
  test('hides the access-control entry from a viewer and bounces the direct URL', async ({
    page,
  }) => {
    await signInFresh(page, 'viewer')

    await expect(page.getByTestId('app-sidebar')).toBeVisible()
    await expect(page.getByTestId('app-sidebar').getByText('访问控制')).toHaveCount(0)

    await page.goto('/access')

    await expect(page).toHaveURL(/\/403\?from=/)
    expect(new URL(page.url()).searchParams.get('from')).toBe('/access')
    await expect(page.getByRole('heading', { name: '当前角色没有访问权限' })).toBeVisible()

    await page.getByRole('button', { name: '返回数据总览' }).click()
    await expect(page).toHaveURL('/')
  })

  test('gives a viewer a read-only member table', async ({ page }) => {
    await signInFresh(page, 'viewer')
    await page.goto('/members')

    await expect(page.getByTestId('data-table')).toBeVisible()
    await expect(page.getByTestId('member-create')).toHaveCount(0)
    // No selection column without members:write.
    await expect(page.getByRole('checkbox')).toHaveCount(0)
  })

  test('lets an admin manage members but not open access control', async ({ page }) => {
    await signInFresh(page, 'admin')
    await page.goto('/members')

    await expect(page.getByTestId('member-create')).toBeVisible()
    await expect(page.getByRole('checkbox').first()).toBeVisible()

    await page.goto('/access')
    await expect(page).toHaveURL(/\/403\?from=/)
  })

  test('shows the permission matrix to the owner', async ({ page }) => {
    await signInFresh(page, 'owner')

    await page.getByTestId('app-sidebar').getByText('访问控制').click()

    await expect(page).toHaveURL('/access')
    await expect(page.getByRole('heading', { name: '访问控制' })).toBeVisible()
    await expect(page.getByText('系统管理', { exact: true })).toBeVisible()
    await expect(page.getByText('只有拥有者可以进入本页')).toBeVisible()
  })

  test('renders the 404 page for an unknown path', async ({ page }) => {
    await signInFresh(page, 'owner')

    await page.goto('/does-not-exist')

    await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible()
  })
})
