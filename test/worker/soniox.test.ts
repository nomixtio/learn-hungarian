import { SELF } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetDb } from './helpers';

const SONIOX_URL = 'https://api.eu.soniox.com/v1/auth/temporary-api-key';

function sameSiteHeaders(ip: string): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		Origin: 'http://example.com',
		'CF-Connecting-IP': ip,
	};
}

function sonioxJson(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

// The worker runs in the same isolate as these tests, so stubbing the
// global fetch intercepts the worker's outbound Soniox call — the
// replacement for the removed `fetchMock` helper.
let sonioxResponse: { status: number; body: unknown };

async function stubFetch(input: unknown): Promise<Response> {
	const url = input instanceof Request ? input.url : String(input);
	if (url.startsWith('https://api.eu.soniox.com/')) {
		return sonioxJson(sonioxResponse.status, sonioxResponse.body);
	}
	throw new Error(`Unexpected outbound fetch blocked in tests: ${url}`);
}

describe('soniox API', () => {
	beforeEach(async () => {
		await resetDb();
		sonioxResponse = {
			status: 200,
			body: { api_key: 'tmp', expires_at: '2030-01-01T00:00:00Z' },
		};
		vi.stubGlobal('fetch', stubFetch);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('rejects cross-site mint requests with 403', async () => {
		const res = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': 'soniox-403' },
		});
		expect(res.status).toBe(403);
	});

	it('mints a temporary key on success', async () => {
		sonioxResponse = {
			status: 200,
			body: { api_key: 'tmp-123', expires_at: '2030-01-01T00:00:00Z' },
		};

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
		sonioxResponse = {
			status: 401,
			body: { error_type: 'unauthenticated', message: 'bad key' },
		};

		const res = await SELF.fetch('http://example.com/api/soniox/temporary-key', {
			method: 'POST',
			headers: sameSiteHeaders('soniox-401'),
		});
		expect(res.status).toBe(502);
		const body = (await res.json()) as { error: string };
		expect(body.error).toContain('SONIOX_REGION');
	});

	it('rate-limits after 30 mints per minute per IP', async () => {
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
