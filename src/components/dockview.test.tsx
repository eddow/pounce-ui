/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals'

// Mock pounce-ts to avoid rendering runtime errors and provide global h
jest.unstable_mockModule('pounce-ts', () => {
	const h = jest.fn((tag: any, props: any) => ({ tag, props }));
	return {
		__esModule: true,
		bindApp: jest.fn(),
		h: h,
		compose: jest.fn((def: any, props: any) => Object.assign({}, def, props)),
		extend: jest.fn((a: any, b: any) => Object.assign(a, b))
	}
})

// Mock dockview-core
jest.unstable_mockModule('dockview-core', () => ({
	__esModule: true,
	createDockview: jest.fn(),
	DockviewApi: jest.fn(),
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
		const widget = jest.fn()
		const link: any = {
			id: 'test-panel',
			scope: { api: {} },
			component: 'test-component'
		}
		const metaById: any = {}
		const schedulePersist = jest.fn()

		const renderer = contentRenderer(widget, link, metaById, schedulePersist)

		const panelApiMock = {
			setTitle: jest.fn(),
			updateParameters: jest.fn(),
			onDidTitleChange: jest.fn(() => () => { }),
			onDidParametersChange: jest.fn(() => () => { })
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
		const widget = jest.fn()
		const link: any = {
			id: 'test-panel',
			scope: { api: {} },
			component: 'test-component'
		}
		const metaById: any = {}
		const schedulePersist = jest.fn()

		const renderer = contentRenderer(widget, link, metaById, schedulePersist)

		let fireTitleChange: any
		const panelApiMock = {
			setTitle: jest.fn(),
			updateParameters: jest.fn(),
			onDidTitleChange: jest.fn((cb: any) => {
				fireTitleChange = cb
				return () => { }
			}),
			onDidParametersChange: jest.fn(() => () => { })
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
