import { computed, reactive } from 'mutts/src'
import { bindApp, defaulted, isElement } from 'pounce-ts'
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
	id: number
	options: Required<Omit<ToastOptions, 'class'>> & { class?: string }
	closing: boolean
}

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
export const toastConfig: { defaultDurationMs: number; position: ToastPosition } = {
	defaultDurationMs: 3500,
	position: 'bottom-right',
}

const state = reactive({
	items: [] as ToastItem[],
})

let hostMounted = false
let idSeq = 0

function ensureHostMounted() {
	if (hostMounted) return
	hostMounted = true
	const host = document.createElement('div')
	document.body.appendChild(host)
	bindApp(<Host />, host)
}

function removeToast(id: number) {
	state.items = state.items.filter((t) => t.id !== id)
}

function closeToast(id: number) {
	const t = state.items.find((x) => x.id === id)
	if (!t || t.closing) return
	t.closing = true
	// allow CSS closing animation
	setTimeout(() => removeToast(id), 160)
}


const Host = () => (
	<div class={[`pp-toasts`, toastConfig.position]} aria-live="polite" aria-atomic="false">
		{computed.memo(state.items, (t) => (
			<ToastItemView item={t} />
		))}
	</div>
)

const variantIcon: Record<Variant, string> = {
    primary: 'mdi:information',
    secondary: 'mdi:information',
    contrast: 'mdi:information',
    success: 'mdi:check-circle',
    warning: 'mdi:alert',
    danger: 'mdi:alert-octagon',
}

const ToastItemView = ({ item }: { item: ToastItem }) => {
	let remaining = item.options.durationMs
	let timer: number | undefined
	let lastStart = 0

	const startTimer = () => {
		if (remaining <= 0 || item.options.durationMs <= 0) return
		lastStart = performance.now()
		timer = window.setTimeout(() => closeToast(item.id), remaining)
	}
	const pauseTimer = () => {
		if (timer !== undefined) {
			window.clearTimeout(timer)
			timer = undefined
			remaining -= performance.now() - lastStart
		}
	}

	queueMicrotask(() => startTimer())

	const role = item.options.ariaRole ?? (item.options.variant === 'danger' ? 'alert' : 'status')
	const iconName = variantIcon[item.options.variant]

	return (
		<div
			role={role}
			class={[
				'pp-toast',
				item.options.class,
				item.closing ? 'pp-toast-closing' : undefined,
				item.options.variant && item.options.variant !== 'primary' ? item.options.variant : undefined,
			]}
			onMouseenter={() => {
				pauseTimer()
			}}
			onMouseleave={() => {
				startTimer()
			}}
		>
			<aside class="pp-toast-icon" aria-hidden="true">
				<Icon name={iconName} size="20px" />
			</aside>
			<div class="pp-toast-content">
				{typeof item.options.content === 'string' ? <p>{item.options.content}</p> : item.options.content}
			</div>
			{item.options.dismissible ? (
				<button class="pp-icon-btn secondary" aria-label="Dismiss" onClick={() => closeToast(item.id)}>
					<Icon name="mdi:close" />
				</button>
			) : undefined}
		</div>
	)
}

export function toast(contentOrOptions: ToastContent | ToastOptions): number {
	ensureHostMounted()
	const options: ToastOptions = isElement(contentOrOptions) || typeof contentOrOptions === 'string'
		? { content: contentOrOptions }
		: contentOrOptions
	const item: ToastItem = {
		id: ++idSeq,
		options: defaulted(options, {
			variant: 'primary',
			durationMs: toastConfig.defaultDurationMs,
			dismissible: true,
			ariaRole: 'status',
		}),
		closing: false,
	}
	state.items = [...state.items, item]
	return item.id
}

export const toastSuccess = (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
	toast({ content, variant: 'success', ...opts })
export const toastWarning = (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
	toast({ content, variant: 'warning', ...opts })
export const toastDanger = (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
	toast({ content, variant: 'danger', ...opts })
export const toastInfo = (content: ToastContent, opts?: Omit<ToastOptions, 'content' | 'variant'>) =>
	toast({ content, variant: 'primary', ...opts })

export const dismissToast = (id: number) => closeToast(id)
