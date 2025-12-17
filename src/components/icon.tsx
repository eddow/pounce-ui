import '@picocss/pico/css/pico.min.css'
import Iconify from '@iconify/iconify'
import { addBatchCleanup } from 'mutts/src'
import { compose } from 'pounce-ts'
import { css } from '../lib/css'

css`
.iconify {
	display: inline-block;
	vertical-align: middle;
}

.pp-icon-btn {
	--pp-icon-btn-size: 2rem;
	min-width: 0;
	width: var(--pp-icon-btn-size);
	height: var(--pp-icon-btn-size);
	padding: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
.pp-icon-btn .iconify {
	width: 1.125rem;
	height: 1.125rem;
}
`

export type IconProps = {
	/** Icon name in the form "prefix:name", e.g. "mdi:home" */
	name: string
	/** CSS size like "1em", "24px"; defaults to "1em" */
	size?: string
	/** If true, aligns icon with text baseline; defaults to true */
	inline?: boolean
	/** Optional title for accessibility */
	title?: string
	/** Additional CSS classes */
	class?: string
	/** Inline styles */
	style?: string
}
function iconifyScan() {
	queueMicrotask(() => Iconify.scan())
}
/**
 * Simple Icon component using Iconify vanilla runtime.
 * Loads any icon by name at runtime without pre-registering or listing them.
 */
export const Icon = (props: IconProps) => {
	// Iconify vanilla scans elements with class "iconify"; we provide data attributes.
	// Use a unique key to encourage re-scan when name changes.
	// Add a batch cleanup to add the microtask once at the end of the batch even if several icons are rendered.
	addBatchCleanup(iconifyScan)

	const state = compose({ size: '1em', inline: true }, props)

	return (
		<span
			class={['iconify', state.class]}
			data-icon={props.name}
			data-inline={String(Boolean(props.inline))}
			title={props.title}
			style={[{ width: props.size, height: props.size }, props.style]}
		/>
	)
}

/**
 * Low-level helper for non-JSX users: returns an SVG element for an icon.
 * If the icon isn't loaded yet, it fetches it and resolves to the SVG.
 */
export async function getIconElement(
	name: string,
	attrs: Record<string, string> = {}
): Promise<SVGElement> {
	await Iconify.loadIcon(name)
	const svg = Iconify.renderSVG(name, attrs)
	if (svg) return svg
	// Fallback: render from loaded data name (ensures element is created)
	const rendered = Iconify.renderSVG(name, attrs)
	if (!rendered) throw new Error(`Failed to render icon: ${name}`)
	return rendered
}
