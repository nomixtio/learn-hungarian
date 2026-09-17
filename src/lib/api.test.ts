import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch } from '@/lib/api';

vi.mock('@/lib/client-id', () => ({ getClientId: () => 'test-client' }));

function jsonResponse(body: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
		...init,
	});
}

describe('apiFetch', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('sends X-Client-Id and parses JSON', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);

		const data = await apiFetch<{ ok: boolean }>('/api/health');
		expect(data).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledOnce();
		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
		expect(options.headers['X-Client-Id']).toBe('test-client');
	});

	it('serializes the json option', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);

		await apiFetch('/api/quiz/attempt', { method: 'POST', json: { entryKey: 'a' } });
		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(options.body).toBe(JSON.stringify({ entryKey: 'a' }));
	});

	it('throws the server error message', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Nope' }, { status: 400 })));
		await expect(apiFetch('/api/quiz/next')).rejects.toThrow('Nope');
	});

	it('appends detail when present and falls back to status', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(jsonResponse({ error: 'Bad', detail: 'x' }, { status: 502 })),
		);
		await expect(apiFetch('/x')).rejects.toThrow('Bad: x');

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 500 })));
		await expect(apiFetch('/x')).rejects.toThrow('Request failed (500)');
	});
});
