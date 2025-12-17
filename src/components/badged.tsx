import { css } from '../lib/css'

css`
.pp-badged {
	position: relative;
	display: inline-flex;
	overflow: visible;
}

.pp-badged .pp-badge {
	position: absolute;
	min-width: 1.25rem;
	height: 1.25rem;
	padding: 0 0.35rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 0.7rem;
	font-weight: 600;
	line-height: 1;
	white-space: nowrap;
	border-radius: 999px;
	background-color: var(--pico-del-color, #d32f2f);
	color: var(--pico-color-inverse, #fff);
	box-shadow: 0 0 0 2px var(--pico-background-color, #fff);
	z-index: 10;
	pointer-events: none;
}

.pp-badged-top-right .pp-badge {
	top: -0.5rem;
	right: -0.4rem;
}

.pp-badged-top-left .pp-badge {
	top: -0.5rem;
	left: -0.4rem;
}

.pp-badged-bottom-right .pp-badge {
	bottom: -0.5rem;
	right: -0.4rem;
}

.pp-badged-bottom-left .pp-badge {
	bottom: -0.5rem;
	left: -0.4rem;
}

.pp-badged-top-right:has(.pp-button-icon-only) .pp-badge,
.pp-badged-top-right:has(.pp-checkbutton-icon-only) .pp-badge,
.pp-badged-top-right:has(.pp-radiobutton-icon-only) .pp-badge {
	top: -0.35rem;
	right: -0.3rem;
}
`

/**
 * Badged component - wraps any element with a badge indicator.
 *
 * The badge is positioned absolutely at one of the four corners of the wrapped element.
 * The wrapped element will fill the Badged wrapper's dimensions.
 *
 * @example
 * ```tsx
 * // Simple usage with Button
 * <Badged badge={5}>
 *   <Button>Inbox</Button>
 * </Badged>
 *
 * // With link
 * <Badged badge="New" position="top-left">
 *   <A href="/new">New Items</A>
 * </Badged>
 *
 * // With custom badge content
 * <Badged badge={<Icon name="mdi:star" />}>
 *   <CheckButton>Favorite</CheckButton>
 * </Badged>
 * ```
 */
export type BadgedProps = {
	/** Badge content (number, string, or JSX element) */
	badge: number | string | JSX.Element
	/** Child element to badge */
	children: JSX.Element
	/** Badge position relative to the wrapped element */
	position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const Badged = (props: BadgedProps) => {
	const position = props.position ?? 'top-right'

	// Check if badge is JSX.Element (not string or number)
	// JSX.Element can be an object (rendered element) or function (component)
	const isJSXElement = typeof props.badge !== 'string' && typeof props.badge !== 'number'

	return (
		<span class={['pp-badged', `pp-badged-${position}`]}>
			{props.children}
			<span class="pp-badge" aria-hidden="true">
				{isJSXElement ? props.badge : String(props.badge)}
			</span>
		</span>
	)
}
