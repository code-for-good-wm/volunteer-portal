// Runs before every Vitest test file (see vitest.config.mts).
// jest-dom adds DOM matchers such as expect(element).toHaveTextContent(/react/i).
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest globals are off, so Testing Library can't register its own cleanup.
afterEach(() => {
  cleanup();
});
