import type { DockviewApi } from 'dockview-core'
import { effect, reactive } from 'mutts/src'
import { Dockview, type DockviewWidgetProps } from '../components/dockview'
import { toast } from '../components/toast'

/**
 * This route reproduces the problematic pattern from App.tsx where:
 * 1. Effects depend on `api` before it's initialized
 * 2. Effects call `api` methods before api exists
 * 3. Functions try to use `api` before it's set
 * 4. Race conditions where panels are added before api is ready
 */
export default () => {
	// Store api in reactive state so effects can track changes
	const state = reactive({ api: undefined as DockviewApi | undefined })

	// Track if api was set (to test if parent's api variable gets updated)
	const apiSetState = reactive({ wasSet: false, setCount: 0 })

	// Simulate theme state that effects depend on
	const themeState = reactive({ darkMode: false })

	// PROBLEM 1: Effect that uses api before it's initialized
	// This demonstrates an effect that depends on api (even if just checking if it exists)
	// In real scenarios, effects might try to call api methods when api becomes available
	effect(() => {
		const theme = themeState.darkMode ? 'dark' : 'light'
		document.documentElement.dataset.theme = theme
	})

	// Monitor api variable changes - now reading from reactive state
	effect(() => {
		// Track if api is available when theme changes
		if (state.api) {
			// API is available - could use it here if needed
			// For example: state.api.addPanel(...) or other valid API methods
			if (!apiSetState.wasSet) {
				apiSetState.wasSet = true
				apiSetState.setCount++
			}
		}
	})

	// PROBLEM 2: Effect that calls api methods before api exists
	// This mimics: effect(() => { if (!api) return; restoreOrBootstrapLayout(); api.onDidLayoutChange?.(...) })
	let layoutInitialized = false
	const restoreOrBootstrapLayout = () => {
		if (!state.api || layoutInitialized) return
		layoutInitialized = true
		// Try to restore layout or bootstrap
		openTestPanel()
	}

	effect(() => {
		if (!state.api) return
		restoreOrBootstrapLayout()
		const disposable = state.api.onDidLayoutChange?.(() => {
			toast.info('Layout changed')
		})
		return () => disposable?.dispose?.()
	})

	// PROBLEM 3: Function that tries to use api before it's set
	// This mimics: const ensurePanel = (component, id, params) => { if (!api) return; ... }
	const ensurePanel = (component: string, id: string, params?: Record<string, any>) => {
		if (!state.api) {
			toast.warning(`API not ready when trying to add panel ${id}`)
			return
		}
		const existing = state.api.getPanel?.(id)
		if (existing) {
			if (params) existing.api?.updateParameters?.(params)
			existing.focus?.()
			return existing
		}
		return state.api.addPanel?.({
			id,
			component,
			params,
		})
	}

	const openTestPanel = () => ensurePanel('test1', 'test-panel', { test: true })

	// PROBLEM 4: Race condition - try to add panel immediately (before api is ready)
	// This simulates calling ensurePanel before the component has mounted
	setTimeout(() => {
		ensurePanel('test1', 'race-condition-panel', { race: true })
	}, 0)

	const testWidget1 = (
		props: DockviewWidgetProps,
		_scope: Record<string, any>
	) => (
		<div style="padding: 1rem;">
			<h3>Test Panel</h3>
			<p>
				Size: {props.size?.width ?? 0} x {props.size?.height ?? 0}
			</p>
			<p>Params: {JSON.stringify(props.params || {})}</p>
		</div>
	)

	const widgets = {
		test1: testWidget1,
	}

	return (
		<section>
			<h1>Dockview Harsh Tests</h1>
			<p>
				This page tests dockview with effects and functions that depend on api before it's
				initialized.
			</p>

			<div role="group" style="margin-bottom: 1rem;">
				<button
					onClick={() => {
						themeState.darkMode = !themeState.darkMode
					}}
				>
					Toggle Theme (tests effect with api dependency)
				</button>
				<button
					onClick={() => {
						openTestPanel()
					}}
				>
					Add Panel (tests ensurePanel)
				</button>
				<button
					onClick={() => {
						if (state.api) {
							state.api.addGroup()
						}
					}}
				>
					Add Group
				</button>
				<button
					data-testid="check-api-variable"
					onClick={() => {
						// This tests if the parent's api variable was updated
						if (state.api) {
							toast.success(`API is set! Can add panel: ${!!state.api.addPanel}`)
						} else {
							toast.warning('API variable is still undefined in parent!')
						}
					}}
				>
					Check API Variable
				</button>
			</div>

			<div
				data-testid="api-status"
				style="margin-bottom: 1rem; padding: 0.5rem; background: var(--pico-muted-border-color); border-radius: 4px;"
			>
				<p>API was set: {apiSetState.wasSet ? 'Yes' : 'No'}</p>
				<p>API set count: {apiSetState.setCount}</p>
				<p>API variable is: {state.api ? 'defined' : 'undefined'}</p>
			</div>

			<Dockview
				el:style="height: 600px; border: 1px solid var(--pico-muted-border-color);"
				widgets={widgets}
				api={state.api}
			/>
		</section>
	)
}
