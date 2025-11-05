// Minimal entry for the package; expose dialog API

import '@picocss/pico/css/pico.min.css'
import './components/variants.scss'

export type {
	DialogButton,
	DialogOptions,
	DialogSize,
	UIContent,
} from './components/dialog'
export { confirm, dialog } from './components/dialog'
export type { IconProps } from './components/icon'
export { Icon } from './components/icon'
export type { ToastContent, ToastOptions } from './components/toast'
export {
	toast,
	toastConfig,
} from './components/toast'
export type { Variant } from './components/variants'
export { variantClass } from './components/variants'
