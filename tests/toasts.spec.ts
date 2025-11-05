import { expect, test, type Page } from '@playwright/test'

const openToastsDemo = async (page: Page) => {
	await page.goto('/#playwright')
	await page.waitForFunction(() => window.location.hash === '#playwright')
	await page.getByRole('link', { name: 'Toasts' }).click()
	await expect(page.getByRole('heading', { level: 2, name: 'Toasts' })).toBeVisible()
	await expect(page).toHaveURL(/\/toasts#playwright$/)
}

test('shows and auto-dismisses the info toast', async ({ page }) => {
	await openToastsDemo(page)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
	await page.getByRole('button', { name: 'Toast' }).click()
	const toastLocator = page.locator('.pp-toast', { hasText: 'Saved!' })
	await expect(toastLocator).toBeVisible()
	await expect(toastLocator).toHaveAttribute('role', 'status')
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('dismisses danger toasts via the close button', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Danger' }).click()
	const dangerToast = page.locator('.pp-toast', { hasText: 'Failed to save' })
	await expect(dangerToast).toBeVisible()
	await expect(dangerToast).toHaveAttribute('role', 'alert')
	await dangerToast.getByRole('button', { name: 'Dismiss' }).click()
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

