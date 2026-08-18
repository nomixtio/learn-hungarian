import { useCallback, useState } from 'react';

import {
	getStoredVoicePreference,
	setStoredVoicePreference,
} from '@/lib/voice-preference';
import type { VoicePreference } from '@/lib/voices';

export function useVoicePreference(): {
	preference: VoicePreference;
	setPreference: (preference: VoicePreference) => void;
} {
	const [preference, setPreferenceState] = useState<VoicePreference>(() => getStoredVoicePreference());

	const setPreference = useCallback((next: VoicePreference) => {
		setStoredVoicePreference(next);
		setPreferenceState(next);
	}, []);

	return { preference, setPreference };
}
