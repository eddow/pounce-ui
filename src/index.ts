// Minimal entry for the package; expose dialog API

import '@picocss/pico/css/pico.min.css'
import './components/variants.scss'

export type {
	DialogButton,
	DialogOptions,
	DialogSize,
	DialogVariant,
	UIContent,
} from './components/dialog'
export { confirm, dialog } from './components/dialog'
export type { Variant } from './components/variants'
export { variantClass } from './components/variants'
export type { IconProps } from './icon'
export { Icon } from './icon'
