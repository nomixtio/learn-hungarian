export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'learn-hungarian-theme';

export function getSystemTheme(): ResolvedTheme {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredThemePreference(): ThemePreference {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}

	return 'system';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
	if (preference === 'light') {
		return 'light';
	}

	if (preference === 'dark') {
		return 'dark';
	}

	return getSystemTheme();
}

export function applyThemePreference(preference: ThemePreference): void {
	document.documentElement.dataset.theme = preference;
}

export function setStoredThemePreference(preference: ThemePreference): void {
	localStorage.setItem(STORAGE_KEY, preference);
	applyThemePreference(preference);
}

export function initTheme(): void {
	applyThemePreference(getStoredThemePreference());
}
