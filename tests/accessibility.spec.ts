import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

const routes = [
	{ path: '/#playwright', name: 'Overview' },
	{ path: '/interaction#playwright', name: 'Interaction' },
	{ path: '/forms#playwright', name: 'Forms' },
	{ path: '/dockview#playwright', name: 'Dockview' },
	{ path: '/toolbar#playwright', name: 'Toolbars' },
	{ path: '/display#playwright', name: 'Display' },
]

test.describe('Accessibility - axe-core smoke', () => {
	for (const route of routes) {
		test(`has no critical/serious a11y violations on ${route.path}`, async ({ page }) => {
			await page.goto(route.path)
			await page.waitForTimeout(50)
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa'])
				.analyze()
			const seriousOrWorse = (results.violations ?? []).filter((v) =>
				['serious', 'critical'].includes(v.impact as string)
			)
			const message = seriousOrWorse
				.map(
					(v) =>
						`${v.id}: ${v.help} (${v.impact})\n` +
						v.nodes
							.map((n) => `  - ${n.html}\n    ${n.failureSummary ?? ''}`.trim())
							.join('\n')
				)
				.join('\n\n')
			expect.soft(seriousOrWorse, message).toHaveLength(0)
		})
	}
})


