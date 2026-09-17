import { SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import { clientHeaders, resetDb, testEnv } from './helpers';

describe('quiz + progress API', () => {
	beforeEach(async () => {
		await resetDb();
	});

	it('GET /api/quiz/next requires X-Client-Id', async () => {
		const res = await SELF.fetch('http://example.com/api/quiz/next');
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'Missing X-Client-Id header' });
	});

	it('returns a quiz item and null progress for new clients', async () => {
		const res = await SELF.fetch('http://example.com/api/quiz/next', {
			headers: clientHeaders('quiz-new'),
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			item: { entryKey: string; promptEnglish: string; expectedHungarian: string };
			progress: null;
		};
		expect(body.item.entryKey).toContain(':');
		expect(body.item.promptEnglish.length).toBeGreaterThan(0);
		expect(body.progress).toBeNull();

		// Client row was created.
		const client = await testEnv().DB.prepare('SELECT * FROM clients WHERE id = ?')
			.bind('quiz-new')
			.first();
		expect(client).not.toBeNull();
	});

	it('honors ?entry= for preferred items', async () => {
		const first = await SELF.fetch('http://example.com/api/quiz/next', {
			headers: clientHeaders('quiz-pref'),
		}).then((r) => r.json() as Promise<{ item: { entryKey: string } }>);

		const res = await SELF.fetch(
			`http://example.com/api/quiz/next?entry=${encodeURIComponent(first.item.entryKey)}`,
			{ headers: clientHeaders('quiz-pref') },
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { item: { entryKey: string } };
		expect(body.item.entryKey).toBe(first.item.entryKey);
	});

	it('POST /api/quiz/attempt validates the body', async () => {
		const res = await SELF.fetch('http://example.com/api/quiz/attempt', {
			method: 'POST',
			headers: clientHeaders('quiz-attempt'),
			body: JSON.stringify({ entryKey: 'x' }),
		});
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'Missing required fields' });
	});

	it('records attempts and reflects them in progress/summary', async () => {
		const next = (await SELF.fetch('http://example.com/api/quiz/next', {
			headers: clientHeaders('quiz-flow'),
		}).then((r) => r.json())) as {
			item: {
				entryKey: string;
				courseSlug: string;
				lessonId: string;
				promptEnglish: string;
				expectedHungarian: string;
			};
		};

		const attempt = await SELF.fetch('http://example.com/api/quiz/attempt', {
			method: 'POST',
			headers: clientHeaders('quiz-flow'),
			body: JSON.stringify({
				entryKey: next.item.entryKey,
				courseSlug: next.item.courseSlug,
				lessonId: next.item.lessonId,
				promptEnglish: next.item.promptEnglish,
				expectedHungarian: next.item.expectedHungarian,
				userAnswer: next.item.expectedHungarian,
				matched: true,
				score: 1,
			}),
		});
		expect(attempt.status).toBe(200);

		const summaryRes = await SELF.fetch('http://example.com/api/progress/summary', {
			headers: clientHeaders('quiz-flow'),
		});
		expect(summaryRes.status).toBe(200);
		const summary = (await summaryRes.json()) as {
			totals: { entries_practiced: number; total_correct: number; total_attempts: number };
			recentAttempts: Array<{ entry_key: string; matched: boolean }>;
		};
		expect(summary.totals.entries_practiced).toBe(1);
		expect(summary.totals.total_correct).toBe(1);
		expect(summary.totals.total_attempts).toBe(1);
		expect(summary.recentAttempts[0]?.entry_key).toBe(next.item.entryKey);
		expect(summary.recentAttempts[0]?.matched).toBe(true);

		// A missed attempt schedules a ~2h review; a hit schedules 6h+.
		const progress = await testEnv()
			.DB.prepare('SELECT * FROM entry_progress WHERE client_id = ?')
			.bind('quiz-flow')
			.first<{ next_review_at: string; times_correct: number }>();
		expect(progress?.times_correct).toBe(1);
		const reviewInMs = Date.parse(progress!.next_review_at) - Date.now();
		expect(reviewInMs).toBeGreaterThan(5 * 3600 * 1000);
	});
});
