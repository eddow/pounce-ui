import type { DockviewApi, DockviewGroupPanel, DockviewPanelApi } from 'dockview-core'
import { reactive, watch } from 'mutts'
import { dialog } from '../components/dialog'
import { Dockview, type DockviewSnapshot } from '../components/dockview'
import { toast } from '../components/toast'

export default (_props: {}, scope: Record<string, any>) => {
	const state = reactive({ api: undefined as DockviewApi | undefined })
	const layoutState = reactive({
		dockviewLayout: undefined as DockviewSnapshot | undefined,
		savedLayout: undefined as DockviewSnapshot | undefined,
	})
	// Expose state for Playwright tests
	if (typeof window !== 'undefined' && window.location.hash.includes('playwright')) {
		; (window as any).__dockviewApiState = state
			; (window as any).__dockviewLayoutState = layoutState
	}

	let panelIdCounter = 0

	const getNextPanelId = () => `panel-${++panelIdCounter}`

	const testWidget1 = (
		props: { title: string; api: DockviewPanelApi; size?: { width: number; height: number } },
		scope: Record<string, any>
	) => (
		<div style="padding: 1rem;">
			<h3>Test Panel 1</h3>
			<p>
				Size: {props.size?.width ?? 0} x {props.size?.height ?? 0}
			</p>
			<p>Clicks: {scope.state?.clicks ?? 0}</p>
			<div role="group">
				<button onClick={() => toast.info('Button 1 clicked!')}>Test Button 1</button>
				<button class="success" onClick={() => toast.success('Success from panel 1')}>
					Success Toast
				</button>
				<button
					class="warning"
					onClick={async () => {
						const res = await dialog('This is a dialog from panel 1')
						console.log('Dialog result:', res)
					}}
				>
					Open Dialog
				</button>
			</div>
		</div>
	)

	// Tab widget for default tabComponent 'normal' that shares scope with panel widget
	const normalTabWidget = (
		props: { title: string; api: DockviewPanelApi; size?: { width: number; height: number } },
		scope: Record<string, any>
	) => {
		if (!scope.state) {
			scope.state = reactive({ clicks: 0 })
		}
		return (
			<div style="display: flex; gap: .25rem; align-items: center; justify-content: center; height: 100%;">
				<span style="margin-right: .25rem;">{props.title}</span>
				<button aria-label="Tab +1" onClick={() => scope.state!.clicks++}>
					+1
				</button>
			</div>
		)
	}

	const titleParamsWidget = (
		props: {
			title: string
			api: DockviewPanelApi
			params?: unknown
			size?: { width: number; height: number }
		},
		_scope: Record<string, any>
	) => {
		// Reactive state for displaying current title/params
		const state = reactive({
			displayTitle: props.title,
			displayParams: props.params ? JSON.stringify(props.params) : '{}',
		})

		// Watch props.title and props.params to update display (tests reverse sync)
		watch(
			() => props.title,
			(title) => {
				state.displayTitle = title
			}
		)
		watch(
			() => props.params,
			(params) => {
				state.displayParams = params ? JSON.stringify(params) : '{}'
			},
			{ deep: true }
		)

		return (
			<div style="padding: 1rem;">
				<h3>Title/Params Sync Test</h3>
				<div>
					<span>
						Title (from props): <span data-testid="title-display">{state.displayTitle}</span>
					</span>
				</div>
				<div>
					<span>
						Params (from props): <span data-testid="params-display">{state.displayParams}</span>
					</span>
				</div>
				<div
					role="group"
					style="display: flex; gap: 0.5rem; flex-direction: column; margin-top: 1rem;"
				>
					<button
						data-testid="update-title-prop"
						onClick={() => {
							// Update title via props (tests forward sync)
							const nextTitle = `Updated Title ${Date.now()}`
							props.title = nextTitle
							state.displayTitle = nextTitle
						}}
					>
						Update Title via Props
					</button>
					<button
						data-testid="update-title-api"
						onClick={() => {
							// Update title via API (tests reverse sync)
							const nextTitle = `API Title ${Date.now()}`
							props.api.setTitle(nextTitle)
							props.title = nextTitle
							state.displayTitle = nextTitle
						}}
					>
						Update Title via API
					</button>
					<button
						data-testid="update-params-prop"
						onClick={() => {
							// Update params via props (tests forward sync)
							const nextParams = { test: Date.now(), updated: true }
							props.params = nextParams
							state.displayParams = JSON.stringify(nextParams)
						}}
					>
						Update Params via Props
					</button>
					<button
						data-testid="update-params-api"
						onClick={() => {
							// Update params via API (tests reverse sync)
							const nextParams = { test: Date.now(), fromAPI: true }
							props.api.updateParameters(nextParams)
							props.params = nextParams
							state.displayParams = JSON.stringify(nextParams)
						}}
					>
						Update Params via API
					</button>
					<button
						data-testid="update-params-event"
						onClick={() => {
							// Update params via CustomEvent (tests fallback reverse sync)
							const panelId = props.api?.id
							if (panelId) {
								const nextParams = { test: Date.now(), fromEvent: true }
								window.dispatchEvent(
									new CustomEvent('param-update', {
										detail: { id: panelId, params: nextParams },
									})
								)
								state.displayParams = JSON.stringify(nextParams)
							}
						}}
					>
						Update Params via Event
					</button>
				</div>
			</div>
		)
	}

	const testWidget2 = (
		props: { title: string; api: DockviewPanelApi; size?: { width: number; height: number } },
		scope: { api: DockviewApi }
	) => (
		<div style="padding: 1rem;">
			<h3>Test Panel 2</h3>
			<p>
				Size: {props.size?.width ?? 0} x {props.size?.height ?? 0}
			</p>
			<div role="group">
				<button onClick={() => toast.warning('Button 2 clicked!')}>Test Button 2</button>
				<button class="danger" onClick={() => toast.danger('Error from panel 2')}>
					Error Toast
				</button>
				<button
					class="secondary"
					onClick={() => {
						if (scope.api)
							scope.api.addPanel({
								id: `panel-${Date.now()}`,
								component: 'test1',
								tabComponent: 'normal',
								title: `New Panel ${Date.now()}`,
							})
					}}
				>
					Add Panel
				</button>
			</div>
		</div>
	)

	const testWidget3 = (
		props: { title: string; api: DockviewPanelApi; size?: { width: number; height: number } },
		scope: { api: DockviewApi }
	) => (
		<div style="padding: 1rem;">
			<h3>Test Panel 3</h3>
			<p>
				Size: {props.size?.width ?? 0} x {props.size?.height ?? 0}
			</p>
			<div role="group">
				<button onClick={() => toast('Info from panel 3')}>Info Toast</button>
				<button
					class="contrast"
					onClick={() => {
						scope.api.addGroup()
					}}
				>
					Add Group
				</button>
				<button
					onClick={() => {
						if (state.api) {
							const panel = state.api.activePanel
							if (panel) {
								panel.api.updateParameters({ test: Date.now() })
							}
						}
					}}
				>
					Update Params
				</button>
			</div>
		</div>
	)

	const widgets = {
		test1: testWidget1,
		test2: testWidget2,
		test3: testWidget3,
		titleParams: titleParamsWidget,
	}
	const tabs = {
		normal: normalTabWidget,
	}

	// Demo header action component - shows panel count in group (reactive)
	const groupHeaderAction = ({
		group,
		panelsState,
	}: {
		api: DockviewApi
		group: DockviewGroupPanel
		panelsState?: { count: number }
	}) => {
		// Use reactive state if provided, otherwise fallback to direct access
		const count = panelsState?.count ?? group.panels.length
		return (
			<div style="display: flex; align-items: center; gap: .25rem; padding: 0 .25rem;">
				<span style="font-size: 0.75rem; color: var(--pico-muted-color);">
					{count} panel{count !== 1 ? 's' : ''}
				</span>
			</div>
		)
	}
	const headerActions = {
		default: groupHeaderAction,
	}

	return (
		<section>
			<h1>Dockview</h1>
			<div role="group" style="margin-bottom: 1rem;">
				<button
					class="secondary"
					onClick={() => {
						layoutState.savedLayout = layoutState.dockviewLayout
						toast.info(layoutState.savedLayout ? 'Layout saved' : 'No layout to save')
					}}
				>
					Save Layout
				</button>
				<button
					class="secondary"
					disabled={!layoutState.savedLayout}
					onClick={() => {
						// Load by recreating panels directly from saved layout data
						if (layoutState.savedLayout && state.api) {
							try {
								console.log('[Load] Recreating panels directly from saved layout')

								// Step 1: Clear existing panels
								state.api.clear()
								state.api.closeAllGroups()

								// Step 2: Wait for clear to complete, then recreate panels
								setTimeout(() => {
									const savedPanels = layoutState.savedLayout?.panels
									if (savedPanels && state.api) {
										console.log('[Load] Recreating panels:', Object.keys(savedPanels))

										// Recreate each panel with correct component and title
										Object.entries(savedPanels).forEach(([panelId, panelData]: [string, any]) => {
											console.log('[Load] Recreating panel:', panelId, panelData)

											// Determine component based on panel data or ID
											let component = 'test1'
											let title = panelData.title || `Panel ${panelId}`

											if (panelId === 'panel-1') {
												component = 'test1'
												title = panelData.title || 'Test Panel 1'
											} else if (panelId === 'panel-2') {
												component = 'test2'
												title = panelData.title || 'Test Panel 2'
											} else {
												component = panelData.component || panelData.viewComponent || 'test1'
												title = panelData.title || `Panel ${panelId}`
											}

											state.api!.addPanel({
												id: panelId,
												component: component,
												tabComponent: 'normal',
												title: title
											})
										})

										// Update layout state after panels are created
										layoutState.dockviewLayout = layoutState.savedLayout
									}
								}, 100)

								toast.info('Layout loaded')
							} catch (error) {
								console.error('[Load] Error loading layout:', error)
								toast.danger('Failed to load layout')
							}
						} else {
							console.error('[Load] Missing saved layout or API', {
								hasSavedLayout: !!layoutState.savedLayout,
								hasApi: !!state.api
							})
							toast.danger('Cannot load layout')
						}
					}}
				>
					Load Layout
				</button>
				<button
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							state.api.addPanel({
								id: getNextPanelId(),
								component: 'test1',
								tabComponent: 'normal',
								title: 'Test Panel 1',
							})
						}
					}}
				>
					Add Panel 1
				</button>
				<button
					disabled={!state.api}
					data-testid="add-title-params-panel"
					onClick={() => {
						if (state.api) {
							state.api.addPanel({
								id: getNextPanelId(),
								component: 'titleParams',
								title: 'Initial Title',
								params: { initial: true },
							})
						}
					}}
				>
					Add Title/Params Panel
				</button>
				<button
					class="secondary"
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							state.api.addPanel({
								id: getNextPanelId(),
								component: 'test2',
								tabComponent: 'normal',
								title: 'Test Panel 2',
							})
						}
					}}
				>
					Add Panel 2
				</button>
				<button
					class="contrast"
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							state.api.addPanel({
								id: getNextPanelId(),
								component: 'test3',
								tabComponent: 'normal',
								title: 'Test Panel 3',
							})
						}
					}}
				>
					Add Panel 3
				</button>
				<button
					class="success"
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							state.api.addGroup()
						}
					}}
				>
					Add Group
				</button>
				<button
					class="warning"
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							const panel = state.api.activePanel
							if (panel) {
								toast.info(`Active panel: ${panel.id}`)
							} else {
								toast.warning('No active panel')
							}
						}
					}}
				>
					Get Active Panel
				</button>
				<button
					class="danger"
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							const panels = state.api.panels
							if (panels.length > 0) {
								panels[panels.length - 1].api.close()
							}
						}
					}}
				>
					Close Last Panel
				</button>
				<button
					class="warning"
					disabled={!state.api}
					onClick={() => {
						if (state.api) {
							// Clear using dockview-core API directly
							state.api.clear()
							state.api.closeAllGroups()
							layoutState.dockviewLayout = undefined
							toast.info('Layout cleared')
						}
					}}
				>
					Clear Layout
				</button>
			</div>
			<Dockview
				el:style="height: 600px; border: 1px solid var(--pico-muted-border-color);"
				widgets={widgets}
				tabs={tabs}
				headerRight={headerActions}
				api={state.api}
				layout={layoutState.dockviewLayout}
				onApiChange={(api) => { state.api = api }}
				onLayoutChange={(layout) => { layoutState.dockviewLayout = layout }}
				theme={scope.theme === 'dark' ? 'abyss' : 'light'}
			/>
		</section>
	)
}
