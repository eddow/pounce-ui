import { biDi, reactive } from 'mutts'
import { scroll } from '../actions/scroll'

export default function DebugScroll() {
	const xScroll = reactive({ value: 0, max: 0 })
	const yScroll = reactive({ value: 0, max: 0 })

	// BiDi bindings for inputs
	const bindX = (el: HTMLInputElement) => {
		const provide = biDi(
			(v) => el.value = String(v),
			() => xScroll.value,
			(v) => xScroll.value = Number(v)
		)
		el.addEventListener('input', () => provide(Number(el.value)))
	}

	const bindY = (el: HTMLInputElement) => {
		const provide = biDi(
			(v) => el.value = String(v),
			() => yScroll.value,
			(v) => yScroll.value = Number(v)
		)
		el.addEventListener('input', () => provide(Number(el.value)))
	}

	return (
		<div style="padding: 20px;">
			<h1>Scroll Debug</h1>

			<div style="display: flex; gap: 20px; align-items: start;">
				{/* Demo Box */}
				<div
					style="width: 300px; height: 200px; border: 2px solid var(--pico-primary); overflow: auto; white-space: nowrap;"
					use:scroll={{ x: xScroll, y: yScroll }}
					id="scroll-container"
				>
					<div style="width: 1000px; height: 800px; background: linear-gradient(135deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%, #e0e0e0 100%); background-size: 20px 20px;">
						<div style="padding: 20px;">
							<h2>Scroll Me!</h2>
							<p>This content is larger than the container.</p>
						</div>
					</div>
				</div>

				{/* Controls */}
				<div style="flex: 1;">
					<article>
						<header>X Axis</header>
						<label>
							<span>Value: {Math.round(xScroll.value)} / {xScroll.max}</span>
							<input
								type="range"
								min="0" // @ts-ignore
								max={xScroll.max}
								use={bindX}
							/>
						</label>
					</article>

					<article>
						<header>Y Axis</header>
						<label>
							<span>Value: {Math.round(yScroll.value)} / {yScroll.max}</span>
							<input
								type="range"
								min="0" // @ts-ignore
								max={yScroll.max}
								use={bindY}
							/>
						</label>
					</article>
				</div>
			</div>
		</div>
	)
}
