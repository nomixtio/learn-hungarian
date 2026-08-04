import { AppRefresh } from '@/components/app-refresh';
import { NotificationSettings } from '@/components/notification-settings';
import { ThemeSettings } from '@/components/theme-settings';

export function SettingsPage() {
	return (
		<div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-6 overflow-y-auto px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
			<header className="flex flex-col gap-2">
				<h1 className="m-0 text-[32px] leading-[44px] font-semibold">Settings</h1>
				<p className="m-0 text-base leading-6 font-medium text-text-secondary">
					App version and refresh controls. Useful after a deploy if you installed the app on your
					home screen.
				</p>
			</header>

			<section className="card flex flex-col gap-3 p-4">
				<h2 className="m-0 text-sm leading-5 font-bold">App</h2>
				<p className="m-0 text-sm leading-5 font-medium text-text-secondary">
					Pull the latest version after a deploy.
				</p>
				<AppRefresh />
			</section>

			<ThemeSettings />

			<NotificationSettings />
		</div>
	);
}
