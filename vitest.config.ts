import { defineConfig, configDefaults } from 'vitest/config'

/**
 * https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    // expose `describe` / `test` / `expect` as globals (jest-style, no imports needed)
    globals: true,
    testTimeout: 20000,
    include: [
      'src/**/*.test.{ts,tsx}',
    ],
    exclude: [
      ...configDefaults.exclude,
      '**/templates/**',
      '**/coverage/**',
      '**/lib/**',
      '**/es/**',
    ],
  },
})
