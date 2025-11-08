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

export type AlertProps = JSX.IntrinsicElements['div'] & {
	variant?: Variant
	title?: string | JSX.Element
	icon?: string | JSX.Element | false
	dismissible?: boolean
	dismissLabel?: string
	onDismiss?: () => void
	role?: 'status' | 'alert'
}

export const Alert = (props: AlertProps) => {
	const state = compose(
		{ variant: 'primary', dismissible: false },
		props,
		({
			variant,
			title,
			icon,
			dismissible,
			dismissLabel,
			onDismiss,
			role,
			class: className,
			children,
			...htmlAttrs
		}) => ({
			htmlAttrs,
			chosenIcon: icon === undefined ? alertIcons[variant] : icon,
			role: props.role ?? (props.variant === 'danger' ? 'alert' : 'status'),
		}),
		{ open: true }
	)
	function close() {
		state.open = false
		props.onDismiss?.()
	}

	return (
		<div
			if={state.open}
			role={state.role}
			class={[
				'pp-alert',
				`pp-alert-${state.variant}`,
				state.dismissible ? 'pp-alert-dismissible' : undefined,
				state.class,
			]}
			{...state.htmlAttrs}
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
