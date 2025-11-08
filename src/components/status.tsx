import { compose } from 'pounce-ts'
import { Icon } from './icon'
import type { Variant } from './variants'
import { variantClass } from './variants'
import './status.scss'

type StatusVariant = Variant | 'primary'

function variantKey(variant?: Variant): StatusVariant {
	if (!variant || variant === 'primary') return 'primary'
	const mapped = variantClass(variant)
	return (mapped || variant) as StatusVariant
}

function renderIcon(icon: string | JSX.Element | undefined, size = '16px') {
	if (icon === undefined) return null
	return (
		<span class="pp-token-icon" aria-hidden={typeof icon === 'string' ? true : undefined}>
			{typeof icon === 'string' ? <Icon name={icon} size={size} /> : icon}
		</span>
	)
}

export type BadgeProps = JSX.IntrinsicElements['span'] & {
	tag?: keyof JSX.IntrinsicElements
	variant?: Variant
	icon?: string | JSX.Element
}

export const Badge = (props: BadgeProps) => {
	const state = compose(
		{ tag: 'span', variant: 'primary' },
		props,
		({ tag, variant, icon, class: className, children, ...htmlAttrs }) => ({ htmlAttrs })
	)
	return (
		<dynamic
			tag={state.tag}
			class={['pp-badge', `pp-variant-${variantKey(state.variant)}`, state.class]}
			{...state.htmlAttrs}
		>
			{renderIcon(state.icon, '14px')}
			<span class="pp-token-label">{state.children}</span>
		</dynamic>
	)
}

export type PillProps = JSX.IntrinsicElements['span'] & {
	tag?: keyof JSX.IntrinsicElements
	variant?: Variant
	icon?: string | JSX.Element
	trailingIcon?: string | JSX.Element
}

export const Pill = (props: PillProps) => {
	const state = compose(
		{ tag: 'span', variant: 'primary' },
		props,
		({ tag, variant, icon, trailingIcon, class: className, children, ...htmlAttrs }) => ({
			htmlAttrs,
		})
	)

	return (
		<dynamic
			tag={state.tag}
			class={['pp-pill', `pp-variant-${variantKey(state.variant)}`, state.class]}
			{...state.htmlAttrs}
		>
			{renderIcon(state.icon)}
			<span class="pp-token-label">{state.children}</span>
			{renderIcon(state.trailingIcon)}
		</dynamic>
	)
}

export type ChipProps = JSX.IntrinsicElements['button'] & {
	tag?: keyof JSX.IntrinsicElements
	variant?: Variant
	icon?: string | JSX.Element
	dismissible?: boolean
	dismissLabel?: string
	onDismiss?: () => void
}

export const Chip = (props: ChipProps) => {
	const state = compose(
		{ tag: 'button', variant: 'secondary', dismissible: false },
		props,
		({
			tag,
			variant,
			icon,
			dismissible,
			dismissLabel,
			onDismiss,
			class: className,
			children,
			...htmlAttrs
		}) => ({
			htmlAttrs,
		}),
		{ open: true }
	)

	function close() {
		state.open = false
		state.onDismiss?.()
	}

	return (
		<dynamic
			if={state.open}
			tag={state.tag}
			class={['pp-chip', `pp-variant-${variantKey(state.variant)}`, state.class]}
			type={state.tag === 'button' || state.tag === undefined ? 'button' : undefined}
			{...state.htmlAttrs}
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
