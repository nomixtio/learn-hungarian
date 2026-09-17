import { SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetDb } from './helpers';

describe('health + meta', () => {
	beforeEach(async () => {
		await resetDb();
	});

	it('GET /api/health returns ok', async () => {
		const res = await SELF.fetch('http://example.com/api/health');
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it('GET /api/meta returns build with no-store', async () => {
		const res = await SELF.fetch('http://example.com/api/meta');
		expect(res.status).toBe(200);
		expect(res.headers.get('Cache-Control')).toBe('no-store');
		const body = (await res.json()) as { build: number | string };
		expect(body.build).toBeDefined();
		expect(String(body.build).length).toBeGreaterThan(0);
	});
});
