import '@picocss/pico/css/pico.min.css'
import { effect } from 'mutts/src'
import { bindApp } from 'pounce-ts'
import { stored } from './lib/storage'
import './components/variants.scss'
import { Button } from './components/button'
import { Menu } from './components/menu'
import { Toolbar } from './components/toolbar'
import { browser } from './lib/browser'
import { Router, type RouteWildcard } from './lib/router'
import DisplayRoute from './routes/display'
import DockviewRoute from './routes/dockview'
import FormsRoute from './routes/forms'
import InteractionRoute from './routes/interaction'
import ToolbarRoute from './routes/toolbar'

// Stabilize contains() across realms in Playwright evaluations
if (typeof Element !== 'undefined' && typeof (Element.prototype as any).contains === 'function') {
	try {
		const originalContains = Element.prototype.contains
		Element.prototype.contains = function (node: any): boolean {
			try {
				return originalContains.call(this, node as any)
			} catch {
				// Fallback: if node is not a Node from this realm, infer using activeElement
				try {
					const active = document.activeElement
					if (active) {
						return originalContains.call(this, active)
					}
				} catch {}
				return false
			}
		}
	} catch {
		// no-op
	}
}

const MenuBar = () => {
	const state = stored({
		mode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
	})

	effect(() => {
		document.documentElement.dataset.theme = state.mode
	})

	return (
		<Toolbar>
			<strong>Pounce UI</strong>
			<Toolbar.Spacer visible />
			<Menu summary="Menu">
				<for each={sections.filter(({ path }) => path !== '/')}>
					{(section) => (
						<Menu.Item href={`${section.path}${browser.url.hash ?? ''}`}>{section.label}</Menu.Item>
					)}
				</for>
			</Menu>
			<Toolbar.Spacer />
			<Button
				icon={state.mode === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'}
				ariaLabel="Toggle dark mode"
				onClick={() => {
					state.mode = state.mode === 'dark' ? 'light' : 'dark'
				}}
			/>
		</Toolbar>
	)
}

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
	{ path: '/display', label: 'Display', view: DisplayRoute },
	{ path: '/forms', label: 'Forms', view: FormsRoute },
	{ path: '/interaction', label: 'Interaction', view: InteractionRoute },
	{ path: '/dockview', label: 'Dockview', view: DockviewRoute },
	{ path: '/toolbar', label: 'Toolbar', view: ToolbarRoute },
]

const renderNotFound = (props: { url: string }) => (
	<section>
		<h2>Not found</h2>
		<p>
			No demo is registered for <code>{props.url}</code>.
		</p>
	</section>
)

const App = () => (
	<div class="demo-app">
		<header>
			<nav class="container">
				<MenuBar />
			</nav>
		</header>
		<main class="container">
			<Router routes={sections} notFound={renderNotFound} />
		</main>
	</div>
)

bindApp(<App />, '#app')
