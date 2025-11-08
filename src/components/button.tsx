import { Icon } from './icon'
import { Variant, variantClass } from './variants'
import './button.scss'
import { compose } from 'pounce-ts'

export type ButtonProps = JSX.IntrinsicElements['button'] & {
	variant?: Variant
	icon?: string | JSX.Element
	iconPosition?: 'start' | 'end'
}

export const Button = (props: ButtonProps) => {
	const state = compose(
		{ variant: 'primary', iconPosition: 'start' },
		props,
		({ variant, icon, iconPosition, children, class: className, ...htmlAttrs }) => ({
			htmlAttrs,
			iconElement:
				icon !== undefined ? (
					<span class="pp-button-icon" aria-hidden={typeof icon === 'string' ? true : undefined}>
						{typeof icon === 'string' ? <Icon name={icon} size="18px" /> : icon}
					</span>
				) : null,
		})
	)
	return (
		<button class={['pp-button', variantClass(state.variant), state.class]} {...state.htmlAttrs}>
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
