import { cleanedBy, effect, reactive, ScopedCallback } from 'mutts'

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
			if (event.newValue == null) rv[evKey] = initial[evKey]
			else {
				try {
					rv[evKey] = json.parse<T[typeof evKey]>(event.newValue)
				} catch {
					try {
						localStorage.removeItem(evKey as string)
					} catch (error) {
						console.warn('Failed to remove localStorage item:', evKey, error)
					}
					rv[evKey] = initial[evKey]
				}
			}
		}
	}
	window.addEventListener('storage', eventListener)
	const cleanups: ScopedCallback[] = []
	function bind(key: keyof T & string) {
		const stored = localStorage.getItem(key)
		if (stored == null) rv[key] = initial[key]
		else {
			try {
				rv[key] = json.parse<T[typeof key]>(stored)
			} catch {
				try {
					localStorage.removeItem(key)
				} catch (error) {
					console.warn('Failed to remove localStorage item:', key, error)
				}
				rv[key] = initial[key]
			}
		}
		cleanups.push(
			effect(() => {
				const value = rv[key]
				if (read[key]) {
					if (value === undefined) localStorage.removeItem(key)
					else localStorage.setItem(key, json.stringify(value))
				}
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
