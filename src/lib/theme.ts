import { useEffect, useState } from 'preact/hooks';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'preact-cn-theme';

function readInitial(): Theme {
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function useTheme(): { theme: Theme; toggle: () => void } {
	const [theme, setTheme] = useState<Theme>(readInitial);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', theme === 'dark' ? '#121317' : '#f4f3ef');
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// 隐私模式下无法写入，主题仍在本页生效
		}
	}, [theme]);

	return {
		theme,
		toggle: () => {
			const next: Theme = theme === 'dark' ? 'light' : 'dark';
			document.documentElement.dataset.theme = next;
			setTheme(next);
		},
	};
}
