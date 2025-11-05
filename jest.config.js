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
	transformIgnorePatterns: ['/node_modules/(?!mutts/)'],
	extensionsToTreatAsEsm: ['.ts', '.tsx'],
	moduleNameMapper: {
		'^(\.{1,2}/.*)\.js$': '$1',
		'^mutts/src$': '<rootDir>/node_modules/mutts/src/index.ts',
		'^mutts/src/(.*)$': '<rootDir>/node_modules/mutts/src/$1.ts',
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
}