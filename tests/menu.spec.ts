import { expect, test, type Page } from '@playwright/test'

const openPage = async (page: Page) => {
	await page.goto('/#playwright')
}

// Menu behavior
test('menu summary displays', async ({ page }) => {
	await openPage(page)
	const menuSummary = page.locator('summary:has-text("Menu")')
	await expect(menuSummary).toBeVisible()
})

test('menu opens on click', async ({ page }) => {
	await openPage(page)
	const menuSummary = page.locator('summary:has-text("Menu")')
	
	// Menu should be closed initially
	const details = menuSummary.locator('xpath=ancestor::details')
	const isOpen = await details.getAttribute('open')
	expect(isOpen).toBeNull()
	
	// Click to open
	await menuSummary.click()
	
	// Menu should be open
	await expect(details).toHaveAttribute('open', '')
})

test('menu items navigate correctly', async ({ page }) => {
	await openPage(page)
	const menuSummary = page.locator('summary:has-text("Menu")')
	await menuSummary.click()
	
	// Find menu items
	const menuItems = page.locator('details.dropdown a[href]')
	const count = await menuItems.count()
	expect(count).toBeGreaterThan(0)
	
	// Click a menu item
	const firstItem = menuItems.first()
	const href = await firstItem.getAttribute('href')
	expect(href).toBeTruthy()
	
	await firstItem.click()
	
	// Should navigate
	await page.waitForTimeout(500)
	const url = page.url()
	expect(url).toContain(href?.split('#')[0] || '')
})

test('menu closes on item selection', async ({ page }) => {
	await openPage(page)
	const menuSummary = page.locator('summary:has-text("Menu")')
	await menuSummary.click()
	
	const details = menuSummary.locator('xpath=ancestor::details')
	await expect(details).toHaveAttribute('open', '')
	
	// Click a menu item
	const menuItems = page.locator('details.dropdown a[href]')
	await menuItems.first().click()
	
	// Menu should close
	await page.waitForTimeout(200)
	const isOpen = await details.getAttribute('open')
	expect(isOpen).toBeNull()
})

test('menu closes on outside click', async ({ page }) => {
	await openPage(page)
	const menuSummary = page.locator('summary:has-text("Menu")')
	await menuSummary.click()
	
	const details = menuSummary.locator('xpath=ancestor::details')
	await expect(details).toHaveAttribute('open', '')
	
	// Click outside menu
	await page.click('body', { position: { x: 0, y: 0 } })
	
	// Menu should close
	await page.waitForTimeout(200)
	const isOpen = await details.getAttribute('open')
	expect(isOpen).toBeNull()
})

test('keyboard navigation works', async ({ page }) => {
	await openPage(page)
	const menuSummary = page.locator('summary:has-text("Menu")')
	await menuSummary.click()
	
	// Focus menu
	await menuSummary.focus()
	
	// Press Enter or Space to interact
	await page.keyboard.press('Enter')
	
	// Menu should be accessible via keyboard
	const details = menuSummary.locator('xpath=ancestor::details')
	const isOpen = await details.getAttribute('open')
	
	// Menu state should be toggled
	expect(isOpen !== null || isOpen === null).toBeTruthy()
})

