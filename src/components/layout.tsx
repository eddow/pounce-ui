import { compose } from 'pounce-ts'
import './layout.scss'

type SpacingToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string

const spacingScale: Record<Exclude<SpacingToken, string>, string> = {
	none: '0',
	xs: 'calc(var(--pico-spacing) * 0.5)',
	sm: 'var(--pico-spacing)',
	md: 'calc(var(--pico-spacing) * 1.5)',
	lg: 'calc(var(--pico-spacing) * 2)',
	xl: 'calc(var(--pico-spacing) * 3)',
}

function spacingValue(value?: SpacingToken) {
	if (!value) return undefined
	return spacingScale[value as Exclude<SpacingToken, string>] ?? value
}

const alignItemsMap = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
	baseline: 'baseline',
	stretch: 'stretch',
} as const

const justifyMap = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
	between: 'space-between',
	around: 'space-around',
	evenly: 'space-evenly',
	stretch: 'stretch',
} as const

export type ContainerProps = JSX.IntrinsicElements['div'] & {
	tag?: JSX.HTMLElementTag
	fluid?: boolean
}

export const Container = (props: ContainerProps) => {
	const state = compose({ tag: 'div' }, props)

	return (
		<dynamic class={[state.fluid ? 'container-fluid' : 'container', state.class]} {...state}>
			{state.children}
		</dynamic>
	)
}

export type StackProps = JSX.IntrinsicElements['div'] & {
	gap?: SpacingToken
	align?: keyof typeof alignItemsMap
	justify?: keyof typeof justifyMap
}

export const Stack = (props: StackProps) => {
	const state = compose({ gap: 'md' }, props)

	return (
		<div
			{...state}
			class={['pp-stack', state.class]}
			style={[
				state.style,
				state.gap ? { gap: spacingValue(state.gap) } : undefined,
				state.align ? { alignItems: alignItemsMap[state.align] ?? state.align } : undefined,
				state.justify ? { justifyContent: justifyMap[state.justify] ?? state.justify } : undefined,
			]}
		>
			{props.children}
		</div>
	)
}

export type InlineProps = JSX.IntrinsicElements['div'] & {
	gap?: SpacingToken
	align?: keyof typeof alignItemsMap
	justify?: keyof typeof justifyMap
	wrap?: boolean
}

export const Inline = (props: InlineProps) => {
	const state = compose({ gap: 'sm', align: 'center' as keyof typeof alignItemsMap }, props)

	return (
		<div
			{...state}
			class={['pp-inline', state.class]}
			style={[
				state.style,
				state.gap ? { gap: spacingValue(state.gap) } : undefined,
				state.align ? { alignItems: alignItemsMap[state.align] ?? state.align } : undefined,
				state.justify ? { justifyContent: justifyMap[state.justify] ?? state.justify } : undefined,
				state.wrap ? { flexWrap: 'wrap' } : { flexWrap: 'nowrap' },
			]}
		>
			{state.children}
		</div>
	)
}

export type GridProps = JSX.IntrinsicElements['div'] & {
	gap?: SpacingToken
	columns?: number | string
	minItemWidth?: string
	align?: 'start' | 'center' | 'end' | 'stretch'
	justify?: 'start' | 'center' | 'end' | 'stretch'
}

export const Grid = (props: GridProps) => {
	function template(columns?: number | string, minItemWidth?: string) {
		if (columns !== undefined && columns !== null && columns !== '')
			return typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns
		if (minItemWidth) return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
		return undefined
	}
	const state = compose({ gap: 'md' }, props)

	return (
		<div
			{...state}
			class={['pp-grid', state.class]}
			style={[
				state.style,
				state.gap ? { gap: spacingValue(state.gap) } : undefined,
				(() => {
					const columns = template(state.columns, state.minItemWidth)
					return columns ? { gridTemplateColumns: columns } : undefined
				})(),
				state.align ? { alignItems: state.align } : undefined,
				state.justify ? { justifyItems: state.justify } : undefined,
			].filter(Boolean)}
		>
			{state.children}
		</div>
	)
}
