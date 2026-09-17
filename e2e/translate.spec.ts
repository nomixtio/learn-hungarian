import { expect, test } from '@playwright/test';

test('translate page loads with recording controls and empty states', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'Translate' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
	await expect(page.getByText('Translation will appear here…')).toBeVisible();
	await expect(page.getByText('Original transcription will appear here…')).toBeVisible();
});

test('translate sections collapse on toggle', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('button', { name: 'English' }).click();
	await expect(page.getByText('Translation will appear here…')).not.toBeVisible();
	// Hungarian section stays open.
	await expect(page.getByText('Original transcription will appear here…')).toBeVisible();
});
