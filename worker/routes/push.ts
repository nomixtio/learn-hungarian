import { Hono } from 'hono';

import type { Env } from '../env';
import {
	deletePushSubscriptionsForClient,
	ensureClient,
	getClient,
	getEntryProgressMap,
	getPushSubscriptionsForClient,
	updateClientSettings,
	upsertPushSubscription,
} from '../lib/db';
import { sendPushNotification } from '../lib/push';
import { buildQuizNotification, pickNextQuizItem } from '../lib/quiz';

type PushSubscriptionBody = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
};

function getClientId(c: { req: { header: (name: string) => string | undefined } }): string | null {
	const clientId = c.req.header('X-Client-Id')?.trim();
	return clientId || null;
}

export const pushRoutes = new Hono<{ Bindings: Env }>();

pushRoutes.get('/vapid-public-key', (c) => {
	const publicKey = c.env.VAPID_PUBLIC_KEY?.trim();
	if (!publicKey) {
		return c.json({ error: 'VAPID_PUBLIC_KEY is not configured' }, 500);
	}

	return c.json({ publicKey });
});

pushRoutes.post('/subscribe', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	let body: PushSubscriptionBody & { quizIntervalHours?: number } = {} as PushSubscriptionBody;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: 'Invalid JSON body' }, 400);
	}

	if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
		return c.json({ error: 'Invalid push subscription' }, 400);
	}

	const quizIntervalHours = body.quizIntervalHours ?? 12;
	if (![6, 12, 24].includes(quizIntervalHours)) {
		return c.json({ error: 'quizIntervalHours must be 6, 12, or 24' }, 400);
	}

	await ensureClient(c.env.DB, clientId, quizIntervalHours);
	await updateClientSettings(c.env.DB, clientId, {
		quizIntervalHours,
		notificationsEnabled: true,
	});
	await upsertPushSubscription(c.env.DB, clientId, body);

	return c.json({ ok: true });
});

pushRoutes.delete('/subscribe', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	await updateClientSettings(c.env.DB, clientId, { notificationsEnabled: false });
	await deletePushSubscriptionsForClient(c.env.DB, clientId);

	return c.json({ ok: true });
});

pushRoutes.post('/test', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	const subscriptions = await getPushSubscriptionsForClient(c.env.DB, clientId);
	if (subscriptions.length === 0) {
		return c.json({ error: 'No push subscription found for this device' }, 404);
	}

	const progressMap = await getEntryProgressMap(c.env.DB, clientId);
	const item = pickNextQuizItem(progressMap);
	if (!item) {
		return c.json({ error: 'No quiz items available' }, 500);
	}

	const payload = buildQuizNotification(item);
	const results = await Promise.all(
		subscriptions.map((subscription) =>
			sendPushNotification(
				c.env,
				{
					endpoint: subscription.endpoint,
					keys: { p256dh: subscription.p256dh, auth: subscription.auth },
				},
				payload,
			),
		),
	);

	if (!results.some((result) => result.ok)) {
		const failed = results.find((result) => !result.ok);
		console.error('Push test failed', failed?.status, failed?.detail);
		const detail = failed?.detail ?? '';
		const vapidMisconfigured =
			detail.includes('Invalid EC key') ||
			detail.includes('Point is not on curve') ||
			detail.includes('VAPID_PRIVATE_KEY is not configured') ||
			detail.includes('VAPID_PRIVATE_KEY is not valid JSON') ||
			detail.includes('failed to parse JSON') ||
			detail.includes('Expected property name');
		return c.json(
			{
				error: vapidMisconfigured
					? 'VAPID private key is invalid or does not match VAPID_PUBLIC_KEY in wrangler.jsonc'
					: 'Failed to send test notification',
				status: failed?.status,
				detail,
			},
			vapidMisconfigured ? 500 : 502,
		);
	}

	return c.json({ ok: true, item });
});

pushRoutes.get('/settings', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	const client = await getClient(c.env.DB, clientId);
	const subscriptions = await getPushSubscriptionsForClient(c.env.DB, clientId);

	return c.json({
		subscribed: subscriptions.length > 0,
		notificationsEnabled: client?.notifications_enabled === 1,
		quizIntervalHours: client?.quiz_interval_hours ?? 12,
	});
});

pushRoutes.patch('/settings', async (c) => {
	const clientId = getClientId(c);
	if (!clientId) {
		return c.json({ error: 'Missing X-Client-Id header' }, 400);
	}

	let body: { quizIntervalHours?: number; notificationsEnabled?: boolean } = {};
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: 'Invalid JSON body' }, 400);
	}

	if (body.quizIntervalHours !== undefined && ![6, 12, 24].includes(body.quizIntervalHours)) {
		return c.json({ error: 'quizIntervalHours must be 6, 12, or 24' }, 400);
	}

	await ensureClient(c.env.DB, clientId);
	await updateClientSettings(c.env.DB, clientId, body);

	return c.json({ ok: true });
});
