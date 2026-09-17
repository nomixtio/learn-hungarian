import { describe, expect, it } from 'vitest';

import { slugifyHungarian } from '@/lib/audio-slug';

describe('slugifyHungarian', () => {
	it('lowercases and strips Hungarian diacritics', () => {
		expect(slugifyHungarian('Jó Napot')).toBe('jo-napot');
		expect(slugifyHungarian('KÖSZÖNÖM')).toBe('koszonom');
		expect(slugifyHungarian('Űrhajó')).toBe('urhajo');
	});

	it('joins whitespace with single dashes', () => {
		expect(slugifyHungarian('  hogy   vagy  ')).toBe('hogy-vagy');
		expect(slugifyHungarian('egy  két   három')).toBe('egy-ket-harom');
	});

	it('strips punctuation and collapses dashes', () => {
		expect(slugifyHungarian('Szia! Hogy vagy?')).toBe('szia-hogy-vagy');
		expect(slugifyHungarian('a -- b')).toBe('a-b');
		expect(slugifyHungarian('-hello-')).toBe('hello');
	});

	it('removes ellipsis characters', () => {
		expect(slugifyHungarian('Szia…')).toBe('szia');
	});

	it('returns empty string for punctuation-only input', () => {
		expect(slugifyHungarian('!!!')).toBe('');
		expect(slugifyHungarian('')).toBe('');
	});

	it('is stable for audio filenames', () => {
		expect(slugifyHungarian('Jó napot kívánok')).toBe(slugifyHungarian('JÓ NAPOT KÍVÁNOK'));
	});
});
