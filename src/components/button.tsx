import { compose } from 'pounce-ts'
import { css } from '../lib/css'
import { Badged } from './badged'
import { Icon } from './icon'
import { Variant, variantClass } from './variants'

css`
.pp-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	margin: 0;
}

.pp-button .pp-button-icon {
	display: inline-flex;
	align-items: center;
}

.pp-button .pp-button-label {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
}

.pp-button-icon-only {
	aspect-ratio: 1;
	padding: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 0;
	max-width: calc(var(--pico-form-element-height, 2.5rem));
	max-height: calc(var(--pico-form-element-height, 2.5rem));
	width: calc(var(--pico-form-element-height, 2.5rem));
	height: calc(var(--pico-form-element-height, 2.5rem));
}

.pp-button-icon-only .pp-button-icon {
	max-width: 1.5rem;
	max-height: 1.5rem;
	flex-shrink: 1;
}

.pp-button-icon-only .pp-button-icon .pure-glyf-icon {
	max-width: 1.5rem;
	max-height: 1.5rem;
}
`

export type ButtonProps = {
	variant?: Variant
	icon?: string | JSX.Element
	iconPosition?: 'start' | 'end'
	el?: JSX.HTMLAttributes<'button'>
	ariaLabel?: string
	children?: JSX.Children
	onClick?: (event: MouseEvent) => void
	tag?: 'button' | 'span' | 'div'
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
	 * <Button badge={<Icon icon={tablerOutlineStar} />}>Favorite</Button>
	 * ```
	 */
	badge?: number | string | JSX.Element
}

export const Button = (props: ButtonProps) => {
	const state = compose(
		{
			variant: 'primary',
			iconPosition: 'start',
			onClick: () => { },
			ariaLabel: undefined as string | undefined,
			tag: 'button' as const,
		},
		props,
		(state) => ({
			get iconElement() {
				return state.icon !== undefined ? (
					<span
						class="pp-button-icon"
						aria-hidden={typeof state.icon === 'string' ? true : undefined}
					>
						{typeof state.icon === 'string' ? <Icon icon={state.icon} size="18px" /> : state.icon}
					</span>
				) : null
			},
			get hasLabel() {
				return state.children && !(Array.isArray(state.children) && state.children.every(e => !!e))
			},
			get isIconOnly() {
				return state.icon && !this.hasLabel
			},
		})
	)

	const buttonElement = (
		<dynamic
			tag={state.tag}
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
		</dynamic>
	)

	// Use Badged wrapper when badge is provided
	if (state.badge !== undefined && state.badge !== null) {
		return <Badged badge={state.badge}>{buttonElement}</Badged>
	}

	return buttonElement
}
