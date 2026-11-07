import type { Theme } from '../lib/theme';
import { PREACT_VERSION } from '../data/content';

const NAV = [
	{ href: '#features', label: '能力' },
	{ href: '#diff', label: 'Diff 实验台' },
	{ href: '#scheduler', label: '调度器' },
	{ href: '#ssr', label: 'SSR 与补水' },
	{ href: '#syntax', label: '三种写法' },
	{ href: '#scale', label: '体积' },
	{ href: '#start', label: '开始' },
];

export function Header(props: { theme: Theme; onToggle: () => void; lifted: boolean }) {
	const dark = props.theme === 'dark';
	return (
		<header class={`topbar${props.lifted ? ' topbar--lifted' : ''}`}>
			<div class="topbar__inner shell">
				<a class="brand" href="#top" aria-label="Preact 中文，回到顶部">
					<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
						<path d="M16 3 29 10v12L16 29 3 22V10L16 3Zm0 3.6L6.4 12l9.6 5.5 9.6-5.5L16 6.6ZM5.4 14.5v7.3l9.6 5.5v-7.3l-9.6-5.5Zm11.2 12.8 9.6-5.5v-7.3l-9.6 5.5v7.3Z" />
					</svg>
					<span class="brand__name">Preact<span class="brand__cn">中文</span></span>
				</a>

				<nav class="topnav" aria-label="站内导航">
					{NAV.map(item => (
						<a key={item.href} href={item.href}>
							{item.label}
						</a>
					))}
				</nav>

				<div class="topbar__tools">
					<span class="version mono">v{PREACT_VERSION}</span>
					<button
						type="button"
						class="theme-toggle"
						onClick={props.onToggle}
						aria-label={dark ? '切换到浅色主题' : '切换到深色主题'}
						aria-pressed={dark}
					>
						<svg viewBox="0 0 20 20" aria-hidden="true">
							{dark ? (
								<path d="M16.2 12.8A6.8 6.8 0 0 1 7.2 3.8a6.8 6.8 0 1 0 9 9Z" />
							) : (
								<>
									<circle cx="10" cy="10" r="3.7" />
									<path d="M10 1v2.1M10 16.9V19M1 10h2.1M16.9 10H19M3.6 3.6l1.5 1.5M14.9 14.9l1.5 1.5M16.4 3.6l-1.5 1.5M5.1 14.9l-1.5 1.5" />
								</>
							)}
						</svg>
						<span class="mono">{dark ? 'DARK' : 'LIGHT'}</span>
					</button>
				</div>
			</div>
		</header>
	);
}
