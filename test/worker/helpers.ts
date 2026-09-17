import { env } from 'cloudflare:test';

// Mirrors migrations/0001_init.sql. Kept inline because test code runs
// inside workerd where Node fs imports are unavailable.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
	id TEXT PRIMARY KEY,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	quiz_interval_hours INTEGER NOT NULL DEFAULT 12,
	notifications_enabled INTEGER NOT NULL DEFAULT 1,
	last_quiz_sent_at TEXT
);
CREATE TABLE IF NOT EXISTS push_subscriptions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
	endpoint TEXT NOT NULL UNIQUE,
	p256dh TEXT NOT NULL,
	auth TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client ON push_subscriptions(client_id);
CREATE TABLE IF NOT EXISTS entry_progress (
	client_id TEXT NOT NULL,
	entry_key TEXT NOT NULL,
	course_slug TEXT NOT NULL,
	lesson_id TEXT NOT NULL,
	times_seen INTEGER NOT NULL DEFAULT 0,
	times_correct INTEGER NOT NULL DEFAULT 0,
	times_incorrect INTEGER NOT NULL DEFAULT 0,
	last_seen_at TEXT,
	last_correct_at TEXT,
	next_review_at TEXT,
	PRIMARY KEY (client_id, entry_key)
);
CREATE INDEX IF NOT EXISTS idx_entry_progress_review ON entry_progress(client_id, next_review_at);
CREATE TABLE IF NOT EXISTS quiz_attempts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	client_id TEXT NOT NULL,
	entry_key TEXT NOT NULL,
	course_slug TEXT NOT NULL,
	lesson_id TEXT NOT NULL,
	prompt_english TEXT NOT NULL,
	expected_hungarian TEXT NOT NULL,
	user_answer TEXT,
	matched INTEGER NOT NULL,
	score REAL NOT NULL,
	attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_client ON quiz_attempts(client_id, attempted_at DESC);
`;

type TestEnv = {
	DB: D1Database;
	SONIOX_API_KEY?: string;
	SONIOX_REGION?: string;
	VAPID_PUBLIC_KEY?: string;
	VAPID_PRIVATE_KEY?: string;
};

export function testEnv(): TestEnv {
	return env as unknown as TestEnv;
}

/** Create tables (if needed) and wipe all rows for test isolation. */
export async function resetDb(): Promise<TestEnv> {
	const tEnv = testEnv();
	// D1 over miniflare executes one statement per call reliably —
	// split the schema instead of a single multi-statement exec().
	for (const raw of SCHEMA.split(';')) {
		const stmt = raw.trim();
		if (stmt) {
			await tEnv.DB.prepare(stmt).run();
		}
	}
	await tEnv.DB.batch([
		tEnv.DB.prepare('DELETE FROM quiz_attempts'),
		tEnv.DB.prepare('DELETE FROM entry_progress'),
		tEnv.DB.prepare('DELETE FROM push_subscriptions'),
		tEnv.DB.prepare('DELETE FROM clients'),
	]);
	return tEnv;
}

export function clientHeaders(clientId: string): Record<string, string> {
	return { 'X-Client-Id': clientId, 'Content-Type': 'application/json' };
}
