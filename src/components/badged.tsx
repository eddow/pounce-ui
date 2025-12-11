import './badged.scss'

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
