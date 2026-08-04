import { useCallback, useEffect, useState } from 'react';

import {
	getPushSettings,
	registerServiceWorker,
	sendTestQuizNotification,
	subscribeToQuizNotifications,
	unsubscribeFromQuizNotifications,
	updateQuizReminderInterval,
	type PushSettings,
} from '@/lib/push-notifications';

const INTERVAL_OPTIONS = [
	{ value: 6, label: 'Every 6 hours' },
	{ value: 12, label: 'Every 12 hours' },
	{ value: 24, label: 'Once a day' },
] as const;

export function NotificationSettings() {
	const [settings, setSettings] = useState<PushSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const next = await getPushSettings();
			setSettings(next);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load notification settings.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void registerServiceWorker();
		void refresh();
	}, [refresh]);

	const handleSubscribe = async () => {
		setBusy(true);
		setError(null);
		setMessage(null);
		try {
			await subscribeToQuizNotifications(settings?.quizIntervalHours ?? 12);
			await refresh();
			setMessage('Quiz reminders enabled. You will get push notifications on this device.');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to enable notifications.');
		} finally {
			setBusy(false);
		}
	};

	const handleUnsubscribe = async () => {
		setBusy(true);
		setError(null);
		setMessage(null);
		try {
			await unsubscribeFromQuizNotifications();
			await refresh();
			setMessage('Quiz reminders disabled on this device.');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to disable notifications.');
		} finally {
			setBusy(false);
		}
	};

	const handleIntervalChange = async (quizIntervalHours: number) => {
		setBusy(true);
		setError(null);
		setMessage(null);
		try {
			await updateQuizReminderInterval(quizIntervalHours);
			await refresh();
			setMessage('Reminder schedule updated.');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update reminder schedule.');
		} finally {
			setBusy(false);
		}
	};

	const handleTest = async () => {
		setBusy(true);
		setError(null);
		setMessage(null);
		try {
			await sendTestQuizNotification();
			setMessage('Test notification sent.');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send test notification.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<section className="card flex flex-col gap-3 p-4">
			<h2 className="m-0 text-sm leading-5 font-bold">Quiz reminders</h2>
			<p className="m-0 text-sm leading-5 font-medium text-text-secondary">
				Get regular push notifications with a Hungarian vocabulary quiz. Your answers and progress
				are saved so reminders focus on words you need to practice.
			</p>

			{loading ? (
				<p className="m-0 text-sm text-text-secondary">Loading notification settings…</p>
			) : (
				<>
					<p className="m-0 text-sm font-medium text-text">
						Status:{' '}
						<span className="text-text-secondary">
							{settings?.subscribed ? 'Enabled on this device' : 'Not enabled'}
						</span>
					</p>

					<label className="flex flex-col gap-1">
						<span className="text-xs font-medium text-text-secondary">Reminder frequency</span>
						<select
							className="field"
							value={settings?.quizIntervalHours ?? 12}
							disabled={busy}
							onChange={(event) => void handleIntervalChange(Number(event.target.value))}>
							{INTERVAL_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<div className="flex flex-wrap gap-2">
						{settings?.subscribed ? (
							<button
								type="button"
								className="btn-secondary"
								disabled={busy}
								onClick={() => void handleUnsubscribe()}>
								Disable reminders
							</button>
						) : (
							<button
								type="button"
								className="btn-primary"
								disabled={busy}
								onClick={() => void handleSubscribe()}>
								Enable reminders
							</button>
						)}
						<button
							type="button"
							className="btn-secondary"
							disabled={busy || !settings?.subscribed}
							onClick={() => void handleTest()}>
							Send test
						</button>
					</div>
				</>
			)}

			{error ? <p className="notice-danger m-0">{error}</p> : null}
			{message ? (
				<p className="m-0 rounded-xl border border-border bg-bg px-4 py-3 text-sm font-medium text-text-secondary">
					{message}
				</p>
			) : null}
		</section>
	);
}
