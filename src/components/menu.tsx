import { A } from '../lib/router'

export interface MenuProps {
	summary: JSX.Element | string
	children: JSX.Element | JSX.Element[]
	class?: string
}

export interface MenuItemProps {
	href: string
	children: JSX.Element | string
}

function isDevEnv(): boolean {
	// Prefer NODE_ENV when available
	if (typeof process !== 'undefined' && process.env && typeof process.env.NODE_ENV === 'string') {
		return process.env.NODE_ENV !== 'production'
	}
	// In browsers during development, assume dev when NODE_ENV is not present
	if (typeof document !== 'undefined') return true
	return true
}

function reportA11yIssue(message: string) {
	const strict = (globalThis as any).PounceA11y?.STRICT === true
	const prefix = '[pounce-ui/menu a11y]'
	if (strict) throw new Error(`${prefix} ${message}`)
	console.warn(`${prefix} ${message}`)
}

function checkMenuStructure(detailsEl: HTMLDetailsElement) {
	const summary = detailsEl.querySelector('summary')
	const list = detailsEl.querySelector('ul')
	if (!summary) reportA11yIssue('Missing <summary> inside <details> for Menu.')
	if (!list) reportA11yIssue('Missing <ul> list inside Menu.')
	if (list) {
		// Validate list roles and items
		if (list.getAttribute('role') !== 'menu') {
			reportA11yIssue('Menu list should have role="menu".')
		}
		const items = Array.from(list.children)
		for (const li of items) {
			if (li.getAttribute('role') !== 'none') {
				reportA11yIssue('Menu items should be wrapped in <li role="none">.')
			}
			const actionable = li.querySelector('a,button,[role="menuitem"]')
			if (!actionable) {
				reportA11yIssue(
					'Each menu item should contain an actionable element (anchor, button or role="menuitem").'
				)
			}
		}
	}
	// Optional: reflect open state on summary aria-expanded if present
	if (summary) {
		if (summary.hasAttribute('aria-expanded')) {
			summary.setAttribute('aria-expanded', String(detailsEl.open))
		}
	}
}

const MenuComponent = (props: MenuProps) => {
	let detailsEl: HTMLDetailsElement | undefined
	// Schedule a structure check after render (dev only)
	if (isDevEnv()) {
		queueMicrotask(() => {
			if (detailsEl) checkMenuStructure(detailsEl)
		})
	}
	return (
		<details
			this={detailsEl}
			class={props.class ?? 'dropdown'}
			onClick={(e) => {
				const target = e.target as HTMLElement
				if (target.closest('a')) {
					;(e.currentTarget as HTMLDetailsElement).removeAttribute('open')
				}
			}}
			onToggle={(e) => {
				if (!isDevEnv()) return
				checkMenuStructure(e.currentTarget as HTMLDetailsElement)
			}}
		>
			<summary aria-haspopup="menu">{props.summary}</summary>
			<ul role="menu">
				{Array.isArray(props.children) ? (
					<for if={Array.isArray(props.children)} each={props.children}>
						{(child) => <li role="none">{child}</li>}
					</for>
				) : (
					<li role="none">{props.children}</li>
				)}
			</ul>
		</details>
	)
}

const MenuItem = (props: MenuItemProps) => {
	return (
		<A href={props.href} role="menuitem">
			{props.children}
		</A>
	)
}

export const Menu = Object.assign(MenuComponent, {
	Item: MenuItem,
})
