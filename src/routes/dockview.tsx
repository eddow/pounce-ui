import type { DockviewApi, DockviewPanelApi } from 'dockview-core'
import { dialog } from '../components/dialog'
import { Dockview } from '../components/dockview'
import { toast } from '../components/toast'

export default () => {
	let api: DockviewApi | undefined

	const testWidget1 = (
		props: { title: string; api: DockviewPanelApi; size?: { width: number; height: number } },
		_widgetScope: Record<string, any>
	) => (
		<div style="padding: 1rem;">
			<h3>Test Panel 1</h3>
			<p>
				Size: {props.size?.width ?? 0} x {props.size?.height ?? 0}
			</p>
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
	}

	return (
		<section>
			<h2>Dockview</h2>
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
			</div>
			<Dockview
				style="height: 600px; border: 1px solid var(--pico-muted-border-color);"
				widgets={widgets}
				api={api}
			/>
		</section>
	)
}
