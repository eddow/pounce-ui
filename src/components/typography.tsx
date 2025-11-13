import { compose } from 'pounce-ts'
import type { Variant } from './variants'
import { variantClass } from './variants'
import './typography.scss'
import { A } from '../lib/router'

type HeadingAlign = 'start' | 'center' | 'end'

function toneForVariant(variant?: Variant): string {
	if (!variant || variant === 'primary') return 'primary'
	const mapped = variantClass(variant)
	return mapped || variant
}

export type HeadingProps = {
	level?: 1 | 2 | 3 | 4 | 5 | 6
	tag?: JSX.HTMLElementTag
	variant?: Variant
	align?: HeadingAlign
	el?: JSX.GlobalHTMLAttributes
	children?: JSX.Children
}

export const Heading = (props: HeadingProps) => {
	const state = compose(
		{ level: 2, variant: 'primary', align: 'start' as HeadingAlign },
		props,
		(state) => {
			const resolvedLevel = () => Math.min(6, Math.max(1, state.level ?? 2))
			return {
				get level() {
					return resolvedLevel()
				},
				get tag() {
					return state.tag ?? `h${resolvedLevel()}`
				},
				get align() {
					return state.align ?? 'start'
				},
			}
		}
	)

	return (
		<dynamic
			tag={state.tag}
			{...state.el}
			class={[
				'pp-heading',
				`pp-heading-level-${state.level}`,
				`pp-heading-variant-${toneForVariant(state.variant)}`,
				state.align ? `pp-heading-align-${state.align}` : undefined,
				state.el?.class,
			]}
		>
			{state.children}
		</dynamic>
	)
}

type TextSize = 'sm' | 'md' | 'lg'

export type TextProps = {
	tag?: JSX.HTMLElementTag
	variant?: Variant
	size?: TextSize
	muted?: boolean
	el?: JSX.GlobalHTMLAttributes
	children?: JSX.Children
}

export const Text = (props: TextProps) => {
	const state = compose(
		{ tag: 'p', variant: 'primary', size: 'md' as TextSize, muted: false },
		props
	)

	return (
		<dynamic
			tag={state.tag}
			{...state.el}
			class={[
				'pp-text',
				`pp-text-${state.size}`,
				`pp-text-variant-${toneForVariant(state.variant)}`,
				state.muted ? 'pp-text-muted' : undefined,
				state.el?.class,
			]}
		>
			{state.children}
		</dynamic>
	)
}

export type LinkProps = JSX.IntrinsicElements['a'] & {
	variant?: Variant
	underline?: boolean
}

export const Link = (props: LinkProps) => {
	const state = compose({ variant: 'primary', underline: true }, props)

	return (
		<A
			{...state}
			class={[
				'pp-link',
				`pp-link-variant-${toneForVariant(state.variant)}`,
				state.underline ? undefined : 'pp-link-no-underline',
				state.class,
			]}
		>
			{state.children}
		</A>
	)
}
