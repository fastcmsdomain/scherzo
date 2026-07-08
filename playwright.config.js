// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3311',
  },
  webServer: {
    command: 'python3 -m http.server 3311 --bind 127.0.0.1',
    url: 'http://127.0.0.1:3311/',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'ignore',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
