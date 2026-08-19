import { MicrophoneSource } from '@soniox/client';
import { useRecording } from '@soniox/react';
import {
	memo,
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PropsWithChildren,
} from 'react';

import { AlignedChunkTranscript } from '@/components/aligned-chunk-transcript';
import { Spacing } from '@/constants/spacing';
import {
	buildTranslationChunks,
	reuseStableChunkReferences,
	splitTranslationChunks,
	type TranslationChunk,
} from '@/lib/translation-chunks';

type ChunkSide = 'original' | 'translation';

const RecordingControls = memo(function RecordingControls({
	isActive,
	isStopping,
	startError,
	onStart,
	onStop,
}: {
	isActive: boolean;
	isStopping: boolean;
	startError: string | null;
	onStart: () => void;
	onStop: () => void;
}) {
	const showStop = isActive || isStopping;
	const label = isStopping ? 'Stopping…' : isActive ? 'Stop' : 'Start';

	return (
		<div className="flex flex-col items-center gap-2">
			{startError ? (
				<p className="m-0 text-center text-sm leading-5 font-medium text-danger">{startError}</p>
			) : null}
			<button
				type="button"
				className={`min-w-[140px] px-6 py-2.5 text-sm leading-5 font-bold ${
					showStop ? 'btn-secondary border-accent/40 text-accent' : 'btn-primary'
				}`}
				disabled={isStopping}
				onClick={showStop ? onStop : onStart}>
				{showStop ? (
					<span
						className={`block h-2.5 w-2.5 rounded-[3px] bg-current ${isActive ? 'animate-pulse' : ''}`}
						aria-hidden="true"
					/>
				) : (
					<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
						<path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" />
					</svg>
				)}
				{label}
			</button>
		</div>
	);
});

function TranslateSection({
	title,
	titleSecondary,
	isOpen,
	onToggle,
	children,
}: PropsWithChildren<{
	title: string;
	titleSecondary?: boolean;
	isOpen: boolean;
	onToggle: () => void;
}>) {
	return (
		<section className="card flex flex-col gap-2 p-4">
			<button
				type="button"
				className="flex w-full items-center gap-2 text-left text-text active:opacity-70"
				onClick={onToggle}
				aria-expanded={isOpen}>
				<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-bg-selected">
					<span
						className={`block h-2 w-2 border-r-2 border-b-2 border-text transition-transform duration-200 ease-in-out ${
							isOpen ? 'rotate-45' : '-rotate-45'
						}`}
					/>
				</span>
				<span
					className={`text-sm leading-5 font-bold ${titleSecondary ? 'text-text-secondary' : ''}`}>
					{title}
				</span>
			</button>
			{isOpen ? <div className="flex flex-col gap-2">{children}</div> : null}
		</section>
	);
}

export function TranslatePanel() {
	const sourceRef = useRef<MicrophoneSource | null>(null);
	if (sourceRef.current === null) {
		sourceRef.current = new MicrophoneSource();
	}

	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollContentRef = useRef<HTMLDivElement>(null);
	const englishSectionEndRef = useRef<HTMLDivElement>(null);
	const chunkAnchors = useRef<Partial<Record<string, Partial<Record<ChunkSide, HTMLElement>>>>>({});
	const programmaticScrollRef = useRef(false);

	const [startError, setStartError] = useState<string | null>(null);
	const [isStopping, setIsStopping] = useState(false);
	const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
	const [englishOpen, setEnglishOpen] = useState(true);
	const [hungarianOpen, setHungarianOpen] = useState(true);
	const [englishFollowScroll, setEnglishFollowScroll] = useState(false);
	const englishFollowScrollRef = useRef(false);
	englishFollowScrollRef.current = englishFollowScroll;
	const stableChunksRef = useRef<TranslationChunk[]>([]);

	const { finalTokens, partialTokens, isActive, state, start, stop } = useRecording({
		model: 'stt-rt-v4',
		language_hints: ['hu'],
		translation: { type: 'one_way', target_language: 'en' },
		enable_speaker_diarization: true,
		enable_endpoint_detection: true,
		source: sourceRef.current,
		onError: (error) => {
			setStartError(error.message);
		},
	});

	const deferredFinalTokens = useDeferredValue(finalTokens);
	const deferredPartialTokens = useDeferredValue(partialTokens);
	const deferredState = useDeferredValue(state);

	const translationChunks = useMemo(() => {
		const fresh = buildTranslationChunks(deferredFinalTokens, deferredPartialTokens);
		const nextChunks = reuseStableChunkReferences(stableChunksRef.current, fresh);
		const { stableChunks } = splitTranslationChunks(nextChunks);
		stableChunksRef.current = stableChunks;
		return nextChunks;
	}, [deferredFinalTokens, deferredPartialTokens]);

	useEffect(() => {
		if (!isActive) {
			setIsStopping(false);
		}
	}, [isActive]);

	const startRef = useRef(start);
	startRef.current = start;
	const stopRef = useRef(stop);
	stopRef.current = stop;

	const handleStart = useCallback(() => {
		setStartError(null);
		setIsStopping(false);
		setSelectedChunkId(null);
		chunkAnchors.current = {};
		stableChunksRef.current = [];
		try {
			startRef.current();
		} catch (error) {
			setStartError(error instanceof Error ? error.message : String(error));
		}
	}, []);

	const handleStop = useCallback(() => {
		setIsStopping(true);
		void stopRef.current();
	}, []);

	const registerChunkAnchor = useCallback(
		(chunkId: string, side: ChunkSide, node: HTMLElement | null) => {
			if (!chunkAnchors.current[chunkId]) {
				chunkAnchors.current[chunkId] = {};
			}
			chunkAnchors.current[chunkId]![side] = node ?? undefined;
		},
		[],
	);

	const markProgrammaticScroll = useCallback((durationMs = 0) => {
		programmaticScrollRef.current = true;
		if (durationMs <= 0) {
			requestAnimationFrame(() => {
				programmaticScrollRef.current = false;
			});
			return;
		}

		window.setTimeout(() => {
			programmaticScrollRef.current = false;
		}, durationMs);
	}, []);

	const followEnglishScroll = useCallback(() => {
		const end = englishSectionEndRef.current;
		const container = scrollRef.current;
		if (!end || !container) {
			return;
		}

		const endBottom = end.getBoundingClientRect().bottom;
		const containerBottom = container.getBoundingClientRect().bottom;
		const delta = endBottom - containerBottom;
		if (delta <= 0) {
			return;
		}

		markProgrammaticScroll();
		container.scrollTop += delta;
	}, [markProgrammaticScroll]);

	useEffect(() => {
		const container = scrollRef.current;
		if (!container) {
			return;
		}

		const handleScroll = () => {
			if (programmaticScrollRef.current || !englishFollowScrollRef.current) {
				return;
			}
			setEnglishFollowScroll(false);
		};

		container.addEventListener('scroll', handleScroll, { passive: true });
		return () => container.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		if (!englishFollowScroll || !englishOpen) {
			return;
		}
		followEnglishScroll();
	}, [englishFollowScroll, englishOpen, followEnglishScroll, translationChunks]);

	const scrollToCorrespondingChunk = useCallback(
		(chunkId: string, fromSide: ChunkSide) => {
			const targetSide: ChunkSide = fromSide === 'original' ? 'translation' : 'original';
			const anchor = chunkAnchors.current[chunkId]?.[targetSide];
			const content = scrollContentRef.current;
			const scrollContainer = scrollRef.current;

			if (!anchor || !content || !scrollContainer) {
				return;
			}

			markProgrammaticScroll(400);
			const top = anchor.offsetTop - content.offsetTop - Spacing.three;
			scrollContainer.scrollTo({
				top: Math.max(0, top),
				behavior: 'smooth',
			});
		},
		[markProgrammaticScroll],
	);

	const handleSelectChunk = useCallback(
		(chunkId: string, side: ChunkSide) => {
			const nextSelection = selectedChunkId === chunkId ? null : chunkId;
			setSelectedChunkId(nextSelection);

			if (!nextSelection) {
				return;
			}

			const shouldOpenEnglish = side === 'original' && !englishOpen;
			const shouldOpenHungarian = side === 'translation' && !hungarianOpen;

			if (shouldOpenEnglish) {
				setEnglishOpen(true);
			}
			if (shouldOpenHungarian) {
				setHungarianOpen(true);
			}

			const scrollDelayMs = shouldOpenEnglish || shouldOpenHungarian ? 250 : 0;
			setTimeout(() => {
				scrollToCorrespondingChunk(nextSelection, side);
			}, scrollDelayMs);
		},
		[englishOpen, hungarianOpen, scrollToCorrespondingChunk, selectedChunkId],
	);

	return (
		<div className="mx-auto flex h-full w-full max-w-[800px] flex-col gap-4 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
			<header className="flex flex-col items-center gap-2">
				<h1 className="m-0 text-[32px] leading-[44px] font-semibold">Translate</h1>
				<p className="m-0 text-center text-base leading-6 font-medium text-text-secondary">
					Follow Hungarian conversations — get live English text
				</p>
				<p className="m-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-element px-3 py-1 text-xs leading-4 font-medium text-text-secondary">
					<span
						className={`h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse bg-accent' : 'bg-text-secondary/50'}`}
						aria-hidden="true"
					/>
					{deferredState}
				</p>
			</header>

			<RecordingControls
				isActive={isActive}
				isStopping={isStopping}
				startError={startError}
				onStart={handleStart}
				onStop={handleStop}
			/>

			<div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
				<div ref={scrollContentRef} className="flex flex-col gap-4">
					<TranslateSection
						title="English"
						isOpen={englishOpen}
						onToggle={() => setEnglishOpen((value) => !value)}>
						<AlignedChunkTranscript
							chunks={translationChunks}
							side="translation"
							selectedChunkId={selectedChunkId}
							onSelectChunk={handleSelectChunk}
							onRegisterChunkAnchor={registerChunkAnchor}
							emptyMessage="Translation will appear here…"
						/>
						<button
							type="button"
							className={`mt-2 self-center rounded-full px-4 py-1.5 text-[13px] leading-5 font-semibold transition-colors active:opacity-70 ${
								englishFollowScroll
									? 'bg-accent-soft text-accent'
									: 'bg-bg-selected text-text-secondary hover:text-text'
							}`}
							aria-pressed={englishFollowScroll}
							onClick={() => {
								setEnglishFollowScroll((enabled) => {
									const next = !enabled;
									if (next) {
										requestAnimationFrame(() => followEnglishScroll());
									}
									return next;
								});
							}}>
							{englishFollowScroll ? 'Following conversation' : 'Follow conversation'}
						</button>
						<div ref={englishSectionEndRef} className="h-0 w-full" aria-hidden="true" />
					</TranslateSection>

					<TranslateSection
						title="Hungarian (original)"
						titleSecondary
						isOpen={hungarianOpen}
						onToggle={() => setHungarianOpen((value) => !value)}>
						<AlignedChunkTranscript
							chunks={translationChunks}
							side="original"
							selectedChunkId={selectedChunkId}
							onSelectChunk={handleSelectChunk}
							onRegisterChunkAnchor={registerChunkAnchor}
							emptyMessage="Original transcription will appear here…"
							textType="small"
						/>
					</TranslateSection>
				</div>
			</div>
		</div>
	);
}
