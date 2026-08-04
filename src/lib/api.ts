import { getClientId } from '@/lib/client-id';

type ApiOptions = RequestInit & {
	json?: unknown;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
	const { json, headers, ...rest } = options;
	const response = await fetch(path, {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			'X-Client-Id': getClientId(),
			...headers,
		},
		body: json === undefined ? rest.body : JSON.stringify(json),
	});

	if (!response.ok) {
		let message = `Request failed (${response.status})`;
		try {
			const body = (await response.json()) as { error?: string; detail?: string };
			if (body.error) {
				message = body.detail ? `${body.error}: ${body.detail}` : body.error;
			}
		} catch {
			// Ignore non-JSON error bodies.
		}
		throw new Error(message);
	}

	return (await response.json()) as T;
}
