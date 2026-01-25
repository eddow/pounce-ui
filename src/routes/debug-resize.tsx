
import { reactive } from 'mutts'

export default function DebugResize() {
	const size = reactive({ width: 300, height: 200 })

	return (
		<div style="padding: 20px;">
			<h1>Resize Debug</h1>
			<p>
				Use the grab handle in the bottom-right of the box to resize it, or input values below to resize
				programmatically.
			</p>

			<div style="display: flex; gap: 10px; margin-bottom: 20px;">
				<label>
					Width:
					<input
						type="number"
						value={size.width}
						onInput={(e) => {
							size.width = Number((e.target as HTMLInputElement).value)
						}}
					/>
				</label>
				<label>
					Height:
					<input
						type="number"
						value={size.height}
						onInput={(e) => {
							size.height = Number((e.target as HTMLInputElement).value)
						}}
					/>
				</label>
			</div>

			<div
				style="border: 2px solid var(--pico-primary); overflow: auto; resize: both; display: flex; align-items: center; justify-content: center; min-width: 50px; min-height: 50px;"
				use:resize={size}
			>
				<span>
					{size.width} x {size.height}
				</span>
			</div>
		</div>
	)
}
