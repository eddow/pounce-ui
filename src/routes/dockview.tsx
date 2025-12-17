import type { DockviewApi, DockviewGroupPanel, DockviewPanelApi, SerializedDockview } from 'dockview-core'
import { reactive, watch } from 'mutts/src'
import { dialog } from '../components/dialog'
import { Dockview } from '../components/dockview'
import { toast } from '../components/toast'

export default () => {
	let api: DockviewApi | undefined
	const layoutState = reactive({ layout: undefined as SerializedDockview | undefined })

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
		_props: { title: string; api: DockviewPanelApi; size?: { width: number; height: number } },
		scope: Record<string, any>
	) => {
		if (!scope.state) {
			scope.state = reactive({ clicks: 0 })
		}
		return (
			<div style="display: flex; gap: .25rem; align-items: center; justify-content: center; height: 100%;">
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
							props.title = `Updated Title ${Date.now()}`
						}}
					>
						Update Title via Props
					</button>
					<button
						data-testid="update-title-api"
						onClick={() => {
							// Update title via API (tests reverse sync)
							props.api.setTitle(`API Title ${Date.now()}`)
						}}
					>
						Update Title via API
					</button>
					<button
						data-testid="update-params-prop"
						onClick={() => {
							// Update params via props (tests forward sync)
							props.params = { test: Date.now(), updated: true }
						}}
					>
						Update Params via Props
					</button>
					<button
						data-testid="update-params-api"
						onClick={() => {
							// Update params via API (tests reverse sync)
							props.api.updateParameters({ test: Date.now(), fromAPI: true })
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
								window.dispatchEvent(
									new CustomEvent('param-update', {
										detail: { id: panelId, params: { test: Date.now(), fromEvent: true } },
									})
								)
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
						if (api) {
							const panel = api.activePanel
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
					onClick={() => {
						if (api) {
							api.addPanel({
								id: `panel-${Date.now()}`,
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
					data-testid="add-title-params-panel"
					onClick={() => {
						if (api) {
							api.addPanel({
								id: `title-params-${Date.now()}`,
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
					onClick={() => {
						if (api) {
							api.addPanel({
								id: `panel-${Date.now()}`,
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
					onClick={() => {
						if (api) {
							api.addPanel({
								id: `panel-${Date.now()}`,
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
					onClick={() => {
						if (api) {
							api.addGroup()
						}
					}}
				>
					Add Group
				</button>
				<button
					class="warning"
					onClick={() => {
						if (api) {
							const panel = api.activePanel
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
					onClick={() => {
						if (api) {
							const panels = api.panels
							if (panels.length > 0) {
								panels[panels.length - 1].api.close()
							}
						}
					}}
				>
					Close Last Panel
				</button>
				<button
					data-testid="save-layout"
					class="success"
					onClick={() => {
						if (api && typeof api.toJSON === 'function') {
							layoutState.layout = api.toJSON()
							toast.success('Layout saved')
						}
					}}
				>
					Save Layout
				</button>
				<button
					data-testid="restore-layout"
					class="secondary"
					onClick={() => {
						if (layoutState.layout) {
							// Trigger restore by creating a deep copy to ensure watch triggers
							layoutState.layout = JSON.parse(JSON.stringify(layoutState.layout))
							toast.info('Layout restored')
						} else {
							toast.warning('No layout to restore')
						}
					}}
				>
					Restore Layout
				</button>
				<button
					data-testid="clear-layout"
					class="warning"
					onClick={() => {
						layoutState.layout = undefined
						toast.info('Layout cleared')
					}}
				>
					Clear Layout
				</button>
			</div>
			<div
				data-testid="layout-status"
				style="margin-bottom: 1rem; padding: 0.5rem; background: var(--pico-muted-border-color); border-radius: 4px; font-size: 0.875rem;"
			>
				Layout: {layoutState.layout ? 'Saved' : 'Not saved'}
				{layoutState.layout ? (
					<span data-testid="layout-has-content" style="margin-left: 0.5rem;">
						(has content)
					</span>
				) : null}
			</div>
			<Dockview
				el:style="height: 600px; border: 1px solid var(--pico-muted-border-color);"
				widgets={widgets}
				tabs={tabs}
				headerRight={headerActions}
				api={api}
				layout={layoutState.layout}
			/>
		</section>
	)
}
