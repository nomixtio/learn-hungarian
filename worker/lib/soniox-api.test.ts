import { describe, expect, it } from 'vitest';

import { sonioxApiOrigin, sonioxTemporaryKeyUrl } from '../../worker/lib/soniox-api';

describe('sonioxApiOrigin', () => {
	it('defaults to US origin', () => {
		expect(sonioxApiOrigin(undefined)).toBe('https://api.soniox.com');
		expect(sonioxApiOrigin('')).toBe('https://api.soniox.com');
		expect(sonioxApiOrigin('us')).toBe('https://api.soniox.com');
	});

	it('maps eu/jp regions with case/whitespace tolerance', () => {
		expect(sonioxApiOrigin('eu')).toBe('https://api.eu.soniox.com');
		expect(sonioxApiOrigin(' EU ')).toBe('https://api.eu.soniox.com');
		expect(sonioxApiOrigin('JP')).toBe('https://api.jp.soniox.com');
	});
});

describe('sonioxTemporaryKeyUrl', () => {
	it('builds the temporary key endpoint', () => {
		expect(sonioxTemporaryKeyUrl('eu')).toBe(
			'https://api.eu.soniox.com/v1/auth/temporary-api-key',
		);
		expect(sonioxTemporaryKeyUrl(undefined)).toBe(
			'https://api.soniox.com/v1/auth/temporary-api-key',
		);
	});
});
