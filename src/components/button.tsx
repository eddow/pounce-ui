import { Icon } from './icon'
import { Variant, variantClass } from './variants'
import './button.scss'
import { compose } from 'pounce-ts'
import { Badged } from './badged'

export type ButtonProps = {
	variant?: Variant
	icon?: string | JSX.Element
	iconPosition?: 'start' | 'end'
	el?: JSX.HTMLAttributes<'button'>
	ariaLabel?: string
	children?: JSX.Children
	onClick?: (event: MouseEvent) => void
	/**
	 * Badge to display on the button (e.g., notification count).
	 * Can be a number, string, or JSX element.
	 *
	 * The badge is positioned at the top-right corner of the button using the Badged component.
	 *
	 * @example
	 * ```tsx
	 * <Button badge={5}>Inbox</Button>
	 * <Button badge="99+">Messages</Button>
	 * <Button badge={<Icon name="mdi:star" />}>Favorite</Button>
	 * ```
	 */
	badge?: number | string | JSX.Element
}

export const Button = (props: ButtonProps) => {
	const state = compose(
		{
			variant: 'primary',
			iconPosition: 'start',
			onClick: () => {},
			ariaLabel: undefined as string | undefined,
		},
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

	const buttonElement = (
		<button
			{...state.el}
			onClick={state.onClick}
			aria-label={
				state.isIconOnly
					? (state.ariaLabel ?? state.el?.['aria-label'] ?? 'Action')
					: (state.ariaLabel ?? (state.el as any)?.['aria-label'])
			}
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

	// Use Badged wrapper when badge is provided
	if (state.badge !== undefined && state.badge !== null) {
		return <Badged badge={state.badge}>{buttonElement}</Badged>
	}

	return buttonElement
}
