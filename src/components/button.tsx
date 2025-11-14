import { Icon } from './icon'
import { Variant, variantClass } from './variants'
import './button.scss'
import { compose } from 'pounce-ts'

export type ButtonProps = {
	variant?: Variant
	icon?: string | JSX.Element
	iconPosition?: 'start' | 'end'
	el?: JSX.HTMLAttributes<'button'>
	children?: JSX.Children
	onClick?: (event: MouseEvent) => void
}

export const Button = (props: ButtonProps) => {
	const state = compose(
		{ variant: 'primary', iconPosition: 'start', onClick: () => {} },
		props,
		(state) => ({
			get iconElement() {
				return state.icon !== undefined ? (
					<span
						class="pp-button-icon"
						aria-hidden={typeof state.icon === 'string' ? true : undefined}
					>
						{typeof state.icon === 'string' ? <Icon name={state.icon} size="18px" /> : state.icon}
					</span>
				) : null
			},
			get hasLabel() {
				return state.children && !(Array.isArray(state.children) && state.children.length === 0)
			},
			get isIconOnly() {
				return state.icon && !this.hasLabel
			},
		})
	)

	return (
		<button
			{...state.el}
			onClick={state.onClick}
			class={[
				'pp-button',
				variantClass(state.variant),
				state.isIconOnly ? 'pp-button-icon-only' : undefined,
				state.el?.class,
			]}
		>
			{state.iconPosition === 'start' ? state.iconElement : null}
			{state.hasLabel ? <span class="pp-button-label">{state.children}</span> : state.children}
			{state.iconPosition === 'end' ? state.iconElement : null}
		</button>
	)
}
