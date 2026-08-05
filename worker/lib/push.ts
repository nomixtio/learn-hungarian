import { buildPushHTTPRequest } from '@pushforge/builder';

import type { Env } from '../env';
import { getVapidPrivateKey } from './db';

export type PushSubscription = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
};

export type PushPayload = {
	title: string;
	body: string;
	icon?: string;
	tag?: string;
	data?: {
		url?: string;
	};
};

const ADMIN_CONTACT = 'mailto:admin@example.com';

export type PushSendResult = {
	ok: boolean;
	status: number;
	expired: boolean;
	detail?: string;
};

export async function sendPushNotification(
	env: Env,
	subscription: PushSubscription,
	payload: PushPayload,
): Promise<PushSendResult> {
	let endpoint: string;
	let headers: Record<string, string> | Headers;
	let body: ArrayBuffer;

	try {
		({ endpoint, headers, body } = await buildPushHTTPRequest({
			privateJWK: getVapidPrivateKey(env),
			subscription,
			message: {
				payload,
				adminContact: ADMIN_CONTACT,
				options: {
					ttl: 86_400,
					urgency: 'normal',
					topic: payload.tag,
				},
			},
		}));
	} catch (error) {
		const detail = error instanceof Error ? error.message : 'Failed to build push request';
		return {
			ok: false,
			status: 500,
			expired: false,
			detail,
		};
	}

	const response = await fetch(endpoint, {
		method: 'POST',
		headers,
		body,
	});

	const detail = await response.text();

	return {
		ok: response.ok,
		status: response.status,
		expired: response.status === 404 || response.status === 410,
		detail: detail || undefined,
	};
}
