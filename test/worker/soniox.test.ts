import { SELF, fetchMock } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetDb } from './helpers';

const SONIOX_URL = 'https://api.eu.soniox.com/v1/auth/temporary-api-key';

function sameSiteHeaders(ip: string): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		Origin: 'http://example.com',
		'CF-Connecting-IP': ip,
	};
}

describe('soniox API', () => {
	beforeEach(async () => {
		await resetDb();
		fetchMock.activate();
		// Block real network — only mocked Soniox calls may succeed.
		fetchMock.disableNetConnect();
	});

	it('rejects cross-site mint requests with 403', async () => {
		const res = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': 'soniox-403' },
		});
		expect(res.status).toBe(403);
	});

	it('mints a temporary key on success', async () => {
		fetchMock
			.get('https://api.eu.soniox.com')
			.intercept({ method: 'POST', path: '/v1/auth/temporary-api-key' })
			.reply(200, { api_key: 'tmp-123', expires_at: '2030-01-01T00:00:00Z' });

		const res = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
			method: 'POST',
			headers: sameSiteHeaders('soniox-ok'),
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as { api_key: string; expires_at: string; region: string };
		expect(body.api_key).toBe('tmp-123');
		expect(body.region).toBe('eu');
		expect(SONIOX_URL).toContain('soniox.com');
	});

	it('maps Soniox 401 to a region hint (502)', async () => {
		fetchMock
			.get('https://api.eu.soniox.com')
			.intercept({ method: 'POST', path: '/v1/auth/temporary-api-key' })
			.reply(401, { error_type: 'unauthenticated', message: 'bad key' });

		const res = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
			method: 'POST',
			headers: sameSiteHeaders('soniox-401'),
		});
		expect(res.status).toBe(502);
		const body = (await res.json()) as { error: string };
		expect(body.error).toContain('SONIOX_REGION');
	});

	it('rate-limits after 30 mints per minute per IP', async () => {
		fetchMock
			.get('https://api.eu.soniox.com')
			.intercept({ method: 'POST', path: '/v1/auth/temporary-api-key' })
			.reply(200, { api_key: 'tmp', expires_at: '2030-01-01T00:00:00Z' })
			.persist();

		const headers = sameSiteHeaders('soniox-rate');
		for (let i = 0; i < 30; i += 1) {
			const res = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
				method: 'POST',
				headers,
			});
			expect(res.status).toBe(200);
		}
		const limited = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
			method: 'POST',
			headers,
		});
		expect(limited.status).toBe(429);
	});
});
