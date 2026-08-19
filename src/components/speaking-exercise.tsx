import { useState } from 'react';

import { matchHungarianSpeech } from '@/lib/match-hungarian-speech';

export function SpeakingExercise({
	promptEnglish,
	expectedHungarian,
	onComplete,
}: {
	promptEnglish: string;
	expectedHungarian: string;
	onComplete?: (matched: boolean, userAnswer: string, score: number) => void;
}) {
	const [transcript, setTranscript] = useState('');
	const [result, setResult] = useState<{ matched: boolean; score: number } | null>(null);

	const handleCheck = () => {
		const match = matchHungarianSpeech(transcript, expectedHungarian);
		setResult(match);
		onComplete?.(match.matched, transcript, match.score);
	};

	return (
		<div className="card flex flex-col gap-3 p-4">
			<p className="m-0 text-sm leading-5 font-medium text-text-secondary">Say in Hungarian:</p>
			<p className="m-0 text-base leading-6 font-semibold">{promptEnglish}</p>

			{/* STT recording will replace this placeholder input in a follow-up. */}
			<label className="flex flex-col gap-1">
				<span className="text-xs font-medium text-text-secondary">Your attempt (placeholder)</span>
				<input
					type="text"
					value={transcript}
					onChange={(event) => {
						setTranscript(event.target.value);
						setResult(null);
					}}
					placeholder="Type what you said…"
					className="field"
				/>
			</label>

			<button
				type="button"
				className="btn-primary self-start"
				disabled={!transcript.trim()}
				onClick={handleCheck}>
				Check
			</button>

			{result ? (
				<p
					className={`m-0 text-sm font-medium ${
						result.matched ? 'text-success' : 'text-danger'
					}`}>
					{result.matched
						? `Correct! (score ${Math.round(result.score * 100)}%)`
						: 'Not quite — try again.'}
				</p>
			) : null}
		</div>
	);
}
