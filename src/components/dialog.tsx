import { reactive } from 'mutts/src'
import { bindApp, compose, isElement } from 'pounce-ts'
import { Icon } from './icon'
import { css } from '../lib/css'
import { Variant, variantClass } from './variants'

css`
.pp-size-sm {
	width: 22rem;
}

.pp-size-md {
	width: 32rem;
}

.pp-size-lg {
	width: 48rem;
}

footer > .pp-actions[role='group'] {
	display: flex;
	justify-content: flex-end;
	width: 100%;
}

footer > .pp-actions[role='group'] > * {
	flex: 0 0 auto;
}

footer > .pp-actions[role='group'] button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}

footer > .pp-actions[role='group'] button .pp-button-icon {
	display: inline-flex;
	align-items: center;
}

footer > .pp-actions[role='group'] button .pp-button-label {
	display: inline-flex;
}

.pp-dialog-article .pp-body {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 1rem;
	align-items: start;
	min-width: 0;
}

.pp-dialog-article .pp-body .pp-stamp {
	width: 4rem;
	height: 4rem;
	border-radius: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--pico-muted-border-color, #e5e7eb);
}

.pp-dialog-article .pp-body .pp-stamp .iconify {
	width: 2.25rem;
	height: 2.25rem;
}
`

export type UIContent = string | JSX.Element
export type DialogSize = 'sm' | 'md' | 'lg'

export interface DialogButton {
	text: string
	variant?: Variant
	disabled?: boolean
	icon?: string | JSX.Element
}

export interface DialogOptions<Buttons extends Record<string, UIContent | DialogButton>> {
	title?: UIContent
	message?: UIContent
	// Optional left-side visual stamp (e.g., large icon)
	stamp?: UIContent
	// Map of return value -> label/content/spec
	buttons?: Buttons
	default?: keyof Buttons
	size?: DialogSize
	closeOnBackdrop?: boolean
	closeOnEscape?: boolean
	ariaLabel?: string
	class?: string
}

type PendingDialog = {
	options: DialogOptions<any>
	defaultButton: HTMLElement | undefined
	resolve: (value: PropertyKey | null) => void
}

// Default: single action
const okButton: DialogButton = { text: 'Ok', variant: 'primary' }

const state = reactive({
	pending: null as PendingDialog | null,
	open: false,
})

let hostMounted = false
let dialogElement: HTMLDialogElement | undefined
let lastActiveElement: HTMLElement | null = null
let trapKeydownListener: ((e: KeyboardEvent) => void) | null = null
let trapKeyupListener: ((e: KeyboardEvent) => void) | null = null
function getOrderedTabstops(root: HTMLElement): HTMLElement[] {
	// 1) Header close button (if present)
	const headerClose = (root.querySelector('header .pp-icon-btn') as HTMLElement | null) ?? undefined
	// 2) Footer primary/actions (in DOM order)
	const footerActions = Array.from(
		root.querySelectorAll<HTMLElement>('footer .pp-actions button:not([disabled])')
	)
	// 3) Other focusables in content area (exclude header close and footer actions to avoid dupes)
	const genericSelector = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])',
	].join(', ')
	const all = Array.from(root.querySelectorAll<HTMLElement>(genericSelector))
	const exclusions = new Set<HTMLElement>(footerActions)
	if (headerClose) exclusions.add(headerClose)
	const contentFocusables = all.filter((el) => !exclusions.has(el))
	// 4) Fallback to the dialog element itself
	const result: HTMLElement[] = []
	if (headerClose) result.push(headerClose)
	result.push(...footerActions)
	result.push(...contentFocusables)
	result.push(root)
	return result
}
function attachGlobalTrap() {
	if (trapKeydownListener) return
	trapKeydownListener = (ev: KeyboardEvent) => {
		if (ev.key !== 'Tab') return
		const root = dialogElement
		if (!state.open) return
		// Capture phase trap to win over other handlers; block default always while open
		ev.preventDefault()
		ev.stopPropagation()
		if (!root) {
			// Dialog not yet mounted; defer focusing to next tick
			setTimeout(() => dialogElement?.focus(), 0)
			return
		}
		// Explicit tabstop order
		if (root.tabIndex < 0) root.tabIndex = -1
		const focusables = getOrderedTabstops(root)
		const active = document.activeElement as HTMLElement | null
		const count = focusables.length
		if (count === 0) {
			root.focus()
			return
		}
		// Find current index within list (default to -1 if not in list)
		let idx = active ? focusables.indexOf(active) : -1
		if (ev.shiftKey) {
			idx = idx <= 0 ? count - 1 : idx - 1
		} else {
			idx = idx < 0 || idx === count - 1 ? 0 : idx + 1
		}
		const next = focusables[idx] ?? root
		next.focus()
	}
	document.addEventListener('keydown', trapKeydownListener, true)
	// Reinforce on keyup to handle late focus changes
	trapKeyupListener = (ev: KeyboardEvent) => {
		if (ev.key !== 'Tab' || !state.open) return
		ev.preventDefault()
		ev.stopPropagation()
		const root = dialogElement
		if (!root) return
		const focusables = getOrderedTabstops(root)
		const target = focusables[0] ?? root
		target.focus()
	}
	document.addEventListener('keyup', trapKeyupListener, true)
}
function detachGlobalTrap() {
	if (trapKeydownListener) {
		document.removeEventListener('keydown', trapKeydownListener, true)
		trapKeydownListener = null
	}
	if (trapKeyupListener) {
		document.removeEventListener('keyup', trapKeyupListener, true)
		trapKeyupListener = null
	}
}
function ensureHostMounted() {
	if (hostMounted) return
	hostMounted = true
	const host = document.createElement('div')
	document.body.appendChild(host)
	bindApp(<Host />, host)
}

function closeCurrent(value: PropertyKey | null) {
	const current = state.pending
	if (!current) return
	state.open = false
	detachGlobalTrap()
	// close native modal if present
	try {
		dialogElement?.close()
	} catch (error) {
		console.error('Failed to close native dialog:', error)
	}
	// re-enable app interactions while dialog is closed
	document.querySelector('.demo-app')?.removeAttribute('inert')
	document.documentElement.classList.remove('modal-is-open')
	document.documentElement.classList.remove('modal-is-opening')
	document.documentElement.classList.remove('modal-is-closing')
	const resolve = current.resolve
	state.pending = null
	resolve(value)
	// restore focus to the element that opened the dialog
	if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
		try {
			lastActiveElement.focus()
		} catch (error) {
			console.error('Failed to restore focus:', error)
		}
	}
	lastActiveElement = null
}

const Host = () => {
	const onDialogKeyDown = (ev: KeyboardEvent) => {
		if (ev.key === 'Escape') {
			ev.stopPropagation()
			if (state.pending?.options.closeOnEscape !== false) {
				ev.preventDefault()
				closeCurrent(null)
			}
		} else if (ev.key === 'Enter') {
			// Trigger default action, or fallback to first enabled button
			ev.stopPropagation()
			const opts = state.pending?.options
			if (!opts) return
			let chosenKey: PropertyKey | undefined
			if (opts.default) {
				const defaultBtn = state.pending?.defaultButton as HTMLButtonElement | undefined
				if (!defaultBtn || defaultBtn.disabled !== true) {
					chosenKey = opts.default
				}
			}
			if (chosenKey === undefined) {
				const first = firstEnabledButtonKey(opts)
				if (first !== undefined) chosenKey = first
			}
			if (chosenKey !== undefined) {
				ev.preventDefault()
				closeCurrent(chosenKey)
			}
		} else if (ev.key === 'Tab') {
			// Basic focus trap within the dialog
			// Capture-phase handler already cycles focus; just block bubbling here
			ev.preventDefault()
			ev.stopPropagation()
			const root = dialogElement
			if (!root) return
			// Do nothing else here; capture-phase trap handled cycling
		}
	}

	const onBackdropClick = (ev: MouseEvent) => {
		if (!state.pending?.options.closeOnBackdrop) return
		const target = ev.target as HTMLElement
		if (target instanceof HTMLDialogElement) closeCurrent(null)
	}

	const opts = state.pending?.options
	const sizeClass =
		opts?.size === 'sm' ? 'pp-size-sm' : opts?.size === 'lg' ? 'pp-size-lg' : 'pp-size-md'

	const hasTitle = Boolean(opts?.title)
	const titleId = 'pp-dialog-title'

	return state.pending ? (
		<dialog
			this={dialogElement as HTMLDialogElement}
			open={state.open}
			onClick={onBackdropClick}
			onKeydown={onDialogKeyDown}
			class={[sizeClass, opts?.class]}
			aria-modal={true}
			aria-labelledby={hasTitle ? titleId : undefined}
			aria-label={!hasTitle ? opts?.ariaLabel : undefined}
			tabIndex={-1}
		>
			<article class="pp-dialog-article">
				{opts?.title ? (
					<header>
						<button
							aria-label="Close"
							class="pp-icon-btn"
							style="float: right;"
							onClick={() => closeCurrent(null)}
						>
							<Icon name="mdi:close" />
						</button>
						<h3 id={titleId}>{opts.title}</h3>
					</header>
				) : undefined}
				<main class="pp-body">
					{opts?.stamp ? (
						<aside class="pp-stamp" aria-hidden="true">
							{typeof opts.stamp === 'string' ? <Icon name={opts.stamp} size="48px" /> : opts.stamp}
						</aside>
					) : undefined}
					<div class="pp-content">
						{typeof opts?.message === 'string' ? <p>{opts.message}</p> : opts?.message}
					</div>
				</main>
				<footer>
					<div role="group" class="pp-actions">
						{renderButtons(opts)}
					</div>
				</footer>
			</article>
		</dialog>
	) : null
}

function isUIContent(value: unknown): value is UIContent {
	return typeof value === 'string' || isElement(value)
}
// reserved for future variants

export function dialog<
	Buttons extends Record<string, UIContent | DialogButton> = { ok: DialogButton },
>(options: DialogOptions<Buttons> | UIContent): Promise<keyof Buttons | null> {
	ensureHostMounted()
	return new Promise<PropertyKey | null>((resolve) => {
		const normalized: DialogOptions<Buttons> = isUIContent(options)
			? { message: options }
			: (options as DialogOptions<Buttons>)

		state.pending = {
			options: compose(
				{
					closeOnBackdrop: true,
					closeOnEscape: true,
				},
				normalized
			) as DialogOptions<any>,
			defaultButton: undefined,
			resolve,
		}
		// mark as open immediately so the global trap can intercept early Tabs
		state.open = true
		attachGlobalTrap()
		queueMicrotask(() => {
			// remember the element that had focus before opening
			lastActiveElement =
				(document.activeElement as HTMLElement | null) ?? (document.body as HTMLElement)
			document.documentElement.classList.add('modal-is-open')
			document.documentElement.classList.add('modal-is-opening')
			// disable app interactions while modal is open
			document.querySelector('.demo-app')?.setAttribute('inert', '')
			// prefer native modal behavior for focus trapping
			try {
				if (dialogElement && typeof dialogElement.showModal === 'function') {
					if (!dialogElement.open) dialogElement.showModal()
				}
			} catch (error) {
				console.error('Failed to show native modal:', error)
			}
			// Deterministic initial focus (header close → footer actions → content → dialog)
			// If dialogElement isn't available yet, defer focus to next tick
			if (dialogElement) {
				const ordered = getOrderedTabstops(dialogElement)
				const initial = ordered[0] ?? dialogElement
				try {
					initial.focus({ preventScroll: true })
				} catch (error) {
					console.error('Failed to set initial focus:', error)
				}
			} else {
				// Element not yet mounted; defer focusing to next tick
				setTimeout(() => {
					if (dialogElement) {
						const ordered = getOrderedTabstops(dialogElement)
						const initial = ordered[0] ?? dialogElement
						try {
							initial.focus({ preventScroll: true })
						} catch (error) {
							console.error('Failed to set deferred focus:', error)
						}
					}
				}, 0)
			}
			setTimeout(() => {
				document.documentElement.classList.remove('modal-is-opening')
			}, 150)
		})
	}) as Promise<keyof Buttons | null>
}

//

function renderButtons<Buttons extends Record<string, UIContent | DialogButton>>(
	opts?: DialogOptions<Buttons>
) {
	const entries = opts?.buttons
		? Object.entries(opts.buttons)
		: ([['ok', okButton]] satisfies [string, DialogButton][])
	return entries.map(([key, spec]) => {
		if (typeof spec === 'string') spec = { text: spec } satisfies DialogButton
		let button: JSX.Element
		if (isElement(spec)) {
			button = spec
		} else {
			const icon = spec.icon ? (
				<span class="pp-button-icon" aria-hidden={typeof spec.icon === 'string' ? true : undefined}>
					{typeof spec.icon === 'string' ? <Icon name={spec.icon} /> : spec.icon}
				</span>
			) : undefined
			button = (
				<button
					type="button"
					class={variantClass(spec.variant ?? 'primary')}
					disabled={spec.disabled}
				>
					{icon}
					<span class="pp-button-label">{spec.text}</span>
				</button>
			)
		}
		const originalRender = button.render
		button = Object.create(button, {
			render: {
				value: () => {
					let rendered = originalRender()
					if (!Array.isArray(rendered)) rendered = [rendered]
					for (const child of rendered) {
						if (child instanceof HTMLButtonElement) {
							child.addEventListener('click', () => closeCurrent(key))
							if (key === opts?.default && state.pending) state.pending.defaultButton = child
						}
					}
					return rendered
				},
			},
		}) satisfies JSX.Element
		return button as JSX.Element
	})
}

// Determine the first enabled button key for Enter fallback
function firstEnabledButtonKey<Buttons extends Record<string, UIContent | DialogButton>>(
	opts: DialogOptions<Buttons>
): PropertyKey | undefined {
	const entries = opts.buttons
		? Object.entries(opts.buttons)
		: ([['ok', okButton]] satisfies [string, DialogButton][])
	for (const [key, spec] of entries) {
		if (typeof spec === 'string') return key
		if (isElement(spec)) return key
		if (!spec.disabled) return key
	}
	return undefined
}

export async function confirm(params: {
	title?: UIContent
	message?: UIContent
	okText?: string
	cancelText?: string
	okVariant?: Variant
}): Promise<boolean> {
	const res = await dialog({
		title: params.title,
		message: params.message,
		buttons: {
			cancel: params.cancelText ?? 'Cancel',
			ok: { text: params.okText ?? 'Ok', variant: params.okVariant ?? 'primary' },
		},
		default: 'ok',
	})
	return res === 'ok'
}

// Width helpers are defined in dialog.scss
