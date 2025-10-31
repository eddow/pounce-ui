import { computed, reactive } from 'mutts/src'
import { array, bindApp, defaulted, isElement } from 'pounce-ts'
import { Icon } from './icon'
import './toast.scss'
import type { Variant } from './variants'

export type ToastContent = string | JSX.Element

export interface ToastOptions {
	content: ToastContent
	variant?: Variant
	durationMs?: number
	dismissible?: boolean
	ariaRole?: 'status' | 'alert'
	class?: string
}

type ToastItem = {
	options: Required<Omit<ToastOptions, 'class'>> & { class?: string }
	closing: boolean
	close(): void
}

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
export const toastConfig: {
	defaultDurationMs: number
	position: ToastPosition
	template: (item: ToastItem) => JSX.Element
	variantIcon: Record<Variant, string>
} = {
	defaultDurationMs: 3500,
	position: 'bottom-right',
	template: (item: ToastItem) => (
		<>
			<aside class="pp-toast-icon" aria-hidden="true">
				<Icon name={toastConfig.variantIcon[item.options.variant]} size="20px" />
			</aside>
			<div class="pp-toast-content">
				{typeof item.options.content === 'string' ? (
					<p>{item.options.content}</p>
				) : (
					item.options.content
				)}
			</div>
			<button
				if={item.options.dismissible}
				class="pp-icon-btn secondary"
				aria-label="Dismiss"
				onClick={() => closeToast(item)}
			>
				<Icon name="mdi:close" />
			</button>
		</>
	),
	variantIcon: {
		primary: 'mdi:information',
		secondary: 'mdi:information',
		contrast: 'mdi:information',
		success: 'mdi:check-circle',
		warning: 'mdi:alert',
		danger: 'mdi:alert-octagon',
	},
}

const state = reactive({
	items: [] as ToastItem[],
})

let hostMounted = false

function ensureHostMounted() {
	if (hostMounted) return
	hostMounted = true
	const host = document.createElement('div')
	document.body.appendChild(host)
	bindApp(<Host />, host)
}

function closeToast(item: ToastItem) {
	if (item.closing) return
	item.closing = true
	// allow CSS closing animation
	setTimeout(() => array.remove(state.items, item), 160)
}

const Host = () => (
	<div class={[`pp-toasts`, toastConfig.position]} aria-live="polite" aria-atomic="false">
		{computed.memo(state.items, (t) => (
			<ToastItemView item={t} />
		))}
	</div>
)

const ToastItemView = ({ item }: { item: ToastItem }) => {
	let remaining = item.options.durationMs
	let timer: number | undefined
	let lastStart = 0

	const startTimer = () => {
		if (remaining <= 0 || item.options.durationMs <= 0) return
		lastStart = performance.now()
		timer = window.setTimeout(() => closeToast(item), remaining)
	}
	const pauseTimer = () => {
		if (timer !== undefined) {
			window.clearTimeout(timer)
			timer = undefined
			remaining -= performance.now() - lastStart
		}
	}

	queueMicrotask(() => startTimer())

	const role = () =>
		item.options.ariaRole ?? (item.options.variant === 'danger' ? 'alert' : 'status')

	return (
		<div
			role={role()}
			class={[
				'pp-toast',
				item.options.class,
				item.closing ? 'pp-toast-closing' : undefined,
				item.options.variant,
			]}
			onMouseenter={() => {
				pauseTimer()
			}}
			onMouseleave={() => {
				startTimer()
			}}
		>
			{toastConfig.template(item)}
		</div>
	)
}

export const toast = Object.assign(
	(contentOrOptions: ToastContent | ToastOptions): ToastItem => {
		ensureHostMounted()
		const options: ToastOptions =
			isElement(contentOrOptions) || typeof contentOrOptions === 'string'
				? { content: contentOrOptions }
				: contentOrOptions
		const item: ToastItem = {
			options: defaulted(options, {
				variant: 'secondary',
				durationMs: toastConfig.defaultDurationMs,
				dismissible: true,
				ariaRole: 'status',
			}),
			closing: false,
			close: () => closeToast(item),
		}
		state.items.push(item)
		return item
	},
	{
		success: (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
			toast({ content, variant: 'success', ...opts }),
		warning: (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
			toast({ content, variant: 'warning', ...opts }),
		danger: (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
			toast({ content, variant: 'danger', ...opts }),
		info: (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
			toast({ content, variant: 'primary', ...opts }),
	}
)
