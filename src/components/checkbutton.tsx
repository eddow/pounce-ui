import { Icon } from './icon'
import { Variant, variantClass } from './variants'
import './checkbutton.scss'
import { compose } from 'pounce-ts'

export type CheckButtonProps = {
	/** Button variant */
	variant?: Variant
	/** Icon name or element */
	icon?: string | JSX.Element
	/** Icon position relative to text */
	iconPosition?: 'start' | 'end'
	/** Whether the button is checked/active */
	checked?: boolean
	/** Event handler for checked state changes */
	onCheckedChange?: (checked: boolean) => void
	/** Additional button attributes */
	el?: JSX.HTMLAttributes<'button'>
	/** Button content */
	children?: JSX.Children
	/** Accessible label (required if icon-only) */
	'aria-label'?: string
}

export const CheckButton = (props: CheckButtonProps) => {
	const state = compose(
		{ variant: 'primary', iconPosition: 'start', checked: false },
		props,
		(state) => ({
			iconElement:
				state.icon !== undefined ? (
					<span
						class="pp-checkbutton-icon"
						aria-hidden={typeof state.icon === 'string' ? true : undefined}
					>
						{typeof state.icon === 'string' ? <Icon name={state.icon} size="18px" /> : state.icon}
					</span>
				) : null,
		})
	)

	const handleClick = (e: MouseEvent) => {
		if (state.el?.onClick) {
			;(state.el.onClick as any)(e)
		}
		if (e.defaultPrevented) return
		state.checked = !state.checked
		if (state.onCheckedChange) {
			state.onCheckedChange(!state.checked)
		}
	}

	const hasLabel = state.children && !(Array.isArray(state.children) && state.children.length === 0)
	const isIconOnly = state.icon && !hasLabel

	return (
		<button
			{...state.el}
			type="button"
			role="checkbox"
			aria-checked={`${state.checked ?? false}`}
			aria-label={isIconOnly ? (props['aria-label'] ?? 'Toggle') : props['aria-label']}
			class={[
				'pp-checkbutton',
				variantClass(state.variant),
				state.checked ? 'pp-checkbutton-checked' : undefined,
				isIconOnly ? 'pp-checkbutton-icon-only' : undefined,
				state.el?.class,
			]}
			onClick={handleClick}
		>
			{state.iconPosition === 'start' ? state.iconElement : null}
			{hasLabel ? <span class="pp-checkbutton-label">{state.children}</span> : state.children}
			{state.iconPosition === 'end' ? state.iconElement : null}
		</button>
	)
}
