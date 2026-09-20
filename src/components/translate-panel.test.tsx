import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslatePanel } from '@/components/translate-panel';

const { recordingMock, startMock, stopMock } = vi.hoisted(() => ({
	startMock: vi.fn(),
	stopMock: vi.fn().mockResolvedValue(undefined),
	recordingMock: vi.fn(),
}));

vi.mock('@soniox/client', () => ({
	// Must be `function`, not an arrow: the component constructs it with
	// `new`, and Vitest ≥4 throws `is not a constructor` otherwise.
	MicrophoneSource: vi.fn().mockImplementation(function () {
		return {};
	}),
}));

vi.mock('@soniox/react', () => ({
	useRecording: recordingMock,
}));

function mockRecording(overrides = {}) {
	recordingMock.mockReturnValue({
		finalTokens: [],
		partialTokens: [],
		isActive: false,
		state: 'idle',
		start: startMock,
		stop: stopMock,
		...overrides,
	});
}

describe('TranslatePanel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRecording();
	});

	it('renders controls and empty states', () => {
		render(<TranslatePanel />);
		expect(screen.getByText('Translate')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
		expect(screen.getByText('Translation will appear here…')).toBeInTheDocument();
		expect(screen.getByText('Original transcription will appear here…')).toBeInTheDocument();
	});

	it('starts recording on Start click', async () => {
		const user = userEvent.setup();
		render(<TranslatePanel />);
		await user.click(screen.getByRole('button', { name: 'Start' }));
		expect(startMock).toHaveBeenCalledOnce();
	});

	it('shows Stop while active and stops on click', async () => {
		mockRecording({ isActive: true, state: 'recording' });
		const user = userEvent.setup();
		render(<TranslatePanel />);
		await user.click(screen.getByRole('button', { name: 'Stop' }));
		expect(stopMock).toHaveBeenCalledOnce();
	});

	it('shows start errors thrown by start()', async () => {
		startMock.mockImplementation(() => {
			throw new Error('mic denied');
		});
		const user = userEvent.setup();
		render(<TranslatePanel />);
		await user.click(screen.getByRole('button', { name: 'Start' }));
		expect(await screen.findByText('mic denied')).toBeInTheDocument();
	});

	it('collapses sections on toggle', async () => {
		const user = userEvent.setup();
		render(<TranslatePanel />);
		await user.click(screen.getByRole('button', { name: /English/ }));
		expect(screen.queryByText('Translation will appear here…')).not.toBeInTheDocument();
	});
});
