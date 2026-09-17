import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getClientId } from '@/lib/client-id';

describe('getClientId', () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
		globalThis.localStorage?.clear();
	});

	it('generates and persists a UUID on first call', () => {
		const id = getClientId();
		expect(id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
		expect(globalThis.localStorage.getItem('learn-hungarian-client-id')).toBe(id);
		expect(getClientId()).toBe(id);
	});

	it('returns the stored id when present', () => {
		globalThis.localStorage.setItem('learn-hungarian-client-id', 'fixed-id');
		expect(getClientId()).toBe('fixed-id');
	});

	it('returns anonymous when localStorage is unavailable', () => {
		vi.stubGlobal('localStorage', undefined);
		expect(getClientId()).toBe('anonymous');
	});
});
