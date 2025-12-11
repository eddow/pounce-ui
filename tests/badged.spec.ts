import { expect, test } from '@playwright/test'
import { openSection } from './helpers/nav'

const openDisplaySection = (page: any) =>
	openSection(page, { menuName: 'Display', expectedUrlPath: '/display', expectedHeading: 'Display', headingLevel: 1 })

test('badged component wraps button correctly', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	
	// Check that buttons with badges are wrapped in Badged component
	const inboxButton = page.getByRole('button', { name: 'Inbox' })
	await expect(inboxButton).toBeVisible()
	
	// Check that button is inside a Badged wrapper
	const badgedWrapper = inboxButton.locator('..')
	const hasBadgedClass = await badgedWrapper.evaluate((el) => {
		return el.classList.contains('pp-badged')
	})
	expect(hasBadgedClass).toBeTruthy()
	
	// Check badge exists in wrapper
	const badge = badgedWrapper.locator('.pp-badge')
	await expect(badge).toBeVisible()
	await expect(badge).toHaveText('5')
})

test('badged button maintains correct dimensions', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	
	const inboxButton = page.getByRole('button', { name: 'Inbox' })
	await expect(inboxButton).toBeVisible()
	
	const buttonBox = await inboxButton.boundingBox()
	const wrapper = inboxButton.locator('..')
	const wrapperBox = await wrapper.boundingBox()
	
	if (buttonBox && wrapperBox) {
		// Badged wrapper uses inline-flex, so button and wrapper may have different widths
		// The wrapper may be larger to accommodate badge overflow
		// Button should be visible and have reasonable dimensions
		expect(buttonBox.width).toBeGreaterThan(0)
		expect(buttonBox.height).toBeGreaterThan(0)
		// Wrapper should contain the button (wrapper may be larger due to badge positioning)
		expect(wrapperBox.width).toBeGreaterThanOrEqual(buttonBox.width - 10) // Allow some tolerance
		expect(wrapperBox.height).toBeGreaterThanOrEqual(buttonBox.height - 10) // Allow some tolerance
	}
})

test('badge is not clipped on labeled buttons', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	
	const inboxButton = page.getByRole('button', { name: 'Inbox' })
	const badge = inboxButton.locator('..').locator('.pp-badge')
	
	await expect(badge).toBeVisible()
	const badgeBox = await badge.boundingBox()
	const buttonBox = await inboxButton.boundingBox()
	const wrapperBox = await inboxButton.locator('..').boundingBox()
	
	if (badgeBox && buttonBox && wrapperBox) {
		// Badge should have proper dimensions (not clipped)
		expect(badgeBox.width).toBeGreaterThan(15)
		expect(badgeBox.height).toBeGreaterThan(15)
		
		// Check that badge extends significantly beyond button bounds to avoid border-radius clipping
		// The badge should extend at least 3px beyond the button's corner
		const extendsRight = (badgeBox.x + badgeBox.width) - (buttonBox.x + buttonBox.width)
		const extendsTop = buttonBox.y - badgeBox.y
		
		// Badge must extend beyond button to avoid clipping by border-radius
		expect(extendsRight).toBeGreaterThan(2) // At least 2px to the right
		expect(extendsTop).toBeGreaterThan(2) // At least 2px above
		
		// Check computed styles to ensure badge is not clipped
		const overflow = await inboxButton.locator('..').evaluate((el) => {
			return window.getComputedStyle(el).overflow
		})
		expect(overflow).toBe('visible')
		
		// Get button border-radius to check if badge extends beyond it
		const buttonBorderRadius = await inboxButton.evaluate((el) => {
			const style = window.getComputedStyle(el)
			const radius = parseFloat(style.borderRadius) || 0
			return radius
		})
		
		// Badge should extend beyond the border-radius area
		// If button has border-radius, badge needs to extend at least that much
		if (buttonBorderRadius > 0) {
			expect(extendsRight).toBeGreaterThan(buttonBorderRadius * 0.3)
			expect(extendsTop).toBeGreaterThan(buttonBorderRadius * 0.3)
		}
		
		// Badge should have border-radius (circular)
		const badgeBorderRadius = await badge.evaluate((el) => {
			return window.getComputedStyle(el).borderRadius
		})
		expect(badgeBorderRadius).toContain('px') // Should have border-radius
	}
})

test('badge is not clipped on icon-only buttons', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	await page.waitForTimeout(200) // Allow for rendering
	
	const notificationsButton = page.getByRole('button', { name: 'Notifications' })
	await expect(notificationsButton).toBeVisible({ timeout: 5000 })
	
	const badge = notificationsButton.locator('..').locator('.pp-badge')
	await expect(badge).toBeVisible({ timeout: 5000 })
	await expect(badge).toHaveText('12')
	
	const badgeBox = await badge.boundingBox()
	const buttonBox = await notificationsButton.boundingBox()
	
	if (badgeBox && buttonBox) {
		// Badge should have proper dimensions (not clipped)
		expect(badgeBox.width).toBeGreaterThan(15)
		expect(badgeBox.height).toBeGreaterThan(15)
		
		// Badge should be roughly circular (not extremely wide or tall)
		const aspectRatio = badgeBox.width / badgeBox.height
		expect(aspectRatio).toBeGreaterThan(0.8) // Not too tall
		expect(aspectRatio).toBeLessThan(2.0) // Not too wide
		
		// Check that badge extends beyond button bounds (not clipped by border-radius)
		const extendsRight = (badgeBox.x + badgeBox.width) - (buttonBox.x + buttonBox.width)
		const extendsTop = buttonBox.y - badgeBox.y
		
		// Badge must extend significantly to avoid clipping
		expect(extendsRight, 'Badge must extend right to avoid clipping').toBeGreaterThan(2)
		expect(extendsTop, 'Badge must extend top to avoid clipping').toBeGreaterThan(2)
		
		// Verify badge is fully visible (check computed styles)
		const visibility = await badge.evaluate((el) => {
			const style = window.getComputedStyle(el)
			return {
				visibility: style.visibility,
				opacity: parseFloat(style.opacity),
				display: style.display,
				clip: style.clip,
				clipPath: style.clipPath,
			}
		})
		expect(visibility.visibility).toBe('visible')
		expect(visibility.opacity).toBeGreaterThan(0)
		expect(visibility.display).not.toBe('none')
		expect(visibility.clip).toBe('auto')
	}
})

test('badge positioning is correct for different button types', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	await page.waitForTimeout(200) // Allow for rendering
	
	// Test labeled button
	const inboxButton = page.getByRole('button', { name: 'Inbox' })
	await expect(inboxButton).toBeVisible()
	const inboxBadge = inboxButton.locator('..').locator('.pp-badge')
	const inboxButtonBox = await inboxButton.boundingBox()
	const inboxBadgeBox = await inboxBadge.boundingBox()
	
	if (inboxButtonBox && inboxBadgeBox) {
		// Badge should be positioned at top-right (extends beyond button)
		expect((inboxBadgeBox.x + inboxBadgeBox.width)).toBeGreaterThan((inboxButtonBox.x + inboxButtonBox.width) - 5)
		expect(inboxBadgeBox.y).toBeLessThan(inboxButtonBox.y + 5)
	}
	
	// Test icon-only button
	const notificationsButton = page.getByRole('button', { name: 'Notifications' })
	const notificationsBadge = notificationsButton.locator('..').locator('.pp-badge')
	const notificationsButtonBox = await notificationsButton.boundingBox()
	const notificationsBadgeBox = await notificationsBadge.boundingBox()
	
	if (notificationsButtonBox && notificationsBadgeBox) {
		// Badge should be positioned at top-right
		expect((notificationsBadgeBox.x + notificationsBadgeBox.width)).toBeGreaterThan((notificationsButtonBox.x + notificationsButtonBox.width) - 5)
		expect(notificationsBadgeBox.y).toBeLessThan(notificationsButtonBox.y + 5)
	}
})

test('badge does not affect button clickability', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	await page.waitForTimeout(200) // Allow for rendering
	
	const inboxButton = page.getByRole('button', { name: 'Inbox' })
	await expect(inboxButton).toBeVisible()
	const badge = inboxButton.locator('..').locator('.pp-badge')
	
	// Badge should have pointer-events: none
	const pointerEvents = await badge.evaluate((el) => {
		return window.getComputedStyle(el).pointerEvents
	})
	expect(pointerEvents).toBe('none')
	
	// Button should still be clickable
	await expect(inboxButton).toBeEnabled()
})

test('badge renders different content types correctly', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	await page.waitForTimeout(200) // Allow for rendering
	
	// Number badge
	const notificationsButton = page.getByRole('button', { name: 'Notifications' })
	await expect(notificationsButton).toBeVisible()
	await expect(notificationsButton.locator('..').locator('.pp-badge')).toHaveText('12')
	
	// String badge
	const messagesButton = page.getByRole('button', { name: 'Messages' })
	await expect(messagesButton).toBeVisible()
	await expect(messagesButton.locator('..').locator('.pp-badge')).toHaveText('99+')
	
	// Text badge
	const profileButton = page.getByRole('button', { name: 'Profile' })
	await expect(profileButton).toBeVisible()
	await expect(profileButton.locator('..').locator('.pp-badge')).toHaveText('New')
})

test('badge accepts JSX.Element as content', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	await page.waitForTimeout(200) // Allow for rendering
	
	// Test JSX.Element badge (Icon component)
	const starredButton = page.getByRole('button', { name: 'Starred' })
	await expect(starredButton).toBeVisible()
	const badge = starredButton.locator('..').locator('.pp-badge')
	
	// Badge should render correctly with JSX.Element content
	await expect(badge).toBeVisible()
	
	// Check that badge contains the icon (JSX.Element was rendered, not stringified)
	const hasIcon = await badge.locator('.iconify, svg').count()
	expect(hasIcon).toBeGreaterThan(0)
	
	// Check that badge content is rendered (not [object Object] or similar)
	const badgeText = await badge.textContent()
	// For JSX.Element badges, text might be empty but element should be present
	expect(hasIcon).toBeGreaterThan(0) // Icon should be present
	
	// Also test that regular badges still work
	const inboxButton = page.getByRole('button', { name: 'Inbox' })
	await expect(inboxButton).toBeVisible()
	const inboxBadge = inboxButton.locator('..').locator('.pp-badge')
	const inboxBadgeText = await inboxBadge.textContent()
	expect(inboxBadgeText).toBeTruthy()
	expect(inboxBadgeText).not.toContain('[object')
})

test('badge sizing and cropping - comprehensive check', async ({ page }) => {
	await openDisplaySection(page)
	
	// Scroll to buttons with badges section
	await page.getByRole('heading', { level: 3, name: 'Buttons with Badges' }).scrollIntoViewIfNeeded()
	await page.waitForTimeout(200) // Allow for rendering
	
	// Test all badge buttons for proper sizing and NO clipping
	const buttons = [
		{ name: 'Inbox', expectedText: '5' },
		{ name: 'Notifications', expectedText: '12' },
		{ name: 'Messages', expectedText: '99+' },
		{ name: 'Shopping cart', expectedText: '3' },
		{ name: 'Profile', expectedText: 'New' },
	]
	
	for (const { name, expectedText } of buttons) {
		const button = page.getByRole('button', { name })
		await expect(button).toBeVisible({ timeout: 5000 })
		const badge = button.locator('..').locator('.pp-badge')
		
		await expect(badge).toBeVisible()
		await expect(badge).toHaveText(expectedText)
		
		const badgeBox = await badge.boundingBox()
		const buttonBox = await button.boundingBox()
		const wrapperBox = await button.locator('..').boundingBox()
		
		if (badgeBox && buttonBox && wrapperBox) {
			// Badge should have minimum dimensions
			expect(badgeBox.width).toBeGreaterThan(15)
			expect(badgeBox.height).toBeGreaterThan(15)
			
			// Badge should not be larger than reasonable size
			expect(badgeBox.width).toBeLessThan(50)
			expect(badgeBox.height).toBeLessThan(30)
			
			// CRITICAL: Check that badge extends SIGNIFICANTLY beyond button to avoid border-radius clipping
			const extendsRight = (badgeBox.x + badgeBox.width) - (buttonBox.x + buttonBox.width)
			const extendsTop = buttonBox.y - badgeBox.y
			const extendsLeft = buttonBox.x - badgeBox.x
			const extendsBottom = (badgeBox.y + badgeBox.height) - (buttonBox.y + buttonBox.height)
			
			// For top-right badges, must extend right and top
			if (extendsRight > 0 && extendsTop > 0) {
				expect(extendsRight, `Badge on ${name} must extend at least 3px right to avoid clipping`).toBeGreaterThan(2)
				expect(extendsTop, `Badge on ${name} must extend at least 3px top to avoid clipping`).toBeGreaterThan(2)
			}
			
			// Get button border-radius
			const buttonBorderRadius = await button.evaluate((el) => {
				const style = window.getComputedStyle(el)
				return parseFloat(style.borderRadius) || 0
			})
			
			// If button has border-radius, badge must extend beyond it
			if (buttonBorderRadius > 0 && extendsRight > 0 && extendsTop > 0) {
				const minExtension = Math.max(buttonBorderRadius * 0.3, 3)
				expect(extendsRight, `Badge on ${name} extends ${extendsRight}px right, needs at least ${minExtension}px to avoid ${buttonBorderRadius}px border-radius clipping`).toBeGreaterThanOrEqual(minExtension)
				expect(extendsTop, `Badge on ${name} extends ${extendsTop}px top, needs at least ${minExtension}px to avoid ${buttonBorderRadius}px border-radius clipping`).toBeGreaterThanOrEqual(minExtension)
			}
			
			// Check wrapper allows overflow
			const wrapperOverflow = await button.locator('..').evaluate((el) => {
				return window.getComputedStyle(el).overflow
			})
			expect(wrapperOverflow).toBe('visible')
			
			// Verify badge is fully visible (not clipped by any parent)
			const badgeVisibility = await badge.evaluate((el) => {
				const style = window.getComputedStyle(el)
				return {
					visibility: style.visibility,
					opacity: parseFloat(style.opacity),
					clip: style.clip,
					clipPath: style.clipPath,
				}
			})
			expect(badgeVisibility.visibility).toBe('visible')
			expect(badgeVisibility.opacity).toBeGreaterThan(0)
			expect(badgeVisibility.clip).toBe('auto')
		}
	}
})

