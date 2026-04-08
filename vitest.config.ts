import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    testTimeout: 10000,
    exclude: ['dist/**', 'node_modules/**', 'test/3-cloud.test.ts'],
  },
});
