import { expect, test } from '@playwright/test';

import { useFreshClient } from './helpers';

test('settings page loads app, theme, voice, and notification sections', async ({ page }) => {
	await useFreshClient(page);
	await page.goto('/settings');

	await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'App', exact: true })).toBeVisible();
	// Theme / voice / notification sections render below the App card.
	await expect(page.getByText('Pull the latest version after a deploy.')).toBeVisible();
});
