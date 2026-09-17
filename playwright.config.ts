import { defineConfig, devices } from '@playwright/test';

const PORT = 8787;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	timeout: 30_000,
	expect: { timeout: 5_000 },
	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
	],
	webServer: {
		// --host 127.0.0.1: without it Vite binds localhost (IPv6 ::1 on
		// macOS) and the 127.0.0.1 health check never succeeds.
		command: `npx vite --port ${PORT} --strictPort --host 127.0.0.1`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: { PORT: String(PORT) },
	},
});
