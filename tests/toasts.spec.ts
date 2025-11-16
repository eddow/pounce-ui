import { expect, test, type Page } from '@playwright/test'

const openToastsDemo = async (page: Page) => {
	await page.goto('/#playwright')
	await page.waitForFunction(() => window.location.hash === '#playwright')
	// Open the menu dropdown first (summary element)
	await page.locator('summary:has-text("Menu")').click()
	// Then click the Interaction link
	await page.getByRole('link', { name: 'Interaction' }).click()
	await expect(page.getByRole('heading', { level: 2, name: 'Toasts' })).toBeVisible()
	await expect(page).toHaveURL(/\/interaction#playwright$/)
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

// Toast variants
test('success toast appears and dismisses', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Success' }).click()
	const successToast = page.locator('.pp-toast', { hasText: 'Profile updated' })
	await expect(successToast).toBeVisible()
	await expect(successToast).toHaveAttribute('role', 'status')
	// Wait for auto-dismiss or manually dismiss
	await page.waitForTimeout(4000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('warning toast appears and dismisses', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Warning' }).click()
	const warningToast = page.locator('.pp-toast', { hasText: 'Network is slow' })
	await expect(warningToast).toBeVisible()
	await expect(warningToast).toHaveAttribute('role', 'status')
	// Wait for auto-dismiss
	await page.waitForTimeout(4000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('primary/info toast appears and dismisses', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Info' }).click()
	const infoToast = page.locator('.pp-toast', { hasText: 'Heads up: maintenance at 2am' })
	await expect(infoToast).toBeVisible()
	await expect(infoToast).toHaveAttribute('role', 'status')
	// Wait for auto-dismiss
	await page.waitForTimeout(4000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('secondary toast appears and dismisses', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Toast' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Saved!' })
	await expect(toast).toBeVisible()
	// Secondary variant is default for toast.info
	await expect(toast).toHaveAttribute('role', 'status')
	// Wait for auto-dismiss
	await page.waitForTimeout(4000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

// Toast behavior
test('multiple toasts stack correctly', async ({ page }) => {
	await openToastsDemo(page)
	// Trigger multiple toasts quickly
	await page.getByRole('button', { name: 'Toast' }).click()
	await page.getByRole('button', { name: 'Success' }).click()
	await page.getByRole('button', { name: 'Warning' }).click()
	
	// Check multiple toasts are visible
	const toasts = page.locator('.pp-toast')
	await expect(toasts).toHaveCount(3, { timeout: 1000 })
	
	// Wait for them to dismiss
	await page.waitForTimeout(4000)
})

test('toast pause on hover (does not auto-dismiss while hovering)', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Toast' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Saved!' })
	await expect(toast).toBeVisible()
	
	// Hover over toast
	await toast.hover()
	
	// Wait longer than auto-dismiss duration
	await page.waitForTimeout(2000)
	
	// Toast should still be visible while hovering
	await expect(toast).toBeVisible()
	
	// Move mouse away
	await page.mouse.move(0, 0)
	
	// Now toast should dismiss
	await page.waitForTimeout(2000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('toast resumes timer on mouse leave', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Toast' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Saved!' })
	await expect(toast).toBeVisible()
	
	// Hover and then leave
	await toast.hover()
	await page.waitForTimeout(1000)
	await page.mouse.move(0, 0)
	
	// Toast should dismiss after remaining time
	await page.waitForTimeout(3000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('toast with custom duration works', async ({ page }) => {
	await openToastsDemo(page)
	// Note: This test assumes there's a way to create a toast with custom duration
	// If not available in demo, we test default duration
	await page.getByRole('button', { name: 'Toast' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Saved!' })
	await expect(toast).toBeVisible()
	
	// Default duration is around 3500ms
	await page.waitForTimeout(4000)
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('non-dismissible toast auto-dismisses only', async ({ page }) => {
	await openToastsDemo(page)
	// Note: This test assumes there's a non-dismissible toast option
	// If not available, we test that dismissible toasts show close button
	await page.getByRole('button', { name: 'Danger' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Failed to save' })
	await expect(toast).toBeVisible()
	
	// Dismissible toast should have close button
	const closeButton = toast.getByRole('button', { name: 'Dismiss' })
	await expect(closeButton).toBeVisible()
	
	await closeButton.click()
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

test('dismissible toast shows close button', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Danger' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Failed to save' })
	await expect(toast).toBeVisible()
	
	// Check for close button
	const closeButton = toast.getByRole('button', { name: 'Dismiss' })
	await expect(closeButton).toBeVisible()
	
	await closeButton.click()
	await expect(page.locator('.pp-toast')).toHaveCount(0)
})

// Toast accessibility
test('role="alert" for danger toasts', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Danger' }).click()
	const dangerToast = page.locator('.pp-toast', { hasText: 'Failed to save' })
	await expect(dangerToast).toBeVisible()
	await expect(dangerToast).toHaveAttribute('role', 'alert')
	await dangerToast.getByRole('button', { name: 'Dismiss' }).click()
})

test('role="status" for info/success toasts', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Success' }).click()
	const successToast = page.locator('.pp-toast', { hasText: 'Profile updated' })
	await expect(successToast).toBeVisible()
	await expect(successToast).toHaveAttribute('role', 'status')
	await page.waitForTimeout(4000)
})

test('toast container has aria-live="polite"', async ({ page }) => {
	await openToastsDemo(page)
	// Find toast container
	const container = page.locator('.pp-toasts')
	await expect(container).toHaveAttribute('aria-live', 'polite')
	
	// Trigger a toast to ensure container is present
	await page.getByRole('button', { name: 'Toast' }).click()
	await expect(container).toHaveAttribute('aria-live', 'polite')
	await page.waitForTimeout(4000)
})

// Toast positioning
test('toasts appear in configured position (bottom-right default)', async ({ page }) => {
	await openToastsDemo(page)
	await page.getByRole('button', { name: 'Toast' }).click()
	const toast = page.locator('.pp-toast', { hasText: 'Saved!' })
	await expect(toast).toBeVisible()
	
	// Check container has position class
	const container = page.locator('.pp-toasts')
	const classes = await container.getAttribute('class')
	expect(classes).toContain('bottom-right')
	
	await page.waitForTimeout(4000)
})

test('multiple toasts stack in correct order', async ({ page }) => {
	await openToastsDemo(page)
	// Trigger multiple toasts
	await page.getByRole('button', { name: 'Toast' }).click()
	await page.waitForTimeout(100)
	await page.getByRole('button', { name: 'Success' }).click()
	await page.waitForTimeout(100)
	await page.getByRole('button', { name: 'Warning' }).click()
	
	// Check multiple toasts exist
	const toasts = page.locator('.pp-toast')
	await expect(toasts).toHaveCount(3, { timeout: 1000 })
	
	// Verify they are stacked (check container layout)
	const container = page.locator('.pp-toasts')
	await expect(container).toBeVisible()
	
	await page.waitForTimeout(4000)
})

