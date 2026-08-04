import type { VocabularyCourse, VocabularyEntry, VocabularyLesson } from '@/lib/courses/types';

export function getEntryRowKey(
	lesson: VocabularyLesson,
	entry: VocabularyEntry,
	index: number,
): string {
	return entry.label ? `${lesson.id}-${entry.label}` : `${lesson.id}-${entry.hungarian}-${index}`;
}

export function getEntryKey(
	course: VocabularyCourse,
	lesson: VocabularyLesson,
	entry: VocabularyEntry,
	index: number,
): string {
	return `${course.slug}:${getEntryRowKey(lesson, entry, index)}`;
}
