import { Link, useParams } from '@tanstack/react-router';

import { VocabularyCoursePage } from '@/components/vocabulary-course-page';
import { getCourseBySlug } from '@/lib/courses/registry';

export function CoursePage() {
	const { courseSlug } = useParams({ from: '/learn/$courseSlug' });
	const course = getCourseBySlug(courseSlug);

	if (!course) {
		return (
			<div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center justify-center gap-4 px-6 py-8">
				<h1 className="m-0 text-2xl font-semibold">Course not found</h1>
				<p className="m-0 text-center text-text-secondary">
					There is no course at <code>/learn/{courseSlug}</code>.
				</p>
				<Link to="/" className="btn-primary no-underline">
					Back to home
				</Link>
			</div>
		);
	}

	return <VocabularyCoursePage course={course} />;
}
