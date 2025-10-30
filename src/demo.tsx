import '@picocss/pico/css/pico.min.css'
import { bindApp } from 'pounce-ts'
import './components/variants.scss'
import { dialog } from './components/dialog'
import { Icon } from './components/icon'
import { toast, toastDanger, toastInfo, toastSuccess, toastWarning } from './components/toast'

const App = () => (
	<>
		<section>
			<h2>Icons (Iconify)</h2>
			<div role="group">
				<Icon name="mdi:home" />
				<Icon name="mdi:account" size="24px" />
				<Icon name="mdi:github" size="24px" />
			</div>
		</section>

		<section>
			<h2>Dialog</h2>
			<div role="group">
				<button
					onClick={async () => {
						const res = await dialog('This is a simple dialog with default OK button.')
						console.log('Dialog result:', res)
					}}
				>
					Open dialog
				</button>
				<button
					class="contrast"
					onClick={async () => {
						const res = await dialog({
							title: 'Confirm action',
							message: 'Are you sure you want to proceed? This action cannot be undone.',
							default: 'proceed',
							stamp: 'mdi:alert',
							buttons: {
								cancel: 'Cancel',
								proceed: { text: 'Yes, proceed', variant: 'danger' },
								question: (
									<button type="button" class="warning">
										Question
									</button>
								),
							},
						})
						console.log('Confirm result:', res)
					}}
				>
					Confirm
				</button>
			</div>
		</section>

		<section>
			<h2>Toasts</h2>
			<div role="group">
				<button onClick={() => toast('Saved!')}>Toast</button>
				<button class="success" onClick={() => toastSuccess('Profile updated')}>
					Success
				</button>
				<button class="warning" onClick={() => toastWarning('Network is slow')}>
					Warning
				</button>
				<button class="danger" onClick={() => toastDanger('Failed to save')}>
					Danger
				</button>
				<button class="contrast" onClick={() => toastInfo('Heads up: maintenance at 2am')}>
					Info
				</button>
			</div>
		</section>

		<section>
			<h2>Buttons (role="group")</h2>
			<div role="group">
				<button aria-current="true">Active</button>
				<button>Primary</button>
				<button class="secondary">Secondary</button>
				<button class="contrast">Contrast</button>
				<button class="success">Success</button>
				<button class="warning">Warning</button>
				<button class="danger">Danger</button>
			</div>
		</section>
	</>
)

bindApp(<App />, '#app')
