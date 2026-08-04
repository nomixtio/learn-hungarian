import type { ThemePreference } from '@/lib/theme';
import { useTheme } from '@/hooks/use-color-scheme';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
	{ value: 'system', label: 'System' },
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
];

export function ThemeSettings() {
	const { preference, resolvedScheme, setPreference } = useTheme();

	return (
		<section className="card flex flex-col gap-3 p-4">
			<h2 className="m-0 text-sm leading-5 font-bold">Appearance</h2>
			<p className="m-0 text-sm leading-5 font-medium text-text-secondary">
				Choose light or dark mode, or match your device setting.
			</p>

			<label className="flex flex-col gap-1">
				<span className="text-xs font-medium text-text-secondary">Theme</span>
				<select
					className="field"
					value={preference}
					onChange={(event) => setPreference(event.target.value as ThemePreference)}>
					{THEME_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>

			<p className="m-0 text-sm font-medium text-text-secondary">
				Currently using {resolvedScheme} mode
				{preference === 'system' ? ' (from system)' : ''}.
			</p>
		</section>
	);
}
