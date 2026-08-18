import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { AUDIO_PHRASES } from '@/lib/audio-catalog';
import {
	buildElevenLabsTtsBody,
	buildElevenLabsTtsUrl,
	getAudioStorageFilename,
} from '@/lib/voices';

/** ElevenLabs voice IDs — change these to swap actors. */
const FEMALE_VOICE_ID = 'xjlfQQ3ynqiEyRpArrT8';
const MALE_VOICE_ID = 'M336tBVZHWWiWb4R54ui';

const VOICES = [
	{ id: 'female', label: 'Female', voiceId: FEMALE_VOICE_ID },
	{ id: 'male', label: 'Male', voiceId: MALE_VOICE_ID },
] as const;

function loadDevVars(): Record<string, string> {
	const varsPath = join(process.cwd(), '.dev.vars');
	const env: Record<string, string> = {};

	if (!existsSync(varsPath)) {
		return env;
	}

	for (const line of readFileSync(varsPath, 'utf-8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const separator = trimmed.indexOf('=');
		if (separator === -1) continue;
		const key = trimmed.slice(0, separator).trim();
		const value = trimmed.slice(separator + 1).trim();
		env[key] = value;
	}

	return env;
}

function selectedVoices() {
	const female = process.argv.includes('--female');
	const male = process.argv.includes('--male');

	if (female && !male) {
		return VOICES.filter((voice) => voice.id === 'female');
	}

	if (male && !female) {
		return VOICES.filter((voice) => voice.id === 'male');
	}

	return [...VOICES];
}

async function generateAudio() {
	const devVars = loadDevVars();
	const apiKey = (process.env.ELEVENLABS_API_KEY ?? devVars.ELEVENLABS_API_KEY)?.trim();
	const force = process.argv.includes('--force');

	if (!apiKey) {
		console.error('Missing ELEVENLABS_API_KEY. Set it in .dev.vars or the environment.');
		process.exit(1);
	}

	const voices = selectedVoices();
	const outputRoot = join(process.cwd(), 'public', 'audio');
	let generated = 0;
	let skipped = 0;

	for (const { id, label, voiceId } of voices) {
		const voiceDir = join(outputRoot, id);
		mkdirSync(voiceDir, { recursive: true });

		for (const phrase of AUDIO_PHRASES) {
			const outputPath = join(voiceDir, getAudioStorageFilename(phrase.id));
			if (!force && existsSync(outputPath)) {
				skipped += 1;
				continue;
			}

			const response = await fetch(buildElevenLabsTtsUrl(voiceId), {
				method: 'POST',
				headers: {
					'xi-api-key': apiKey,
					'Content-Type': 'application/json',
					Accept: 'audio/mpeg',
				},
				body: JSON.stringify(buildElevenLabsTtsBody(phrase.hungarian)),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				console.error(
					`Failed to generate ${label}/${getAudioStorageFilename(phrase.id)}: ${response.status} ${errorBody}`,
				);
				process.exit(1);
			}

			const audio = Buffer.from(await response.arrayBuffer());
			writeFileSync(outputPath, audio);
			generated += 1;
			console.log(`Generated ${label}/${getAudioStorageFilename(phrase.id)} (${phrase.hungarian})`);
		}
	}

	console.log(`Done. Generated ${generated}, skipped ${skipped}.`);
}

await generateAudio();
