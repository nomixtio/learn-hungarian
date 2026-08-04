import { useCallback, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';

import { SpeakingExercise } from '@/components/speaking-exercise';
import { apiFetch } from '@/lib/api';
import type { QuizItem } from '@/lib/courses/quiz-pool';

type QuizResponse = {
	item: QuizItem;
	progress: {
		timesSeen: number;
		timesCorrect: number;
		timesIncorrect: number;
		lastSeenAt: string | null;
		nextReviewAt: string | null;
	} | null;
};

type ProgressSummary = {
	totals: {
		entries_practiced: number;
		total_correct: number;
		total_incorrect: number;
		total_attempts: number;
	};
	byCourse: Array<{
		course_slug: string;
		entries_practiced: number;
		total_correct: number;
		total_incorrect: number;
	}>;
};

export function QuizPage() {
	const [quiz, setQuiz] = useState<QuizResponse | null>(null);
	const [summary, setSummary] = useState<ProgressSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [completed, setCompleted] = useState(false);

	const loadQuiz = useCallback(async (entry?: string) => {
		setLoading(true);
		setError(null);
		setCompleted(false);
		try {
			const path = entry ? `/api/quiz/next?entry=${encodeURIComponent(entry)}` : '/api/quiz/next';
			const [nextQuiz, progressSummary] = await Promise.all([
				apiFetch<QuizResponse>(path),
				apiFetch<ProgressSummary>('/api/progress/summary'),
			]);
			setQuiz(nextQuiz);
			setSummary(progressSummary);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load quiz.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		void loadQuiz(params.get('entry') ?? undefined);
	}, [loadQuiz]);

	const handleComplete = async (matched: boolean, userAnswer: string, score: number) => {
		if (!quiz || completed) {
			return;
		}

		try {
			await apiFetch('/api/quiz/attempt', {
				method: 'POST',
				json: {
					entryKey: quiz.item.entryKey,
					courseSlug: quiz.item.courseSlug,
					lessonId: quiz.item.lessonId,
					promptEnglish: quiz.item.promptEnglish,
					expectedHungarian: quiz.item.expectedHungarian,
					userAnswer,
					matched,
					score,
				},
			});
			setCompleted(true);
			const progressSummary = await apiFetch<ProgressSummary>('/api/progress/summary');
			setSummary(progressSummary);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save your progress.');
		}
	};

	const accuracy =
		summary && summary.totals.total_attempts > 0
			? Math.round((summary.totals.total_correct / summary.totals.total_attempts) * 100)
			: 0;

	return (
		<div className="mx-auto flex w-full max-w-[800px] flex-1 min-h-0 flex-col gap-6 overflow-y-auto px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
			<header className="flex flex-col items-center gap-2">
				<h1 className="m-0 text-[32px] leading-[44px] font-semibold">Quiz</h1>
				<p className="m-0 text-center text-base leading-6 font-medium text-text-secondary">
					Practice Hungarian vocabulary and track your progress over time.
				</p>
			</header>

			{summary ? (
				<section className="card grid gap-3 p-4 sm:grid-cols-3">
					<div>
						<p className="m-0 text-xs font-medium text-text-secondary">Words practiced</p>
						<p className="m-0 text-2xl font-semibold">{summary.totals.entries_practiced}</p>
					</div>
					<div>
						<p className="m-0 text-xs font-medium text-text-secondary">Total attempts</p>
						<p className="m-0 text-2xl font-semibold">{summary.totals.total_attempts}</p>
					</div>
					<div>
						<p className="m-0 text-xs font-medium text-text-secondary">Accuracy</p>
						<p className="m-0 font-display text-2xl font-semibold text-accent">{accuracy}%</p>
					</div>
				</section>
			) : null}

			{loading ? (
				<p className="m-0 text-center text-sm text-text-secondary">Loading quiz…</p>
			) : error ? (
				<p className="notice-danger m-0 text-center">{error}</p>
			) : quiz ? (
				<div className="flex flex-col gap-4">
					<p className="m-0 text-sm font-medium text-text-secondary">
						{quiz.item.courseTitle} · {quiz.item.lessonTitle}
						{quiz.progress
							? ` · seen ${quiz.progress.timesSeen} time${quiz.progress.timesSeen === 1 ? '' : 's'}`
							: ' · new word'}
					</p>

					<SpeakingExercise
						key={quiz.item.entryKey}
						promptEnglish={quiz.item.promptEnglish}
						expectedHungarian={quiz.item.expectedHungarian}
						onComplete={(matched, userAnswer, score) => {
							void handleComplete(matched, userAnswer, score);
						}}
					/>

					{completed ? (
						<div className="flex flex-wrap gap-2">
							<button type="button" className="btn-primary" onClick={() => void loadQuiz()}>
								Next question
							</button>
							<Link to="/settings" className="btn-secondary no-underline">
								Notification settings
							</Link>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
