import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(rootDir, 'src'),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}', 'worker/lib/**/*.{test,spec}.ts'],
		exclude: ['node_modules', 'dist', 'e2e/**', 'test/worker/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			include: ['src/lib/**/*.ts', 'src/components/**/*.tsx', 'src/hooks/**/*.ts', 'worker/lib/**/*.ts'],
			exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/vite-env.d.ts'],
			thresholds: {
				// Recalibrated for Vitest 4: its V8 provider counts more
				// functions/branches per file than v3 did (totals are not
				// comparable across versions — same tests, different ruler).
				// Raise as integration coverage lands (target: lines 70, branches 60).
				lines: 37,
				branches: 35,
				functions: 37,
				statements: 37,
			},
		},
	},
});
