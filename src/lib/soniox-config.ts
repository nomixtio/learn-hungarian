type SonioxClientRegion = 'eu' | 'jp' | undefined;

type TemporaryKeyResponse = {
	api_key: string;
	expires_at: string;
	region?: SonioxClientRegion;
	error?: string;
};

async function fetchTemporaryKey(): Promise<TemporaryKeyResponse> {
	const response = await fetch('/api/soniox/temporary-key', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ usage_type: 'transcribe_websocket' }),
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

export async function fetchSonioxTemporaryKey(): Promise<{
	api_key: string;
	region?: SonioxClientRegion;
}> {
	const data = await fetchTemporaryKey();
	return { api_key: data.api_key, region: data.region };
}
