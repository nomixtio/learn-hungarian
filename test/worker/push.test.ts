import { SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import { clientHeaders, resetDb, testEnv } from './helpers';

const SUBSCRIPTION = {
	endpoint: 'https://push.example.com/sub/1',
	keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
};

describe('push API', () => {
	beforeEach(async () => {
		await resetDb();
	});

	it('GET /api/push/vapid-public-key returns the configured key', async () => {
		const res = await SELF.fetch('http://example.com/api/push/vapid-public-key');
		expect(res.status).toBe(200);
		const body = (await res.json()) as { publicKey: string };
		expect(body.publicKey.length).toBeGreaterThan(10);
	});

	it('POST /api/push/subscribe validates input', async () => {
		// Missing header
		const noHeader = await SELF.fetch('http://example.com/api/push/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(SUBSCRIPTION),
		});
		expect(noHeader.status).toBe(400);

		// Invalid subscription shape
		const badSub = await SELF.fetch('http://example.com/api/push/subscribe', {
			method: 'POST',
			headers: clientHeaders('push-1'),
			body: JSON.stringify({ endpoint: 'x' }),
		});
		expect(badSub.status).toBe(400);

		// Invalid interval
		const badInterval = await SELF.fetch('http://example.com/api/push/subscribe', {
			method: 'POST',
			headers: clientHeaders('push-1'),
			body: JSON.stringify({ ...SUBSCRIPTION, quizIntervalHours: 99 }),
		});
		expect(badInterval.status).toBe(400);
	});

	it('subscribes, reports settings, updates, then unsubscribes', async () => {
		const sub = await SELF.fetch('http://example.com/api/push/subscribe', {
			method: 'POST',
			headers: clientHeaders('push-flow'),
			body: JSON.stringify({ ...SUBSCRIPTION, quizIntervalHours: 6 }),
		});
		expect(sub.status).toBe(200);

		const settings = (await SELF.fetch('http://example.com/api/push/settings', {
			headers: clientHeaders('push-flow'),
		}).then((r) => r.json())) as {
			subscribed: boolean;
			notificationsEnabled: boolean;
			quizIntervalHours: number;
		};
		expect(settings).toEqual({ subscribed: true, notificationsEnabled: true, quizIntervalHours: 6 });

		const patch = await SELF.fetch('http://example.com/api/push/settings', {
			method: 'PATCH',
			headers: clientHeaders('push-flow'),
			body: JSON.stringify({ quizIntervalHours: 24 }),
		});
		expect(patch.status).toBe(200);

		const badPatch = await SELF.fetch('http://example.com/api/push/settings', {
			method: 'PATCH',
			headers: clientHeaders('push-flow'),
			body: JSON.stringify({ quizIntervalHours: 99 }),
		});
		expect(badPatch.status).toBe(400);

		const unsub = await SELF.fetch('http://example.com/api/push/subscribe', {
			method: 'DELETE',
			headers: clientHeaders('push-flow'),
		});
		expect(unsub.status).toBe(200);

		const after = await testEnv()
			.DB.prepare('SELECT * FROM push_subscriptions WHERE client_id = ?')
			.bind('push-flow')
			.all();
		expect(after.results).toHaveLength(0);
	});

	it('POST /api/push/test 404s without a subscription', async () => {
		const res = await SELF.fetch('http://example.com/api/push/test', {
			method: 'POST',
			headers: clientHeaders('push-empty'),
		});
		expect(res.status).toBe(404);
	});
});
