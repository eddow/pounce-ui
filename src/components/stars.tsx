import { compose } from 'pounce-ts'
import { css } from '../lib/css'
import { Icon } from './icon'
import { mapped } from 'mutts'

css`
.pp-stars {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    cursor: pointer;
    user-select: none;
}

.pp-stars-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--pico-muted-color, #888);
    transition: color 0.1s ease, transform 0.1s ease;
}

.pp-stars-item:hover {
    transform: scale(1.1);
}

.pp-stars-item.pp-inside {
    color: var(--pico-primary, #f59e0b);
}

.pp-stars.pp-readonly {
    cursor: default;
}
.pp-stars.pp-readonly .pp-stars-item:hover {
    transform: none;
}
`

export type StarsProps = {
	/** Current value (number of stars filled) */
	value: number | readonly [number, number]
	/** Maximum number of stars, defaults to 5 */
	maximum?: number
	/** Callback when value changes */
	onChange?: (value: any) => void
	/** If true, user cannot interact */
	readonly?: boolean
	/** Size of the stars, defaults to "1.5rem" */
	size?: string
	/** Icon name for filled state, defaults to "tabler:star-filled" */
	inside?: string
	/** Icon name for empty state, defaults to "tabler:star" */
	outside?: string
	/** Icon name for before state (stars before the range), defaults to outside icon if not set */
	before?: string
}

export const Stars = (props: StarsProps) => {
	const state = compose(
		{
			value: 0 as number | readonly [number, number],
			maximum: 5,
			readonly: false,
			size: '1.5rem',
			inside: 'mdi:star',
			outside: 'mdi:star-outline',
			before: undefined as string | undefined,
		},
		props
	)

	const internal = compose({
		draggingEnd: null as 'min' | 'max' | null
	})
	function set(val: number | readonly [number, number]) {
		state.value = val
		state.onChange?.(val)
	}

	const handleInteraction = (index: number, e: MouseEvent) => {
		if (state.readonly) return
		const isLeftClick = e.type === 'mousedown' && e.button === 0
		const isLeftDrag = e.type === 'mousemove' && (e.buttons & 1) === 1

		if (!isLeftClick && !isLeftDrag) return

		let val: number | readonly [number, number] = index + 1

		if (Array.isArray(state.value)) {
			let [min, max] = state.value
			if (val < min) {
				internal.draggingEnd = 'min'
			} else if (val > max) {
				internal.draggingEnd = 'max'
			} else if (!internal.draggingEnd) {
				// Inside range: pick closer end
				const distMin = val - min
				const distMax = max - val
				if (distMin < distMax) {
					internal.draggingEnd = 'min'
				} else if (distMax < distMin) {
					internal.draggingEnd = 'max'
				} else {
					// Middle: check click position within star
					const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
					const clickX = e.clientX - rect.left
					internal.draggingEnd = clickX < rect.width / 2 ? 'min' : 'max'
				}
			}
			let [newMin, newMax] = [Math.min(val, min), Math.max(val, max)]

			if (internal.draggingEnd === 'min') {
				newMin = val
			} else if (internal.draggingEnd === 'max') {
				newMax = val
			}
			set([newMin, newMax])
		} else set(index + 1)
	}

	const handleDblClick = (index: number) => {
		if (state.readonly) return
		if (Array.isArray(state.value)) {
			const val = index + 1
			set([val, val])
		}
	}

	const handleMouseUp = () => {
		internal.draggingEnd = null
	}
	// TODO: Add a "0" at the left if 0 should be selectable
	// TODO: problem on range update
	return (
		<div
			class={['pp-stars', state.readonly ? 'pp-readonly' : undefined]}
			onMouseup={handleMouseUp}
			onMouseleave={handleMouseUp}
		>
			{mapped(Array.from({ length: state.maximum }), (_, index) => {
				const status = () => {
					if (Array.isArray(state.value)) {
						const [min, max] = state.value
						return index + 1 < min ? 'before' : index + 1 <= max ? 'inside' : 'after'
					}
					return index < state.value ? 'inside' : 'after'
				}

				return (
					<span
						class={['pp-stars-item', status() === 'inside' ? 'pp-inside' : ['pp-outside', status() === 'before' ? 'pp-before' : 'pp-after']]}
						onMousedown={(e: MouseEvent) => handleInteraction(index, e)}
						onMousemove={(e: MouseEvent) => handleInteraction(index, e)}
						onDblclick={() => handleDblClick(index)}
					>
						<Icon if={status() === 'inside'}
							name={state.inside}
							size={state.size}
						/>
						<Icon else if={status() === 'before'}
							name={state.before ?? state.outside}
							size={state.size}
						/>
						<Icon else
							name={state.outside}
							size={state.size}
						/>
					</span>
				)
			})}
		</div>
	)
}
