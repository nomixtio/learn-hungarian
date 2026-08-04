import { useCallback, useEffect, useState } from 'react';

import {
	type ResolvedTheme,
	type ThemePreference,
	getStoredThemePreference,
	resolveTheme,
	setStoredThemePreference,
} from '@/lib/theme';

export function useTheme(): {
	preference: ThemePreference;
	resolvedScheme: ResolvedTheme;
	setPreference: (preference: ThemePreference) => void;
} {
	const [preference, setPreferenceState] = useState<ThemePreference>(() => getStoredThemePreference());
	const [resolvedScheme, setResolvedScheme] = useState<ResolvedTheme>(() =>
		resolveTheme(getStoredThemePreference()),
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const syncResolvedScheme = () => {
			setResolvedScheme(resolveTheme(preference));
		};

		syncResolvedScheme();
		mediaQuery.addEventListener('change', syncResolvedScheme);
		return () => mediaQuery.removeEventListener('change', syncResolvedScheme);
	}, [preference]);

	const setPreference = useCallback((next: ThemePreference) => {
		setStoredThemePreference(next);
		setPreferenceState(next);
		setResolvedScheme(resolveTheme(next));
	}, []);

	return { preference, resolvedScheme, setPreference };
}

/** Resolved light/dark scheme for components that only need the active palette. */
export function useColorScheme(): ResolvedTheme {
	const { resolvedScheme } = useTheme();
	return resolvedScheme;
}
