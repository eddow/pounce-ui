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
import { effect, reactive, ScopedCallback, unreactive, watch } from 'mutts/src'
import { bindApp, compose, extend } from 'pounce-ts'
import { css } from '../lib/css'

css`@import 'dockview-core/dist/styles/dockview.css';`

// Scope passed to widgets always has api defined (set before widget is called)
type DockviewScope = Record<string, any> & { api: DockviewApi }
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
type DvHeaderAction = (props: DockviewHeaderActionProps) => JSX.Element

interface DockviewLinkProps {
	params?: unknown
	title: string
	api: DockviewPanelApi
	size: { width: number; height: number }
}

function contentRenderer(
	widget: DvWidget<any>,
	link: { props?: DockviewLinkProps; scope: DockviewScope }
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
			link.props = reactive({ params: params.params, title: params.title, api, size })
			// Loop suppression flags for bi-directional updates
			let suppressTitle = false
			let suppressParams = false
			// Subscribe to Dockview → props (reverse flow) if supported
			try {
				const panelId: unknown = api?.id
				const onTitle = api?.onDidTitleChange
				const onParams = api?.onDidParametersChange
				if (typeof onTitle === 'function') {
					const dispose = onTitle((e: { title: string }) => {
						suppressTitle = true
						if (link.props) link.props.title = e.title
						queueMicrotask(() => {
							suppressTitle = false
						})
					})
					if (typeof dispose === 'function') cleanups.push(dispose)
				}
				if (typeof onParams === 'function') {
					const dispose = onParams((nextParams: unknown) => {
						suppressParams = true
						if (link.props) link.props.params = nextParams
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
						suppressParams = true
						if (link.props && detail.params !== undefined) link.props.params = detail.params
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
			let jsx: JSX.Element | undefined
			cleanup = effect(() => {
				watch(
					() => link.props?.title,
					(title) => {
						if (!suppressTitle && typeof api?.setTitle === 'function' && title !== undefined) {
							api.setTitle(title)
						}
					}
				)
				watch(
					() => link.props?.params,
					(params) => {
						if (!suppressParams && typeof api?.updateParameters === 'function') {
							api.updateParameters(params)
						}
					},
					{ deep: true }
				)
				jsx = widget(link.props!, link.scope as DockviewScope)
			})
			bindApp(jsx!, element, link.scope)
		},
		layout: (width: number, height: number) => {
			size.width = width
			size.height = height
		},
		dispose() {
			cleanup?.()
			for (const fn of cleanups) fn()
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
function headerActionRenderer(widget: DvHeaderAction, api: DockviewApi, group: DockviewGroupPanel) {
	const element = document.createElement('div')
	element.style.height = '100%'
	element.style.width = '100%'
	let cleanup: ScopedCallback | undefined
	return {
		element,
		init(_params: any) {
			let jsx: JSX.Element | undefined
			cleanup = effect(() => {
				jsx = widget({ api, group })
			})
			const headerScope = extend({}, { api }) as DockviewScope
			bindApp(jsx!, element, headerScope)
		},
		dispose() {
			cleanup?.()
		},
	}
}

export const Dockview = (
	props: {
		api?: DockviewApi
		widgets: Record<string, DvWidget<any>>
		tabs?: Record<string, DvWidget<any>>
		headerLeft?: Record<string, DvHeaderAction>
		headerRight?: Record<string, DvHeaderAction>
		headerPrefix?: Record<string, DvHeaderAction>
		options?: FreeDockviewOptions
		layout?: SerializedDockview
		el?: JSX.GlobalHTMLAttributes
	},
	scope: Record<string, any>
) => {
	const links = new Map<string, { props?: DockviewLinkProps; scope: DockviewScope }>()
	const state = compose({ options: {} }, props)
	const options: FreeDockviewOptions = {}
	effect(() => {
		if (props.api) props.api.updateOptions(state.options)
		else Object.assign(options, state.options)
	})
	const initDockview = (element: HTMLElement) => {
		const createdApi = unreactive(
			createDockview(element, {
				...options,
				createComponent(options: CreateComponentOptions) {
					const panelLink = { scope: extend({}, scope as DockviewScope) }
					links.set(options.id, panelLink)
					const widget = state.widgets[options.name]
					if (!widget) throw new Error(`Widget ${options.name} not found`)
					return contentRenderer(widget, panelLink)
				},
				createLeftHeaderActionComponent(group: DockviewGroupPanel) {
					// Use 'default' key for now; component name lookup would come from group options
					const widget = state.headerLeft?.default
					if (!widget) {
						const element = document.createElement('div')
						return { element, init: () => {}, dispose: () => {} }
					}
					const api = props.api
					if (!api) {
						const element = document.createElement('div')
						return { element, init: () => {}, dispose: () => {} }
					}
					return headerActionRenderer(widget, api, group)
				},
				createRightHeaderActionComponent(group: DockviewGroupPanel) {
					const widget = state.headerRight?.default
					if (!widget) {
						const element = document.createElement('div')
						return { element, init: () => {}, dispose: () => {} }
					}
					const api = props.api
					if (!api) {
						const element = document.createElement('div')
						return { element, init: () => {}, dispose: () => {} }
					}
					return headerActionRenderer(widget, api, group)
				},
				createPrefixHeaderActionComponent(group: DockviewGroupPanel) {
					const widget = state.headerPrefix?.default
					if (!widget) {
						const element = document.createElement('div')
						return { element, init: () => {}, dispose: () => {} }
					}
					const api = props.api
					if (!api) {
						const element = document.createElement('div')
						return { element, init: () => {}, dispose: () => {} }
					}
					return headerActionRenderer(widget, api, group)
				},
				createTabComponent(options: CreateComponentOptions) {
					const element = document.createElement('div')
					element.style.height = '100%'
					element.style.width = '100%'
					const widget = state.tabs?.[options.name]
					if (!widget) return
					const panelLink = links.get(options.id)!
					let cleanup: ScopedCallback | undefined
					return {
						element,
						init(_params: GroupPanelPartInitParameters) {
							let jsx: JSX.Element | undefined
							cleanup = effect(() => {
								jsx = widget(panelLink.props, panelLink.scope as DockviewScope)
							})
							bindApp(jsx!, element, panelLink.scope as DockviewScope)
						},
						dispose() {
							cleanup?.()
							links.delete(options.id)
						},
					}
				},
			})
		)
		// Set api on props, scope, and call callback to update parent
		props.api = scope.api = createdApi

		// Handle layout initialization and updates
		let suppressLayout = false

		// Restore initial layout if provided
		if (state.layout !== undefined && state.layout !== null) {
			try {
				// Use dockview-core fromJSON method with type assertion
				if (typeof createdApi.fromJSON === 'function') {
					createdApi.fromJSON(state.layout)
				}
			} catch {
				// best-effort layout restoration; ignore if API shape differs
			}
		}

		// Subscribe to layout changes from dockview
		try {
			const onDidLayoutChange = createdApi?.onDidLayoutChange
			if (typeof onDidLayoutChange === 'function') {
				onDidLayoutChange(() => {
					try {
						// Get current layout from dockview
						let currentLayout: SerializedDockview | undefined
						if (typeof createdApi.toJSON === 'function') {
							currentLayout = createdApi.toJSON()
						} else {
							return
						}

						// Update layout prop (with loop suppression)
						suppressLayout = true
						if (props.layout !== currentLayout) props.layout = currentLayout
						queueMicrotask(() => {
							suppressLayout = false
						})
					} catch {
						// best-effort layout sync; ignore if API shape differs
					}
				})
			}
		} catch {
			// best-effort layout subscription; ignore if API shape differs
		}

		// Watch layout prop changes to restore layout
		effect(() => {
			watch(
				() => state.layout,
				(layout) => {
					if (!suppressLayout && layout !== undefined && layout !== null && createdApi) {
						try {
							// Use dockview-core fromJSON method with type assertion
							if (typeof createdApi.fromJSON === 'function') {
								createdApi.fromJSON(layout as any)
							}
						} catch {
							// best-effort layout restoration; ignore if API shape differs
						}
					}
				},
				{ deep: true }
			)
		})
	}
	return <div {...state.el} use={initDockview}></div>
}
