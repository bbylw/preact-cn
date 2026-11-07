import { Component, hydrate, render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CODE } from '../data/content';
import { highlight } from '../lib/highlight';
import { renderToHtml } from '../lib/ssr';
import { CodeBlock, Panel, SectionHead, Stat } from './ui';

class Card extends Component<{ name: string }, { pings: number }> {
	state = { pings: 0 };

	render() {
		return (
			<article class="ssr-card">
				<span class="ssr-card__tag mono">&lt;article&gt;</span>
				<h4>{this.props.name}</h4>
				<p>这段标记由服务端输出，浏览器端只需接管。</p>
				<button type="button" onClick={() => this.setState({ pings: this.state.pings + 1 })}>
					点击验证 hydrate
				</button>
				<span class="ssr-card__count mono">{`PINGS ${this.state.pings}`}</span>
			</article>
		);
	}
}

interface HydrationResult {
	structural: number;
	textual: number;
	before: number;
	after: number;
}

export function SsrLab() {
	const hostRef = useRef<HTMLDivElement>(null);
	const [name, setName] = useState('Preact');
	const [phase, setPhase] = useState<'plain' | 'hydrated'>('plain');
	const [result, setResult] = useState<HydrationResult | null>(null);
	const html = useMemo(() => renderToHtml(<Card name={name} />), [name]);

	const showPlainMarkup = () => {
		const host = hostRef.current;
		if (!host) return;
		render(null, host);
		host.innerHTML = html;
		setPhase('plain');
		setResult(null);
	};

	useEffect(() => {
		showPlainMarkup();
	}, [html]);

	const doHydrate = () => {
		const host = hostRef.current;
		if (!host) return;
		if (phase === 'hydrated') showPlainMarkup();

		const before = host.querySelectorAll('*').length;
		const observer = new MutationObserver(() => {});
		observer.observe(host, { childList: true, subtree: true, characterData: true });
		hydrate(<Card name={name} />, host);
		const records = observer.takeRecords();
		observer.disconnect();

		setResult({
			structural: records.filter(record => record.type === 'childList').length,
			textual: records.filter(record => record.type === 'characterData').length,
			before,
			after: host.querySelectorAll('*').length,
		});
		setPhase('hydrated');
	};

	return (
		<section class="band section" id="ssr">
			<SectionHead
				index="04"
				kicker="SSR / HYDRATION"
				title="服务端写好的标记，不必推倒重来"
				note="高度优化的 diff 与服务端渲染无缝衔接。这里真的调用 preact-render-to-string 生成标记，再用 hydrate() 接管，并统计接管过程中是否有节点被替换。"
			/>

			<div class="section__split" data-reveal>
				<div class="section__aside">
					<p class="prose">
						服务端把组件渲染成字符串随页面送达；浏览器端不做重建，而是沿已有 DOM 对齐虚拟树、挂上事件与后续更新。
						接管完成后，下面这枚按钮的计数器才会开始工作。
					</p>
					<CodeBlock snippet={CODE.ssr} />
					<ol class="pipeline mono">
						<li class={phase === 'plain' ? 'is-current' : ''}>
							<span>01</span> renderToString()
						</li>
						<li>
							<span>02</span> HTML 送达浏览器
						</li>
						<li class={phase === 'hydrated' ? 'is-current' : ''}>
							<span>03</span> hydrate() 接管
						</li>
					</ol>
				</div>

				<div class="section__main">
					<Panel title="SERVER MARKUP → LIVE DOM" meta={phase === 'hydrated' ? 'HYDRATED' : 'PLAIN HTML'}>
						<label class="field field--inline">
							<span class="field__label mono">组件 props.name</span>
							<input
								type="text"
								value={name}
								onInput={event => setName(event.currentTarget.value)}
								maxLength={20}
							/>
						</label>
						<div class="ssr-host" ref={hostRef} />
						<div class="panel__foot mono">
							<span>
								{phase === 'hydrated'
									? `按钮已接管 · 文本同步 ${result?.textual ?? 0} 次`
									: '纯服务端标记，按钮无事件'}
							</span>
							<button type="button" class="text-btn mono" onClick={showPlainMarkup}>
								重置为纯 HTML
							</button>
						</div>
						<button type="button" class="btn btn--primary ssr-run" onClick={doHydrate}>
							执行 hydrate()
						</button>
					</Panel>

					<div class="stat-row" aria-live="polite">
						<Stat label="DOM REPLACED" value={result ? String(result.structural) : '—'} hint="节点增删次数" />
						<Stat label="NODES BEFORE" value={result ? String(result.before) : '—'} hint="接管前节点" />
						<Stat label="NODES AFTER" value={result ? String(result.after) : '—'} hint="接管后节点" />
						<Stat label="MARKUP" value={String(html.length)} unit="chars" hint="字符串长度" />
					</div>

					<figure class="html-out" data-reveal>
						<figcaption class="mono">
							<span>renderToString() 的真实输出</span>
							<span>text/html</span>
						</figcaption>
						<pre>
							<code dangerouslySetInnerHTML={{ __html: highlight(html, 'html') }} />
						</pre>
					</figure>
				</div>
			</div>
		</section>
	);
}
