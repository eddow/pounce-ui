# Dockview

A dockable panel system built on dockview-core with reactive bindings.

## Basic

```ts
import { Dockview } from 'pounce-ui'

const widgets = {
	myPanel: (props, scope) => <div>Panel content</div>,
}

<Dockview widgets={widgets} />
```

## Widgets (Content Components)

Widgets render the main content of each panel. They receive reactive props and a shared scope.

```ts
type DockviewWidgetProps<T = Record<string, unknown>> = T & {
	title: string
	api: DockviewPanelApi
	size: { width: number; height: number }
	params?: unknown
}

const myWidget = (props: DockviewWidgetProps, scope: DockviewScope) => {
	return (
		<div>
			<h3>{props.title}</h3>
			<p>Size: {props.size.width} x {props.size.height}</p>
			<p>Params: {JSON.stringify(props.params)}</p>
		</div>
	)
}

<Dockview widgets={{ myPanel: myWidget }} />
```

## Tabs

Custom tab components share scope with their panel widget.

```ts
const tabWidget = (props, scope) => (
	<div style="display: flex; gap: 0.25rem; align-items: center;">
		<button onClick={() => scope.state.clicks++}>+1</button>
		<span>{scope.state.clicks}</span>
	</div>
)

<Dockview
	widgets={{ myPanel: myWidget }}
	tabs={{ custom: tabWidget }}
/>

// Use when adding panels:
api.addPanel({
	id: 'panel-1',
	component: 'myPanel',
	tabComponent: 'custom',
	title: 'My Panel',
})
```

## Header Actions

Custom components for group header areas (left, right, prefix).

```ts
type DockviewHeaderActionProps = {
	api: DockviewApi
	group: DockviewGroupPanel
}

const headerAction = ({ api, group }: DockviewHeaderActionProps) => (
	<div>{group.panels.length} panels</div>
)

<Dockview
	widgets={widgets}
	headerRight={{ default: headerAction }}
/>
```

## Layout Persistence

The `layout` prop enables bidirectional layout synchronization.

### Restore Layout on Initialization

```ts
const savedLayout = { /* serialized layout from api.toJSON() */ }

<Dockview
	widgets={widgets}
	layout={savedLayout}
/>
```

### Automatic Layout Updates

The `layout` prop automatically updates when the dockview layout changes:

```ts
const state = reactive({ layout: undefined })

<Dockview
	widgets={widgets}
	layout={state.layout}
/>

// Save layout when it changes
effect(() => {
	if (state.layout) {
		localStorage.setItem('dockview-layout', JSON.stringify(state.layout))
	}
})
```

### Restore Layout Programmatically

You can also update the layout prop to restore a different layout:

```ts
const state = reactive({ layout: undefined })

<Dockview
	widgets={widgets}
	layout={state.layout}
/>

// Restore from storage
state.layout = JSON.parse(localStorage.getItem('dockview-layout') || 'null')
```

The layout prop uses `api.fromJSON()` and `api.toJSON()` internally, with loop suppression to prevent infinite update cycles.

## API Access

Access the DockviewApi to programmatically control panels.

```ts
let api: DockviewApi | undefined

<Dockview
	widgets={widgets}
	api={api}
/>

// After mount, api is set
effect(() => {
	if (api) {
		api.addPanel({
			id: 'panel-1',
			component: 'myPanel',
			title: 'New Panel',
		})
	}
})
```

The API is also available in widget scope:

```ts
const widget = (props, scope: DockviewScope) => {
	// scope.api is the global DockviewApi
	return (
		<button onClick={() => scope.api.addPanel({ ... })}>
			Add Panel
		</button>
	)
}
```

## Bidirectional Sync

### Title Sync

Panel titles sync bidirectionally between props and the dockview API.

```ts
const widget = (props: DockviewWidgetProps) => {
	// Update title via props (forward sync)
	const updateTitle = () => {
		props.title = 'New Title'
	}

	// Title also updates when changed via API (reverse sync)
	return (
		<div>
			<h3>{props.title}</h3>
			<button onClick={updateTitle}>Change Title</button>
		</div>
	)
}
```

### Params Sync

Panel parameters sync bidirectionally with loop suppression.

```ts
const widget = (props: DockviewWidgetProps) => {
	// Update params via props
	const updateParams = () => {
		props.params = { count: (props.params?.count || 0) + 1 }
	}

	// Params update when changed via:
	// - props.params = ...
	// - props.api.updateParameters(...)
	// - CustomEvent 'param-update' with { id, params }

	return (
		<div>
			<p>Count: {props.params?.count || 0}</p>
			<button onClick={updateParams}>Increment</button>
		</div>
	)
}
```

## Options

Pass dockview-core options (excluding component factories):

```ts
<Dockview
	widgets={widgets}
	options={{
		disableAutoResizing: true,
		// ... other DockviewComponentOptions
	}}
/>
```

## Props

- `api?: DockviewApi` - Optional API reference (set after mount)
- `widgets: Record<string, DvWidget<any>>` - Content component registry
- `tabs?: Record<string, DvWidget<any>>` - Tab component registry
- `headerLeft?: Record<string, DvHeaderAction>` - Left header actions
- `headerRight?: Record<string, DvHeaderAction>` - Right header actions
- `headerPrefix?: Record<string, DvHeaderAction>` - Prefix header actions
- `options?: FreeDockviewOptions` - Dockview configuration options
- `layout?: unknown` - Serialized layout for restoration (auto-updates on changes)
- `el?: JSX.GlobalHTMLAttributes` - Element attributes

## Types

### DockviewWidgetProps

```ts
export type DockviewWidgetProps<T = Record<string, unknown>> = T & {
	title: string
	api: DockviewPanelApi
	size: { width: number; height: number }
	params?: unknown
}
```

### DockviewHeaderActionProps

```ts
export type DockviewHeaderActionProps = {
	api: DockviewApi
	group: DockviewGroupPanel
}
```

### DockviewScope

Widgets receive a scope with the global API:

```ts
type DockviewScope = Record<string, any> & { api: DockviewApi }
```

## Notes

- Widget props are reactive; changes sync with dockview API
- Loop suppression prevents infinite update cycles
- Layout prop updates automatically via `onDidLayoutChange`
- API is set on props and scope after component mount
- Header actions use 'default' key for now (component name lookup may be added later)

