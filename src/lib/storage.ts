import { cleanedBy, effect, reactive, ScopedCallback } from 'mutts/src'

export const json = {
	parse: <T>(value: string): T => JSON.parse(value),
	stringify: <T>(value: T): string => JSON.stringify(value),
}
// MUtTs localStorage wrapper
export function stored<T extends Record<string, any>>(initial: T): T {
	const rv: Partial<T> = reactive({})
	const read: { [K in keyof T]?: boolean } = {}
	function eventListener(event: StorageEvent) {
		if (event.key === null)
			for (const key in initial) {
				read[key] = false
				rv[key] = initial[key]
			}
		else if (event.key in initial) {
			const evKey = event.key as keyof T
			read[evKey] = false
			rv[evKey] = event.newValue ? json.parse<T[typeof evKey]>(event.newValue) : initial[evKey]
		}
	}
	window.addEventListener('storage', eventListener)
	const cleanups: ScopedCallback[] = []
	function bind(key: keyof T & string) {
		const stored = localStorage.getItem(key)
		rv[key] = stored ? json.parse<T[typeof key]>(stored) : initial[key]
		cleanups.push(
			effect(() => {
				const stored = json.stringify(rv[key])
				if (read[key]) localStorage.setItem(key, stored)
				read[key] = true
			})
		)
	}
	for (const key in initial) bind(key)
	return cleanedBy(rv as T, () => {
		for (const cleanup of cleanups) cleanup()
		window.removeEventListener('storage', eventListener)
	})
}
