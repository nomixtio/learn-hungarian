import type { Context } from 'hono';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_MINT_REQUESTS_PER_WINDOW = 30;

export function isSameSiteRequest(c: Context): boolean {
	const url = new URL(c.req.url);
	if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
		return true;
	}

	const fetchSite = c.req.header('Sec-Fetch-Site');
	if (fetchSite === 'same-origin' || fetchSite === 'same-site') {
		return true;
	}

	const origin = c.req.header('Origin');
	if (origin) {
		try {
			return new URL(origin).host === url.host;
		} catch {
			return false;
		}
	}

	const referer = c.req.header('Referer');
	if (referer) {
		try {
			return new URL(referer).host === url.host;
		} catch {
			return false;
		}
	}

	return false;
}

export async function isWithinRateLimit(c: Context, namespace: string): Promise<boolean> {
	const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
	const cacheKey = new Request(`https://rate-limit.internal/${namespace}/${ip}`);
	const cache = caches.default;

	const cached = await cache.match(cacheKey);
	const count = cached ? Number.parseInt(await cached.text(), 10) || 0 : 0;

	if (count >= MAX_MINT_REQUESTS_PER_WINDOW) {
		return false;
	}

	await cache.put(
		cacheKey,
		new Response(String(count + 1), {
			headers: { 'Cache-Control': `max-age=${RATE_LIMIT_WINDOW_SECONDS}` },
		}),
	);

	return true;
}
