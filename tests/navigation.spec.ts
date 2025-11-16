import { expect, test } from '@playwright/test'

const openMenu = async (page: any) => {
	await page.locator('summary:has-text("Menu")').click()
}

test('shows Overview by default and supports navigation links', async ({ page }) => {
	await page.goto('/#playwright')
	await expect(page.getByRole('heading', { level: 2, name: 'Overview' })).toBeVisible()
	// Open the menu dropdown first (summary element)
	await openMenu(page)
	// Then find and click the Interaction item
	const interactionLink = page.getByRole('menuitem', { name: 'Interaction' })
	await expect(interactionLink).toHaveAttribute('href', '/interaction#playwright')
	await interactionLink.click()
	await expect(page).toHaveURL(/\/interaction#playwright$/)
	await expect(page.getByRole('heading', { level: 2, name: 'Dialog' })).toBeVisible()
})

// Route navigation
test('all menu items navigate to correct routes', async ({ page }) => {
	await page.goto('/#playwright')
	
	const routes = [
		{ name: 'Display', path: '/display', heading: 'Display' },
		{ name: 'Forms', path: '/forms', heading: 'Forms' },
		{ name: 'Interaction', path: '/interaction', heading: 'Dialog' },
		{ name: 'Dockview', path: '/dockview', heading: 'Dockview' },
		{ name: 'Toolbar', path: '/toolbar', heading: 'Toolbars' },
	]
	
	for (const route of routes) {
		await openMenu(page)
		const link = page.getByRole('menuitem', { name: route.name })
		await expect(link).toHaveAttribute('href', `${route.path}#playwright`)
		await link.click()
		await expect(page).toHaveURL(new RegExp(`${route.path.replace('/', '\\/')}#playwright$`))
		const expectedLevel = route.name === 'Interaction' ? 2 : 1
		await expect(page.getByRole('heading', { level: expectedLevel, name: route.heading })).toBeVisible()
	}
})

test('browser back/forward buttons work', async ({ page }) => {
	await page.goto('/#playwright')
	await expect(page.getByRole('heading', { level: 2, name: 'Overview' })).toBeVisible()
	
	// Navigate to a route
	await openMenu(page)
	await page.getByRole('menuitem', { name: 'Display' }).click()
	await expect(page).toHaveURL(/\/display#playwright$/)
	
	// Go back
	await page.goBack()
	await expect(page).toHaveURL(/\/#playwright$/)
	await expect(page.getByRole('heading', { level: 2, name: 'Overview' })).toBeVisible()
	
	// Go forward
	await page.goForward()
	await expect(page).toHaveURL(/\/display#playwright$/)
	await expect(page.getByRole('heading', { level: 1, name: 'Display' })).toBeVisible()
})

test('direct URL navigation works', async ({ page }) => {
	// Navigate directly to a route
	await page.goto('/forms#playwright')
	await expect(page.getByRole('heading', { level: 1, name: 'Forms' })).toBeVisible()
	
	// Navigate directly to another route
	await page.goto('/toolbar#playwright')
	await expect(page.getByRole('heading', { level: 1, name: 'Toolbars' })).toBeVisible()
	
	// Navigate to root
	await page.goto('/#playwright')
	await expect(page.getByRole('heading', { level: 2, name: 'Overview' })).toBeVisible()
})

test('hash fragments preserved during navigation', async ({ page }) => {
	await page.goto('/#playwright')
	
	// Navigate with hash
	await openMenu(page)
	await page.getByRole('menuitem', { name: 'Display' }).click()
	await expect(page).toHaveURL(/\/display#playwright$/)
	
	// Navigate to another route
	await openMenu(page)
	await page.getByRole('menuitem', { name: 'Forms' }).click()
	await expect(page).toHaveURL(/\/forms#playwright$/)
	
	// Hash should be preserved
	const url = page.url()
	expect(url).toContain('#playwright')
})

test('route changes update URL correctly', async ({ page }) => {
	await page.goto('/#playwright')
	await expect(page).toHaveURL(/\/#playwright$/)
	
	// Navigate to Display
	await openMenu(page)
	await page.getByRole('menuitem', { name: 'Display' }).click()
	await expect(page).toHaveURL(/\/display#playwright$/)
	
	// Navigate to Forms
	await openMenu(page)
	await page.getByRole('menuitem', { name: 'Forms' }).click()
	await expect(page).toHaveURL(/\/forms#playwright$/)
	
	// Navigate back to Overview
	// Overview is not a menu item; navigate directly
	await page.goto('/#playwright')
	await expect(page).toHaveURL(/\/#playwright$/)
})

// Dark mode toggle
test('toggle button appears', async ({ page }) => {
	await page.goto('/#playwright')
	const toggleButton = page.getByRole('button', { name: 'Toggle dark mode' })
	await expect(toggleButton).toBeVisible()
})

test('clicking toggle changes theme', async ({ page }) => {
	await page.goto('/#playwright')
	const toggleButton = page.getByRole('button', { name: 'Toggle dark mode' })
	
	// Get initial theme
	const initialTheme = await page.evaluate(() => document.documentElement.dataset.theme)
	
	// Click toggle
	await toggleButton.click()
	
	// Wait for theme change
	await page.waitForTimeout(100)
	
	// Get new theme
	const newTheme = await page.evaluate(() => document.documentElement.dataset.theme)
	
	// Theme should have changed
	expect(newTheme).not.toBe(initialTheme)
	expect(['dark', 'light']).toContain(newTheme)
})

test('theme persists across navigation', async ({ page }) => {
	await page.goto('/#playwright')
	const toggleButton = page.getByRole('button', { name: 'Toggle dark mode' })
	
	// Set theme to dark
	await toggleButton.click()
	await page.waitForTimeout(100)
	const themeAfterToggle = await page.evaluate(() => document.documentElement.dataset.theme)
	
	// Navigate to another route
	await openMenu(page)
	await page.getByRole('menuitem', { name: 'Display' }).click()
	await expect(page).toHaveURL(/\/display#playwright$/)
	
	// Theme should persist
	const themeAfterNav = await page.evaluate(() => document.documentElement.dataset.theme)
	expect(themeAfterNav).toBe(themeAfterToggle)
})

test('theme persists on page reload (via localStorage)', async ({ page }) => {
	await page.goto('/#playwright')
	const toggleButton = page.getByRole('button', { name: 'Toggle dark mode' })
	
	// Set theme
	await toggleButton.click()
	await page.waitForTimeout(100)
	const themeBeforeReload = await page.evaluate(() => document.documentElement.dataset.theme)
	
	// Reload page
	await page.reload()
	await page.waitForTimeout(100)
	
	// Theme should persist
	const themeAfterReload = await page.evaluate(() => document.documentElement.dataset.theme)
	expect(themeAfterReload).toBe(themeBeforeReload)
})

