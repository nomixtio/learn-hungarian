import { alphabetCourse } from '@/lib/courses/alphabet';
import { colorsCourse } from '@/lib/courses/colors';
import { daysCourse } from '@/lib/courses/days';
import { foodCourse } from '@/lib/courses/food';
import { greetingsCourse } from '@/lib/courses/greetings';
import { monthsCourse } from '@/lib/courses/months';
import { numbersCourse } from '@/lib/courses/numbers';
import { phrasesCourse } from '@/lib/courses/phrases';
import type { VocabularyCourse } from '@/lib/courses/types';

export const courses: VocabularyCourse[] = [
	alphabetCourse,
	numbersCourse,
	greetingsCourse,
	phrasesCourse,
	colorsCourse,
	daysCourse,
	monthsCourse,
	foodCourse,
];

export function getCourseBySlug(slug: string): VocabularyCourse | undefined {
	return courses.find((course) => course.slug === slug);
}
