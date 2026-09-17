import { expect, test } from '@playwright/test';

import { useFreshClient } from './helpers';

test('quiz happy path against the real API', async ({ page }) => {
	await useFreshClient(page);

	// Pin the quiz item: StrictMode double-mounts in dev and would otherwise
	// fetch two random items, racing the captured response against the UI.
	// Attempt + summary still hit the real worker + D1.
	const fixedItem = {
		courseSlug: 'greetings',
		courseTitle: 'Greetings',
		lessonId: 'l1',
		lessonTitle: 'Basics',
		entryKey: 'e2e:fixed-item-1',
		promptEnglish: 'E2E prompt',
		expectedHungarian: 'E2E valasz',
	};
	await page.route('**/api/quiz/next**', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ item: fixedItem, progress: null }),
		}),
	);
	await page.goto('/quiz');

	await expect(page.getByRole('heading', { name: 'Quiz' })).toBeVisible();
	await expect(page.getByText(fixedItem.promptEnglish)).toBeVisible();

	const attemptResponse = page.waitForResponse('**/api/quiz/attempt**');
	await page.getByPlaceholder('Type what you said…').fill(fixedItem.expectedHungarian);
	await page.getByRole('button', { name: 'Check' }).click();

	const attemptRes = await attemptResponse;
	expect(attemptRes.ok()).toBe(true);
	await expect(page.getByText(/Correct!/)).toBeVisible();
	await expect(page.getByRole('button', { name: 'Next question' })).toBeVisible();
});

test('quiz shows an error when the API fails', async ({ page }) => {
	await useFreshClient(page);
	await page.route('**/api/quiz/next**', (route) =>
		route.fulfill({
			status: 500,
			contentType: 'application/json',
			body: JSON.stringify({ error: 'quiz unavailable' }),
		}),
	);
	await page.goto('/quiz');
	await expect(page.getByText('quiz unavailable')).toBeVisible();
});
