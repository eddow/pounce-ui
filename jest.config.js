export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/?(*.)+(spec|test).ts'],
	transform: {
		'^.+\.[tj]sx?$': [
			'ts-jest',
			{
				tsconfig: process.env.TSCONFIG || 'tsconfig.json',
				useESM: true,
			},
		],
	},
	extensionsToTreatAsEsm: ['.ts', '.tsx'],
	moduleNameMapper: {
		'^(\.{1,2}/.*)\.js$': '$1',
		'^mutts/src$': '<rootDir>/../mutts/dist/index.esm.js',
		'^mutts/src/(.*)$': '<rootDir>/../mutts/dist/$1.esm.js',
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
}