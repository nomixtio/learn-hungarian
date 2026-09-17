import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AlignedChunkTranscript } from '@/components/aligned-chunk-transcript';
import type { TranslationChunk } from '@/lib/translation-chunks';

const noop = () => {};

function chunk(overrides: Partial<TranslationChunk> & { id: string }): TranslationChunk {
	return {
		speaker: 'spk1',
		originalText: '',
		translationText: '',
		originalPartial: '',
		translationPartial: '',
		...overrides,
	};
}

describe('AlignedChunkTranscript', () => {
	it('shows the empty message when there are no chunks', () => {
		render(
			<AlignedChunkTranscript
				chunks={[]}
				side="translation"
				selectedChunkId={null}
				onSelectChunk={noop}
				onRegisterChunkAnchor={noop}
				emptyMessage="Nothing yet…"
			/>,
		);
		expect(screen.getByText('Nothing yet…')).toBeInTheDocument();
	});

	it('renders stable translation text grouped by speaker', () => {
		render(
			<AlignedChunkTranscript
				chunks={[chunk({ id: 'a-1', speaker: 'a', translationText: 'Hello' })]}
				side="translation"
				selectedChunkId={null}
				onSelectChunk={noop}
				onRegisterChunkAnchor={noop}
				emptyMessage="empty"
			/>,
		);
		expect(screen.getByText('Speaker a')).toBeInTheDocument();
		expect(screen.getByText('Hello')).toBeInTheDocument();
	});

	it('renders the original side, not the translation', () => {
		render(
			<AlignedChunkTranscript
				chunks={[chunk({ id: 'a-1', originalText: 'Szia', translationText: 'Hello' })]}
				side="original"
				selectedChunkId={null}
				onSelectChunk={noop}
				onRegisterChunkAnchor={noop}
				emptyMessage="empty"
			/>,
		);
		expect(screen.getByText('Szia')).toBeInTheDocument();
		expect(screen.queryByText('Hello')).not.toBeInTheDocument();
	});

	it('notifies on word click and keyboard select', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<AlignedChunkTranscript
				chunks={[chunk({ id: 'a-1', translationText: 'Hello world' })]}
				side="translation"
				selectedChunkId={null}
				onSelectChunk={onSelect}
				onRegisterChunkAnchor={noop}
				emptyMessage="empty"
			/>,
		);
		await user.click(screen.getByText('Hello'));
		expect(onSelect).toHaveBeenCalledWith('a-1', 'translation');

		await user.tab();
		await user.keyboard('{Enter}');
		expect(onSelect).toHaveBeenCalledTimes(2);
	});

	it('renders live partial text', () => {
		render(
			<AlignedChunkTranscript
				chunks={[chunk({ id: 'spk1-partial', translationPartial: 'Typing…' })]}
				side="translation"
				selectedChunkId={null}
				onSelectChunk={noop}
				onRegisterChunkAnchor={noop}
				emptyMessage="empty"
			/>,
		);
		expect(screen.getByText('Typing…')).toBeInTheDocument();
	});
});
