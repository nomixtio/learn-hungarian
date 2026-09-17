import { describe, expect, it } from 'vitest';

import { getEntryKey, getEntryRowKey } from '@/lib/courses/entry-key';
import {
	getAllQuizItems,
	getQuizEligibleCourses,
	getQuizItemByKey,
	getQuizItemsForCourse,
} from '@/lib/courses/quiz-pool';
import type { VocabularyCourse } from '@/lib/courses/types';

const course: VocabularyCourse = {
	id: 'c1',
	slug: 'greetings',
	title: 'Greetings',
	subtitle: 'Say hello',
	lessons: [
		{
			id: 'l1',
			title: 'Basics',
			entries: [
				{ hungarian: 'Szia', english: 'Hi' },
				{ hungarian: 'Jó napot', english: 'Good day', label: 'formal-hello' },
			],
		},
	],
};

describe('getEntryRowKey / getEntryKey', () => {
	it('uses label when present', () => {
		const lesson = course.lessons[0]!;
		expect(getEntryRowKey(lesson, lesson.entries[1]!, 1)).toBe('l1-formal-hello');
		expect(getEntryKey(course, lesson, lesson.entries[1]!, 1)).toBe(
			'greetings:l1-formal-hello',
		);
	});

	it('falls back to hungarian + index', () => {
		const lesson = course.lessons[0]!;
		expect(getEntryRowKey(lesson, lesson.entries[0]!, 0)).toBe('l1-Szia-0');
		expect(getEntryKey(course, lesson, lesson.entries[0]!, 0)).toBe('greetings:l1-Szia-0');
	});
});

describe('quiz-pool', () => {
	it('builds items for a course with stable keys', () => {
		const items = getQuizItemsForCourse(course);
		expect(items).toHaveLength(2);
		expect(items[0]).toMatchObject({
			courseSlug: 'greetings',
			promptEnglish: 'Hi',
			expectedHungarian: 'Szia',
		});
		expect(items[0]?.entryKey).toContain('greetings:');
	});

	it('excludes the alphabet course from eligibility', () => {
		const eligible = getQuizEligibleCourses();
		expect(eligible.length).toBeGreaterThan(0);
		expect(eligible.map((c) => c.slug)).not.toContain('alphabet');
	});

	it('getAllQuizItems is non-empty and keyed', () => {
		const items = getAllQuizItems();
		expect(items.length).toBeGreaterThan(0);
		const keys = new Set(items.map((i) => i.entryKey));
		expect(keys.size).toBe(items.length);
	});

	it('getQuizItemByKey round-trips', () => {
		const first = getAllQuizItems()[0]!;
		expect(getQuizItemByKey(first.entryKey)).toEqual(first);
		expect(getQuizItemByKey('nope:missing-0')).toBeUndefined();
	});
});
