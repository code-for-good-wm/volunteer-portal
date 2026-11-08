import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Pin the time zone and locale so date/time assertions give the same result on
// every machine and in CI. Set here (before test workers start) so they inherit them.
process.env.TZ = 'America/Detroit';
process.env.LANG = 'en_US.UTF-8';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/setupTests.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts'],
      },
    },
  }),
);
