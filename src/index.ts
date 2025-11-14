// Minimal entry for the package; expose dialog API

import '@picocss/pico/css/pico.min.css'
import './components/variants.scss'
import './components/buttongroup' // Initialize global keyboard handler

export type { AlertProps } from './components/alert'
export { Alert } from './components/alert'
export type { ButtonProps } from './components/button'
export { Button } from './components/button'
export type { ButtonGroupProps } from './components/buttongroup'
export { ButtonGroup, getGroupButtons } from './components/buttongroup'
export type { CheckButtonProps } from './components/checkbutton'
export { CheckButton } from './components/checkbutton'
export type {
	DialogButton,
	DialogOptions,
	DialogSize,
	UIContent,
} from './components/dialog'
export { confirm, dialog } from './components/dialog'
export type { DockviewWidgetProps } from './components/dockview'
export { Dockview } from './components/dockview'
export type {
	CheckboxProps,
	ComboboxProps,
	RadioProps,
	SelectProps,
	SwitchProps,
} from './components/forms'
export { Checkbox, Combobox, Radio, Select, Switch } from './components/forms'
export type { IconProps } from './components/icon'
export { Icon } from './components/icon'
export type { ContainerProps, GridProps, InlineProps, StackProps } from './components/layout'
export { Container, Grid, Inline, Stack } from './components/layout'
export type { RadioButtonProps } from './components/radiobutton'
export { RadioButton } from './components/radiobutton'
export type { BadgeProps, ChipProps, PillProps } from './components/status'
export { Badge, Chip, Pill } from './components/status'
export type { ToastContent, ToastOptions } from './components/toast'
export {
	toast,
	toastConfig,
} from './components/toast'
export type { ToolbarProps, ToolbarSpacerProps } from './components/toolbar'
export { Toolbar } from './components/toolbar'
export type { HeadingProps, LinkProps, TextProps } from './components/typography'
export { Heading, Link, Text } from './components/typography'
export type { Variant } from './components/variants'
export { variantClass } from './components/variants'
export { stored } from './lib/storage'
