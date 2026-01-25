import '@picocss/pico/css/pico.min.css'
import { bindApp, type Scope } from 'pounce-ts'
import './components/variants.scss'
import { enableDevTools } from 'mutts'
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
import InfiniteScrollRoute from './routes/infinite-scroll'
import DebugResizeRoute from './routes/debug-resize'
import DebugScrollRoute from './routes/debug-scroll'
import DebugIntersectRoute from './routes/debug-intersect'

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
				} catch (error) {
					console.error('Failed to fallback to activeElement:', error)
					return false
				}
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
	readonly view: (props: {}, scope: Scope) => JSX.Element
}

const sections: DemoSection[] = [
	{ path: '/display', label: 'Display', view: DisplayRoute },
	{ path: '/forms', label: 'Forms', view: FormsRoute },
	{ path: '/interaction', label: 'Interaction', view: InteractionRoute },
	{ path: '/infinite-scroll', label: 'Infinite Scroll', view: InfiniteScrollRoute },
	{ path: '/dockview', label: 'Dockview', view: DockviewRoute },
	{ path: '/dockview-harsh', label: 'Dockview Harsh', view: DockviewHarshRoute },
	{ path: '/toolbar', label: 'Toolbar', view: ToolbarRoute },
	{ path: '/debug-resize', label: 'Resize', view: DebugResizeRoute },
	{ path: '/debug-scroll', label: 'Scroll', view: DebugScrollRoute },
	{ path: '/debug-intersect', label: 'Intersect', view: DebugIntersectRoute },
	{ path: '/', label: 'Overview', view: OverviewSection },
]

const renderNotFound = (props: { url: string }) => (
	<section>
		<h2>Not found</h2>
		<p>
			No demo is registered for <code>{props.url}</code>.
		</p>
	</section>
)

import { resize } from './actions/resize'
import { scroll } from './actions/scroll'
import { intersect } from './actions/intersect'


const App = (_props: {}, scope: Scope) => {
	scope.resize = resize
	scope.scroll = scroll
	scope.intersect = intersect
	return (
		<AppShell
			header={
				<header>
					<nav class="container pp-menu-nav">
						<Menu.Bar
							brand="Pounce UI"
							trailing={<DarkModeButton theme={scope.theme} />}
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
