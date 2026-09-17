import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkersConfig({
	resolve: {
		alias: {
			'@': path.resolve(here, '../../src'),
		},
	},
	test: {
		include: ['test/worker/**/*.test.ts'],
		poolOptions: {
			workers: {
				main: path.resolve(here, '../../worker/index.ts'),
				singleWorker: true,
				isolatedStorage: true,
				wrangler: { configPath: path.resolve(here, './wrangler.test.jsonc') },
			},
		},
	},
});
