export function NumberListenButton({
	hungarian,
	isLoading,
	isPlaying,
	hasError,
	onPlay,
}: {
	hungarian: string;
	isLoading: boolean;
	isPlaying: boolean;
	hasError?: boolean;
	onPlay: (hungarian: string) => void;
}) {
	const label = isLoading ? 'Loading…' : isPlaying ? 'Playing' : hasError ? 'Retry' : 'Listen';

	return (
		<button
			type="button"
			className={`inline-flex min-w-[72px] items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-xs leading-4 font-semibold transition-colors enabled:active:opacity-70 disabled:cursor-not-allowed disabled:opacity-70 ${
				hasError
					? 'bg-danger-soft text-danger enabled:hover:opacity-80'
					: isPlaying
						? 'bg-accent-soft text-accent'
						: 'bg-bg-selected text-text-secondary enabled:hover:text-text'
			}`}
			aria-label={hasError ? `Retry listening to ${hungarian}` : `Listen to ${hungarian}`}
			aria-busy={isLoading}
			disabled={isLoading}
			onClick={() => onPlay(hungarian)}>
			<span className="text-[10px] leading-none" aria-hidden="true">
				{isLoading ? '…' : hasError ? '↻' : '▶'}
			</span>
			<span className="whitespace-nowrap">{label}</span>
		</button>
	);
}
