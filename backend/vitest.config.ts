import { defineConfig } from 'vitest/config';

process.env.TEST_DATABASE_URL ??= 'postgres://panel:panel@localhost:5433/panel_test';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/global-setup.ts'],
    fileParallelism: false,
  },
});
