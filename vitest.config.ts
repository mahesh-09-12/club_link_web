import { defineConfig } from 'vitest/config';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setup.ts',
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
    },
  },
});
