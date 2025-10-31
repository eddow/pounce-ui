import { reactive } from 'mutts/src'
import { defaulted } from 'pounce-ts'
import './dock.scss'
/*
Highly experimental and not yet ready for production.
*/
export type DockZoneId = 'top' | 'right' | 'bottom' | 'left'
export type ToolbarId = string

export type ToolbarState = {
	id: ToolbarId
	zone: DockZoneId
	index: number
	collapsed?: boolean
}

export type DockApi = {
	state: {
		layout: ToolbarState[]
		dragId?: ToolbarId
		hoverZone?: DockZoneId
		hoverIndex?: number
		expandedId?: ToolbarId
	}
	setLayout(next: ToolbarState[]): void
	move(id: ToolbarId, zone: DockZoneId, index?: number): void
	setCollapsed(id: ToolbarId, collapsed: boolean): void
	startDrag(id: ToolbarId): void
	setHover(zone?: DockZoneId, index?: number): void
	endDrag(apply: boolean): void
	setExpanded(id?: ToolbarId): void
}

// Note: keep simple for now; no shared context/state until drag-dock is added

export type DockLayoutProps = {
	initialLayout: ToolbarState[]
	onLayoutChange?(state: ToolbarState[]): void
	api?: DockApi
	children: any
}

export const DockLayout = (props: DockLayoutProps, scope: any) => {
	const zones: DockZoneId[] = ['top', 'right', 'bottom', 'left']
	let dock: DockApi | undefined = scope?.dock
	if (!dock) scope.dock = dock = createDockScope(props)
	props.api = dock
	if (!dock.state.layout || dock.state.layout.length === 0) dock.setLayout(props.initialLayout)
	const layout = dock.state.layout
	return (
		<div class="pounce-dock-layout">
			{zones.map((zone) => (
				<DockZone id={zone}>{collectToolbarsForZone(zone, layout, props.children, scope)}</DockZone>
			))}
		</div>
	)
}

function createDockScope(p: DockLayoutProps): DockApi {
	const state = reactive({
		layout: normalizeIndexes([...p.initialLayout]),
		dragId: undefined as ToolbarId | undefined,
		hoverZone: undefined as DockZoneId | undefined,
		hoverIndex: undefined as number | undefined,
		expandedId: undefined as ToolbarId | undefined,
	})
	const api = {
		state,
		setLayout(next: ToolbarState[]) {
			state.layout = normalizeIndexes([...next])
			p.onLayoutChange?.(state.layout)
		},
		move(id: ToolbarId, zone: DockZoneId, index: number = 0) {
			const others = state.layout.filter((t) => t.id !== id)
			const inZone = others.filter((t) => t.zone === zone).sort((a, b) => a.index - b.index)
			const clamped = Math.max(0, Math.min(index, inZone.length))
			const existing = state.layout.find((t) => t.id === id)
			const moved: ToolbarState = existing
				? { ...existing, zone, index: clamped }
				: { id, zone, index: clamped, collapsed: false }
			api.setLayout([...others, moved])
		},
		setCollapsed(id: ToolbarId, collapsed: boolean) {
			const next = state.layout.map((t) => (t.id === id ? { ...t, collapsed } : t))
			api.setLayout(next)
		},
		startDrag(id: ToolbarId) {
			state.dragId = id
		},
		setHover(zone?: DockZoneId, index?: number) {
			state.hoverZone = zone
			state.hoverIndex = index
		},
		endDrag(apply: boolean) {
			if (
				apply &&
				state.dragId &&
				state.hoverZone !== undefined &&
				state.hoverIndex !== undefined
			) {
				api.move(state.dragId, state.hoverZone, state.hoverIndex)
			}
			state.dragId = undefined
			state.hoverZone = undefined
			state.hoverIndex = undefined
		},
		setExpanded(id?: ToolbarId) {
			state.expandedId = id
		},
	} satisfies DockApi
	return api
}

function collectToolbarsForZone(
	zone: DockZoneId,
	layout: ToolbarState[],
	children: any,
	scope: any
): any[] {
	const items = Array.isArray(children) ? children : [children]
	const byIdNodes = new Map<string, Node[]>()
	for (const child of items) {
		if (child && typeof child.render === 'function') {
			const nodes = child.render(scope)
			const id = findToolbarId(nodes)
			if (id) byIdNodes.set(id, nodes)
		}
	}
	const ordered: any[] = []
	for (const t of layout.filter((x) => x.zone === zone).sort((a, b) => a.index - b.index)) {
		const nodes = byIdNodes.get(t.id)
		if (nodes) ordered.push(...nodes)
	}
	return ordered
}

function findToolbarId(nodes: Node[]): string | undefined {
	for (const n of nodes) {
		if (n instanceof HTMLElement) {
			const id = n.getAttribute('data-toolbar-id') || (n as any).dataset?.toolbarId
			if (id) return id
		}
	}
	return undefined
}

export type DockZoneProps = {
	id: DockZoneId
	children?: any
}

export const DockZone = (props: DockZoneProps, scope?: any) => {
	const p = defaulted(props, {})
	const orientation = p.id === 'left' || p.id === 'right' ? 'vertical' : 'horizontal'
	const dock: DockApi | undefined = scope?.dock
	const children = Array.isArray(p.children) ? p.children : [p.children]
	let rendered = children
	if (dock?.state.dragId && dock?.state.hoverZone === p.id && dock.state.hoverIndex !== undefined) {
		const parts = [...children]
		parts.splice(dock.state.hoverIndex, 0, <div class="pounce-insert-marker" aria-hidden="true" />)
		rendered = parts
	}
	const computeIndexFromPointer = (ev: MouseEvent) => {
		if (!dock?.state.dragId) return
		const zoneEl = ev.currentTarget as HTMLElement
		const toolbarEls = Array.from(zoneEl.querySelectorAll<HTMLElement>('[data-toolbar-id]'))
		if (toolbarEls.length === 0) {
			dock.setHover(p.id, 0)
			return
		}
		const isVertical = orientation === 'vertical'
		const pos = isVertical ? ev.clientY : ev.clientX
		const rects = toolbarEls.map((el) => el.getBoundingClientRect())
		let idx = rects.length
		for (let i = 0; i < rects.length; i++) {
			const r = rects[i]
			const mid = isVertical ? r.top + r.height / 2 : r.left + r.width / 2
			if (pos < mid) {
				idx = i
				break
			}
		}
		dock.setHover(p.id, idx)
	}
	return (
		<div
			class={[
				`pounce-dock-zone pounce-dock-zone-${p.id} pounce-${orientation}`,
				dock?.state.hoverZone === p.id ? 'pounce-dock-zone-hovered' : undefined,
			]}
			data-zone={p.id}
			onMouseenter={(ev: MouseEvent) => computeIndexFromPointer(ev)}
			onMousemove={(ev: MouseEvent) => computeIndexFromPointer(ev)}
			onMouseleave={() => dock?.setHover(undefined, undefined)}
		>
			{rendered}
		</div>
	)
}

export type ToolbarProps = {
	id: ToolbarId
	title?: string
	collapsed?: boolean
	onCollapseToggle?: (collapsed: boolean) => void
	children?: JSX.Element | JSX.Element[]
}

export const Toolbar = (props: ToolbarProps, scope?: any) => {
	const p = defaulted(props, { collapsed: false })
	const dock = scope?.dock
	const layout: ToolbarState[] = dock?.state?.layout ?? []
	const own = layout.find((t) => t.id === p.id)
	const isCollapsed = own ? Boolean(own.collapsed) : Boolean(p.collapsed)
	const orientationClass =
		own && (own.zone === 'left' || own.zone === 'right') ? 'pounce-vertical' : 'pounce-horizontal'

	// Basic drag-to-dock: drag grip, on drop snap to nearest edge
	let dragging = false
	const onMouseMove = (ev: MouseEvent) => {
		if (!dragging) return
		ev.preventDefault()
	}
	const onMouseUp = (ev: MouseEvent) => {
		if (!dragging) return
		dragging = false
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', onMouseUp)
		// If hovering a zone with an index, apply move there; else fallback to nearest edge
		if (dock?.state.hoverZone !== undefined && dock.state.hoverIndex !== undefined) {
			dock.endDrag(true)
			return
		}
		const x = ev.clientX
		const y = ev.clientY
		const w = window.innerWidth
		const h = window.innerHeight
		const dTop = y
		const dBottom = h - y
		const dLeft = x
		const dRight = w - x
		const min = Math.min(dTop, dBottom, dLeft, dRight)
		let zone: DockZoneId = 'top'
		if (min === dTop) zone = 'top'
		else if (min === dBottom) zone = 'bottom'
		else if (min === dLeft) zone = 'left'
		else zone = 'right'
		// insert at end of the target zone
		const targetIndex = layout.filter((t) => t.zone === zone).length
		dock?.move?.(p.id, zone, targetIndex)
		dock?.endDrag(false)
	}
	const onGripMouseDown = (_ev: MouseEvent) => {
		dragging = true
		dock?.startDrag?.(p.id)
		document.addEventListener('mousemove', onMouseMove, { passive: false })
		document.addEventListener('mouseup', onMouseUp)
	}
	const toggle = () => {
		const next = !isCollapsed
		p.onCollapseToggle?.(next)
		dock?.setCollapsed?.(p.id, next)
	}

	// Hover-expand when collapsed
	let hoverTimer: number | undefined
	const onEnter = () => {
		if (!isCollapsed) return
		if (hoverTimer) window.clearTimeout(hoverTimer)
		hoverTimer = window.setTimeout(() => dock?.setExpanded?.(p.id), 160)
	}
	const onLeave = () => {
		if (hoverTimer) window.clearTimeout(hoverTimer)
		dock?.setExpanded?.(undefined)
	}
	const showItems = !isCollapsed || dock?.state.expandedId === p.id
	return (
		<div
			class={`pounce-toolbar ${orientationClass}`}
			data-toolbar-id={p.id}
			data-collapsed={isCollapsed ? 'true' : 'false'}
			onMouseenter={onEnter}
			onMouseleave={onLeave}
		>
			<span class="pounce-toolbar-grip" aria-hidden="true" onMousedown={onGripMouseDown}>
				⋮
			</span>
			{p.title ? <div class="pounce-toolbar-title">{p.title}</div> : undefined}
			<div class="pounce-toolbar-items" hidden={!showItems}>
				{p.children}
			</div>
			<button
				class="pounce-toolbar-collapse"
				onClick={toggle}
				aria-pressed={isCollapsed}
				aria-label={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
			>
				{isCollapsed ? '▸' : '▾'}
			</button>
		</div>
	)
}

export type ToolbarItemProps = {
	children?: string | JSX.Element | (string | JSX.Element)[]
	onSelect?: () => void
	disabled?: boolean
	title?: string
}

export const ToolbarItem = (props: ToolbarItemProps) => {
	const p = defaulted(props, {})
	return (
		<button
			class="pounce-toolbar-item"
			type="button"
			disabled={p.disabled}
			onClick={p.onSelect}
			title={p.title}
		>
			{p.children}
		</button>
	)
}

function normalizeIndexes(state: ToolbarState[]): ToolbarState[] {
	const zones: DockZoneId[] = ['top', 'right', 'bottom', 'left']
	const next: ToolbarState[] = []
	zones.forEach((zone) => {
		const inZone = state.filter((t) => t.zone === zone).sort((a, b) => a.index - b.index)
		inZone.forEach((t, i) => {
			next.push({ ...t, index: i })
		})
	})
	return next
}

// Convenience re-exports for API familiarity
export const Dock = {
	Layout: DockLayout,
	Zone: DockZone,
}

export const ToolbarNS = {
	Root: Toolbar,
	Item: ToolbarItem,
}
