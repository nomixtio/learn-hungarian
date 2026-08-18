export const UI_VOICES = [
	{ id: 'female', label: 'Female' },
	{ id: 'male', label: 'Male' },
] as const;

export type VoicePreference = (typeof UI_VOICES)[number]['id'];

export const DEFAULT_VOICE_PREFERENCE: VoicePreference = 'female';

export const ELEVENLABS_MODEL_ID = 'eleven_v3';
export const ELEVENLABS_OUTPUT_FORMAT = 'mp3_44100_128';

export function getAudioStorageFilename(audioId: string): string {
	return `${audioId}.mp3`;
}

export function buildAudioAssetUrl(voice: VoicePreference, audioId: string): string {
	return `/audio/${voice}/${getAudioStorageFilename(audioId)}`;
}

export function buildElevenLabsTtsUrl(voiceId: string): string {
	const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`);
	url.searchParams.set('output_format', ELEVENLABS_OUTPUT_FORMAT);
	return url.toString();
}

export function buildElevenLabsTtsBody(text: string) {
	return {
		text,
		model_id: ELEVENLABS_MODEL_ID,
	};
}
