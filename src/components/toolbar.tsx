import { compose } from 'pounce-ts'
import './toolbar.scss'

export type ToolbarProps = {
	/** Toolbar children */
	children?: JSX.Children
	/** Additional CSS classes */
	class?: string
	/** Inline styles */
	style?: string
	/** Orientation - horizontal (default) or vertical */
	orientation?: 'horizontal' | 'vertical'
}

const ToolbarComponent = (props: ToolbarProps) => {
	const state = compose({ orientation: 'horizontal' }, props)

	return (
		<div
			class={['pp-toolbar', `pp-toolbar-${state.orientation}`, state.class]}
			role="toolbar"
			style={state.style}
		>
			{state.children}
		</div>
	)
}

export type ToolbarSpacerProps = {
	/** Show a visible divider line instead of being invisible */
	visible?: boolean
	/** Fixed width instead of flex-grow (e.g., '1px', '0.5rem') */
	width?: string
	/** Additional CSS classes */
	class?: string
}

const ToolbarSpacer = (props: ToolbarSpacerProps) => {
	const state = compose({ visible: false }, props)

	return (
		<span
			class={[
				'pp-toolbar-spacer',
				state.visible ? 'pp-toolbar-spacer-visible' : undefined,
				state.class,
			]}
			style={state.width ? { width: state.width, flex: 'none' } : undefined}
			aria-hidden="true"
		/>
	)
}

export const Toolbar = Object.assign(ToolbarComponent, {
	Spacer: ToolbarSpacer,
})
