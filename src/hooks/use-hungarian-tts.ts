import { useTts } from '@soniox/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchSonioxTtsConfig } from '@/lib/soniox-config';

const TTS_MIME_TYPE = 'audio/wav';

export function useHungarianTts() {
	const cacheRef = useRef(new Map<string, string>());
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const chunksRef = useRef<Uint8Array[]>([]);
	const activeKeyRef = useRef<string | null>(null);
	const activeWordRef = useRef<string | null>(null);

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
			setPlayingKey(entryKey);
			setLoadingKey(null);

			const handleEnded = () => {
				if (audioRef.current === audio) {
					audioRef.current = null;
					setPlayingKey(null);
				}
			};

			audio.addEventListener('ended', handleEnded);
			audio.addEventListener('error', () => {
				setErrorKey(entryKey);
				setErrorMessage('Could not play audio');
				handleEnded();
			});

			void audio.play().catch(() => {
				setErrorKey(entryKey);
				setErrorMessage('Could not play audio');
				handleEnded();
			});
		},
		[stopCurrent],
	);

	const { speak, cancel } = useTts({
		mode: 'rest',
		config: fetchSonioxTtsConfig,
		voice: 'Maya',
		model: 'tts-rt-v1',
		language: 'hu',
		audio_format: 'wav',
		onAudio: (chunk) => {
			chunksRef.current.push(chunk);
		},
		onAudioEnd: () => {
			const chunks = chunksRef.current;
			chunksRef.current = [];
			const entryKey = activeKeyRef.current;
			const hungarian = activeWordRef.current;
			if (chunks.length === 0 || !entryKey || !hungarian) {
				return;
			}

			const blob = new Blob(
				chunks.map((chunk) => new Uint8Array(chunk)),
				{ type: TTS_MIME_TYPE },
			);
			const url = URL.createObjectURL(blob);
			cacheRef.current.set(hungarian, url);
			playFromUrl(entryKey, url);
		},
		onError: (error) => {
			setLoadingKey(null);
			if (activeKeyRef.current) {
				setErrorKey(activeKeyRef.current);
			}
			setErrorMessage(error.message);
		},
		onTerminated: () => {
			setLoadingKey(null);
		},
	});

	const play = useCallback(
		(entryKey: string, hungarian: string) => {
			setErrorKey(null);
			setErrorMessage(null);
			cancel();

			const cachedUrl = cacheRef.current.get(hungarian);
			if (cachedUrl) {
				activeKeyRef.current = entryKey;
				activeWordRef.current = hungarian;
				playFromUrl(entryKey, cachedUrl);
				return;
			}

			activeKeyRef.current = entryKey;
			activeWordRef.current = hungarian;
			chunksRef.current = [];
			setLoadingKey(entryKey);
			speak(hungarian);
		},
		[cancel, playFromUrl, speak],
	);

	useEffect(() => {
		const cache = cacheRef.current;
		return () => {
			cancel();
			stopCurrent();
			for (const url of cache.values()) {
				URL.revokeObjectURL(url);
			}
			cache.clear();
		};
	}, [cancel, stopCurrent]);

	return {
		play,
		loadingKey,
		playingKey,
		errorKey,
		errorMessage,
	};
}
