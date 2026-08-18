import { NumberListenButton } from '@/components/number-listen-button';
import { useHungarianTts } from '@/hooks/use-hungarian-tts';
import { getAudioId } from '@/lib/audio-catalog';
import type { VocabularyCourse } from '@/lib/courses/types';

export function VocabularyCoursePage({ course }: { course: VocabularyCourse }) {
	const { play, loadingKey, playingKey, errorKey, errorMessage } = useHungarianTts();

	return (
		<div className="mx-auto flex w-full max-w-[800px] flex-1 min-h-0 flex-col gap-6 overflow-y-auto px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
			<header className="flex flex-col items-center gap-2">
				<h1 className="m-0 text-[32px] leading-[44px] font-semibold">{course.title}</h1>
				<p className="m-0 text-center text-base leading-6 font-medium text-text-secondary">
					{course.subtitle}
				</p>
			</header>

			{errorMessage ? (
				<p className="notice-danger m-0 text-center">{errorMessage}</p>
			) : null}

			<div className="flex flex-col gap-4">
				{course.lessons.map((lesson) => (
					<section key={lesson.id} className="card flex flex-col gap-2 p-4">
						<h2 className="m-0 text-sm leading-5 font-bold">{lesson.title}</h2>
						{lesson.description ? (
							<p className="m-0 text-sm leading-5 font-medium text-text-secondary">
								{lesson.description}
							</p>
						) : null}
						<ul className="m-0 flex list-none flex-col gap-2 p-0">
							{lesson.entries.map((entry, index) => {
								const rowKey = entry.label
									? `${lesson.id}-${entry.label}`
									: `${lesson.id}-${entry.hungarian}-${index}`;
								const entryKey = `${lesson.id}-${rowKey}`;

								return (
									<li
										key={rowKey}
										className={`grid items-center gap-3 rounded-lg bg-bg px-3 py-2 ${
											entry.label
												? 'grid-cols-[56px_1fr_1fr_auto] max-[480px]:grid-cols-[48px_1fr_auto] max-[480px]:grid-rows-[auto_auto]'
												: 'grid-cols-[1fr_1fr_auto] max-[480px]:grid-cols-[1fr_auto] max-[480px]:grid-rows-[auto_auto]'
										}`}>
										{entry.label ? (
											<span className="text-base leading-6 font-bold tabular-nums">{entry.label}</span>
										) : null}
										<span
											className={`text-base leading-6 font-semibold ${
												entry.label ? '' : 'max-[480px]:col-start-1'
											}`}>
											{entry.hungarian}
										</span>
										<span
											className={`text-sm leading-5 font-medium text-text-secondary ${
												entry.label
													? 'max-[480px]:col-start-2 max-[480px]:row-start-2'
													: 'max-[480px]:col-start-1 max-[480px]:row-start-2'
											}`}>
											{entry.english}
										</span>
										<NumberListenButton
											hungarian={entry.hungarian}
											isLoading={loadingKey === entryKey}
											isPlaying={playingKey === entryKey}
											hasError={errorKey === entryKey}
											onPlay={() => play(entryKey, getAudioId(entry.hungarian))}
										/>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
}
