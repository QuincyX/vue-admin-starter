/**
 * Regenerates the README screenshots and the PWA icon set from the running app.
 *
 * `README.md` embeds these files, so they must not drift from the UI. The script
 * uses the same Chromium that Playwright already installs.
 *
 * Usage: start a dev server first, then run
 *   pnpm dev
 *   node scripts/capture-docs.mjs --base-url http://127.0.0.1:5173
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { chromium } from '@playwright/test'

const baseUrl = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://127.0.0.1:5173'

const root = fileURLToPath(new URL('..', import.meta.url))
const svg = readFileSync(`${root}public/favicon.svg`, 'utf8')

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'zh-CN',
  colorScheme: 'light',
})
const page = await context.newPage()

async function shot(name, options = {}) {
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${root}docs/${name}.png`, ...options })
  console.log(`captured docs/${name}.png`)
}

// --- login page -------------------------------------------------------------
await page.goto(`${baseUrl}/login`)
await page.evaluate(() => window.localStorage.clear())
await page.reload()
await shot('login')

// --- signed-in pages --------------------------------------------------------
await page.getByTestId('demo-account-owner').click()
await page.getByTestId('login-submit').click()
await page.waitForURL(`${baseUrl}/`)

await page.goto(`${baseUrl}/`)
await shot('preview')

await page.goto(`${baseUrl}/members`)
await shot('members')

await page.goto(`${baseUrl}/audit`)
await shot('audit')

await page.goto(`${baseUrl}/access`)
await shot('access')

// --- dark mode --------------------------------------------------------------
await page.goto(`${baseUrl}/settings`)
await page.getByTestId('theme-dark').click()
await page.goto(`${baseUrl}/`)
await shot('preview-dark')

// --- PWA icons --------------------------------------------------------------
const iconPage = await context.newPage()

async function icon(name, size) {
  await iconPage.setViewportSize({ width: size, height: size })
  await iconPage.setContent(
    `<!doctype html><html><body style="margin:0;background:#4f46e5">${svg.replace(
      '<svg ',
      `<svg style="display:block;width:${size}px;height:${size}px" `,
    )}</body></html>`,
  )
  await iconPage.screenshot({ path: `${root}public/icons/${name}.png` })
  console.log(`captured public/icons/${name}.png`)
}

await icon('icon-512', 512)
await icon('icon-192', 192)
await icon('maskable-512', 512)
await icon('maskable-192', 192)

await iconPage.setViewportSize({ width: 180, height: 180 })
await iconPage.setContent(
  `<!doctype html><html><body style="margin:0;background:#4f46e5">${svg.replace(
    '<svg ',
    '<svg style="display:block;width:180px;height:180px" ',
  )}</body></html>`,
)
await iconPage.screenshot({ path: `${root}public/apple-touch-icon.png` })
console.log('captured public/apple-touch-icon.png')

await browser.close()
