import type { Env } from './env';
import { getDueClients, getEntryProgressMap, markQuizSent } from './lib/db';
import { sendPushNotification } from './lib/push';
import { buildQuizNotification, pickNextQuizItem } from './lib/quiz';

export async function handleScheduledQuizReminders(env: Env): Promise<void> {
	const dueClients = await getDueClients(env.DB);
	const sentForClient = new Set<string>();

	for (const row of dueClients) {
		if (sentForClient.has(row.id)) {
			continue;
		}

		const progressMap = await getEntryProgressMap(env.DB, row.id);
		const item = pickNextQuizItem(progressMap);
		if (!item) {
			continue;
		}

		const payload = buildQuizNotification(item);
		const result = await sendPushNotification(
			env,
			{ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
			payload,
		);

		if (result.expired) {
			await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
				.bind(row.endpoint)
				.run();
			continue;
		}

		if (result.ok) {
			sentForClient.add(row.id);
			await markQuizSent(env.DB, row.id);
		}
	}
}
