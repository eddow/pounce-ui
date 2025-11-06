import './dockview.scss'
import {
	CreateComponentOptions,
	createDockview,
	DockviewApi,
	DockviewPanelApi,
	GroupPanelPartInitParameters,
	IContentRenderer,
} from 'dockview-core'
import { effect, reactive, ScopedCallback, unreactive, watch } from 'mutts/src'
import { bindApp, decompose, extended } from 'pounce-ts'

// Scope passed to widgets always has api defined (set before widget is called)
type DockviewScope = Record<string, any> & { api: DockviewApi }
type DvWidget<T extends Record<string, any>> = (
	props: T & { title: string; api: DockviewPanelApi; size: { width: number; height: number } },
	scope: DockviewScope
) => JSX.Element

function contentRenderer(widget: DvWidget<any>, link: { props?: any; scope: DockviewScope }) {
	const element = document.createElement('div')
	element.style.height = '100%'
	element.style.width = '100%'
	const size = reactive({ width: 0, height: 0 })
	let cleanup: ScopedCallback | undefined
	return {
		element,
		init: (params: GroupPanelPartInitParameters) => {
			const api = unreactive(params.api)
			link.props = reactive({ params: params.params, title: params.title, api, size })
			let jsx: JSX.Element | undefined
			cleanup = effect(() => {
				watch(
					() => link.props.title,
					(title) => {
						api.setTitle(title)
					}
				)
				watch(
					() => link.props.params,
					(params) => {
						// TODO: could be a simple effect ?
						debugger
						api.updateParameters(params)
					},
					{ deep: true }
				)
				jsx = widget(link.props, link.scope as DockviewScope)
			})
			bindApp(jsx!, element, link.scope)
		},
		layout: (width: number, height: number) => {
			size.width = width
			size.height = height
		},
		dispose() {
			cleanup?.()
		},
	} satisfies IContentRenderer
}

export const Dockview = (
	props: {
		api?: DockviewApi
		widgets: Record<string, DvWidget<any>>
		tabs?: Record<string, DvWidget<any>>
	} & JSX.BaseHTMLAttributes,
	scope: Record<string, any>
) => {
	const links = new Map<string, { props?: any; scope: DockviewScope }>()
	const htmlAttrs = decompose(props, ({ api, widgets, ...rest }) => rest)
	const initDockview = (element: HTMLElement) => {
		props.api = scope.api = unreactive(
			createDockview(element, {
				createComponent(options: CreateComponentOptions) {
					const panelLink = { scope: extended({}, scope as DockviewScope) }
					links.set(options.id, panelLink)
					const widget = props.widgets[options.name]
					if (!widget) throw new Error(`Widget ${options.name} not found`)
					return contentRenderer(widget, panelLink)
				},
				/*createLeftHeaderActionComponent(_group: DockviewGroupPanel) {
					const element = document.createElement('div')
					return {
						element,
						init(params: GroupPanelPartInitParameters) {

						},
						dispose() {
						},
					}
				},*/
				createTabComponent(options: CreateComponentOptions) {
					const element = document.createElement('div')
					element.style.height = '100%'
					element.style.width = '100%'
					const widget = props.tabs?.[options.name]
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
	}
	return <div {...htmlAttrs} use={initDockview}></div>
}
