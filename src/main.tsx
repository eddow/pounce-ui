import '@picocss/pico/css/pico.min.css'
import { effect } from 'mutts/src'
import { bindApp } from 'pounce-ts'
import { stored } from './lib/storage'
import './components/variants.scss'
import { Menu } from './components/menu'
import { browser } from './lib/browser'
import { Router, type RouteWildcard } from './lib/router'
import DisplayRoute from './routes/display'
import DockviewRoute from './routes/dockview'
import InteractionRoute from './routes/interaction'

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
					<Menu summary="Menu">
						<for each={sections}>
							{(section) => (
								<Menu.Item href={`${section.path}${browser.url.hash ?? ''}`}>
									{section.label}
								</Menu.Item>
							)}
						</for>
					</Menu>
				</li>
			</ul>
			<ul style="margin-left: auto;">
				<li>
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
	{ path: '/interaction', label: 'Interaction', view: InteractionRoute },
	{ path: '/dockview', label: 'Dockview', view: DockviewRoute },
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
