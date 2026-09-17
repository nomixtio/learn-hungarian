import type { RealtimeToken } from '@soniox/client';
import { describe, expect, it } from 'vitest';

import {
	buildTranslationChunks,
	reuseStableChunkReferences,
	splitTranslationChunks,
} from '@/lib/translation-chunks';

function tok(partial: Partial<RealtimeToken> & { text: string }): RealtimeToken {
	return {
		speaker: 'spk1',
		translation_status: 'original',
		...partial,
	} as RealtimeToken;
}

describe('buildTranslationChunks', () => {
	it('returns empty for no tokens', () => {
		expect(buildTranslationChunks([], [])).toEqual([]);
	});

	it('groups original tokens by speaker', () => {
		const chunks = buildTranslationChunks(
			[tok({ text: 'Hello ', start_ms: 100 }), tok({ text: 'world' })],
			[],
		);
		expect(chunks).toHaveLength(1);
		expect(chunks[0]).toMatchObject({ speaker: 'spk1', originalText: 'Hello world' });
		expect(chunks[0]?.id).toBe('spk1-100');
	});

	it('splits on speaker change', () => {
		const chunks = buildTranslationChunks(
			[
				tok({ text: 'Hello', speaker: 'a', start_ms: 10 }),
				tok({ text: 'Szia', speaker: 'b', start_ms: 20 }),
			],
			[],
		);
		expect(chunks).toHaveLength(2);
		expect(chunks.map((c) => c.speaker)).toEqual(['a', 'b']);
	});

	it('pairs original + translation into one chunk', () => {
		const chunks = buildTranslationChunks(
			[
				tok({ text: 'Hello', speaker: 'a', start_ms: 5 }),
				tok({ text: 'Szia', speaker: 'a', translation_status: 'translation' }),
			],
			[],
		);
		expect(chunks).toHaveLength(1);
		expect(chunks[0]).toMatchObject({ originalText: 'Hello', translationText: 'Szia' });
	});

	it('starts a new chunk when original follows a translation', () => {
		const chunks = buildTranslationChunks(
			[
				tok({ text: 'Hi', translation_status: 'translation' }),
				tok({ text: 'Next sentence' }),
			],
			[],
		);
		expect(chunks).toHaveLength(2);
		expect(chunks[0]?.translationText).toBe('Hi');
		expect(chunks[1]?.originalText).toBe('Next sentence');
	});

	it('appends partial tokens as live content on the last chunk', () => {
		const chunks = buildTranslationChunks(
			[tok({ text: 'Hello', start_ms: 1 })],
			[tok({ text: ' wor' }), tok({ text: 'ld' })],
		);
		expect(chunks).toHaveLength(1);
		expect(chunks[0]?.originalPartial).toBe(' world');
		expect(chunks[0]?.id).toBe('spk1-partial');
	});

	it('creates a partial-only chunk when speaker differs', () => {
		const chunks = buildTranslationChunks(
			[tok({ text: 'Hello', speaker: 'a', start_ms: 1 })],
			[tok({ text: 'Szia', speaker: 'b' })],
		);
		expect(chunks).toHaveLength(2);
		expect(chunks[1]).toMatchObject({ speaker: 'b', originalPartial: 'Szia' });
	});

	it('filters out empty chunks', () => {
		expect(buildTranslationChunks([tok({ text: '' })], [])).toEqual([]);
	});
});

describe('splitTranslationChunks', () => {
	it('returns empty stable/live for no chunks', () => {
		expect(splitTranslationChunks([])).toEqual({ stableChunks: [], liveChunk: null });
	});

	it('treats chunks without partials as fully stable', () => {
		const chunks = buildTranslationChunks([tok({ text: 'Hi' })], []);
		const { stableChunks, liveChunk } = splitTranslationChunks(chunks);
		expect(liveChunk).toBeNull();
		expect(stableChunks).toHaveLength(1);
	});

	it('splits the live partial chunk off', () => {
		const chunks = buildTranslationChunks([tok({ text: 'Hi' })], [tok({ text: ' there' })]);
		const { stableChunks, liveChunk } = splitTranslationChunks(chunks);
		expect(stableChunks).toHaveLength(0);
		expect(liveChunk?.originalPartial).toBe(' there');
	});
});

describe('reuseStableChunkReferences', () => {
	it('reuses previous object identity for unchanged stable chunks', () => {
		const first = buildTranslationChunks([tok({ text: 'Hi' })], []);
		const { stableChunks } = splitTranslationChunks(first);
		const second = buildTranslationChunks([tok({ text: 'Hi' })], [tok({ text: ' there' })]);
		const reused = reuseStableChunkReferences(stableChunks, second);
		// First chunk of `second` is live (has partial), so no reuse — but stable path:
		const third = buildTranslationChunks([tok({ text: 'Hi' }), tok({ text: 'Yo', speaker: 'b' })], []);
		const reusedStable = reuseStableChunkReferences(splitTranslationChunks(first).stableChunks, third);
		expect(reusedStable[0]).toBe(first[0]);
		expect(reused).toHaveLength(1);
	});
});
