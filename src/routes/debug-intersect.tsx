import { reactive } from 'mutts'
import { intersect } from '../actions/intersect'

export default function DebugIntersect() {
	const log = reactive<string[]>([])
	const addLog = (msg: string) => {
		log.push(`${new Date().toLocaleTimeString().split(' ')[0]}: ${msg}`)
		if (log.length > 10) log.shift()
	}

	const isVisible = reactive({ value: false })

	// Options for intersect
	const options = {
		threshold: 0.5,
		onEnter: () => {
			isVisible.value = true
			addLog('ENTER (50% visible)')
		},
		onLeave: () => {
			isVisible.value = false
			addLog('LEAVE')
		}
	}

	return (
		<div style="padding: 20px;">
			<h1>Intersect Debug</h1>

			<div style="display: flex; gap: 20px;">
				<div style="width: 300px;">
					<h3>Log</h3>
					<pre style="background: #eee; padding: 10px; height: 300px; overflow: auto;">
						{() => log.map(l => <div>{l}</div>)}
					</pre>
					<div
						style={() => `
							margin-top: 20px; 
							padding: 10px; 
							border: 1px solid #ccc; 
							background: ${isVisible.value ? '#d4edda' : '#f8d7da'};
							color: ${isVisible.value ? '#155724' : '#721c24'};
							transition: background 0.3s;
						`}
					>
						Status: {() => isVisible.value ? 'VISIBLE' : 'HIDDEN'}
					</div>
				</div>

				<div style="flex: 1; height: 400px; overflow: auto; border: 2px solid var(--pico-primary); position: relative;">
					<div style="height: 800px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
						<p>Scroll down to see the target...</p>
						<div style="height: 300px;"></div>

						{/* Target Element */}
						<div
							use:intersect={options}
							style="width: 200px; height: 200px; background: var(--pico-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"
						>
							TARGET
						</div>

						<div style="height: 300px;"></div>
						<p>End of content</p>
					</div>
				</div>
			</div>
		</div>
	)
}
