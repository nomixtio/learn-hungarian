import { useEffect, useState } from 'react';

import { APP_BUILD } from '@/lib/app';
import { checkForAppUpdate, refreshAppToLatest } from '@/lib/app-update';

type RefreshStatus = 'checking' | 'upToDate' | 'updateAvailable' | 'error';

export function AppRefresh() {
	const [status, setStatus] = useState<RefreshStatus>('checking');
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let cancelled = false;

		checkForAppUpdate().then((result) => {
			if (cancelled) {
				return;
			}

			if (result.kind === 'error') {
				setStatus('error');
				setMessage(result.message);
				return;
			}

			if (result.kind === 'updateAvailable') {
				setStatus('updateAvailable');
				setMessage(`Update available (build ${result.localBuild} → ${result.serverBuild}).`);
				return;
			}

			setStatus('upToDate');
			setMessage("You're on the latest version.");
		});

		return () => {
			cancelled = true;
		};
	}, []);

	async function handleRefresh() {
		setBusy(true);
		setMessage('Refreshing…');
		await refreshAppToLatest();
	}

	const canRefresh = (status === 'updateAvailable' || status === 'error') && !busy;

	return (
		<div className="flex flex-col gap-3">
			<p className="m-0 text-sm font-medium text-text-secondary">Build {APP_BUILD}</p>
			<button
				type="button"
				className="btn-primary self-start"
				onClick={() => handleRefresh().catch(console.error)}
				disabled={!canRefresh}>
				{busy ? 'Refreshing…' : 'Refresh app'}
			</button>
			{message ? (
				<p
					className={`m-0 text-sm leading-5 ${
						status === 'error' ? 'text-danger' : 'text-text-secondary'
					}`}>
					{message}
				</p>
			) : null}
		</div>
	);
}
