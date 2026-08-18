import { DEFAULT_VOICE_PREFERENCE, type VoicePreference } from '@/lib/voices';

const STORAGE_KEY = 'learn-hungarian-voice';

export function getStoredVoicePreference(): VoicePreference {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'female' || stored === 'male') {
		return stored;
	}

	return DEFAULT_VOICE_PREFERENCE;
}

export function setStoredVoicePreference(preference: VoicePreference): void {
	localStorage.setItem(STORAGE_KEY, preference);
}
