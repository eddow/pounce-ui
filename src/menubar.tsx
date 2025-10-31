import '@picocss/pico/css/pico.min.css'
import { effect } from 'mutts/src'
import { bindApp } from 'pounce-ts'
import { stored } from './lib/storage'

const MenuBar = () => {
	const state = stored({
		mode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
	})

	effect(() => {
		document.documentElement.dataset.theme = state.mode
	})

	return (
		<>
			<ul>
				<li>
					<strong>Pounce UI</strong>
				</li>
				<li>
					<details class="dropdown">
						<summary>Menu</summary>
						<ul>
							<li>
								<button type="button">Item 1</button>
							</li>
							<li>
								<button type="button">Item 2</button>
							</li>
							<li>
								<button type="button">Item 3</button>
							</li>
						</ul>
					</details>
				</li>
			</ul>
			<ul>
				<li style="margin-left: auto;">
					<label>
						<input
							type="checkbox"
							checked={state.mode === 'dark'}
							update:checked={(dark) => {
								state.mode = dark ? 'dark' : 'light'
							}}
						/>
						<span>Dark mode</span>
					</label>
				</li>
			</ul>
		</>
	)
}

bindApp(<MenuBar />, '#menuBar')
