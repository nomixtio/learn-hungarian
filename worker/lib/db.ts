import type { Env } from '../env';

export type ClientRow = {
	id: string;
	created_at: string;
	quiz_interval_hours: number;
	notifications_enabled: number;
	last_quiz_sent_at: string | null;
};

export type PushSubscriptionRow = {
	id: number;
	client_id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	created_at: string;
};

export type EntryProgressRow = {
	client_id: string;
	entry_key: string;
	course_slug: string;
	lesson_id: string;
	times_seen: number;
	times_correct: number;
	times_incorrect: number;
	last_seen_at: string | null;
	last_correct_at: string | null;
	next_review_at: string | null;
};

export async function ensureClient(
	db: D1Database,
	clientId: string,
	quizIntervalHours = 12,
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO clients (id, quiz_interval_hours)
       VALUES (?, ?)
       ON CONFLICT(id) DO NOTHING`,
		)
		.bind(clientId, quizIntervalHours)
		.run();
}

export async function getClient(db: D1Database, clientId: string): Promise<ClientRow | null> {
	return db
		.prepare('SELECT * FROM clients WHERE id = ?')
		.bind(clientId)
		.first<ClientRow>();
}

export async function updateClientSettings(
	db: D1Database,
	clientId: string,
	settings: { quizIntervalHours?: number; notificationsEnabled?: boolean },
): Promise<void> {
	const updates: string[] = [];
	const values: unknown[] = [];

	if (settings.quizIntervalHours !== undefined) {
		updates.push('quiz_interval_hours = ?');
		values.push(settings.quizIntervalHours);
	}

	if (settings.notificationsEnabled !== undefined) {
		updates.push('notifications_enabled = ?');
		values.push(settings.notificationsEnabled ? 1 : 0);
	}

	if (updates.length === 0) {
		return;
	}

	values.push(clientId);
	await db
		.prepare(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function upsertPushSubscription(
	db: D1Database,
	clientId: string,
	subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO push_subscriptions (client_id, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET
         client_id = excluded.client_id,
         p256dh = excluded.p256dh,
         auth = excluded.auth`,
		)
		.bind(clientId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth)
		.run();
}

export async function deletePushSubscriptionsForClient(
	db: D1Database,
	clientId: string,
): Promise<void> {
	await db.prepare('DELETE FROM push_subscriptions WHERE client_id = ?').bind(clientId).run();
}

export async function getPushSubscriptionsForClient(
	db: D1Database,
	clientId: string,
): Promise<PushSubscriptionRow[]> {
	const result = await db
		.prepare('SELECT * FROM push_subscriptions WHERE client_id = ?')
		.bind(clientId)
		.all<PushSubscriptionRow>();

	return result.results;
}

export async function getDueClients(db: D1Database): Promise<
	Array<ClientRow & { endpoint: string; p256dh: string; auth: string }>
> {
	const result = await db
		.prepare(
			`SELECT c.*, ps.endpoint, ps.p256dh, ps.auth
       FROM clients c
       INNER JOIN push_subscriptions ps ON ps.client_id = c.id
       WHERE c.notifications_enabled = 1
         AND (
           c.last_quiz_sent_at IS NULL
           OR datetime(c.last_quiz_sent_at, '+' || c.quiz_interval_hours || ' hours') <= datetime('now')
         )`,
		)
		.all<ClientRow & { endpoint: string; p256dh: string; auth: string }>();

	return result.results;
}

export async function markQuizSent(db: D1Database, clientId: string): Promise<void> {
	await db
		.prepare(`UPDATE clients SET last_quiz_sent_at = datetime('now') WHERE id = ?`)
		.bind(clientId)
		.run();
}

export async function getEntryProgressMap(
	db: D1Database,
	clientId: string,
): Promise<Map<string, EntryProgressRow>> {
	const result = await db
		.prepare('SELECT * FROM entry_progress WHERE client_id = ?')
		.bind(clientId)
		.all<EntryProgressRow>();

	return new Map(result.results.map((row) => [row.entry_key, row]));
}

export async function recordQuizAttempt(
	db: D1Database,
	attempt: {
		clientId: string;
		entryKey: string;
		courseSlug: string;
		lessonId: string;
		promptEnglish: string;
		expectedHungarian: string;
		userAnswer: string;
		matched: boolean;
		score: number;
	},
): Promise<void> {
	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO quiz_attempts (
         client_id, entry_key, course_slug, lesson_id,
         prompt_english, expected_hungarian, user_answer, matched, score
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			attempt.clientId,
			attempt.entryKey,
			attempt.courseSlug,
			attempt.lessonId,
			attempt.promptEnglish,
			attempt.expectedHungarian,
			attempt.userAnswer,
			attempt.matched ? 1 : 0,
			attempt.score,
		)
		.run();

	const existing = await db
		.prepare('SELECT * FROM entry_progress WHERE client_id = ? AND entry_key = ?')
		.bind(attempt.clientId, attempt.entryKey)
		.first<EntryProgressRow>();

	const timesSeen = (existing?.times_seen ?? 0) + 1;
	const timesCorrect = (existing?.times_correct ?? 0) + (attempt.matched ? 1 : 0);
	const timesIncorrect = (existing?.times_incorrect ?? 0) + (attempt.matched ? 0 : 1);

	const reviewHours = attempt.matched
		? Math.min(24 * 14, Math.max(6, timesCorrect * 12))
		: 2;
	const nextReviewAt = new Date(Date.now() + reviewHours * 60 * 60 * 1000).toISOString();

	await db
		.prepare(
			`INSERT INTO entry_progress (
         client_id, entry_key, course_slug, lesson_id,
         times_seen, times_correct, times_incorrect,
         last_seen_at, last_correct_at, next_review_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(client_id, entry_key) DO UPDATE SET
         times_seen = excluded.times_seen,
         times_correct = excluded.times_correct,
         times_incorrect = excluded.times_incorrect,
         last_seen_at = excluded.last_seen_at,
         last_correct_at = CASE
           WHEN excluded.last_correct_at IS NOT NULL THEN excluded.last_correct_at
           ELSE entry_progress.last_correct_at
         END,
         next_review_at = excluded.next_review_at`,
		)
		.bind(
			attempt.clientId,
			attempt.entryKey,
			attempt.courseSlug,
			attempt.lessonId,
			timesSeen,
			timesCorrect,
			timesIncorrect,
			now,
			attempt.matched ? now : existing?.last_correct_at ?? null,
			nextReviewAt,
		)
		.run();
}

export async function getProgressSummary(db: D1Database, clientId: string) {
	const totals = await db
		.prepare(
			`SELECT
         COUNT(*) AS entries_practiced,
         COALESCE(SUM(times_correct), 0) AS total_correct,
         COALESCE(SUM(times_incorrect), 0) AS total_incorrect,
         COALESCE(SUM(times_seen), 0) AS total_attempts
       FROM entry_progress
       WHERE client_id = ?`,
		)
		.bind(clientId)
		.first<{
			entries_practiced: number;
			total_correct: number;
			total_incorrect: number;
			total_attempts: number;
		}>();

	const recentAttempts = await db
		.prepare(
			`SELECT entry_key, course_slug, prompt_english, expected_hungarian, matched, score, attempted_at
       FROM quiz_attempts
       WHERE client_id = ?
       ORDER BY attempted_at DESC
       LIMIT 10`,
		)
		.bind(clientId)
		.all<{
			entry_key: string;
			course_slug: string;
			prompt_english: string;
			expected_hungarian: string;
			matched: number;
			score: number;
			attempted_at: string;
		}>();

	const byCourse = await db
		.prepare(
			`SELECT
         course_slug,
         COUNT(*) AS entries_practiced,
         COALESCE(SUM(times_correct), 0) AS total_correct,
         COALESCE(SUM(times_incorrect), 0) AS total_incorrect
       FROM entry_progress
       WHERE client_id = ?
       GROUP BY course_slug`,
		)
		.bind(clientId)
		.all<{
			course_slug: string;
			entries_practiced: number;
			total_correct: number;
			total_incorrect: number;
		}>();

	return {
		totals: totals ?? {
			entries_practiced: 0,
			total_correct: 0,
			total_incorrect: 0,
			total_attempts: 0,
		},
		byCourse: byCourse.results,
		recentAttempts: recentAttempts.results.map((row) => ({
			...row,
			matched: row.matched === 1,
		})),
	};
}

export function getVapidPrivateKey(env: Env): JsonWebKey {
	if (!env.VAPID_PRIVATE_KEY) {
		throw new Error('VAPID_PRIVATE_KEY is not configured');
	}

	const raw = env.VAPID_PRIVATE_KEY.trim();
	try {
		return JSON.parse(raw) as JsonWebKey;
	} catch {
		throw new Error(
			'VAPID_PRIVATE_KEY is not valid JSON. Re-upload it with ./scripts/setup-production-secrets.sh',
		);
	}
}
