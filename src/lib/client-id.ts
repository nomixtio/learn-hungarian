const STORAGE_KEY = 'learn-hungarian-client-id';

export function getClientId(): string {
	if (typeof localStorage === 'undefined') {
		return 'anonymous';
	}

	let clientId = localStorage.getItem(STORAGE_KEY);
	if (!clientId) {
		clientId = crypto.randomUUID();
		localStorage.setItem(STORAGE_KEY, clientId);
	}

	return clientId;
}
