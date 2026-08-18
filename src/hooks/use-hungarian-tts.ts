import { useCallback, useEffect, useRef, useState } from 'react';

import { useVoicePreference } from '@/hooks/use-voice-preference';
import type { AudioPhraseId } from '@/lib/audio-catalog';
import { buildAudioAssetUrl } from '@/lib/voices';

export function useHungarianTts() {
	const { preference: voice } = useVoicePreference();
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const [loadingKey, setLoadingKey] = useState<string | null>(null);
	const [playingKey, setPlayingKey] = useState<string | null>(null);
	const [errorKey, setErrorKey] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const stopCurrent = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		audio.pause();
		audio.currentTime = 0;
		audioRef.current = null;
		setPlayingKey(null);
	}, []);

	const playFromUrl = useCallback(
		(entryKey: string, url: string) => {
			stopCurrent();
			const audio = new Audio(url);
			audioRef.current = audio;
			setLoadingKey(entryKey);

			const handleReady = () => {
				if (audioRef.current !== audio) {
					return;
				}
				setLoadingKey(null);
				setPlayingKey(entryKey);
				void audio.play().catch(() => {
					setErrorKey(entryKey);
					setErrorMessage('Could not play audio');
					stopCurrent();
				});
			};

			const handleEnded = () => {
				if (audioRef.current === audio) {
					audioRef.current = null;
					setPlayingKey(null);
				}
			};

			audio.addEventListener('canplay', handleReady, { once: true });
			audio.addEventListener('ended', handleEnded);
			audio.addEventListener(
				'error',
				() => {
					setLoadingKey(null);
					setErrorKey(entryKey);
					setErrorMessage('Voice unavailable — audio file missing.');
					handleEnded();
				},
				{ once: true },
			);
		},
		[stopCurrent],
	);

	const play = useCallback(
		(entryKey: string, audioId: AudioPhraseId) => {
			setErrorKey(null);
			setErrorMessage(null);
			stopCurrent();
			playFromUrl(entryKey, buildAudioAssetUrl(voice, audioId));
		},
		[playFromUrl, stopCurrent, voice],
	);

	useEffect(() => {
		return () => {
			stopCurrent();
		};
	}, [stopCurrent]);

	return {
		play,
		loadingKey,
		playingKey,
		errorKey,
		errorMessage,
	};
}
