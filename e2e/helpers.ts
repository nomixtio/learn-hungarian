import type { Page } from '@playwright/test';

export const CLIENT_ID_KEY = 'learn-hungarian-client-id';

/** Seed a fresh client id before navigation so tests never share D1 rows. */
export async function useFreshClient(page: Page, clientId = `e2e-${crypto.randomUUID()}`) {
	await page.addInitScript(
		({ key, id }) => {
			localStorage.setItem(key, id);
		},
		{ key: CLIENT_ID_KEY, id: clientId },
	);
	return clientId;
}
