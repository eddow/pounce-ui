import { vi, describe, it, expect } from 'vitest'

// Mock pounce-ts to avoid rendering runtime errors and provide global h
vi.mock('pounce-ts', async () => {
	const actual = await vi.importActual('pounce-ts') as any
	const h = vi.fn((tag: any, props: any) => ({ tag, props }));
	return {
		...actual,
		bindApp: vi.fn(),
		h: h,
		compose: vi.fn((def: any, props: any) => Object.assign({}, def, props)),
		extend: vi.fn((a: any, b: any) => Object.assign(a, b))
	}
})

// Mock dockview-core
vi.mock('dockview-core', () => ({
	createDockview: vi.fn(),
	DockviewApi: vi.fn(),
}))

// Import SUT after mocks
const { contentRenderer } = await import('./dockview')
const { h } = await import('pounce-ts')

// Ensure h is global for the SUT if it relies on implicit global h
// The user said "don't import h - it should be mae global... make sure it gets setup even in the tests"
// So we attach our mocked h to the global object.
// @ts-ignore
global.h = h

describe('contentRenderer Title Sync', () => {
	it('should forward props.title changes to api (Forward Sync)', async () => {
		const widget = vi.fn()
		const link: any = {
			id: 'test-panel',
			scope: { api: {} },
			component: 'test-component'
		}
		const metaById: any = {}
		const schedulePersist = vi.fn()

		const renderer = contentRenderer(widget, link, metaById, schedulePersist)

		const panelApiMock = {
			setTitle: vi.fn(),
			updateParameters: vi.fn(),
			onDidTitleChange: vi.fn(() => () => { }),
			onDidParametersChange: vi.fn(() => () => { })
		}

		const initParams = {
			api: panelApiMock,
			params: {},
			title: 'Initial Title'
		}

		renderer.init(initParams as any)

		// Verify link.props was initialized
		expect(link.props).toBeDefined()
		expect(link.props.title).toBe('Initial Title')

		// Update title via props (Simulating component logic)
		link.props.title = 'Updated Title'

		// Wait for microtasks (mutts watcher)
		await Promise.resolve()

		expect(panelApiMock.setTitle).toHaveBeenCalledWith('Updated Title')
	})

	it('should update props.title on API change (Reverse Sync)', async () => {
		const widget = vi.fn()
		const link: any = {
			id: 'test-panel',
			scope: { api: {} },
			component: 'test-component'
		}
		const metaById: any = {}
		const schedulePersist = vi.fn()

		const renderer = contentRenderer(widget, link, metaById, schedulePersist)

		let fireTitleChange: any
		const panelApiMock = {
			setTitle: vi.fn(),
			updateParameters: vi.fn(),
			onDidTitleChange: vi.fn((cb: any) => {
				fireTitleChange = cb
				return () => { }
			}),
			onDidParametersChange: vi.fn(() => () => { })
		}

		renderer.init({ api: panelApiMock, params: {}, title: 'Initial' } as any)

		expect(fireTitleChange).toBeDefined()

		fireTitleChange('New Title From API')
		await Promise.resolve()

		expect(link.props.title).toBe('New Title From API')
		// Loop suppression check: props update shouldn't call api.setTitle if it came from API
		expect(panelApiMock.setTitle).not.toHaveBeenCalled()
	})
})
