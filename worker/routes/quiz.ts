import { Hono } from 'hono';

import type { Env } from '../env';
import { ensureClient, getEntryProgressMap, getProgressSummary, recordQuizAttempt } from '../lib/db';
import { pickNextQuizItem } from '../lib/quiz';

function getClientId(c: { req: { header: (name: string) => string | undefined } }): string | null {
	const clientId = c.req.header('X-Client-Id')?.trim();
	return clientId || null;
}

export const quizRoutes = new Hono<{ Bindings: Env }>();

quizRoutes.get('/next', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	await ensureClient(c.env.DB, clientId);
	const progressMap = await getEntryProgressMap(c.env.DB, clientId);
	const preferredEntryKey = c.req.query('entry')?.trim();
	const item = pickNextQuizItem(progressMap, preferredEntryKey);

	if (!item) {
		return c.json({ error: 'No quiz items available' }, 404);
	}

	const progress = progressMap.get(item.entryKey);

	return c.json({
		item,
		progress: progress
			? {
					timesSeen: progress.times_seen,
					timesCorrect: progress.times_correct,
					timesIncorrect: progress.times_incorrect,
					lastSeenAt: progress.last_seen_at,
					nextReviewAt: progress.next_review_at,
				}
			: null,
	});
});

quizRoutes.post('/attempt', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	let body: {
		entryKey: string;
		courseSlug: string;
		lessonId: string;
		promptEnglish: string;
		expectedHungarian: string;
		userAnswer: string;
		matched: boolean;
		score: number;
	};

	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: 'Invalid JSON body' }, 400);
	}

	if (
		!body.entryKey ||
		!body.courseSlug ||
		!body.lessonId ||
		!body.promptEnglish ||
		!body.expectedHungarian
	) {
		return c.json({ error: 'Missing required fields' }, 400);
	}

	await ensureClient(c.env.DB, clientId);
	await recordQuizAttempt(c.env.DB, {
		clientId,
		entryKey: body.entryKey,
		courseSlug: body.courseSlug,
		lessonId: body.lessonId,
		promptEnglish: body.promptEnglish,
		expectedHungarian: body.expectedHungarian,
		userAnswer: body.userAnswer ?? '',
		matched: Boolean(body.matched),
		score: typeof body.score === 'number' ? body.score : 0,
	});

	return c.json({ ok: true });
});

export const progressRoutes = new Hono<{ Bindings: Env }>();

progressRoutes.get('/summary', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	await ensureClient(c.env.DB, clientId);
	const summary = await getProgressSummary(c.env.DB, clientId);
	return c.json(summary);
});
