import {
	CreateComponentOptions,
	createDockview,
	DockviewApi,
	DockviewComponentOptions,
	DockviewGroupPanel,
	DockviewPanelApi,
	GroupPanelPartInitParameters,
	IContentRenderer,
	SerializedDockview,
} from 'dockview-core'
import 'dockview-core/dist/styles/dockview.css'
import { effect, reactive, type ScopedCallback, unreactive, watch } from 'mutts'
import { bindApp, compose, extend } from 'pounce-ts'

function isObject(value: any): value is object {
	return typeof value === 'object' && value !== null
}

// Scope passed to widgets always has dockviewApi defined (set before widget is called)
// and panelApi defined if within a panel context
type DockviewScope = Record<string, any> & {
	dockviewApi: DockviewApi
	panelApi?: DockviewPanelApi
}
export type DockviewWidgetProps<T extends Record<string, any> = Record<string, unknown>> = T & {
	title: string
	api: DockviewPanelApi
	size: { width: number; height: number }
	// Widgets receive the panel parameters; kept generic to allow serializable shapes
	params?: unknown
}
type DvWidget<T extends Record<string, any>> = (
	props: DockviewWidgetProps<T>,
	scope: DockviewScope
) => JSX.Element

// Group header action components receive global API and group API (no stable scope)
export type DockviewHeaderActionProps = {
	api: DockviewApi
	group: DockviewGroupPanel
}
type DvHeaderAction = (props: DockviewHeaderActionProps) => JSX.Element | null

interface DockviewLinkProps {
	params?: unknown
	title: string
	api: DockviewPanelApi
	size: { width: number; height: number }
}

export type DockviewSnapshot = {
	version: 1
	layout: SerializedDockview
	panels: Record<
		string,
		{
			id: string
			title?: string
			component?: string
			tabComponent?: string
			params?: unknown
		}
	>
}

function assertJsonable(value: unknown, label: string) {
	// Allow callers to omit optional values (e.g. params?: unknown)
	if (value === undefined) return
	const stack = new WeakSet<object>()
	const visit = (v: unknown) => {
		// JSON.stringify omits undefined in objects and converts it to null in arrays.
		// We allow it; the goal is to throw early for truly non-serializable structures.
		if (v === undefined) return
		const t = typeof v
		if (t === 'function' || t === 'symbol' || t === 'bigint') {
			throw new Error(`Dockview: ${label} must be JSON-serializable`)
		}
		if (t === 'number' && v !== null && !Number.isFinite(v as number)) {
			throw new Error(`Dockview: ${label} must be JSON-serializable`)
		}
		if (v && t === 'object') {
			const obj = v as object
			if (stack.has(obj)) throw new Error(`Dockview: ${label} must be JSON-serializable`)
			stack.add(obj)
			if (Array.isArray(v)) {
				for (const item of v) visit(item)
			} else {
				for (const k of Object.keys(v as any)) visit((v as any)[k])
			}
			stack.delete(obj)
		}
	}
	visit(value)
	try {
		JSON.stringify(value)
	} catch {
		throw new Error(`Dockview: ${label} must be JSON-serializable`)
	}
}

export function contentRenderer(
	widget: DvWidget<any>,
	link: { id: string; props?: DockviewLinkProps; scope: DockviewScope; component?: string },
	metaById: DockviewSnapshot['panels'],
	schedulePersist: () => void
) {
	const element = document.createElement('div')
	element.style.height = '100%'
	element.style.width = '100%'
	const size = reactive({ width: 0, height: 0 })
	let cleanup: ScopedCallback | undefined
	const cleanups: ScopedCallback[] = []
	return {
		element,
		init: (params: GroupPanelPartInitParameters) => {
			const api = unreactive(params.api)
			let suppressTitle = false
			let suppressParams = false
			const syncMeta = () => {
				metaById[link.id] = {
					id: link.id,
					title: link.props?.title,
					component: link.component,
					params: link.props?.params,
				}
				schedulePersist()
			}
			const exposedApi = Object.create(api) as DockviewPanelApi
			if (typeof api?.setTitle === 'function') {
				exposedApi.setTitle = (title: string) => {
					suppressTitle = true
					if (link.props) link.props.title = title
					syncMeta()
					api.setTitle(title)
					queueMicrotask(() => {
						suppressTitle = false
					})
				}
			}
			if (typeof api?.updateParameters === 'function') {
				exposedApi.updateParameters = (nextParams: any) => {
					assertJsonable(nextParams, 'panel params')
					suppressParams = true
					if (link.props) link.props.params = nextParams
					syncMeta()
					api.updateParameters(nextParams)
					queueMicrotask(() => {
						suppressParams = false
					})
				}
			}
			assertJsonable(params.params, 'initial panel params')
			link.props = reactive({ params: params.params, title: params.title, api: exposedApi, size })
			syncMeta()
			// Subscribe to Dockview → props (reverse flow) if supported
			try {
				const panelId: unknown = api?.id
				const onTitle = api?.onDidTitleChange
				const onParams = api?.onDidParametersChange
				if (typeof onTitle === 'function') {
					const dispose = onTitle((e: { title?: string } | string) => {
						const nextTitle = typeof e === 'string' ? e : (e as any)?.title
						if (nextTitle === undefined) return
						suppressTitle = true
						if (link.props) link.props.title = nextTitle
						syncMeta()
						queueMicrotask(() => {
							suppressTitle = false
						})
					})
					if (typeof dispose === 'function') cleanups.push(dispose)
				}
				if (typeof onParams === 'function') {
					const dispose = onParams((payload: unknown) => {
						const nextParams =
							payload && typeof payload === 'object' && 'params' in (payload as any)
								? (payload as any).params
								: payload
						assertJsonable(nextParams, 'panel params')
						suppressParams = true
						if (link.props) link.props.params = nextParams
						syncMeta()
						queueMicrotask(() => {
							suppressParams = false
						})
					})
					if (typeof dispose === 'function') cleanups.push(dispose)
				}
				// Fallback: listen to a CustomEvent 'param-update' with { id, params }
				const paramUpdateHandler = (ev: Event) => {
					const ce = ev as CustomEvent<{ id?: unknown; params?: unknown }>
					const detail = ce?.detail
					if (!detail) return
					if (panelId != null && detail.id === panelId) {
						assertJsonable(detail.params, 'panel params')
						suppressParams = true
						if (link.props && detail.params !== undefined) link.props.params = detail.params
						syncMeta()
						queueMicrotask(() => {
							suppressParams = false
						})
					}
				}
				window.addEventListener('param-update', paramUpdateHandler as EventListener)
				cleanups.push(() =>
					window.removeEventListener('param-update', paramUpdateHandler as EventListener)
				)
			} catch {
				// best-effort reverse binding; ignore if API shape differs
			}
			cleanups.push(
				watch(
					() => link.props?.title,
					(title) => {
						syncMeta()
						if (!suppressTitle && typeof api?.setTitle === 'function' && title !== undefined) {
							api.setTitle(title)
						}
					}
				)
			)
			cleanups.push(
				watch(
					() => link.props?.params,
					(params) => {
						assertJsonable(params, 'panel params')
						syncMeta()
						if (!suppressParams && typeof api?.updateParameters === 'function') {
							api.updateParameters(params)
						}
					},
					{ deep: true }
				)
			)
			// Use h() to create a proper component element that goes through the pounce lifecycle
			// We map props to bindings { get, set } to ensure they are writable in the component
			// and that writes propagate back to link.props (which triggers the watchers below)
			const boundProps: Record<string, any> = {}
			if (link.props) {
				for (const key of Object.keys(link.props)) {
					boundProps[key] = {
						get: () => (link.props as any)[key],
						set: (v: any) => ((link.props as any)[key] = v),
					}
				}
			}
			const jsx = h(widget, boundProps)
			link.scope.panelApi = exposedApi
			bindApp(jsx, element, link.scope)
		},
		layout: (width: number, height: number) => {
			size.width = width
			size.height = height
		},
		dispose() {
			cleanup?.()
			for (const fn of cleanups) fn()
			delete metaById[link.id]
			schedulePersist()
		},
	} satisfies IContentRenderer
}

type FreeDockviewOptions = Omit<
	DockviewComponentOptions,
	| 'createComponent'
	| 'createTabComponent'
	| 'createLeftHeaderActionComponent'
	| 'createRightHeaderActionComponent'
	| 'createPrefixHeaderActionComponent'
	| 'createWatermarkComponent'
>

type Binding<T> = { get: () => T; set: (value: T) => void }
function resolveSnapshot(
	layout: DockviewSnapshot | Binding<DockviewSnapshot | undefined> | undefined
): DockviewSnapshot | undefined {
	if (isObject(layout) && layout !== null && 'get' in layout && 'set' in layout) {
		return (layout as Binding<DockviewSnapshot | undefined>).get()
	}
	return layout as DockviewSnapshot | undefined
}
function resolveApi(api: DockviewApi | Binding<DockviewApi | undefined> | undefined): DockviewApi | undefined {
	if (isObject(api) && api !== null && 'get' in api && 'set' in api) {
		return (api as Binding<DockviewApi | undefined>).get()
	}
	return api as DockviewApi | undefined
}

const DefaultTab = (
	props: DockviewWidgetProps,
	scope: DockviewScope & { tabLeft?: any; tabRight?: any; tabPrefix?: any }
) => {
	const params = (props.params as any) || {}

	const renderAction = (type: 'tabLeft' | 'tabRight' | 'tabPrefix') => {
		const key = params[type]
		if (!key) return null
		const action = (scope[type] || {})[key] || (scope[type] || {})['default']
		if (!action) return null
		const group = (props.api as any).group
		return h(action, { api: scope.dockviewApi, group })
	}

	return (
		<div style="display: flex; align-items: center; height: 100%; width: 100%; overflow: hidden; padding: 0 4px; gap: 2px;">
			{renderAction('tabPrefix')}
			{renderAction('tabLeft')}
			<span
				style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 4px;"
			>
				{props.title}
			</span>
			{renderAction('tabRight')}
		</div>
	)
}
function headerActionRenderer(
	resolveWidget: (group: DockviewGroupPanel) => DvHeaderAction | undefined,
	api: DockviewApi,
	group: DockviewGroupPanel,
	scope: Record<string, any>
) {
	const element = document.createElement('div')
	element.style.height = '100%'
	element.style.width = '100%'
	let cleanup: ScopedCallback | undefined
	let groupListeners: (() => void)[] = []

	return {
		element,
		init(_params: any) {
			// Signal to force update on group events
			const signal = reactive({ version: 0 })
			const update = () => { signal.version++ }

			const disposable = group.api.onDidActivePanelChange(update)
			groupListeners.push(() => disposable.dispose())

			let jsx: JSX.Element | undefined
			cleanup = effect(() => {
				// Dependency on signal
				signal.version

				const widget = resolveWidget(group)

				// Use h() to create proper component elements
				if (widget) {
					jsx = h(widget, { api, group })
				} else {
					jsx = h('div', { style: 'display: none' })
				}
			})
			const headerScope = extend(scope, { dockviewApi: api }) as DockviewScope
			bindApp(jsx!, element, headerScope)
		},
		dispose() {
			cleanup?.()
			groupListeners.forEach(f => f())
			groupListeners = []
		},
	}
}

export const Dockview = (
	props: {
		api?: DockviewApi | Binding<DockviewApi | undefined>
		widgets: Record<string, DvWidget<any>>
		tabs?: Record<string, DvWidget<any>>
		headerLeft?: Record<string, DvHeaderAction>
		headerRight?: Record<string, DvHeaderAction>
		headerPrefix?: Record<string, DvHeaderAction>
		tabLeft?: Record<string, DvHeaderAction>
		tabRight?: Record<string, DvHeaderAction>
		tabPrefix?: Record<string, DvHeaderAction>
		options?: FreeDockviewOptions
		layout?: DockviewSnapshot | Binding<DockviewSnapshot | undefined>
		onApiChange?: (api: DockviewApi | undefined) => void
		onLayoutChange?: (layout: DockviewSnapshot | undefined) => void
		el?: JSX.GlobalHTMLAttributes
		theme?: string
	},
	scope: Record<string, any>
) => {
	const links = new Map<string, { id: string; props?: DockviewLinkProps; scope: DockviewScope; component?: string }>()
	const metaById = reactive({}) as DockviewSnapshot['panels']
	const state = compose({ options: {}, tabs: {}, tabLeft: {}, tabRight: {}, tabPrefix: {} }, props)
	const options: FreeDockviewOptions = {}

	effect(() => {
		const api = resolveApi(props.api)
		if (api) api.updateOptions(state.options)
		else Object.assign(options, state.options)
	})
	const initDockview = (element: HTMLElement) => {
		type LayoutSyncMode = 'idle' | 'ignore_next_external' | 'restoring' | 'cleared'
		let layoutSyncMode: LayoutSyncMode = 'idle'
		const persistSnapshot = (api: DockviewApi) => {
			if (layoutSyncMode === 'restoring') return
			if (layoutSyncMode === 'cleared') return
			if (typeof (api as any)?.toJSON !== 'function') return
			const layout = (api as any).toJSON()
			const snapshot: DockviewSnapshot = {
				version: 1,
				layout,
				panels: JSON.parse(JSON.stringify(unreactive(metaById))),
			}
			assertJsonable(snapshot, 'layout snapshot')
			layoutSyncMode = 'ignore_next_external'
			const layoutProp = (props as any).layout
			if (isObject(layoutProp) && layoutProp !== null && 'get' in layoutProp && 'set' in layoutProp) {
				; (layoutProp as Binding<DockviewSnapshot | undefined>).set(snapshot)
			} else {
				// For reactive values, use the callback
				if (props.onLayoutChange) {
					props.onLayoutChange(snapshot)
				} else {
					props.layout = snapshot
				}
			}
		}

		let persistScheduled = false
		const schedulePersist = () => {
			if (persistScheduled) return
			persistScheduled = true
			queueMicrotask(() => {
				persistScheduled = false
				if (layoutSyncMode === 'restoring') return
				if (layoutSyncMode === 'cleared') return
				persistSnapshot(createdApi)
			})
		}
		const ensurePanelsFromSnapshot = (snapshot: DockviewSnapshot | undefined) => {
			if (!snapshot?.panels) return
			if (typeof (createdApi as any)?.addPanel !== 'function') return
			const panels = Object.values(snapshot.panels)
			for (const p of panels) {
				if (!p?.id || !p?.component || !p?.title) continue
				assertJsonable(p.params, 'panel params')
				const existing = (createdApi as any).getPanel?.(p.id)
				if (existing) continue
				const added = (createdApi as any).addPanel({
					id: p.id,
					component: p.component,
					tabComponent: p.tabComponent,
					title: p.title,
					params: p.params,
				})
				try {
					added?.focus?.()
					added?.api?.focus?.()
				} catch {

				}
			}
		}
		const createdApi = unreactive(
			createDockview(element, {
				...options,
				createComponent(options: CreateComponentOptions) {
					layoutSyncMode = 'idle'
					const panelLink = { id: options.id, scope: extend(scope, {}) as DockviewScope, component: options.name }
					links.set(options.id, panelLink)
					const widget = state.widgets[options.name]
					if (!widget) throw new Error(`Widget ${options.name} not found`)
					metaById[options.id] = {
						id: options.id,
						component: options.name,
					}
					schedulePersist()
					return contentRenderer(widget, panelLink, metaById, schedulePersist)
				},
				createLeftHeaderActionComponent(group: DockviewGroupPanel) {
					const api = resolveApi(props.api)
					if (!api) {
						const element = document.createElement('div')
						return { element, init: () => { }, dispose: () => { } }
					}
					return headerActionRenderer(
						(g) => {
							const key = (g.activePanel?.params as any)?.headerLeft ?? 'default'
							return state.headerLeft?.[key] ?? state.headerLeft?.['default']
						},
						api,
						group,
						scope
					)
				},
				createRightHeaderActionComponent(group: DockviewGroupPanel) {
					const api = resolveApi(props.api)
					if (!api) {
						const element = document.createElement('div')
						return { element, init: () => { }, dispose: () => { } }
					}
					return headerActionRenderer(
						(g) => {
							const key = (g.activePanel?.params as any)?.headerRight ?? 'default'
							return state.headerRight?.[key] ?? state.headerRight?.['default']
						},
						api,
						group,
						scope
					)
				},
				createPrefixHeaderActionComponent(group: DockviewGroupPanel) {
					const api = resolveApi(props.api)
					if (!api) {
						const element = document.createElement('div')
						return { element, init: () => { }, dispose: () => { } }
					}
					return headerActionRenderer(
						(g) => {
							const key = (g.activePanel?.params as any)?.headerPrefix ?? 'default'
							return state.headerPrefix?.[key] ?? state.headerPrefix?.['default']
						},
						api,
						group,
						scope
					)
				},
				createTabComponent(options: CreateComponentOptions) {
					const element = document.createElement('div')
					element.style.height = '100%'
					element.style.width = '100%'
					const widget = state.tabs?.[options.name] ?? DefaultTab

					// Deferred initialization because createTabComponent might be called before createComponent
					let cleanup: ScopedCallback | undefined
					return {
						element,
						init(_params: GroupPanelPartInitParameters) {
							// Return early if already disposed (best effort)
							const setup = () => {
								const panelLink = links.get(options.id)
								if (!panelLink) {
									// Retry in next microtask if not yet available
									queueMicrotask(() => {
										if (cleanup === undefined) setup()
									})
									return
								}

								const tabScope = extend(panelLink.scope, {
									tabLeft: state.tabLeft,
									tabRight: state.tabRight,
									tabPrefix: state.tabPrefix,
								})

								cleanup = effect(() => {
									// Use h() to create proper component elements
									const jsx = h(widget, panelLink.props)
									bindApp(jsx, element, tabScope as DockviewScope)
								})
							}
							setup()
						},
						dispose() {
							if (cleanup) cleanup()
							cleanup = () => { } // Mark as disposed
						},
					}
				},
			})
		)
		// Set api on props, scope, and call callback to update parent
		scope.dockviewApi = createdApi
		const apiProp = (props as any).api
		if (isObject(apiProp) && apiProp !== null && 'get' in apiProp && 'set' in apiProp) {
			; (apiProp as Binding<DockviewApi | undefined>).set(createdApi)
		} else {
			// For reactive values, use the callback
			if (props.onApiChange) {
				props.onApiChange(createdApi)
			} else {
				try {
					; (props as any).api = createdApi
				} catch {

				}
			}
		}

		// Theme sync effect - watches scope.theme and updates dockview theme
		effect(() => {
			const theme = props.theme ?? (scope as any).theme ?? 'light'
			// Find dockview theme elements within this dockview container
			const htmlElements = element.querySelectorAll('[class*="dockview-theme-"]')
			for (const htmlElement of Array.from(htmlElements) as HTMLElement[]) {
				// Remove existing dockview theme classes
				htmlElement.className = htmlElement.className.replace(/dockview-theme-\w+/g, '').trim()
				// Add the appropriate theme class
				htmlElement.classList.add(`dockview-theme-${theme}`)
			}
		})

		// Restore initial layout if provided
		const initialSnapshot = resolveSnapshot(props.layout)
		const initialLayout = initialSnapshot?.layout
		if (initialLayout !== undefined && initialLayout !== null) {
			// Use dockview-core fromJSON method with type assertion
			if (typeof createdApi.fromJSON === 'function') {
				layoutSyncMode = 'restoring'
				requestAnimationFrame(() => {
					try {
						try {
							const panels: any[] = Array.isArray((createdApi as any).panels)
								? [...(createdApi as any).panels]
								: []
							for (const p of panels) {
								try {
									p?.api?.close?.()
										; (createdApi as any)?.removePanel?.(p)
								} catch {

								}
							}
							; (createdApi as any)?.closeAllGroups?.()
								; (createdApi as any)?.clear?.()
						} catch {

						}
						ensurePanelsFromSnapshot(initialSnapshot)
						createdApi.fromJSON(unreactive(initialLayout as any))
					} finally {
						queueMicrotask(() => {
							layoutSyncMode = 'idle'
						})
					}
				})
			}
		}

		// Subscribe to layout changes from dockview
		try {
			const onDidLayoutChange = createdApi?.onDidLayoutChange
			if (typeof onDidLayoutChange === 'function') {
				onDidLayoutChange(() => {
					schedulePersist()
				})
			}
		} catch {
			// best-effort layout subscription; ignore if API shape differs
		}

		// Watch layout prop changes to restore/clear layout
		effect(() => {
			watch(
				() => {
					// Create a reactive getter that accesses the layout prop
					return props.layout
				},
				(snapshot) => {
					console.warn('[Dockview] watch layout snapshot:', snapshot ? 'present' : 'null/undefined')
					// If this layout change originated from dockview itself (onDidLayoutChange),
					// do not immediately call fromJSON, otherwise we can revert the active tab.
					if (layoutSyncMode === 'ignore_next_external') {
						layoutSyncMode = 'idle'
						return
					}
					const resolvedSnapshot = resolveSnapshot(snapshot)
					if (!resolvedSnapshot || resolvedSnapshot.layout === undefined || resolvedSnapshot.layout === null) {
						layoutSyncMode = 'cleared'
						try {
							try {
								console.warn('[Dockview] Clearing layout: calling closeAllGroups and clear')
									; (createdApi as any)?.closeAllGroups?.()
									; (createdApi as any)?.clear?.()
								const panels: any[] = Array.isArray((createdApi as any).panels)
									? [...createdApi.panels]
									: []
								console.warn('[Dockview] Panels after clear:', panels.length)
								for (const p of panels) {
									createdApi.removePanel(p)
								}
							} catch {

							}
							for (const id of Object.keys(metaById)) delete (metaById as any)[id]
						} finally {
							// Keep layoutSyncMode as 'cleared' until a new panel is created
							// or an external snapshot (non-null) is provided.
						}
						return
					}

					layoutSyncMode = 'restoring'
					if (resolvedSnapshot) {
						assertJsonable(resolvedSnapshot, 'layout snapshot')
						if (createdApi && typeof createdApi.fromJSON === 'function') {
							requestAnimationFrame(() => {
								try {
									try {
										const panels: any[] = Array.isArray((createdApi as any).panels)
											? [...(createdApi as any).panels]
											: []
										for (const p of panels) {
											try {
												p?.api?.close?.()
													; (createdApi as any)?.removePanel?.(p)
											} catch {

											}
										}
										; (createdApi as any)?.closeAllGroups?.()
											; (createdApi as any)?.clear?.()
									} catch {

									}
									ensurePanelsFromSnapshot(resolvedSnapshot)
									createdApi.fromJSON(unreactive(resolvedSnapshot.layout as any))
								} finally {
									queueMicrotask(() => {
										layoutSyncMode = 'idle'
									})
								}
							})
						}
					}
				},
				{}
			)
		})
	}
	return <div {...state.el} use={initDockview}></div>
}
