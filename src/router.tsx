import {
	Outlet,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';

import { AppNav } from '@/components/app-nav';
import { AppUpdatePrompt } from '@/components/app-update-prompt';
import { APP_BUILD, APP_NAME } from '@/lib/app';
import { CoursePage } from '@/pages/course-page';
import { QuizPage } from '@/pages/quiz-page';
import { SettingsPage } from '@/pages/settings-page';
import { TranslatePage } from '@/pages/translate-page';

function AppLayout() {
	return (
		<div className="flex h-full min-h-full flex-col">
			<AppNav />
			<AppUpdatePrompt />
			<main className="flex min-h-0 flex-1 flex-col">
				<Outlet />
			</main>
			<footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-text-secondary sm:px-6">
				{APP_NAME} · Build {APP_BUILD}
			</footer>
		</div>
	);
}

const rootRoute = createRootRoute({
	component: AppLayout,
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: TranslatePage,
});

const courseRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/learn/$courseSlug',
	component: CoursePage,
});

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/settings',
	component: SettingsPage,
});

const quizRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/quiz',
	component: QuizPage,
});

const routeTree = rootRoute.addChildren([indexRoute, courseRoute, quizRoute, settingsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
