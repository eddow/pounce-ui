import { compose } from 'pounce-ts'
import type { Variant } from './variants'
import { variantClass } from './variants'
import './forms.scss'

function tone(variant?: Variant): string {
	if (!variant || variant === 'primary') return 'primary'
	return variantClass(variant) || variant
}

export type SelectProps = JSX.IntrinsicElements['select'] & {
	variant?: Variant
	fullWidth?: boolean
}

export const Select = (props: SelectProps) => {
	const state = compose({ variant: 'primary', fullWidth: false }, props)

	return (
		<select
			class={[
				'pp-select',
				`pp-control-${tone(state.variant)}`,
				state.fullWidth ? 'pp-select-full' : undefined,
				state.class,
			]}
			{...state}
		>
			{state.children}
		</select>
	)
}

export type ComboboxOption = string | { value: string; label?: string }

export type ComboboxProps = JSX.IntrinsicElements['input'] & {
	variant?: Variant
	options?: readonly ComboboxOption[]
}

export const Combobox = (props: ComboboxProps) => {
	const generatedId = `pp-combobox-${Math.random().toString(36).slice(2, 9)}`
	const state = compose(
		{ variant: 'primary', list: generatedId, options: [] as ComboboxOption[] },
		props
	)

	return (
		<div class={['pp-combobox', `pp-control-${tone(state.variant)}`, state.class]}>
			<input {...state} />
			<datalist id={state.list}>
				{state.options.map((option) => {
					if (typeof option === 'string') {
						return <option value={option} />
					}
					return <option value={option.value}>{option.label ?? option.value}</option>
				})}
				{state.children}
			</datalist>
		</div>
	)
}

type ControlBaseProps = JSX.IntrinsicElements['input'] & {
	label?: JSX.Element | string
	description?: JSX.Element | string
	variant?: Variant
	el?: JSX.IntrinsicElements['label']
	labelProps?: Omit<JSX.IntrinsicElements['label'], 'children'>
	children?: JSX.Element | string
	checked?: boolean
}

export type CheckboxProps = ControlBaseProps

export const Checkbox = (props: CheckboxProps) => {
	const state = compose({ variant: 'primary', type: 'checkbox' }, props)

	return (
		<label
			{...state.labelProps}
			class={['pp-control', 'pp-checkbox', `pp-control-${tone(state.variant)}`, state.el?.class]}
		>
			<input {...state} class={['pp-control-input', state.class]} />
			<span class="pp-control-copy">
				<span class="pp-control-label" if={state.label ?? state.children}>
					{state.label ?? state.children}
				</span>
				<span class="pp-control-description" if={state.description}>
					{state.description}
				</span>
			</span>
		</label>
	)
}

export type RadioProps = ControlBaseProps

export const Radio = (props: RadioProps) => {
	const state = compose({ variant: 'primary', type: 'radio' }, props)

	return (
		<label
			{...state.labelProps}
			class={['pp-control', 'pp-radio', `pp-control-${tone(state.variant)}`, state.el?.class]}
		>
			<input {...state} class={['pp-control-input', state.class]} />
			<span class="pp-control-copy">
				<span class="pp-control-label" if={state.label ?? state.children}>
					{state.label ?? state.children}
				</span>
				<span class="pp-control-description" if={state.description}>
					{state.description}
				</span>
			</span>
		</label>
	)
}

export type SwitchProps = ControlBaseProps & {
	labelPosition?: 'start' | 'end'
}

export const Switch = (props: SwitchProps) => {
	const state = compose({ variant: 'primary', labelPosition: 'end', type: 'checkbox' }, props)

	return (
		<label
			{...state.labelProps}
			class={[
				'pp-control',
				'pp-switch',
				`pp-control-${tone(state.variant)}`,
				state.labelPosition === 'start' ? 'pp-switch-label-start' : undefined,
				state.el?.class,
			]}
		>
			<input
				role="switch"
				{...state}
				class={['pp-control-input', 'pp-switch-input', state.class]}
				aria-checked={state.checked}
			/>
			<span class="pp-switch-visual" aria-hidden="true" />
			<span class="pp-control-copy" if={state.label || state.children || state.description}>
				<span class="pp-control-label" if={state.label || state.children}>
					{state.label ?? state.children}
				</span>
				<span class="pp-control-description" if={state.description}>
					{state.description}
				</span>
			</span>
		</label>
	)
}
