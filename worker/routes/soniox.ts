import { Hono } from 'hono';

import type { Env } from '../env';
import { isSameSiteRequest, isWithinRateLimit } from '../lib/request-guard';
import { sonioxTemporaryKeyUrl } from '../lib/soniox-api';

type UsageType = 'transcribe_websocket' | 'tts_rt';

type TemporaryKeyRequest = {
	usage_type?: UsageType;
};

type SonioxTemporaryKeyResponse = {
	api_key: string;
	expires_at: string;
};

type SonioxErrorResponse = {
	message?: string;
	error_type?: string;
};

const ALLOWED_USAGE_TYPES = new Set<UsageType>(['transcribe_websocket', 'tts_rt']);

function sonioxClientRegion(region?: string): 'eu' | 'jp' | undefined {
	const normalized = region?.trim().toLowerCase();
	if (normalized === 'eu' || normalized === 'jp') {
		return normalized;
	}
	return undefined;
}

function sonioxMintErrorMessage(status: number, detail: string): string {
	try {
		const body = JSON.parse(detail) as SonioxErrorResponse;
		if (status === 401 || body.error_type === 'unauthenticated') {
			return 'Soniox API key is invalid or does not match SONIOX_REGION. EU keys require SONIOX_REGION=eu in wrangler.jsonc.';
		}
		if (body.message) {
			return body.message;
		}
	} catch {
		// Soniox may return non-JSON error bodies.
	}

	return 'Failed to mint Soniox temporary API key';
}

export const sonioxRoutes = new Hono<{ Bindings: Env }>();

sonioxRoutes.post('/temporary-key', async (c) => {
	if (!isSameSiteRequest(c)) {
		return c.json({ error: 'Forbidden' }, 403);
	}

	if (!(await isWithinRateLimit(c, 'soniox-temporary-key'))) {
		return c.json({ error: 'Too many requests' }, 429);
	}

	const apiKey = c.env.SONIOX_API_KEY?.trim();
	if (!apiKey) {
		return c.json({ error: 'SONIOX_API_KEY is not configured' }, 500);
	}

	let body: TemporaryKeyRequest = {};
	try {
		body = (await c.req.json()) as TemporaryKeyRequest;
	} catch {
		// Empty body is fine — default usage_type applies.
	}

	const usageType: UsageType = body.usage_type ?? 'transcribe_websocket';
	if (!ALLOWED_USAGE_TYPES.has(usageType)) {
		return c.json({ error: 'Invalid usage_type' }, 400);
	}

	const payload =
		usageType === 'transcribe_websocket'
			? {
					usage_type: usageType,
					expires_in_seconds: 120,
					single_use: true,
				}
			: {
					usage_type: usageType,
					expires_in_seconds: 600,
				};

	const response = await fetch(sonioxTemporaryKeyUrl(c.env.SONIOX_REGION), {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const detail = await response.text();
		console.error('Soniox temporary key mint failed', response.status, detail);
		return c.json({ error: sonioxMintErrorMessage(response.status, detail) }, 502);
	}

	const data = (await response.json()) as SonioxTemporaryKeyResponse;

	const region = sonioxClientRegion(c.env.SONIOX_REGION);

	if (usageType === 'tts_rt') {
		return c.json({
			api_key: data.api_key,
			expires_at: data.expires_at,
			region,
			tts_defaults: {
				model: 'tts-rt-v1',
				language: 'hu',
				voice: 'Maya',
				audio_format: 'wav',
			},
		});
	}

	return c.json({ api_key: data.api_key, expires_at: data.expires_at, region });
});
