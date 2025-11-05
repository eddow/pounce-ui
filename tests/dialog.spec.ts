import { expect, test, type Page } from '@playwright/test'

const openDialogSection = async (page: Page) => {
	await page.goto('/#playwright')
	await page.getByRole('link', { name: 'Dialogs' }).click()
	await expect(page).toHaveURL(/\/dialog#playwright$/)
	await expect(page.getByRole('heading', { level: 2, name: 'Dialog' })).toBeVisible()
}

test('opens the simple dialog and closes via Ok', async ({ page }) => {
	await openDialogSection(page)
	await page.getByRole('button', { name: 'Open dialog' }).click()
	const dialog = page.getByRole('dialog')
	await expect(dialog).toBeVisible()
	await expect(dialog.getByText('This is a simple dialog with default OK button.')).toBeVisible()
	await dialog.getByRole('button', { name: 'Ok' }).click()
	await expect(page.locator('dialog')).toHaveCount(0)
})

test('confirm dialog exposes actions and closes on proceed', async ({ page }) => {
	await openDialogSection(page)
	await page.getByRole('button', { name: 'Confirm' }).click()
	const dialog = page.getByRole('dialog')
	await expect(dialog.getByRole('heading', { level: 3, name: 'Confirm action' })).toBeVisible()
	await expect(dialog.getByText('Are you sure you want to proceed? This action cannot be undone.')).toBeVisible()
	await dialog.getByRole('button', { name: 'Yes, proceed' }).click()
	await expect(page.locator('dialog')).toHaveCount(0)
})

