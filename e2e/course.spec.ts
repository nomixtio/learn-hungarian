import { expect, test } from '@playwright/test';

test('course page renders lessons and entries', async ({ page }) => {
	await page.goto('/learn/greetings');

	await expect(page.getByRole('heading', { name: 'Greetings & introductions' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Informal' })).toBeVisible();
	await expect(page.getByText('szia').first()).toBeVisible();
});

test('unknown course shows a not-found page', async ({ page }) => {
	await page.goto('/learn/nope-not-a-course');

	await expect(page.getByRole('heading', { name: 'Course not found' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
});
