import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', '**/index.ts'],
      exclude: ['lib/test-utils/**', '**/*.test.ts', 'lib/config/**'],
    },
  },
});
