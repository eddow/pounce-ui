import '@picocss/pico/css/pico.min.css'
import { bindApp } from 'pounce-ts'
import './components/variants.scss'
import { effect } from 'mutts/src'
import { dialog } from './components/dialog'
import { Icon } from './components/icon'
import { toast, toastConfig } from './components/toast'
import { browser } from './lib/browser'
import { A, Router, type RouteWildcard } from './lib/router'

const defaultToastDuration = toastConfig.defaultDurationMs

effect(() => {
	toastConfig.defaultDurationMs = browser.url.hash === '#playwright' ? 50 : defaultToastDuration
})

const IconsSection = () => (
	<section>
		<h2>Icons (Iconify)</h2>
		<div role="group">
			<Icon name="mdi:home" />
			<Icon name="mdi:account" size="24px" />
			<Icon name="mdi:github" size="24px" />
		</div>
	</section>
)

const DialogSection = () => (
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
)

const ToastsSection = () => (
	<section>
		<h2>Toasts</h2>
		<div role="group">
			<button onClick={() => toast.info('Saved!')}>Toast</button>
			<button class="success" onClick={() => toast.success('Profile updated')}>
				Success
			</button>
			<button class="warning" onClick={() => toast.warning('Network is slow')}>
				Warning
			</button>
			<button class="danger" onClick={() => toast.danger('Failed to save')}>
				Danger
			</button>
			<button class="secondary" onClick={() => toast('Heads up: maintenance at 2am')}>
				Info
			</button>
		</div>
	</section>
)

const ButtonsSection = () => (
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
)

const OverviewSection = () => (
	<section>
		<h2>Overview</h2>
		<p>Select a section from the menu to explore the component demos.</p>
	</section>
)

type DemoSection = {
	readonly path: RouteWildcard
	readonly label: string
	readonly view: () => JSX.Element
}

const sections: DemoSection[] = [
	{ path: '/', label: 'Overview', view: OverviewSection },
	{ path: '/icons', label: 'Icons', view: IconsSection },
	{ path: '/dialog', label: 'Dialogs', view: DialogSection },
	{ path: '/toasts', label: 'Toasts', view: ToastsSection },
	{ path: '/buttons', label: 'Buttons', view: ButtonsSection },
]

const renderNotFound = (props: { url: string }) => (
	<section>
		<h2>Not found</h2>
		<p>
			No demo is registered for <code>{props.url}</code>.
		</p>
	</section>
)

const DemoMenu = () => (
	<nav aria-label="Demo sections">
		<ul>
			<For each={sections}>
				{(section) => (
					<li>
						<A href={`${section.path}${browser.url.hash ?? ''}`}>{section.label}</A>
					</li>
				)}
			</For>
		</ul>
	</nav>
)

const App = () => (
	<div class="demo-app">
		<header>
			<h1>Pounce UI Demo</h1>
			<DemoMenu />
		</header>
		<main>
			<Router routes={sections} notFound={renderNotFound} />
		</main>
	</div>
)

bindApp(<App />, '#app')
