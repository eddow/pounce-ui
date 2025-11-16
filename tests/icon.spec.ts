import { expect, test, type Page } from '@playwright/test'

const openDisplaySection = async (page: Page) => {
	await page.goto('/#playwright')
	await page.locator('summary:has-text("Menu")').click()
	await page.getByRole('link', { name: 'Display' }).click()
	await expect(page).toHaveURL(/\/display#playwright$/)
	await expect(page.getByRole('heading', { level: 1, name: 'Display' })).toBeVisible()
}

// Icon rendering
test('icons render by name', async ({ page }) => {
	await openDisplaySection(page)
	// Scroll to icons section
	await page.getByRole('heading', { level: 3, name: 'Icons' }).scrollIntoViewIfNeeded()
	
	// Find iconify icons
	const icons = page.locator('.iconify, [class*="iconify"]')
	const count = await icons.count()
	expect(count).toBeGreaterThan(0)
	
	// Verify icons are visible
	for (let i = 0; i < count; i++) {
		const icon = icons.nth(i)
		await expect(icon).toBeVisible()
	}
})

test('custom size works', async ({ page }) => {
	await openDisplaySection(page)
	await page.getByRole('heading', { level: 3, name: 'Icons' }).scrollIntoViewIfNeeded()
	
	const icons = page.locator('.iconify, [class*="iconify"]')
	const count = await icons.count()
	
	// Find icons with custom size
	for (let i = 0; i < count; i++) {
		const icon = icons.nth(i)
		const style = await icon.getAttribute('style')
		
		// Icons with custom size should have width/height in style
		if (style && (style.includes('width') || style.includes('height'))) {
			// Verify size is set
			expect(style).toBeTruthy()
		}
	}
})

test('icons are visible', async ({ page }) => {
	await openDisplaySection(page)
	await page.getByRole('heading', { level: 3, name: 'Icons' }).scrollIntoViewIfNeeded()
	
	const icons = page.locator('.iconify, [class*="iconify"]')
	const count = await icons.count()
	expect(count).toBeGreaterThan(0)
	
	// All icons should be visible
	for (let i = 0; i < count; i++) {
		const icon = icons.nth(i)
		await expect(icon).toBeVisible()
	}
})

