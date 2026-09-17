import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Auto-cleanup mounted components between tests.
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

// In-memory localStorage fallback — some jsdom/Node combos expose no
// window.localStorage (Node 22+ ships an experimental stub instead).
if (typeof window !== 'undefined' && (window as any).localStorage == null) {
	const store = new Map<string, string>();
	const fallback = {
		getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
		setItem: (key: string, value: string) => {
			store.set(key, String(value));
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
		key: (index: number) => [...store.keys()][index] ?? null,
		get length() {
			return store.size;
		},
	};
	Object.defineProperty(window, 'localStorage', { writable: true, value: fallback });
	if ((globalThis as any).localStorage == null) {
		Object.defineProperty(globalThis, 'localStorage', { writable: true, value: fallback });
	}
}

// jsdom lacks matchMedia — used by theme / color-scheme hooks.
// Always override with a plain function (not vi.fn): vi.restoreAllMocks()
// in afterEach would wipe a vi.fn implementation back to `undefined`.
// Some environments ship a stub that returns undefined.
if (typeof window !== 'undefined') {
	const noop = () => {};
	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: noop,
			removeListener: noop,
			addEventListener: noop,
			removeEventListener: noop,
			dispatchEvent: () => false,
		}),
	});
}

// jsdom lacks IntersectionObserver — stub for future component tests.
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
	class IntersectionObserverStub {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	// @ts-expect-error — intentional test stub
	window.IntersectionObserver = IntersectionObserverStub;
}
