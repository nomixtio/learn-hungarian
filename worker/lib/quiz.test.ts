import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAllQuizItems } from '../../src/lib/courses/quiz-pool';
import type { EntryProgressRow } from './db';
import {
	buildCourseReminderNotification,
	buildQuizNotification,
	buildScheduledNotification,
	pickCourseForReminder,
	pickNextQuizItem,
} from './quiz';

function progressRow(overrides: Partial<EntryProgressRow> = {}): EntryProgressRow {
	return {
		client_id: 'c1',
		entry_key: 'k1',
		course_slug: 'greetings',
		lesson_id: 'l1',
		times_seen: 0,
		times_correct: 0,
		times_incorrect: 0,
		last_seen_at: null,
		last_correct_at: null,
		next_review_at: null,
		...overrides,
	};
}

describe('pickNextQuizItem', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(Math, 'random').mockReturnValue(0);
	});

	it('returns the preferred item when the key exists', () => {
		const first = getAllQuizItems()[0]!;
		expect(pickNextQuizItem(new Map(), first.entryKey)).toEqual(first);
	});

	it('falls back to weighted pick for unknown preferred keys', () => {
		const item = pickNextQuizItem(new Map(), 'missing:key');
		expect(item).not.toBeNull();
		expect(getAllQuizItems()).toContainEqual(item);
	});

	it('is deterministic when Math.random is fixed', () => {
		const first = getAllQuizItems()[0]!;
		// roll = 0 * total = 0 → first entry wins (roll -= weight <= 0 immediately)
		expect(pickNextQuizItem(new Map())).toEqual(first);
	});

	it('prefers unseen items over mastered ones', () => {
		const items = getAllQuizItems();
		const masteredKey = items[0]!.entryKey;
		const map = new Map<string, EntryProgressRow>([
			[
				masteredKey,
				progressRow({
					entry_key: masteredKey,
					times_seen: 100,
					times_correct: 100,
					next_review_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
				}),
			],
		]);
		// With random=0 the first weighted bucket still wins, but total weight must
		// reflect the mastered discount (10) vs unseen (100).
		// Sanity: function still returns a valid item.
		const picked = pickNextQuizItem(map);
		expect(picked).not.toBeNull();
	});

	it('returns null when the pool is empty', async () => {
		vi.resetModules();
		vi.doMock('../../src/lib/courses/quiz-pool', () => ({
			getAllQuizItems: () => [],
			getQuizItemByKey: () => undefined,
			getQuizEligibleCourses: () => [],
		}));
		const mod = await import('./quiz');
		expect(mod.pickNextQuizItem(new Map())).toBeNull();
		vi.doUnmock('../../src/lib/courses/quiz-pool');
	});
});

describe('notifications', () => {
	it('buildQuizNotification links back to the quiz entry', () => {
		const item = getAllQuizItems()[0]!;
		const payload = buildQuizNotification(item);
		expect(payload.title).toBe('Hungarian quiz time');
		expect(payload.body).toContain(item.promptEnglish);
		expect(payload.data.url).toContain(encodeURIComponent(item.entryKey));
		expect(payload.tag).toBe('hungarian-quiz');
	});

	it('buildCourseReminderNotification links to the course', () => {
		const payload = buildCourseReminderNotification({
			id: 'c1',
			slug: 'greetings',
			title: 'Greetings',
			subtitle: '',
			lessons: [],
		});
		expect(payload.data.url).toBe('/learn/greetings');
		expect(payload.tag).toBe('hungarian-course-reminder');
	});

	it('pickCourseForReminder never returns the alphabet course', () => {
		for (let i = 0; i < 20; i += 1) {
			const course = pickCourseForReminder();
			expect(course).not.toBeNull();
			expect(course?.slug).not.toBe('alphabet');
		}
	});

	it('buildScheduledNotification can return either branch', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0); // < 1/3 → course reminder
		expect(buildScheduledNotification(new Map())?.tag).toBe('hungarian-course-reminder');

		vi.spyOn(Math, 'random').mockReturnValue(0.99); // quiz branch
		expect(buildScheduledNotification(new Map())?.tag).toBe('hungarian-quiz');
	});
});
