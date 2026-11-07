import { render } from 'preact';
import { createElement as compatCreateElement } from 'preact/compat';
import type { ComponentChild } from 'preact';
import { html } from 'htm/preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { CODE } from '../data/content';
import { highlight } from '../lib/highlight';
import { CodeBlock, Panel, SectionHead, Stat } from './ui';

type TabKey = 'jsx' | 'htm' | 'compat';

const Badge = ({ label }: { label: string }) => (
	<span class="badge">
		<b>{label}</b>
		<i>4kB</i>
	</span>
);

const VARIANTS: Record<TabKey, () => ComponentChild> = {
	jsx: () => <Badge label="Preact" />,
	htm: () => html`<span class="badge"><b>Preact</b><i>4kB</i></span>`,
	compat: () =>
		compatCreateElement(
			'span',
			{ class: 'badge' },
			compatCreateElement('b', null, 'Preact'),
			compatCreateElement('i', null, '4kB')
		),
};

const TABS: Array<{ id: TabKey; label: string; hint: string; snippet: (typeof CODE)[string] }> = [
	{ id: 'jsx', label: 'JSX', hint: 'Vite 编译', snippet: CODE.jsx },
	{ id: 'htm', label: 'HTM', hint: '无需构建', snippet: CODE.htm },
	{ id: 'compat', label: 'preact/compat', hint: 'React 别名', snippet: CODE.alias },
];

export function SyntaxLab() {
	const hostRef = useRef<HTMLDivElement>(null);
	const baselineRef = useRef<string | null>(null);
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const [tab, setTab] = useState<TabKey>('jsx');
	const [markup, setMarkup] = useState('');
	const [identical, setIdentical] = useState(true);
	const [bytes, setBytes] = useState(0);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		host.replaceChildren();
		render(VARIANTS[tab](), host);
		const output = host.innerHTML;
		if (baselineRef.current === null) baselineRef.current = output;
		setMarkup(output);
		setIdentical(output === baselineRef.current);
		setBytes(new TextEncoder().encode(output).length);
		return () => {
			if (hostRef.current) render(null, hostRef.current);
		};
	}, [tab]);

	const onKeyDown = (event: KeyboardEvent) => {
		const current = TABS.findIndex(item => item.id === tab);
		let next = current;
		if (event.key === 'ArrowRight') next = (current + 1) % TABS.length;
		else if (event.key === 'ArrowLeft') next = (current - 1 + TABS.length) % TABS.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = TABS.length - 1;
		else return;
		event.preventDefault();
		setTab(TABS[next].id);
		tabRefs.current[next]?.focus();
	};

	const active = TABS.find(item => item.id === tab) ?? TABS[0];

	return (
		<section class="band section" id="syntax">
			<SectionHead
				index="05"
				kicker="JSX / HTM / COMPAT"
				title="三种写法，同一棵树"
				note="JSX 经 Vite 编译，HTM 用标签模板，preact/compat 直接提供 React 风格的 createElement。切换标签会把对应写法重新挂载，并比较产出的 DOM 标记是否逐字一致。"
			/>

			<div class="section__split section__split--reverse" data-reveal>
				<div class="section__main">
					<Panel title="RENDER OUTPUT" meta="ONE ROOT / THREE SYNTAXES">
						<div class="tabs" role="tablist" aria-label="选择组件写法" onKeyDown={onKeyDown}>
							{TABS.map((item, index) => (
								<button
									key={item.id}
									ref={element => {
										tabRefs.current[index] = element;
									}}
									type="button"
									role="tab"
									id={`tab-${item.id}`}
									aria-controls="syntax-panel"
									aria-selected={tab === item.id}
									tabIndex={tab === item.id ? 0 : -1}
									class={tab === item.id ? 'is-active' : ''}
									onClick={() => setTab(item.id)}
								>
									<span class="mono">{item.label}</span>
									<small>{item.hint}</small>
								</button>
							))}
						</div>
						<div class="syntax-panel" id="syntax-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
							<div class="badge-host" ref={hostRef} />
							<p class="syntax-panel__hint">
								上面这枚徽章由「{active.label}」写法挂载；下方字符串是浏览器里真实的 innerHTML。
							</p>
							<pre class="syntax-markup">
								<code dangerouslySetInnerHTML={{ __html: highlight(markup, 'html') }} />
							</pre>
						</div>
					</Panel>

					<div class="stat-row" aria-live="polite">
						<Stat label="MARKUP MATCH" value={identical ? '一致' : '不一致'} hint="与基线逐字比较" />
						<Stat label="BYTES" value={String(bytes)} hint="UTF-8 编码后" />
						<Stat label="ROOT" value="1" hint="独立渲染根" />
						<Stat label="SYNTAX" value={active.label} hint="当前写法" />
					</div>
				</div>

				<div class="section__aside">
					<p class="prose">
						兼容不是模拟出来的：本站的 Vite 配置把 react 与 react-dom 指向 preact/compat，因此既有 React 组件无需改写。
						想省掉构建步骤时，HTM 让同样的树直接写在标签模板里。
					</p>
					<CodeBlock snippet={active.snippet} />
					<p class="aside-note mono">ARIA TABS · ← → HOME END</p>
				</div>
			</div>
		</section>
	);
}
