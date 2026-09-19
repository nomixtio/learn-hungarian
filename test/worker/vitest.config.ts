import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		cloudflareTest({
			main: path.resolve(here, '../../worker/index.ts'),
			wrangler: { configPath: path.resolve(here, './wrangler.test.jsonc') },
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(here, '../../src'),
		},
	},
	test: {
		include: ['test/worker/**/*.test.ts'],
	},
});
