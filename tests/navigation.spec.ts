import { expect, test } from '@playwright/test'

test('shows Overview by default and supports navigation links', async ({ page }) => {
	await page.goto('/#playwright')
	await expect(page.getByRole('heading', { level: 2, name: 'Overview' })).toBeVisible()
	const toastsLink = page.getByRole('link', { name: 'Toasts' })
	await expect(toastsLink).toHaveAttribute('href', '/toasts#playwright')
	await toastsLink.click()
	await expect(page).toHaveURL(/\/toasts#playwright$/)
	await expect(page.getByRole('heading', { level: 2, name: 'Toasts' })).toBeVisible()
})

