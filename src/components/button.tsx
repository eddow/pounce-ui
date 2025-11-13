import { Icon } from './icon'
import { Variant, variantClass } from './variants'
import './button.scss'
import { compose } from 'pounce-ts'

export type ButtonProps = {
	variant?: Variant
	icon?: string | JSX.Element
	iconPosition?: 'start' | 'end'
	el?: JSX.HTMLAttributes<'button'>
	children?: JSX.Child
}

export const Button = (props: ButtonProps) => {
	const state = compose({ variant: 'primary', iconPosition: 'start' }, props, (state) => ({
		iconElement:
			state.icon !== undefined ? (
				<span
					class="pp-button-icon"
					aria-hidden={typeof state.icon === 'string' ? true : undefined}
				>
					{typeof state.icon === 'string' ? <Icon name={state.icon} size="18px" /> : state.icon}
				</span>
			) : null,
	}))
	return (
		<button {...state.el} class={['pp-button', variantClass(state.variant), state.el?.class]}>
			{state.iconPosition === 'start' ? state.iconElement : null}
			{state.children && !(Array.isArray(state.children) && state.children.length === 0) ? (
				<span class="pp-button-label">{state.children}</span>
			) : (
				state.children
			)}
			{state.iconPosition === 'end' ? state.iconElement : null}
		</button>
	)
}
