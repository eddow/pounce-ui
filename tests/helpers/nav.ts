import { expect, type Page } from '@playwright/test'

export const openMenu = async (page: Page) => {
	await page.locator('summary:has-text("Menu")').click()
}

type OpenSectionArgs = {
	readonly menuName: 'Display' | 'Forms' | 'Interaction' | 'Dockview' | 'Toolbar'
	readonly expectedUrlPath: '/display' | '/forms' | '/interaction' | '/dockview' | '/toolbar'
	readonly expectedHeading: string
	readonly headingLevel: 1 | 2
}

export const openSection = async (page: Page, args: OpenSectionArgs) => {
	await page.goto('/#playwright')
	// Ensure hash is set to avoid flakiness
	await page.waitForFunction(() => window.location.hash === '#playwright')
	await openMenu(page)
	await page.getByRole('menuitem', { name: args.menuName, exact: true }).click()
	await expect(page).toHaveURL(new RegExp(`${args.expectedUrlPath.replace('/', '\\/')}#playwright$`))
	await expect(page.getByRole('heading', { level: args.headingLevel, name: args.expectedHeading })).toBeVisible()
}
