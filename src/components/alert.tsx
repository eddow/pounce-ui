import { compose } from 'pounce-ts'
import { Icon } from './icon'
import type { Variant } from './variants'
import './alert.scss'

const alertIcons: Record<Variant, string> = {
	primary: 'mdi:information-outline',
	secondary: 'mdi:bell-outline',
	contrast: 'mdi:brightness-7',
	success: 'mdi:check-circle-outline',
	warning: 'mdi:alert-circle-outline',
	danger: 'mdi:alert-octagon-outline',
}

export type AlertProps = {
	variant?: Variant
	title?: string | JSX.Element
	icon?: string | JSX.Element | false
	dismissible?: boolean
	dismissLabel?: string
	onDismiss?: () => void
	role?: 'status' | 'alert'
	el?: JSX.GlobalHTMLAttributes
	children?: JSX.Children
}

export const Alert = (props: AlertProps) => {
	const state = compose({ variant: 'primary', dismissible: false, open: true }, props, (state) => ({
		get chosenIcon() {
			return state.icon === undefined ? alertIcons[state.variant] : state.icon
		},
		get role() {
			return state.role ?? (state.variant === 'danger' ? 'alert' : 'status')
		},
	}))
	function close() {
		state.open = false
		props.onDismiss?.()
	}

	return (
		<div
			if={state.open}
			role={state.role}
			{...state.el}
			class={[
				'pp-alert',
				`pp-alert-${state.variant}`,
				state.dismissible ? 'pp-alert-dismissible' : undefined,
				state.el?.class,
			]}
		>
			<span class="pp-alert-icon" if={state.chosenIcon} aria-hidden="true">
				{typeof state.chosenIcon === 'string' ? (
					<Icon name={state.chosenIcon} size="20px" />
				) : (
					state.chosenIcon
				)}
			</span>
			<div class="pp-alert-body">
				<strong if={state.title}>{state.title}</strong>
				<div if={state.children} class="pp-alert-content">
					{state.children}
				</div>
			</div>
			<button
				if={state.dismissible}
				type="button"
				class="pp-alert-close"
				aria-label={state.dismissLabel ?? 'Dismiss'}
				onClick={close}
			>
				<Icon name="mdi:close" size="18px" />
			</button>
		</div>
	)
}
