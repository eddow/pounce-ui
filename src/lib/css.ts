/**
 * CSS template tag functions for inline CSS processing
 *
 * These functions are transformed by the Vite plugin to process CSS
 * through Vite's PostCSS pipeline (autoprefixer, etc.)
 *
 * For syntax highlighting in VS Code/Cursor, install the "es6-string-html" extension:
 * https://open-vsx.org/extension/Tobermory/es6-string-html
 *
 * This extension automatically detects `css`, `sass`, and `scss` tags in template
 * literals and provides proper syntax highlighting without any configuration.
 *
 * @example
 * ```ts
 * import { css, sass, scss } from './lib/css'
 *
 * css`.my-class { color: red; }`
 *
 * sass`
 * .container
 *   color: blue
 *   &:hover
 *     color: red
 * `
 *
 * scss`
 * .container {
 *   color: blue;
 *   &:hover {
 *     color: red;
 *   }
 * }
 * `
 * ```
 */

// Runtime CSS injection function
// This is called by the transformed code from the Vite plugin
const injectedStyles = new Set<string>()

function getCallerId(): string {
	try {
		const stack = new Error().stack
		if (!stack) return 'unknown'
		
		// Parse the stack trace to find the caller
		const lines = stack.split('\n')
		for (const line of lines) {
			// Look for file paths, ignoring internal/library frames if possible
			// In Vite dev, paths usually look like http://localhost:5173/src/components/icon.tsx
			if (line.includes('/src/') && !line.includes('lib/css.ts')) {
				const match = line.match(/(https?:\/\/[^\)]+)/) || line.match(/(\/[\w\.-]+\/[\w\.-]+)/)
				if (match) {
                    const url = match[1]
                    // specific fix: extract relative path from /src/
                    const srcIndex = url.indexOf('/src/')
                    if (srcIndex !== -1) {
                        // Return "/src/..." and strip query params (?) or line numbers (:)
                        return url.substring(srcIndex).split('?')[0].split(':')[0]
                    }
					return url
				}
			}
		}
	} catch (e) {}
	return 'default'
}

export function __injectCSS(css: string): void {
	if (typeof document === 'undefined' || injectedStyles.has(css)) return

	injectedStyles.add(css)

    const callerId = getCallerId()
    
    // Find or create a style tag for this caller
    let style = document.querySelector(`style[data-vite-css-id="${callerId}"]`) as HTMLStyleElement
    if (!style) {
        style = document.createElement('style')
        style.setAttribute('data-vite-css-id', callerId)
        document.head.appendChild(style)
    }

	// Append the CSS
    // Using appendChild with a Text node is often faster than setting textContent for appending
    style.appendChild(document.createTextNode(css + '\n'))
}

/**
 * CSS template tag function
 *
 * Processes plain CSS through Vite's PostCSS pipeline.
 * The CSS is automatically injected into the document head.
 *
 * @example
 * ```ts
 * css`.my-class { color: red; }`
 * ```
 *
 * @note Template string interpolation (${...}) is not yet supported.
 * Use static template strings only.
 */
export function css(strings: TemplateStringsArray, ...values: any[]): void {
	// This function is replaced by the Vite plugin during build
	// This is just a runtime fallback (shouldn't be reached in normal usage)
	const cssText = strings.reduce((acc, str, i) => {
		return acc + str + (values[i] ?? '')
	}, '')
	__injectCSS(cssText)
}

/**
 * SASS template tag function
 *
 * Processes SASS/SCSS syntax through Vite's SASS preprocessor.
 * Supports nesting, variables, mixins, etc.
 *
 * @example
 * ```ts
 * sass`
 *   .container {
 *     color: blue;
 *     &:hover { color: red; }
 *   }
 * `
 * ```
 */
export function sass(strings: TemplateStringsArray, ...values: any[]): void {
	// This function is replaced by the Vite plugin during build
	// This is just a runtime fallback (shouldn't be reached in normal usage)
	const cssText = strings.reduce((acc, str, i) => {
		return acc + str + (values[i] ?? '')
	}, '')
	__injectCSS(cssText)
}

/**
 * SCSS template tag function
 *
 * Processes SCSS syntax (curly braces, semicolons) through the SASS preprocessor.
 *
 * @example
 * ```ts
 * scss`
 * .container {
 *   color: blue;
 *   &:hover {
 *     color: red;
 *   }
 * }
 * `
 * ```
 */
export function scss(strings: TemplateStringsArray, ...values: any[]): void {
	// This function is replaced by the Vite plugin during build
	// This is just a runtime fallback (shouldn't be reached in normal usage)
	const cssText = strings.reduce((acc, str, i) => {
		return acc + str + (values[i] ?? '')
	}, '')
	__injectCSS(cssText)
}
