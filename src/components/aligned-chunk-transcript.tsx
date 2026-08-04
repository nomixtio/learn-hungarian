import { memo, useMemo } from 'react';

import { getSpeakerColor, type SpeakerColorPair } from '@/constants/speaker-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { splitTranslationChunks, type TranslationChunk } from '@/lib/translation-chunks';

type TextPart = {
	text: string;
	isPartial: boolean;
	isSpace: boolean;
};

type ChunkSide = 'original' | 'translation';

type SpeakerParagraph = {
	speaker: string;
	chunks: TranslationChunk[];
};

function formatSpeakerLabel(speaker: string): string {
	return speaker === 'unknown' ? 'Speaker' : `Speaker ${speaker}`;
}

function splitTextParts(text: string, isPartial: boolean): TextPart[] {
	if (!text) {
		return [];
	}

	return (text.match(/\S+|\s+/g) ?? []).map((part) => ({
		text: part,
		isPartial,
		isSpace: /^\s+$/.test(part),
	}));
}

function getChunkTextParts(chunk: TranslationChunk, side: ChunkSide): TextPart[] {
	if (side === 'original') {
		return [
			...splitTextParts(chunk.originalText, false),
			...splitTextParts(chunk.originalPartial, true),
		];
	}

	return [
		...splitTextParts(chunk.translationText, false),
		...splitTextParts(chunk.translationPartial, true),
	];
}

function groupChunksBySpeaker(chunks: readonly TranslationChunk[]): SpeakerParagraph[] {
	const groups: SpeakerParagraph[] = [];

	for (const chunk of chunks) {
		const lastGroup = groups.at(-1);
		if (lastGroup && lastGroup.speaker === chunk.speaker) {
			lastGroup.chunks.push(chunk);
			continue;
		}

		groups.push({ speaker: chunk.speaker, chunks: [chunk] });
	}

	return groups;
}

function textClassName(textType: 'default' | 'small', isPartial: boolean) {
	return [
		textType === 'small' ? 'text-sm leading-5' : 'text-base leading-6',
		'font-medium',
		isPartial ? 'opacity-65' : '',
	]
		.filter(Boolean)
		.join(' ');
}

function ChunkWords({
	chunks,
	side,
	selectedChunkId,
	onSelectChunk,
	onRegisterChunkAnchor,
	textType,
	speakerColor,
}: {
	chunks: readonly TranslationChunk[];
	side: ChunkSide;
	selectedChunkId: string | null;
	onSelectChunk: (chunkId: string, side: ChunkSide) => void;
	onRegisterChunkAnchor: (chunkId: string, side: ChunkSide, node: HTMLElement | null) => void;
	textType: 'default' | 'small';
	speakerColor: SpeakerColorPair;
}) {
	return (
		<>
			{chunks.map((chunk) => {
				const isSelected = chunk.id === selectedChunkId;
				const parts = getChunkTextParts(chunk, side);

				return parts.map((part, partIndex) => {
					const key = `${chunk.id}-${partIndex}`;
					const textClass = textClassName(textType, part.isPartial);

					if (part.isSpace) {
						return (
							<span
								key={key}
								className={`${textClass} whitespace-pre-wrap`}
								style={{ color: speakerColor.text }}>
								{part.text}
							</span>
						);
					}

					const wordStyle = {
						color: speakerColor.text,
						backgroundColor: isSelected ? speakerColor.highlight : undefined,
					};

					if (partIndex === 0) {
						return (
							<span
								key={key}
								ref={(node) => onRegisterChunkAnchor(chunk.id, side, node)}
								role="button"
								tabIndex={0}
								className={`${textClass} cursor-pointer rounded`}
								style={wordStyle}
								onClick={() => onSelectChunk(chunk.id, side)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										onSelectChunk(chunk.id, side);
									}
								}}>
								{part.text}
							</span>
						);
					}

					return (
						<span
							key={key}
							role="button"
							tabIndex={0}
							className={`${textClass} cursor-pointer rounded`}
							style={wordStyle}
							onClick={() => onSelectChunk(chunk.id, side)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									onSelectChunk(chunk.id, side);
								}
							}}>
							{part.text}
						</span>
					);
				});
			})}
		</>
	);
}

const StableSpeakerParagraphs = memo(function StableSpeakerParagraphs({
	stableChunks,
	side,
	selectedChunkId,
	onSelectChunk,
	onRegisterChunkAnchor,
	textType,
	colorScheme,
}: {
	stableChunks: readonly TranslationChunk[];
	side: ChunkSide;
	selectedChunkId: string | null;
	onSelectChunk: (chunkId: string, side: ChunkSide) => void;
	onRegisterChunkAnchor: (chunkId: string, side: ChunkSide, node: HTMLElement | null) => void;
	textType: 'default' | 'small';
	colorScheme: 'light' | 'dark';
}) {
	const speakerParagraphs = useMemo(() => groupChunksBySpeaker(stableChunks), [stableChunks]);

	return (
		<>
			{speakerParagraphs.map((group, groupIndex) => {
				const visibleChunks = group.chunks.filter(
					(chunk) => getChunkTextParts(chunk, side).length > 0,
				);

				if (visibleChunks.length === 0) {
					return null;
				}

				const speakerColor = getSpeakerColor(group.speaker, colorScheme);

				return (
					<div
						key={`${side}-stable-${group.speaker}-${groupIndex}`}
						className={groupIndex > 0 ? 'mt-2' : undefined}>
						<p className="mb-1 text-sm leading-5 font-bold" style={{ color: speakerColor.text }}>
							{formatSpeakerLabel(group.speaker)}
						</p>
						<div className="flex flex-wrap items-start">
							<ChunkWords
								chunks={visibleChunks}
								side={side}
								selectedChunkId={selectedChunkId}
								onSelectChunk={onSelectChunk}
								onRegisterChunkAnchor={onRegisterChunkAnchor}
								textType={textType}
								speakerColor={speakerColor}
							/>
						</div>
					</div>
				);
			})}
		</>
	);
});

const LiveSpeakerParagraph = memo(function LiveSpeakerParagraph({
	liveChunk,
	side,
	selectedChunkId,
	onSelectChunk,
	onRegisterChunkAnchor,
	textType,
	colorScheme,
	continuesPreviousSpeaker,
	hasStableContent,
}: {
	liveChunk: TranslationChunk;
	side: ChunkSide;
	selectedChunkId: string | null;
	onSelectChunk: (chunkId: string, side: ChunkSide) => void;
	onRegisterChunkAnchor: (chunkId: string, side: ChunkSide, node: HTMLElement | null) => void;
	textType: 'default' | 'small';
	colorScheme: 'light' | 'dark';
	continuesPreviousSpeaker: boolean;
	hasStableContent: boolean;
}) {
	const parts = getChunkTextParts(liveChunk, side);
	if (parts.length === 0) {
		return null;
	}

	const speakerColor = getSpeakerColor(liveChunk.speaker, colorScheme);

	return (
		<div className={hasStableContent && !continuesPreviousSpeaker ? 'mt-2' : undefined}>
			{!continuesPreviousSpeaker ? (
				<p className="mb-1 text-sm leading-5 font-bold" style={{ color: speakerColor.text }}>
					{formatSpeakerLabel(liveChunk.speaker)}
				</p>
			) : null}
			<div className="flex flex-wrap items-start">
				<ChunkWords
					chunks={[liveChunk]}
					side={side}
					selectedChunkId={selectedChunkId}
					onSelectChunk={onSelectChunk}
					onRegisterChunkAnchor={onRegisterChunkAnchor}
					textType={textType}
					speakerColor={speakerColor}
				/>
			</div>
		</div>
	);
});

export function AlignedChunkTranscript({
	chunks,
	side,
	selectedChunkId,
	onSelectChunk,
	onRegisterChunkAnchor,
	emptyMessage,
	textType = 'default',
}: {
	chunks: TranslationChunk[];
	side: ChunkSide;
	selectedChunkId: string | null;
	onSelectChunk: (chunkId: string, side: ChunkSide) => void;
	onRegisterChunkAnchor: (chunkId: string, side: ChunkSide, node: HTMLElement | null) => void;
	emptyMessage: string;
	textType?: 'default' | 'small';
}) {
	const colorScheme = useColorScheme();

	const { stableChunks, liveChunk } = useMemo(() => splitTranslationChunks(chunks), [chunks]);
	const lastStableSpeaker = stableChunks.at(-1)?.speaker;
	const continuesPreviousSpeaker =
		liveChunk !== null && lastStableSpeaker !== undefined && liveChunk.speaker === lastStableSpeaker;

	if (chunks.length === 0) {
		return <p className="m-0 text-base leading-6 font-medium text-text-secondary">{emptyMessage}</p>;
	}

	return (
		<>
			{stableChunks.length > 0 ? (
				<StableSpeakerParagraphs
					stableChunks={stableChunks}
					side={side}
					selectedChunkId={selectedChunkId}
					onSelectChunk={onSelectChunk}
					onRegisterChunkAnchor={onRegisterChunkAnchor}
					textType={textType}
					colorScheme={colorScheme}
				/>
			) : null}
			{liveChunk !== null ? (
				<LiveSpeakerParagraph
					liveChunk={liveChunk}
					side={side}
					selectedChunkId={selectedChunkId}
					onSelectChunk={onSelectChunk}
					onRegisterChunkAnchor={onRegisterChunkAnchor}
					textType={textType}
					colorScheme={colorScheme}
					continuesPreviousSpeaker={continuesPreviousSpeaker}
					hasStableContent={stableChunks.length > 0}
				/>
			) : null}
		</>
	);
}
