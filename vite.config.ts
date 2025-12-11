import { defineConfig, type Plugin } from 'vite'
import { transformSync } from '@babel/core'
// Reuse the JSX reactive plugin directly from pounce sources
import { babelPluginJsxReactive } from 'pounce-ts/plugin'

export default defineConfig({
	root: '.',
	css: {
		preprocessorOptions: {
			scss: {}
		}
	},
	plugins: [
		{
			name: 'babel-jsx-transform',
			enforce: 'pre',
			async transform(code, id) {
				if (!/\.(tsx?|jsx?)$/.test(id)) return null

				const result = transformSync(code, {
					filename: id,
					babelrc: false,
					configFile: false,
					plugins: [
						babelPluginJsxReactive,
						['@babel/plugin-proposal-decorators', { version: '2023-05' }],
						['@babel/plugin-transform-react-jsx', { pragma: 'h', pragmaFrag: 'Fragment', throwIfNamespace: false }],
						['@babel/plugin-transform-typescript', { isTSX: id.endsWith('.tsx'), allowDeclareFields: true }],
					],
					sourceMaps: true,
				})

				if (!result) return null
				return { code: result.code || '', map: result.map}
			},
		} as Plugin,
	],
	esbuild: false,
	build: {
		outDir: 'dist',
		target: 'esnext',
		minify: false,
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'index.js',
		},
		rollupOptions: {
			external: [
				'pounce-ts',
				'@picocss/pico',
			],
		},
	},
})



