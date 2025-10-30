export type Variant =
	| 'neutral'
	| 'primary'
	| 'secondary'
	| 'contrast'
	| 'danger'
	| 'success'
	| 'warning'

export function variantClass(variant: Variant | undefined): string {
	if (!variant || variant === 'primary') return ''
	return ['contrast', 'danger', 'success', 'warning'].includes(variant) ? variant : 'secondary'
}
