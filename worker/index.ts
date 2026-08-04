import { Hono } from 'hono';

import versionData from '../src/app-version.json';
import type { Env } from './env';
import { progressRoutes, quizRoutes } from './routes/quiz';
import { pushRoutes } from './routes/push';
import { sonioxRoutes } from './routes/soniox';
import { handleScheduledQuizReminders } from './scheduled';

const app = new Hono<{ Bindings: Env }>();

app.get('/api/health', (c) => c.json({ ok: true }));

app.get('/api/meta', (c) => {
	c.header('Cache-Control', 'no-store');
	return c.json({ build: versionData.build });
});

app.route('/api/soniox', sonioxRoutes);
app.route('/api/push', pushRoutes);
app.route('/api/quiz', quizRoutes);
app.route('/api/progress', progressRoutes);

export default {
	fetch: app.fetch,
	async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(handleScheduledQuizReminders(env));
	},
};
