import { cleanedBy, effect, reactive, unreactive } from 'mutts/src'
import { copyObject, extended } from 'pounce-ts'
import { browser } from './browser'

export type RouteWildcard = string //`/${string}`

export type RouteParamFormat = 'string' | 'number' | 'integer' | 'float' | 'uuid' | RegExp

export interface RouteDefinition {
	readonly path: RouteWildcard
	//readonly view: RouterRender<any>
}

export type RouteParameters = Record<string, string>

export interface RouteSpecification<Definition extends RouteDefinition> {
	readonly definition: Definition
	params: RouteParameters
	unusedPath: string
}

export type RouteAnalyzer<Definition extends RouteDefinition> = (
	url: string
) => RouteSpecification<Definition> | null

export function routeMatcher<Definition extends RouteDefinition>(
	routes: readonly Definition[]
): RouteAnalyzer<Definition> {
	const preparedDefinitions = routes
		.map((definition) => prepareRouteDefinition(definition))
		.sort(comparePreparedDefinitions)

	return (url: string) => matchPreparedRoutes(url, preparedDefinitions)
}

type ParsedPathSegment =
	| { readonly kind: 'literal'; readonly value: string }
	| { readonly kind: 'param'; readonly name: string; readonly format: RouteParamFormat }

interface ParsedQueryParam {
	readonly key: string
	readonly name: string
	readonly format: RouteParamFormat
	readonly optional: boolean
}

interface ParsedWildcard {
	readonly path: readonly ParsedPathSegment[]
	readonly query: readonly ParsedQueryParam[]
}

interface ParsedParamToken {
	readonly name: string
	readonly format: RouteParamFormat
	readonly optional: boolean
}

interface PreparedRouteDefinition<Definition extends RouteDefinition> {
	readonly definition: Definition
	readonly parsed: ParsedWildcard
}

const PARAM_TOKEN_REGEX =
	/^(?<name>[A-Za-z_][\w-]*)(?::(?<format>[A-Za-z_][\w-]*))?(?<optional>\?)?$/

const UUID_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

export function matchRoute<Definition extends RouteDefinition>(
	road: string,
	definitions: readonly Definition[]
): RouteSpecification<Definition> | null {
	const prepared = definitions
		.map((definition) => prepareRouteDefinition(definition))
		.sort(comparePreparedDefinitions)
	return matchPreparedRoutes(road, prepared)
}

export function buildRoute(
	path: RouteWildcard,
	params: RouteParameters = {},
	unusedPath?: string
): string {
	const parsed = parseWildcard(path)
	const segments = parsed.path.map((segment) => {
		if (segment.kind === 'literal') {
			return segment.value
		}

		const value = params[segment.name]
		if (value === undefined) {
			throw new Error(`Missing value for path parameter: ${segment.name}`)
		}

		return encodeURIComponent(value)
	})

	let url = `/${segments.join('/')}`
	if (url.length === 0) {
		url = '/'
	}
	if (url.length > 1 && url.endsWith('/')) {
		url = url.slice(0, -1)
	}

	const queryParts: string[] = []
	for (const spec of parsed.query) {
		const value = params[spec.name]
		if (value === undefined) {
			if (spec.optional) {
				continue
			}
			throw new Error(`Missing value for query parameter: ${spec.name}`)
		}
		queryParts.push(`${encodeURIComponent(spec.key)}=${encodeURIComponent(value)}`)
	}

	if (queryParts.length > 0) {
		url += `?${queryParts.join('&')}`
	}

	if (unusedPath) {
		if (/^[/?#]/.test(unusedPath)) {
			url += unusedPath
		} else {
			url += `/${unusedPath}`
		}
	}

	return url
}

interface DissectedRoad {
	readonly pathSegments: readonly string[]
	readonly queryString: string
	readonly hash: string
}

function dissectRoad(road: string): DissectedRoad {
	let pathPart = road
	let queryString = ''
	let hash = ''

	const hashIndex = pathPart.indexOf('#')
	if (hashIndex >= 0) {
		hash = pathPart.slice(hashIndex)
		pathPart = pathPart.slice(0, hashIndex)
	}

	const queryIndex = pathPart.indexOf('?')
	if (queryIndex >= 0) {
		queryString = pathPart.slice(queryIndex + 1)
		pathPart = pathPart.slice(0, queryIndex)
	}

	const trimmedPath = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart
	const pathSegments = trimmedPath.split('/').filter((segment) => segment.length > 0)

	return {
		pathSegments,
		queryString,
		hash,
	}
}

function parseWildcard(pattern: RouteWildcard): ParsedWildcard {
	let pathPart: string = pattern
	let queryPart = ''

	const queryIndex = pathPart.indexOf('?')
	if (queryIndex >= 0) {
		queryPart = pathPart.slice(queryIndex + 1)
		pathPart = pathPart.slice(0, queryIndex)
	}

	const trimmedPath = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart
	const pathSegments = trimmedPath
		.split('/')
		.filter((segment) => segment.length > 0)
		.map(parsePathSegment)

	const query = queryPart.length > 0 ? parseQueryPart(queryPart) : []

	return { path: pathSegments, query }
}

function parsePathSegment(segment: string): ParsedPathSegment {
	if (segment.startsWith('{') && segment.endsWith('}')) {
		const param = parseParamToken(segment.slice(1, -1))
		if (param.optional) {
			throw new Error('Path parameters cannot be optional in route wildcard')
		}
		return {
			kind: 'param',
			name: param.name,
			format: param.format,
		}
	}

	return { kind: 'literal', value: segment }
}

function parseQueryPart(query: string): ParsedQueryParam[] {
	return query
		.split('&')
		.filter((entry) => entry.length > 0)
		.map((entry) => {
			const equalIndex = entry.indexOf('=')
			const keyPart = equalIndex >= 0 ? entry.slice(0, equalIndex) : undefined
			const tokenPart = equalIndex >= 0 ? entry.slice(equalIndex + 1) : entry

			if (!tokenPart.startsWith('{') || !tokenPart.endsWith('}')) {
				throw new Error('Query parameters must use `{}` notation in route wildcard')
			}

			const param = parseParamToken(tokenPart.slice(1, -1))
			const key = keyPart && keyPart.length > 0 ? keyPart : param.name

			return {
				key,
				name: param.name,
				format: param.format,
				optional: param.optional,
			}
		})
}

function parseParamToken(token: string): ParsedParamToken {
	const match = token.match(PARAM_TOKEN_REGEX)
	if (!match || !match.groups) {
		throw new Error(`Invalid route parameter token: {${token}}`)
	}

	const { name, format, optional } = match.groups
	return {
		name,
		format: normalizeFormat(format),
		optional: optional === '?',
	}
}

function prepareRouteDefinition<Definition extends RouteDefinition>(
	definition: Definition
): PreparedRouteDefinition<Definition> {
	return unreactive({
		definition,
		parsed: parseWildcard(definition.path),
	})
}

function comparePreparedDefinitions(
	a: PreparedRouteDefinition<RouteDefinition>,
	b: PreparedRouteDefinition<RouteDefinition>
): number {
	const segmentDiff = b.parsed.path.length - a.parsed.path.length
	if (segmentDiff !== 0) {
		return segmentDiff
	}
	return b.parsed.query.length - a.parsed.query.length
}

function matchPreparedRoutes<Definition extends RouteDefinition>(
	road: string,
	preparedDefinitions: readonly PreparedRouteDefinition<Definition>[]
): RouteSpecification<Definition> | null {
	const dissectedRoad = dissectRoad(road)

	for (const prepared of preparedDefinitions) {
		const { definition, parsed } = prepared
		const pathMatch = matchPath(parsed.path, dissectedRoad.pathSegments)
		if (!pathMatch) {
			continue
		}

		const queryMatch = matchQuery(parsed.query, dissectedRoad.queryString)
		if (!queryMatch) {
			continue
		}

		const unusedPath = buildUnusedPath(
			dissectedRoad.pathSegments,
			pathMatch.consumedSegments,
			queryMatch.unusedQuery,
			dissectedRoad.hash
		)

		return {
			definition,
			params: {
				...pathMatch.params,
				...queryMatch.params,
			},
			unusedPath,
		}
	}

	return null
}

function normalizeFormat(format?: string): RouteParamFormat {
	if (!format) {
		return 'string'
	}

	const lowered = format.toLowerCase()
	switch (lowered) {
		case 'string':
			return 'string'
		case 'number':
			return 'number'
		case 'float':
			return 'float'
		case 'int':
		case 'integer':
			return 'integer'
		case 'uuid':
			return 'uuid'
		default:
			throw new Error(`Unsupported route parameter format: ${format}`)
	}
}

interface PathMatchResult {
	readonly consumedSegments: number
	readonly params: Record<string, string>
}

function matchPath(
	segments: readonly ParsedPathSegment[],
	actualSegments: readonly string[]
): PathMatchResult | null {
	if (segments.length > actualSegments.length) {
		return null
	}

	const params: Record<string, string> = {}

	for (let index = 0; index < segments.length; index += 1) {
		const spec = segments[index]
		const actualRaw = actualSegments[index]
		const actual = safeDecode(actualRaw)

		if (spec.kind === 'literal') {
			if (actual !== spec.value) {
				return null
			}
			continue
		}

		if (!matchesFormat(actual, spec.format)) {
			return null
		}

		params[spec.name] = actual
	}

	return { consumedSegments: segments.length, params }
}

interface QueryMatchResult {
	readonly params: Record<string, string>
	readonly unusedQuery: string
}

function matchQuery(
	queryParams: readonly ParsedQueryParam[],
	queryString: string
): QueryMatchResult | null {
	if (queryParams.length === 0) {
		return {
			params: {},
			unusedQuery: queryString,
		}
	}

	const searchParams = new URLSearchParams(queryString)
	const params: Record<string, string> = {}

	for (const spec of queryParams) {
		const value = searchParams.get(spec.key)

		if (value === null) {
			if (!spec.optional) {
				return null
			}
			continue
		}

		if (!matchesFormat(value, spec.format)) {
			return null
		}

		params[spec.name] = value
		searchParams.delete(spec.key)
	}

	return {
		params,
		unusedQuery: searchParams.toString(),
	}
}

function buildUnusedPath(
	actualSegments: readonly string[],
	consumedSegments: number,
	unusedQuery: string,
	hash: string
): string {
	const remainingSegments = actualSegments.slice(consumedSegments)
	let unusedPath = ''

	if (remainingSegments.length > 0) {
		unusedPath += `/${remainingSegments.join('/')}`
	}

	if (unusedQuery.length > 0) {
		unusedPath += `?${unusedQuery}`
	}

	if (hash.length > 0) {
		unusedPath += hash
	}

	return unusedPath
}

function matchesFormat(value: string, format: RouteParamFormat): boolean {
	if (format instanceof RegExp) {
		return format.test(value)
	}

	switch (format) {
		case 'string':
			return value.length > 0
		case 'integer':
			return /^-?\d+$/.test(value)
		case 'number':
		case 'float':
			return value.trim().length > 0 && Number.isFinite(Number(value))
		case 'uuid':
			return UUID_REGEX.test(value)
		default:
			return false
	}
}

function safeDecode(segment: string): string {
	try {
		return decodeURIComponent(segment)
	} catch (_error) {
		return segment
	}
}
type RouteRenderResult = JSX.Element | JSX.Element[]

export type RouterRender<Definition extends RouteDefinition> = (
	specification: RouteSpecification<Definition>,
	scope: Record<PropertyKey, any>
) => RouteRenderResult

export type RouterNotFound<Definition extends RouteDefinition> = (
	context: { url: string; routes: readonly Definition[] },
	scope: Record<PropertyKey, any>
) => RouteRenderResult

export interface RouterProps<Definition extends RouteDefinition> {
	readonly routes: readonly Definition[]
	readonly notFound: RouterNotFound<Definition>
	readonly url?: string
}

export const Router = <
	Definition extends RouteDefinition & { readonly view: RouterRender<Definition> },
>(
	props: RouterProps<Definition>,
	scope: Record<PropertyKey, any>
) => {
	const p = extended(props, {
		get url() {
			return browser.url.pathname
		},
	})
	const matcher = routeMatcher(p.routes)
	const result: JSX.Element[] = reactive([])
	let oldMatch: RouteSpecification<Definition> | null = null
	const notFound = { routes: p.routes, url: p.url }

	function setResult(els: RouteRenderResult) {
		result.length = 0
		if (Array.isArray(els)) {
			result.push(...els)
		} else {
			result.push(els)
		}
	}

	const cleanup = effect(() => {
		const match = matcher(p.url)
		if (match) {
			if (oldMatch?.definition !== match.definition) {
				setResult(match.definition.view(match, scope))
				oldMatch = match
			} else copyObject(oldMatch, match)
		} else {
			notFound.url = p.url
			if (oldMatch) setResult(props.notFound(notFound, scope))
			oldMatch = null
		}
	})

	return <>{cleanedBy(result, cleanup)}</>
}

export function A(props: JSX.IntrinsicElements['a']) {
	function handleClick(event: MouseEvent) {
		props.onClick?.(event)
		if (event.defaultPrevented) {
			return
		}
		const href = props.href
		if (typeof href === 'string' && href.startsWith('/')) {
			event.preventDefault()
			if (browser.url.pathname !== href) {
				browser.navigate(href)
			}
		}
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: a has onclick
		<a
			{...props}
			// biome-ignore lint/a11y/useValidAnchor: a has onclick
			onClick={handleClick}
			aria-current={
				(props['aria-current'] ?? browser.url.pathname === props.href) ? 'page' : undefined
			}
		>
			{props.children}
		</a>
	)
}
