import { compose } from 'pounce-ts'
import { Icon } from './icon'
import type { Variant } from './variants'
import { variantClass } from './variants'
import './status.scss'

type StatusVariant = Variant | 'primary'

function variantKey(variant?: Variant): StatusVariant {
	if (!variant || variant === 'primary') return 'primary'
	return (variantClass(variant) || variant) as StatusVariant
}

function renderIcon(icon: string | JSX.Element | undefined, size = '16px') {
	if (icon === undefined) return null
	return (
		<span class="pp-token-icon" aria-hidden={typeof icon === 'string' ? true : undefined}>
			{typeof icon === 'string' ? <Icon name={icon} size={size} /> : icon}
		</span>
	)
}

export type BadgeProps = {
	tag?: JSX.HTMLElementTag
	variant?: Variant
	icon?: string | JSX.Element
	el?: JSX.GlobalHTMLAttributes
	children?: JSX.Children
}

export const Badge = (props: BadgeProps) => {
	const state = compose({ tag: 'span', variant: 'primary' }, props)
	return (
		<dynamic
			tag={state.tag}
			{...state.el}
			class={['pp-badge', `pp-variant-${variantKey(state.variant)}`, state.el?.class]}
		>
			{renderIcon(state.icon, '14px')}
			<span class="pp-token-label">{state.children}</span>
		</dynamic>
	)
}

export type PillProps = {
	tag?: JSX.HTMLElementTag
	variant?: Variant
	icon?: string | JSX.Element
	trailingIcon?: string | JSX.Element
	el?: JSX.GlobalHTMLAttributes
	children?: JSX.Children
}

export const Pill = (props: PillProps) => {
	const state = compose({ tag: 'span', variant: 'primary' }, props)

	return (
		<dynamic
			tag={state.tag}
			{...state.el}
			class={['pp-pill', `pp-variant-${variantKey(state.variant)}`, state.el?.class]}
		>
			{renderIcon(state.icon)}
			<span class="pp-token-label">{state.children}</span>
			{renderIcon(state.trailingIcon)}
		</dynamic>
	)
}

export type ChipProps = {
	tag?: JSX.HTMLElementTag
	variant?: Variant
	icon?: string | JSX.Element
	el?: JSX.GlobalHTMLAttributes
	children?: JSX.Children
	dismissible?: boolean
	dismissLabel?: string
	onDismiss?: () => void
}

export const Chip = (props: ChipProps) => {
	const state = compose(
		{ tag: 'button', variant: 'secondary', dismissible: false, open: true },
		props
	)

	function close() {
		state.open = false
		state.onDismiss?.()
	}

	return (
		<dynamic
			if={state.open}
			tag={state.tag}
			type={state.tag === 'button' || state.tag === undefined ? 'button' : undefined}
			{...state.el}
			class={['pp-chip', `pp-variant-${variantKey(state.variant)}`, state.el?.class]}
		>
			{renderIcon(state.icon)}
			<span class="pp-token-label">{state.children}</span>
			<button
				if={state.dismissible}
				type="button"
				class="pp-chip-dismiss"
				aria-label={state.dismissLabel ?? 'Remove'}
				onClick={(event) => {
					event.stopPropagation()
					close()
				}}
			>
				<Icon name="mdi:close" size="14px" />
			</button>
		</dynamic>
	)
}
