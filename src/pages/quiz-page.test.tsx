import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizPage } from '@/pages/quiz-page';

vi.mock('@tanstack/react-router', () => ({
	// Minimal Link stub — QuizPage only uses `to`, `children`, `className`.
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiFetch: apiFetchMock }));

const quizItem = {
	courseSlug: 'greetings',
	courseTitle: 'Greetings',
	lessonId: 'l1',
	lessonTitle: 'Basics',
	entryKey: 'greetings:l1-Szia-0',
	promptEnglish: 'Hi',
	expectedHungarian: 'Szia',
};

const summary = {
	totals: { entries_practiced: 3, total_correct: 2, total_incorrect: 1, total_attempts: 3 },
	byCourse: [],
};

describe('QuizPage', () => {
	beforeEach(() => {
		apiFetchMock.mockReset();
		apiFetchMock.mockImplementation((path: string) => {
			if (path.startsWith('/api/quiz/next')) {
				return Promise.resolve({ item: quizItem, progress: null });
			}
			if (path === '/api/progress/summary') {
				return Promise.resolve(summary);
			}
			if (path === '/api/quiz/attempt') {
				return Promise.resolve({ ok: true });
			}
			return Promise.reject(new Error(`unexpected ${path}`));
		});
	});

	it('loads and renders the quiz plus summary stats', async () => {
		render(<QuizPage />);
		expect(screen.getByText('Loading quiz…')).toBeInTheDocument();

		expect(await screen.findByText('Hi')).toBeInTheDocument();
		expect(screen.getByText(/Greetings · Basics/)).toBeInTheDocument();
		expect(screen.getByText('Words practiced')).toBeInTheDocument();
		// Accuracy = 2/3 → 67%
		expect(screen.getByText('67%')).toBeInTheDocument();
	});

	it('shows an error when loading fails', async () => {
		apiFetchMock.mockRejectedValue(new Error('boom'));
		render(<QuizPage />);
		expect(await screen.findByText('boom')).toBeInTheDocument();
	});

	it('submits an attempt and offers the next question', async () => {
		const user = userEvent.setup();
		render(<QuizPage />);
		await screen.findByText('Hi');

		await user.type(screen.getByPlaceholderText('Type what you said…'), 'Szia');
		await user.click(screen.getByRole('button', { name: 'Check' }));

		await waitFor(() => {
			expect(apiFetchMock).toHaveBeenCalledWith(
				'/api/quiz/attempt',
				expect.objectContaining({
					method: 'POST',
					json: expect.objectContaining({ entryKey: quizItem.entryKey, matched: true }),
				}),
			);
		});
		expect(await screen.findByRole('button', { name: 'Next question' })).toBeInTheDocument();

		apiFetchMock.mockClear();
		await user.click(screen.getByRole('button', { name: 'Next question' }));
		await waitFor(() => {
			expect(apiFetchMock.mock.calls.some(([path]) => path === '/api/quiz/next')).toBe(true);
		});
	});
});
