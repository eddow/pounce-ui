import '@picocss/pico/css/pico.min.css'
import { reactive } from 'mutts/src'
import { bindApp, defaulted, isElement } from 'pounce-ts'
import { Icon } from '../icon'
import { Variant, variantClass } from './variants'

export type UIContent = string | JSX.Element
export type DialogVariant = Variant
export type DialogSize = 'sm' | 'md' | 'lg'

export interface DialogButton {
	text: string
	variant?: DialogVariant
	disabled?: boolean
}

export interface DialogOptions<Buttons extends Record<string, UIContent | DialogButton>> {
	title?: UIContent
	message?: UIContent
	// Map of return value -> label/content/spec
	buttons?: Buttons
	default?: keyof Buttons
	size?: DialogSize
	closeOnBackdrop?: boolean
	closeOnEscape?: boolean
	ariaLabel?: string
	className?: string
}

type PendingDialog = {
	options: DialogOptions<any>
	resolve: (value: PropertyKey | null) => void
}

// Default: single action
const okButton: DialogButton = { text: 'Ok', variant: 'primary' }

const state = reactive({
	pending: null as PendingDialog | null,
	open: false,
})

let hostMounted = false
let dialogElement: HTMLElement | undefined
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
	document.documentElement.classList.remove('modal-is-open')
	document.documentElement.classList.remove('modal-is-opening')
	document.documentElement.classList.remove('modal-is-closing')
	const resolve = current.resolve
	state.pending = null
	resolve(value)
}

const Host = () => {
	const onDialogKeyDown = (ev: KeyboardEvent) => {
		if (ev.key === 'Escape') {
			ev.stopPropagation()
			ev.preventDefault()
			if (state.pending?.options.closeOnEscape !== false) closeCurrent(null)
		} else if (ev.key === 'Enter') {
			// Trigger first action for convenience
			ev.stopPropagation()
			ev.preventDefault()
			if (state.pending?.options.default) {
				closeCurrent(state.pending.options.default)
			}
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

	return state.pending ? (
		<dialog
			this={dialogElement}
			open={state.open}
			onClick={onBackdropClick}
			onKeydown={onDialogKeyDown}
			class={[sizeClass, opts?.className]}
			aria-label={opts?.ariaLabel}
			tabIndex={-1}
		>
			<article>
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
						<p>
							<strong>{opts.title}</strong>
						</p>
					</header>
				) : undefined}
				{typeof opts?.message === 'string' ? <p>{opts.message}</p> : opts?.message}
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
			options: defaulted(normalized, {
				closeOnBackdrop: true,
				closeOnEscape: true,
			} as any) as DialogOptions<any>,
			resolve,
		}
		queueMicrotask(() => {
			state.open = true
			document.documentElement.classList.add('modal-is-open')
			document.documentElement.classList.add('modal-is-opening')
			//const target = host.querySelector('[autofocus], [data-initial-focus], input, button, [tabindex]:not([tabindex="-1"])')
			dialogElement?.focus({ preventScroll: true })
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
		let button = isElement(spec) ? (
			spec
		) : (
			<button type="button" class={variantClass(spec.variant ?? 'primary')}>
				{spec.text}
			</button>
		)
		const originalRender = button.render
		button = Object.create(button, {
			render: {
				value: () => {
					let rendered = originalRender()
					if (!Array.isArray(rendered)) rendered = [rendered]
					for (const child of rendered) {
						child.addEventListener('click', () => closeCurrent(key))
					}
					return rendered
				},
			},
		}) satisfies JSX.Element
		return button as JSX.Element
	})
}

// Optional width helpers (Pico handles spacing/looks)
const style = document.createElement('style')
style.textContent = `
.pp-size-sm { width: 22rem; }
.pp-size-md { width: 32rem; }
.pp-size-lg { width: 48rem; }
`
document.head.appendChild(style)
