export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/tests/setup-mutts.ts'],
	roots: ['<rootDir>/src'],
	testMatch: ['**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).tsx'],
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
		'^mutts$': '<rootDir>/node_modules/mutts/src/index.ts',
		'^mutts/(.*)$': '<rootDir>/node_modules/mutts/src/$1/index.ts',
		'\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
}