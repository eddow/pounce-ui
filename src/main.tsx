import '@picocss/pico/css/pico.min.css'
import { effect, project } from 'mutts/src'
import { bindApp } from 'pounce-ts'
import { stored } from './lib/storage'
import './components/variants.scss'
import { enableDevTools } from 'mutts/src'
import { Button } from './components/button'
import { AppShell } from './components/layout'
import { Menu } from './components/menu'
import { browser } from './lib/browser'
import { Router, type RouteWildcard } from './lib/router'
import DisplayRoute from './routes/display'
import DockviewRoute from './routes/dockview'
import DockviewHarshRoute from './routes/dockview-harsh'
import FormsRoute from './routes/forms'
import InteractionRoute from './routes/interaction'
import ToolbarRoute from './routes/toolbar'

enableDevTools()
// Stabilize contains() across realms in Playwright evaluations
if (typeof Element !== 'undefined' && typeof Element.prototype.contains === 'function') {
	try {
		const originalContains = Element.prototype.contains
		Element.prototype.contains = function (node: any): boolean {
			try {
				return originalContains.call(this, node)
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
		<Menu.Bar
			brand="Pounce UI"
			trailing={
				<Button
					icon={state.mode === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'}
					ariaLabel="Toggle dark mode"
					onClick={() => {
						state.mode = state.mode === 'dark' ? 'light' : 'dark'
					}}
				/>
			}
			items={project.array(sections.filter(({ path }) => path !== '/'), ({value}) => (
					<Menu.Item href={`${value.path}${browser.url.hash ?? ''}`}>
						{value.label}
					</Menu.Item>
				))}
		/>
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
	{ path: '/dockview-harsh', label: 'Dockview Harsh', view: DockviewHarshRoute },
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
	<AppShell
		header={
			<header>
				<nav class="container pp-menu-nav">
					<MenuBar />
				</nav>
			</header>
		}
	>
		<main class="container">
			<Router routes={sections} notFound={renderNotFound} />
		</main>
	</AppShell>
)

bindApp(<App />, '#app')
