/**
 * CSS template tag functions for inline CSS processing
 *
 * These functions are transformed by the Vite plugin to process CSS
 * through Vite's PostCSS pipeline (autoprefixer, etc.)
 *
 * For syntax highlighting in VS Code/Cursor, install the "es6-string-html" extension:
 * https://open-vsx.org/extension/Tobermory/es6-string-html
 *
 * This extension automatically detects `css`, `sass`, and `less` tags in template
 * literals and provides proper syntax highlighting without any configuration.
 *
 * @example
 * ```ts
 * import { css, sass } from './lib/css'
 *
 * css`.my-class { color: red; }`
 *
 * sass`
 *   .container {
 *     color: blue;
 *     &:hover { color: red; }
 *   }
 * `
 * ```
 */

// Runtime CSS injection function
// This is called by the transformed code from the Vite plugin
const injectedStyles = new Set<string>()

export function __injectCSS(css: string): void {
	if (typeof document === 'undefined') {
		// SSR - no-op
		return
	}

	// Avoid duplicate injections
	if (injectedStyles.has(css)) {
		return
	}

	injectedStyles.add(css)

	// Inject the CSS into the document
	const style = document.createElement('style')
	style.textContent = css
	document.head.appendChild(style)
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
 * LESS template tag function
 *
 * Processes LESS syntax through Vite's LESS preprocessor.
 *
 * @example
 * ```ts
 * less`
 *   .container {
 *     color: blue;
 *     &:hover { color: red; }
 *   }
 * `
 * ```
 */
export function less(strings: TemplateStringsArray, ...values: any[]): void {
	// This function is replaced by the Vite plugin during build
	// This is just a runtime fallback (shouldn't be reached in normal usage)
	const cssText = strings.reduce((acc, str, i) => {
		return acc + str + (values[i] ?? '')
	}, '')
	__injectCSS(cssText)
}
