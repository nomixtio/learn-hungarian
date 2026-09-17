import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SpeakingExercise } from '@/components/speaking-exercise';

describe('SpeakingExercise', () => {
	it('renders the prompt and disables Check when empty', () => {
		render(<SpeakingExercise promptEnglish="Good day" expectedHungarian="Jó napot" />);
		expect(screen.getByText('Good day')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
	});

	it('reports a correct match and calls onComplete', async () => {
		const user = userEvent.setup();
		const onComplete = vi.fn();
		render(
			<SpeakingExercise promptEnglish="Hi" expectedHungarian="Szia" onComplete={onComplete} />,
		);

		await user.type(screen.getByPlaceholderText('Type what you said…'), 'Szia');
		await user.click(screen.getByRole('button', { name: 'Check' }));

		expect(screen.getByText(/Correct! \(score 100%\)/)).toBeInTheDocument();
		expect(onComplete).toHaveBeenCalledWith(true, 'Szia', 1);
	});

	it('is accent/case-insensitive', async () => {
		const user = userEvent.setup();
		render(<SpeakingExercise promptEnglish="Thank you" expectedHungarian="Köszönöm" />);
		await user.type(screen.getByPlaceholderText('Type what you said…'), 'KOSZONOM');
		await user.click(screen.getByRole('button', { name: 'Check' }));
		expect(screen.getByText(/Correct!/)).toBeInTheDocument();
	});

	it('reports a miss and clears the result on edit', async () => {
		const user = userEvent.setup();
		const onComplete = vi.fn();
		render(
			<SpeakingExercise promptEnglish="Hi" expectedHungarian="Szia" onComplete={onComplete} />,
		);

		await user.type(screen.getByPlaceholderText('Type what you said…'), 'Alma');
		await user.click(screen.getByRole('button', { name: 'Check' }));
		expect(screen.getByText('Not quite — try again.')).toBeInTheDocument();
		expect(onComplete).toHaveBeenCalledWith(false, 'Alma', 0);

		await user.type(screen.getByPlaceholderText('Type what you said…'), '!');
		expect(screen.queryByText('Not quite — try again.')).not.toBeInTheDocument();
	});
});
