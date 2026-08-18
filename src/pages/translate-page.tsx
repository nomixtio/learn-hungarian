import { SonioxProvider } from '@soniox/react';

import { TranslatePanel } from '@/components/translate-panel';
import { fetchSonioxTemporaryKey } from '@/lib/soniox-config';

export function TranslatePage() {
	return (
		<SonioxProvider
			config={fetchSonioxTemporaryKey}
			permissions={null}>
			<TranslatePanel />
		</SonioxProvider>
	);
}
