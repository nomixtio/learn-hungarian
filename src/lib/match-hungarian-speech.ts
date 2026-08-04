export function normalizeHungarianSpeech(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export type HungarianSpeechMatch = {
	matched: boolean;
	score: number;
};

export function matchHungarianSpeech(
	transcript: string,
	expectedHungarian: string,
): HungarianSpeechMatch {
	const normalizedTranscript = normalizeHungarianSpeech(transcript);
	const normalizedExpected = normalizeHungarianSpeech(expectedHungarian);

	if (!normalizedTranscript || !normalizedExpected) {
		return { matched: false, score: 0 };
	}

	if (normalizedTranscript === normalizedExpected) {
		return { matched: true, score: 1 };
	}

	if (
		normalizedTranscript.includes(normalizedExpected) ||
		normalizedExpected.includes(normalizedTranscript)
	) {
		return { matched: true, score: 0.85 };
	}

	return { matched: false, score: 0 };
}
