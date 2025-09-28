/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  testMatch: ['**/+(*.)+(spec).+(ts)'], // ✅ Only test .spec.ts files
  transform: {
    '^.+\\.(ts|mjs|html)$': ['ts-jest', {
      tsconfig: 'tsconfig.spec.json',
      useESM: true,
      stringifyContentPathRegex: '\\.html$',
    }],
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
};
