import { useCallback, useEffect, useState } from 'react';

import {
	checkForAppUpdate,
	dismissUpdatePrompt,
	getDismissedUpdateBuild,
	refreshAppToLatest,
} from '@/lib/app-update';

export function AppUpdatePrompt() {
	const [serverBuild, setServerBuild] = useState<number | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const evaluateUpdate = useCallback(async () => {
		const result = await checkForAppUpdate();
		if (result.kind !== 'updateAvailable') {
			setServerBuild(null);
			return;
		}

		if (getDismissedUpdateBuild() === result.serverBuild) {
			setServerBuild(null);
			return;
		}

		setServerBuild(result.serverBuild);
	}, []);

	useEffect(() => {
		evaluateUpdate().catch(console.error);

		function onVisible() {
			if (document.visibilityState === 'visible') {
				evaluateUpdate().catch(console.error);
			}
		}

		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	}, [evaluateUpdate]);

	function handleDismiss() {
		if (serverBuild != null) {
			dismissUpdatePrompt(serverBuild);
		}
		setServerBuild(null);
	}

	async function handleRefresh() {
		setRefreshing(true);
		await refreshAppToLatest();
	}

	if (serverBuild == null) {
		return null;
	}

	return (
		<div
			className="mx-auto mb-0 flex w-full max-w-[800px] flex-wrap items-center justify-between gap-3 border-b border-accent/30 bg-accent-soft px-4 py-3 sm:px-6"
			role="status"
			aria-live="polite">
			<div className="flex min-w-0 flex-col gap-0.5">
				<strong className="text-sm font-semibold text-accent">New version available</strong>
				<span className="text-sm text-text">Refresh to get the latest updates.</span>
			</div>
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					className="btn-primary min-h-10"
					onClick={() => handleRefresh().catch(console.error)}
					disabled={refreshing}>
					{refreshing ? 'Refreshing…' : 'Refresh'}
				</button>
				<button
					type="button"
					className="btn-secondary min-h-10"
					onClick={handleDismiss}
					disabled={refreshing}>
					Not now
				</button>
			</div>
		</div>
	);
}
