import { useVoicePreference } from '@/hooks/use-voice-preference';
import type { VoicePreference } from '@/lib/voices';
import { UI_VOICES } from '@/lib/voices';

export function VoiceSettings() {
	const { preference, setPreference } = useVoicePreference();

	return (
		<section className="card flex flex-col gap-3 p-4">
			<h2 className="m-0 text-sm leading-5 font-bold">Voice</h2>
			<p className="m-0 text-sm leading-5 font-medium text-text-secondary">
				Choose the voice used when you tap Listen on course vocabulary.
			</p>

			<label className="flex flex-col gap-1">
				<span className="text-xs font-medium text-text-secondary">Course audio</span>
				<select
					className="field"
					value={preference}
					onChange={(event) => setPreference(event.target.value as VoicePreference)}>
					{UI_VOICES.map((option) => (
						<option key={option.id} value={option.id}>
							{option.label}
						</option>
					))}
				</select>
			</label>
		</section>
	);
}
