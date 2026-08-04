import type { SonioxConnectionConfig } from '@soniox/client';

export type SonioxUsageType = 'transcribe_websocket' | 'tts_rt';

type SonioxClientRegion = 'eu' | 'jp' | undefined;

type TemporaryKeyResponse = {
	api_key: string;
	expires_at: string;
	region?: SonioxClientRegion;
	error?: string;
	tts_defaults?: SonioxConnectionConfig['tts_defaults'];
};

async function fetchTemporaryKey(usageType: SonioxUsageType): Promise<TemporaryKeyResponse> {
	const response = await fetch('/api/soniox/temporary-key', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ usage_type: usageType }),
	});

	const data = (await response.json()) as TemporaryKeyResponse;
	if (!response.ok) {
		throw new Error(data.error ?? 'Failed to mint Soniox session');
	}

	if (!data.api_key) {
		throw new Error('Soniox session did not include an API key');
	}

	return data;
}

export async function fetchSonioxTemporaryKey(
	usageType: SonioxUsageType,
): Promise<{ api_key: string; region?: SonioxClientRegion }> {
	const data = await fetchTemporaryKey(usageType);
	return { api_key: data.api_key, region: data.region };
}

export async function fetchSonioxTtsConfig(): Promise<SonioxConnectionConfig> {
	const data = await fetchTemporaryKey('tts_rt');
	return {
		api_key: data.api_key,
		region: data.region,
		tts_defaults: data.tts_defaults ?? {
			model: 'tts-rt-v1',
			language: 'hu',
			voice: 'Maya',
			audio_format: 'wav',
		},
	};
}
