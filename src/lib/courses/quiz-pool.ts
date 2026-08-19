import { getEntryKey } from '@/lib/courses/entry-key';
import { courses } from '@/lib/courses/registry';
import type { VocabularyCourse } from '@/lib/courses/types';

export type QuizItem = {
	courseSlug: string;
	courseTitle: string;
	lessonId: string;
	lessonTitle: string;
	entryKey: string;
	promptEnglish: string;
	expectedHungarian: string;
};

export function getQuizItemsForCourse(course: VocabularyCourse): QuizItem[] {
	const items: QuizItem[] = [];

	for (const lesson of course.lessons) {
		lesson.entries.forEach((entry, index) => {
			items.push({
				courseSlug: course.slug,
				courseTitle: course.title,
				lessonId: lesson.id,
				lessonTitle: lesson.title,
				entryKey: getEntryKey(course, lesson, entry, index),
				promptEnglish: entry.english,
				expectedHungarian: entry.hungarian,
			});
		});
	}

	return items;
}

const QUIZ_EXCLUDED_COURSE_SLUGS = new Set(['alphabet']);

export function getQuizEligibleCourses(): VocabularyCourse[] {
	return courses.filter((course) => !QUIZ_EXCLUDED_COURSE_SLUGS.has(course.slug));
}

export function getAllQuizItems(): QuizItem[] {
	return getQuizEligibleCourses().flatMap(getQuizItemsForCourse);
}

export function getQuizItemByKey(entryKey: string): QuizItem | undefined {
	return getAllQuizItems().find((item) => item.entryKey === entryKey);
}
