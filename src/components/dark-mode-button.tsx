import { effect } from 'mutts'
import { browser } from '../lib/browser'
import { stored } from '../lib/storage'
import { Button } from './button'

export interface DarkModeButtonProps {
	ariaLabel?: string
	icon?: string
	children?: JSX.Element | string
	theme?: 'light' | 'dark'
	onThemeChange?: (theme: 'light' | 'dark') => void
}

const defaultIcons = {
	dark: 'mdi:weather-sunny',
	light: 'mdi:weather-night'
}
const defaultChildren = {
	dark: 'Light',
	light: 'Dark'
}
const systemTheme = (browser as any).prefersDark?.() ? 'dark' : 'light' as 'light' | 'dark'

export const DarkModeButton = (props: DarkModeButtonProps) => {
	const themeStorage = stored({ theme: systemTheme })

	// Initialize theme from storage or system
	if (props.theme === undefined) {
		props.theme = themeStorage.theme
	}

	// Sync theme with document element and storage
	effect(() => {
		const theme = props.theme ?? systemTheme
		themeStorage.theme = theme
		document.documentElement.dataset.theme = theme

		// Notify parent of theme change
		if (props.onThemeChange) {
			props.onThemeChange(theme)
		}
	})

	const handleToggle = () => {
		const newTheme = props.theme === 'light' ? 'dark' : 'light'
		if (props.onThemeChange) {
			props.onThemeChange(newTheme)
		} else {
			// Direct mutation only if no callback provided (for standalone usage)
			(props as any).theme = newTheme
		}
	}

	return (
		<Button
			onClick={handleToggle}
			ariaLabel={props.ariaLabel || 'Toggle dark mode'}
			icon={props.icon || defaultIcons[props.theme ?? systemTheme]}
		>
			{props.children || defaultChildren[props.theme ?? systemTheme]}
		</Button>
	)
}
