import { useEffect, useState } from 'preact/hooks';
import { Header } from './components/Header';
import { DiffLab } from './components/DiffLab';
import { FeatureList } from './components/FeatureList';
import { SchedulerLab } from './components/SchedulerLab';
import { SsrLab } from './components/SsrLab';
import { SyntaxLab } from './components/SyntaxLab';
import { SizeScale } from './components/SizeScale';
import { QuickStart } from './components/QuickStart';
import { LINKS, PREACT_VERSION } from './data/content';
import { useTheme } from './lib/theme';
import { initReveal } from './lib/useReveal';

export function App() {
	const { theme, toggle } = useTheme();
	const [lifted, setLifted] = useState(false);

	useEffect(() => {
		const stopReveal = initReveal();
		const sentinel = document.getElementById('top-sentinel');
		let observer: IntersectionObserver | null = null;
		if (sentinel) {
			observer = new IntersectionObserver(
				entries => setLifted(!entries[0].isIntersecting),
				{ threshold: 0 }
			);
			observer.observe(sentinel);
		}
		return () => {
			stopReveal();
			observer?.disconnect();
		};
	}, []);

	return (
		<>
			<div id="top-sentinel" aria-hidden="true" />
			<Header theme={theme} onToggle={toggle} lifted={lifted} />

			<main id="main">
				<DiffLab />
				<FeatureList />
				<SchedulerLab />
				<SsrLab />
				<SyntaxLab />
				<SizeScale />
				<QuickStart />
			</main>

			<footer class="footer band">
				<div class="shell footer__inner">
					<div class="footer__lead">
						<span class="eyebrow">COLOPHON</span>
						<p>
							{`所有实验台均由页面内运行的 Preact ${PREACT_VERSION} 现场执行。`}
						</p>
						<span class="mono footer__stamp">MIT · NO FRAMEWORK OVERHEAD</span>
					</div>
					<div class="footer__links">
						<div>
							<span class="mono footer__label">项目</span>
							<a href={LINKS.site} target="_blank" rel="noreferrer">Preact 官网</a>
							<a href={LINKS.repo} target="_blank" rel="noreferrer">GitHub 仓库</a>
							<a href={LINKS.npm} target="_blank" rel="noreferrer">npm 包</a>
						</div>
						<div>
							<span class="mono footer__label">生态</span>
							<a href={LINKS.compat} target="_blank" rel="noreferrer">preact/compat</a>
							<a href={LINKS.devtools} target="_blank" rel="noreferrer">Preact DevTools</a>
							<a href={LINKS.awesome} target="_blank" rel="noreferrer">awesome-preact</a>
						</div>
					</div>
				</div>
				<div class="shell footer__bottom mono">
					<span>PREACT / 第 01 期</span>
					<span>BUILT WITH PREACT + TYPESCRIPT + VITE + BUN</span>
					<a href="#top">回到顶部</a>
				</div>
			</footer>
		</>
	);
}
