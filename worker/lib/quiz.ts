import {
	getAllQuizItems,
	getQuizEligibleCourses,
	getQuizItemByKey,
	type QuizItem,
} from '../../src/lib/courses/quiz-pool';
import type { VocabularyCourse } from '../../src/lib/courses/types';
import type { EntryProgressRow } from './db';

export type PushNotificationPayload = {
	title: string;
	body: string;
	icon: string;
	tag: string;
	data: {
		url: string;
	};
};

const COURSE_REMINDER_CHANCE = 1 / 3;

function scoreQuizItem(item: QuizItem, progress: EntryProgressRow | undefined, now: number): number {
	if (!progress) {
		return 100;
	}

	if (progress.next_review_at && Date.parse(progress.next_review_at) <= now) {
		return 90;
	}

	const accuracy =
		progress.times_seen > 0 ? progress.times_correct / progress.times_seen : 0;

	if (accuracy < 0.5) {
		return 80;
	}

	if (accuracy < 0.8) {
		return 50;
	}

	return 10;
}

export function pickNextQuizItem(
	progressMap: Map<string, EntryProgressRow>,
	preferredEntryKey?: string,
): QuizItem | null {
	const items = getAllQuizItems();
	if (items.length === 0) {
		return null;
	}

	if (preferredEntryKey) {
		const preferred = getQuizItemByKey(preferredEntryKey);
		if (preferred) {
			return preferred;
		}
	}

	const now = Date.now();
	const weighted = items.map((item) => ({
		item,
		weight: scoreQuizItem(item, progressMap.get(item.entryKey), now),
	}));

	const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
	let roll = Math.random() * totalWeight;

	for (const entry of weighted) {
		roll -= entry.weight;
		if (roll <= 0) {
			return entry.item;
		}
	}

	return weighted[weighted.length - 1]?.item ?? items[0] ?? null;
}

export function pickCourseForReminder(): VocabularyCourse | null {
	const eligible = getQuizEligibleCourses();
	if (eligible.length === 0) {
		return null;
	}

	return eligible[Math.floor(Math.random() * eligible.length)] ?? null;
}

export function buildQuizNotification(item: QuizItem): PushNotificationPayload {
	return {
		title: 'Hungarian quiz time',
		body: `How do you say “${item.promptEnglish}”?`,
		icon: '/logo192.png',
		tag: 'hungarian-quiz',
		data: {
			url: `/quiz?entry=${encodeURIComponent(item.entryKey)}`,
		},
	};
}

export function buildCourseReminderNotification(course: VocabularyCourse): PushNotificationPayload {
	return {
		title: 'Time to practice Hungarian',
		body: `Continue with ${course.title}.`,
		icon: '/logo192.png',
		tag: 'hungarian-course-reminder',
		data: {
			url: `/learn/${course.slug}`,
		},
	};
}

export function buildScheduledNotification(
	progressMap: Map<string, EntryProgressRow>,
): PushNotificationPayload | null {
	if (Math.random() < COURSE_REMINDER_CHANCE) {
		const course = pickCourseForReminder();
		if (course) {
			return buildCourseReminderNotification(course);
		}
	}

	const item = pickNextQuizItem(progressMap);
	if (item) {
		return buildQuizNotification(item);
	}

	const course = pickCourseForReminder();
	return course ? buildCourseReminderNotification(course) : null;
}
