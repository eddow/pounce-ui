import { buildRoute, matchRoute, routeMatcher } from './router'

describe('matchRoute', () => {
	test('matches literal routes and extracts path parameters', () => {
		const definition = { path: '/users/{userId:integer}' }
		const result = matchRoute('/users/42', [definition])

		expect(result).not.toBeNull()
		expect(result?.definition).toBe(definition)
		expect(result?.definition).toBe(definition)
		expect(result?.params).toEqual({ userId: '42' })
		expect(result?.unusedPath).toBe('')
	})

	test('supports required and optional query parameters', () => {
		const definition = { path: '/search?term={term}&page={page:integer?}' }
		const result = matchRoute('/search?term=hello', [definition])

		expect(result).not.toBeNull()
		expect(result?.params).toEqual({ term: 'hello' })
		expect(result?.unusedPath).toBe('')
	})

	test('requires parameter formats to match', () => {
		const definition = { path: '/users/{userId:integer}' }
		const result = matchRoute('/users/not-a-number', [definition])

		expect(result).toBeNull()
	})

	test('returns unused path, query, and hash portions', () => {
		const definition = { path: '/docs/{section}?term={term?}' }
		const result = matchRoute('/docs/api/reference?filter=beta#intro', [definition])

		expect(result).not.toBeNull()
		expect(result?.params).toEqual({ section: 'api' })
		expect(result?.unusedPath).toBe('/reference?filter=beta#intro')
	})
})

describe('routeMatcher', () => {
	test('returns a matching route specification', () => {
		const routes = [{ path: '/users/{userId:integer}' }, { path: '/search' }]
		const analyze = routeMatcher(routes)

		const spec = analyze('/users/101')

		expect(spec).not.toBeNull()
		expect(spec?.definition).toBe(routes[0])
		expect(spec?.params).toEqual({ userId: '101' })
		expect(spec?.unusedPath).toBe('')
	})

	test('returns null when no route matches the provided url', () => {
		const routes = [{ path: '/health' }]
		const analyze = routeMatcher(routes)

		expect(analyze('/missing')).toBeNull()
	})
})

describe('buildRoute', () => {
	test('builds path with parameters', () => {
		expect(buildRoute('/users/{userId}', { userId: '42' })).toBe('/users/42')
	})

	test('builds query string with required and optional params', () => {
		expect(
			buildRoute('/search?term={term}&page={page:integer?}', { term: 'hello', page: '2' })
		).toBe('/search?term=hello&page=2')
	})

	test('omits optional query parameters when missing', () => {
		expect(buildRoute('/search?term={term}&page={page:integer?}', { term: 'hello' })).toBe(
			'/search?term=hello'
		)
	})

	test('encodes parameter values', () => {
		expect(buildRoute('/docs/{section}', { section: 'API Specs' })).toBe('/docs/API%20Specs')
	})

	test('appends unused path portion', () => {
		expect(buildRoute('/docs/{section}', { section: 'api' }, '/reference#intro')).toBe(
			'/docs/api/reference#intro'
		)
	})

	test('throws when required path parameter missing', () => {
		expect(() => buildRoute('/users/{userId}', {})).toThrow(
			'Missing value for path parameter: userId'
		)
	})

	test('throws when required query parameter missing', () => {
		expect(() => buildRoute('/search?term={term}', {} as any)).toThrow(
			'Missing value for query parameter: term'
		)
	})
})
