import { effect, untracked } from 'mutts/src'
import { browser } from '../lib/browser'
import { stored } from '../lib/storage'
import { Button } from './button'

export interface DarkModeButtonProps {
	ariaLabel?: string
	icon?: string
	children?: JSX.Element | string
	theme?: 'light' | 'dark'
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
	untracked(() => {
		props.theme ??= themeStorage.theme
	})
	// Sync theme with document element
	effect(() => {
		themeStorage.theme = document.documentElement.dataset.theme = props.theme ?? systemTheme
	})

	return (
		<Button 
			onClick={() => {
				props.theme = props.theme === 'light' ? 'dark' : 'light'
			}}
			ariaLabel={props.ariaLabel || 'Toggle dark mode'}
			icon={props.icon || defaultIcons[props.theme ?? systemTheme]}
		>
			{props.children || defaultChildren[props.theme ?? systemTheme]}
		</Button>
	)
}
