import { Icon } from './icon'
import { Variant, variantClass } from './variants'
import './radiobutton.scss'
import { compose } from 'pounce-ts'

export type RadioButtonProps<Value = string> = {
	/** Button variant */
	variant?: Variant
	/** Icon name or element */
	icon?: string | JSX.Element
	/** Icon position relative to text */
	iconPosition?: 'start' | 'end'
	/** Value for this radio button */
	value?: Value
	/** 2-way bound: current selected value in the group (checked when group === value) */
	group?: Value
	/** Additional button attributes */
	el?: JSX.HTMLAttributes<'button'>
	/** Button content */
	children?: JSX.Children
	/** Accessible label (required if icon-only) */
	'aria-label'?: string
}

export function RadioButton<Value = string>(props: RadioButtonProps<Value>) {
	const state = compose({ variant: 'primary', iconPosition: 'start' }, props, (state) => ({
		get checked() {
			return state.group !== undefined && state.value !== undefined && state.group === state.value
		},
		get iconElement() {
			return state.icon !== undefined ? (
				<span
					class="pp-radiobutton-icon"
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
	}))

	const handleClick = (e: MouseEvent) => {
		if (state.el?.onClick) {
			;(state.el.onClick as any)(e)
		}
		if (e.defaultPrevented) return
		// 2-way binding: set group = value
		if (state.value !== undefined) {
			state.group = state.value
		}
	}

	return (
		<button
			{...state.el}
			type="button"
			role="radio"
			aria-checked={state.checked}
			class={[
				'pp-radiobutton',
				variantClass(state.variant),
				state.checked ? 'pp-radiobutton-checked' : undefined,
				state.isIconOnly ? 'pp-radiobutton-icon-only' : undefined,
				state.el?.class,
			]}
			onClick={handleClick}
			data-value={state.value}
		>
			{state.iconPosition === 'start' ? state.iconElement : null}
			{state.hasLabel ? <span class="pp-radiobutton-label">{state.children}</span> : state.children}
			{state.iconPosition === 'end' ? state.iconElement : null}
		</button>
	)
}
