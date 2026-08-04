CREATE TABLE clients (
	id TEXT PRIMARY KEY,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	quiz_interval_hours INTEGER NOT NULL DEFAULT 12,
	notifications_enabled INTEGER NOT NULL DEFAULT 1,
	last_quiz_sent_at TEXT
);

CREATE TABLE push_subscriptions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
	endpoint TEXT NOT NULL UNIQUE,
	p256dh TEXT NOT NULL,
	auth TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_push_subscriptions_client ON push_subscriptions(client_id);

CREATE TABLE entry_progress (
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

CREATE INDEX idx_entry_progress_review ON entry_progress(client_id, next_review_at);

CREATE TABLE quiz_attempts (
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

CREATE INDEX idx_quiz_attempts_client ON quiz_attempts(client_id, attempted_at DESC);
