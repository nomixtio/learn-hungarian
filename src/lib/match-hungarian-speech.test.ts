import { describe, expect, it } from 'vitest';

import {
	matchHungarianSpeech,
	normalizeHungarianSpeech,
} from '@/lib/match-hungarian-speech';

describe('normalizeHungarianSpeech', () => {
	it('lowercases and strips Hungarian diacritics', () => {
		expect(normalizeHungarianSpeech('Jó Napot Kívánok')).toBe('jo napot kivanok');
		expect(normalizeHungarianSpeech('KÖSZÖNÖM')).toBe('koszonom');
		expect(normalizeHungarianSpeech('űőú')).toBe('uou');
	});

	it('strips punctuation and collapses whitespace', () => {
		expect(normalizeHungarianSpeech('  Szia!  Hogy vagy? ')).toBe('szia hogy vagy');
		expect(normalizeHungarianSpeech('igen...nem')).toBe('igen nem');
	});

	it('returns empty string for punctuation-only input', () => {
		expect(normalizeHungarianSpeech('!!!')).toBe('');
		expect(normalizeHungarianSpeech('')).toBe('');
	});
});

describe('matchHungarianSpeech', () => {
	it('matches exact text ignoring case and accents', () => {
		expect(matchHungarianSpeech('Jó napot', 'jo napot')).toEqual({ matched: true, score: 1 });
		expect(matchHungarianSpeech('KÖSZÖNÖM', 'köszönöm')).toEqual({ matched: true, score: 1 });
	});

	it('matches on substring with 0.85 score', () => {
		expect(matchHungarianSpeech('szia uram', 'szia').matched).toBe(true);
		expect(matchHungarianSpeech('szia uram', 'szia').score).toBe(0.85);
		// Expected contains transcript (partial attempt)
		expect(matchHungarianSpeech('szia', 'szia uram')).toEqual({ matched: true, score: 0.85 });
	});

	it('rejects empty transcript or expected', () => {
		expect(matchHungarianSpeech('', 'szia')).toEqual({ matched: false, score: 0 });
		expect(matchHungarianSpeech('szia', '')).toEqual({ matched: false, score: 0 });
		expect(matchHungarianSpeech('!!!', 'szia')).toEqual({ matched: false, score: 0 });
	});

	it('rejects unrelated phrases', () => {
		expect(matchHungarianSpeech('alma', 'korte')).toEqual({ matched: false, score: 0 });
	});
});
