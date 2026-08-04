self.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};

	event.waitUntil(
		self.registration.showNotification(data.title ?? 'Learn Hungarian', {
			body: data.body,
			icon: data.icon ?? '/logo192.png',
			badge: '/logo192.png',
			tag: data.tag,
			data: data.data,
		}),
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const url = event.notification.data?.url ?? '/quiz';
	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
			for (const client of windowClients) {
				if ('focus' in client) {
					client.navigate(url);
					return client.focus();
				}
			}

			if (clients.openWindow) {
				return clients.openWindow(url);
			}
		}),
	);
});
