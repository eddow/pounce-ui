/**
 * ButtonGroup provides keyboard navigation for buttons in group containers.
 * Buttons in ButtonGroup, Toolbar, or elements with role="group" can be navigated
 * with arrow keys. Tab exits the group normally.
 *
 * Uses DOM traversal - no need for data attributes.
 */

import './buttongroup.scss'
import { compose } from 'pounce-ts'

// Global keyboard handler - set up once
let globalHandlerSetup = false

function setupGlobalHandler() {
	if (globalHandlerSetup) return
	globalHandlerSetup = true

	document.addEventListener('keydown', (e: KeyboardEvent) => {
		// Don't intercept Tab - let it work normally for tab navigation
		if (e.key === 'Tab') return

		const target = e.target as HTMLElement
		const button = target.closest('button') as HTMLButtonElement | null

		if (!button) return

		// Only handle buttons that are in a group container
		const groupContainer = button.closest(
			'.pp-buttongroup, .pp-toolbar, [role="group"], [role="radiogroup"], [role="toolbar"]'
		) as HTMLElement | null

		if (!groupContainer) return

		// Handle keyboard navigation for all buttons in groups
		handleButtonGroupNavigation(e, button, groupContainer)
	})
}

/**
 * Handle keyboard navigation for buttons in a group container using DOM traversal
 */
function handleButtonGroupNavigation(
	e: KeyboardEvent,
	button: HTMLButtonElement,
	groupContainer: HTMLElement
) {
	// Only handle arrow keys
	if (
		e.key !== 'ArrowLeft' &&
		e.key !== 'ArrowRight' &&
		e.key !== 'ArrowUp' &&
		e.key !== 'ArrowDown'
	) {
		return
	}

	// Find all buttons in the same container
	// For radio groups, only include radio buttons; otherwise include all buttons
	const isRadioGroup = groupContainer.getAttribute('role') === 'radiogroup'
	const selector = isRadioGroup ? 'button[role="radio"]' : 'button'

	const groupButtons = Array.from(groupContainer.querySelectorAll(selector)) as HTMLButtonElement[]

	// Filter out disabled buttons
	const enabledButtons = groupButtons.filter((btn) => !btn.disabled)

	if (enabledButtons.length === 0) return

	// Determine orientation based on container direction
	const isVertical =
		groupContainer.classList.contains('pp-buttongroup-vertical') ||
		groupContainer.classList.contains('pp-toolbar-vertical')
	const isHorizontal = !isVertical

	// Only handle if it's a navigation key in the correct direction
	if (
		(isHorizontal && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
		(isVertical && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))
	) {
		e.preventDefault()
		const isNext = (isHorizontal && e.key === 'ArrowRight') || (isVertical && e.key === 'ArrowDown')
		navigateToButtonInGroup(enabledButtons, button, isNext)
	}
}

/**
 * Navigate to the next/previous button in an array
 */
function navigateToButtonInGroup(
	allButtons: HTMLButtonElement[],
	currentButton: HTMLButtonElement,
	forward: boolean
) {
	const currentIndex = allButtons.indexOf(currentButton)
	if (currentIndex === -1) return

	let nextIndex: number
	if (forward) {
		nextIndex = currentIndex + 1 >= allButtons.length ? 0 : currentIndex + 1
	} else {
		nextIndex = currentIndex - 1 < 0 ? allButtons.length - 1 : currentIndex - 1
	}

	const nextButton = allButtons[nextIndex]
	if (nextButton) {
		nextButton.focus()
	}
}

/**
 * Get all buttons in a group container (useful for finding related buttons)
 * @param container - The group container element (ButtonGroup, Toolbar, etc.)
 * @param filterRole - Optional role filter (e.g., 'radio' for radio buttons only)
 */
export function getGroupButtons(container: HTMLElement, filterRole?: string): HTMLButtonElement[] {
	const selector = filterRole ? `button[role="${filterRole}"]` : 'button'
	return Array.from(container.querySelectorAll(selector)) as HTMLButtonElement[]
}

// Initialize global handler when module loads
if (typeof document !== 'undefined') {
	// Use queueMicrotask to ensure DOM is ready
	queueMicrotask(() => {
		setupGlobalHandler()
	})
}

// Visual ButtonGroup component
export type ButtonGroupProps = {
	/** Group children */
	children?: JSX.Children
	/** Additional CSS classes */
	class?: string
	/** Inline styles */
	style?: string
	/** Orientation */
	orientation?: 'horizontal' | 'vertical'
}

export const ButtonGroup = (props: ButtonGroupProps) => {
	const state = compose({ orientation: 'horizontal' }, props)

	return (
		<div
			class={['pp-buttongroup', `pp-buttongroup-${state.orientation}`, state.class]}
			role="group"
			style={state.style}
		>
			{state.children}
		</div>
	)
}
