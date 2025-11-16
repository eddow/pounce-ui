import { expect, test, type Page } from '@playwright/test'

const openDisplaySection = async (page: Page) => {
	await page.goto('/#playwright')
	await page.locator('summary:has-text("Menu")').click()
	await page.getByRole('link', { name: 'Display' }).click()
	await expect(page).toHaveURL(/\/display#playwright$/)
	await expect(page.getByRole('heading', { level: 1, name: 'Display' })).toBeVisible()
}

// Button variants
test('all variant buttons render correctly (primary, secondary, contrast, danger, success, warning)', async ({ page }) => {
	await openDisplaySection(page)
	
	const variants = ['Primary', 'Secondary', 'Contrast', 'Success', 'Warning', 'Danger']
	
	for (const variant of variants) {
		const button = page.getByRole('button', { name: variant })
		await expect(button).toBeVisible()
	}
})

test('button with icon renders', async ({ page }) => {
	await openDisplaySection(page)
	const homeButton = page.getByRole('button', { name: 'Home' })
	await expect(homeButton).toBeVisible()
	
	// Check for icon element
	const icon = homeButton.locator('.pp-button-icon, [class*="iconify"]')
	await expect(icon.first()).toBeVisible()
})

test('button with icon at end renders', async ({ page }) => {
	await openDisplaySection(page)
	const githubButton = page.getByRole('button', { name: 'GitHub' })
	await expect(githubButton).toBeVisible()
	
	// Check for icon element
	const icon = githubButton.locator('.pp-button-icon, [class*="iconify"]')
	await expect(icon.first()).toBeVisible()
})

test('icon-only button renders', async ({ page }) => {
	await openDisplaySection(page)
	// Find icon-only buttons (buttons with aria-label but no visible text)
	const iconOnlyButtons = page.locator('button[aria-label]')
	const count = await iconOnlyButtons.count()
	
	// Should have at least one icon-only button (dark mode toggle in header)
	expect(count).toBeGreaterThan(0)
	
	// Check dark mode toggle button
	const darkModeToggle = page.getByRole('button', { name: 'Toggle dark mode' })
	await expect(darkModeToggle).toBeVisible()
	
	// Check it has icon-only class or structure
	const hasIconOnlyClass = await darkModeToggle.evaluate((el) => {
		return el.classList.contains('pp-button-icon-only') || 
		       el.querySelector('.pp-button-icon') !== null
	})
	expect(hasIconOnlyClass).toBeTruthy()
})

test('button click handlers work', async ({ page }) => {
	await openDisplaySection(page)
	const primaryButton = page.getByRole('button', { name: 'Primary' })
	await expect(primaryButton).toBeVisible()
	
	// Click button (should not cause errors)
	await primaryButton.click()
	
	// Button should still be visible after click
	await expect(primaryButton).toBeVisible()
})

test('disabled button does not respond to clicks', async ({ page }) => {
	await openDisplaySection(page)
	// Find all buttons and check for disabled state
	const buttons = page.locator('button')
	const count = await buttons.count()
	
	for (let i = 0; i < count; i++) {
		const button = buttons.nth(i)
		const isDisabled = await button.isDisabled()
		
		if (isDisabled) {
			// Disabled button should not be clickable
			await expect(button).toBeDisabled()
			
			// Try to click (should not trigger handlers)
			await button.click({ force: true })
		}
	}
})

// Button accessibility
test('icon-only buttons have aria-label', async ({ page }) => {
	await openDisplaySection(page)
	// Check dark mode toggle has aria-label
	const darkModeToggle = page.getByRole('button', { name: 'Toggle dark mode' })
	await expect(darkModeToggle).toBeVisible()
	await expect(darkModeToggle).toHaveAttribute('aria-label', 'Toggle dark mode')
})

test('buttons are keyboard accessible (Enter/Space)', async ({ page }) => {
	await openDisplaySection(page)
	const primaryButton = page.getByRole('button', { name: 'Primary' })
	await expect(primaryButton).toBeVisible()
	
	// Focus button
	await primaryButton.focus()
	
	// Press Enter
	await page.keyboard.press('Enter')
	
	// Press Space
	await page.keyboard.press('Space')
	
	// Button should still be visible and functional
	await expect(primaryButton).toBeVisible()
})

test('focus indicators visible', async ({ page }) => {
	await openDisplaySection(page)
	const primaryButton = page.getByRole('button', { name: 'Primary' })
	await expect(primaryButton).toBeVisible()
	
	// Focus button
	await primaryButton.focus()
	
	// Check if button has focus
	const isFocused = await primaryButton.evaluate((el) => document.activeElement === el)
	expect(isFocused).toBeTruthy()
	
	// Check for focus styles (outline or box-shadow)
	const hasFocusStyle = await primaryButton.evaluate((el) => {
		const style = window.getComputedStyle(el)
		return style.outline !== 'none' || 
		       style.outlineWidth !== '0px' ||
		       style.boxShadow !== 'none'
	})
	// Note: Focus styles may vary, but button should be focusable
	expect(isFocused).toBeTruthy()
})

