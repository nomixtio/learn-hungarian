import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';
import { registerServiceWorker } from '@/lib/push-notifications';
import { initTheme } from '@/lib/theme';
import '@/styles/global.css';

initTheme();

if ('serviceWorker' in navigator) {
	void registerServiceWorker();
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
