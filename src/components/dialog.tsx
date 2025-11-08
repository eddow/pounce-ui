import { reactive } from 'mutts/src'
import { bindApp, compose, isElement } from 'pounce-ts'
import { Icon } from './icon'
import './dialog.scss'
import { Variant, variantClass } from './variants'

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
		queueMicrotask(() => {
			state.open = true
			document.documentElement.classList.add('modal-is-open')
			document.documentElement.classList.add('modal-is-opening')
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
