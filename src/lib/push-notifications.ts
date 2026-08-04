import { apiFetch } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let index = 0; index < rawData.length; index += 1) {
		outputArray[index] = rawData.charCodeAt(index);
	}
	return outputArray;
}

export type PushSettings = {
	subscribed: boolean;
	notificationsEnabled: boolean;
	quizIntervalHours: number;
};

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!('serviceWorker' in navigator)) {
		return null;
	}

	return navigator.serviceWorker.register('/sw.js');
}

export async function getPushSettings(): Promise<PushSettings> {
	return apiFetch<PushSettings>('/api/push/settings');
}

export async function subscribeToQuizNotifications(
	quizIntervalHours: number,
): Promise<void> {
	if (!('Notification' in window) || !('serviceWorker' in navigator)) {
		throw new Error('Push notifications are not supported in this browser.');
	}

	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		throw new Error('Notification permission was denied.');
	}

	const registration = await registerServiceWorker();
	if (!registration) {
		throw new Error('Could not register the service worker.');
	}

	const { publicKey } = await apiFetch<{ publicKey: string }>('/api/push/vapid-public-key');

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicKey),
	});

	const json = subscription.toJSON();
	if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
		throw new Error('Invalid push subscription from the browser.');
	}

	await apiFetch('/api/push/subscribe', {
		method: 'POST',
		json: {
			endpoint: json.endpoint,
			keys: {
				p256dh: json.keys.p256dh,
				auth: json.keys.auth,
			},
			quizIntervalHours,
		},
	});
}

export async function unsubscribeFromQuizNotifications(): Promise<void> {
	await apiFetch('/api/push/subscribe', { method: 'DELETE' });

	if ('serviceWorker' in navigator) {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		await subscription?.unsubscribe();
	}
}

export async function updateQuizReminderInterval(quizIntervalHours: number): Promise<void> {
	await apiFetch('/api/push/settings', {
		method: 'PATCH',
		json: { quizIntervalHours },
	});
}

export async function sendTestQuizNotification(): Promise<void> {
	await apiFetch('/api/push/test', { method: 'POST' });
}
