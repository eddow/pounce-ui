import '@picocss/pico/css/pico.min.css'
import { reactive, effect } from 'mutts/src'
import { bindApp, Scope } from 'pounce-ts'
import { stored } from './lib/storage'
import './components/variants.scss'
import { enableDevTools } from 'mutts/src'
import { AppShell } from './components/layout'
import { Menu } from './components/menu'
import { DarkModeButton } from './components/dark-mode-button'
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

const App = (_props: {}, scope: Scope) => {

	return (
		<AppShell
			header={
				<header>
					<nav class="container pp-menu-nav">
						<Menu.Bar
							brand="Pounce UI"
							trailing={<DarkModeButton theme={scope.theme}/>}
							items={sections.map(({ path, label }) => (
								<Menu.Item href={`${path}${browser.url.hash ?? ''}`}>
									{label}
								</Menu.Item>
							))}
						/>
					</nav>
				</header>
			}
		>
			<main class="container">
				<Router routes={sections} notFound={renderNotFound} />
			</main>
		</AppShell>
	)
}

bindApp(<App />, '#app')
