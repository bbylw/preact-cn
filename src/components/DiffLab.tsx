import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { CODE } from '../data/content';
import { CodeBlock, Panel, SectionHead, Stat } from './ui';

const INITIAL_ITEMS = ['保留的段落节点', '保留的列表节点'];

function DiffTree(props: { title: string; items: string[] }) {
	return (
		<div class="dtree">
			<span class="dtree__tag mono">&lt;main&gt;</span>
			<h3 class="dtree__title">{props.title}</h3>
			<p class="dtree__desc">同一个容器，第二次 render() 复用已有 DOM。</p>
			<ul class="dtree__list">
				{props.items.map((item, index) => (
					<li key={`${index}-${item}`}>
						<span class="mono">{String(index + 1).padStart(2, '0')}</span>
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}

interface DiffStat {
	mutations: number;
	type: string;
	target: string;
	ms: number;
}

export function DiffLab() {
	const hostRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<MutationObserver | null>(null);
	const [draft, setDraft] = useState('Hello World!');
	const [title, setTitle] = useState('Hello');
	const [items, setItems] = useState<string[]>([...INITIAL_ITEMS]);
	const [renderCount, setRenderCount] = useState(1);
	const [mountNodes, setMountNodes] = useState(0);
	const [stat, setStat] = useState<DiffStat>({ mutations: 0, type: '—', target: '—', ms: 0 });
	const [log, setLog] = useState<string[]>([]);

	const connect = (host: HTMLElement) => {
		observerRef.current?.disconnect();
		const observer = new MutationObserver(() => {});
		observer.observe(host, { childList: true, subtree: true, characterData: true });
		observerRef.current = observer;
		return observer;
	};

	const mount = (nextTitle: string, nextItems: string[]) => {
		const host = hostRef.current;
		if (!host) return;
		const observer = connect(host);
		render(<DiffTree title={nextTitle} items={nextItems} />, host);
		observer.takeRecords();
		setMountNodes(host.querySelectorAll('*').length);
	};

	useEffect(() => {
		mount('Hello', [...INITIAL_ITEMS]);
		setLog(['render #1 · 首次挂载 · 建立整棵树，写入全部节点']);
		return () => {
			observerRef.current?.disconnect();
			observerRef.current = null;
			if (hostRef.current) render(null, hostRef.current);
		};
	}, []);

	const paint = (nextTitle: string, nextItems: string[], reason: string) => {
		const host = hostRef.current;
		const observer = observerRef.current;
		if (!host || !observer) return;

		observer.takeRecords();
		const started = performance.now();
		render(<DiffTree title={nextTitle} items={nextItems} />, host);
		const ms = performance.now() - started;
		const records = observer.takeRecords();

		const types = Array.from(new Set(records.map(record => record.type))).join(' + ') || '无';
		const targets =
			Array.from(
				new Set(
					records.map(record => {
						const node = record.target;
						const element = node instanceof Element ? node : node.parentElement;
						return element?.tagName ?? 'TEXT';
					})
				)
			).join(' · ') || '无';

		const nextRender = renderCount + 1;
		setStat({ mutations: records.length, type: types, target: targets, ms });
		setRenderCount(nextRender);
		setLog(previous =>
			[
				`render #${nextRender} · ${reason} · ${records.length} 次 DOM 变更 · ${ms.toFixed(2)}ms`,
				...previous,
			].slice(0, 5)
		);
	};

	const rerender = () => {
		setTitle(draft);
		paint(draft, items, '仅标题文本变化');
	};

	const append = () => {
		const next = [...items, `新增节点 ${items.length + 1}`];
		setItems(next);
		paint(title, next, '追加一个子节点');
	};

	const reset = () => {
		setDraft('Hello World!');
		setTitle('Hello');
		setItems([...INITIAL_ITEMS]);
		setRenderCount(1);
		setStat({ mutations: 0, type: '—', target: '—', ms: 0 });
		mount('Hello', [...INITIAL_ITEMS]);
		setLog(['render #1 · 首次挂载 · 建立整棵树，写入全部节点']);
	};

	return (
		<section class="band section" id="diff">
			<SectionHead
				index="02"
				kicker="DIFF / MUTATION OBSERVER"
				title="一次 render，究竟改了几个节点？"
				note="官方 README 说第二次 render() 只会更新 <h1> 的文本。这里挂了一棵真的 Preact 树，并用浏览器原生的 MutationObserver 把变更数出来。"
			/>

			<div class="section__split" data-reveal>
				<div class="section__aside">
					<p class="prose">
						Preact 在内部计算新旧树之间的差异，以尽可能少的 DOM 操作完成更新。组件把 <code>diff</code> 的范围收敛到自身挂载点，所以应用变大时，单次更新并不会重新遍历整页。
					</p>
					<CodeBlock snippet={CODE.render} />
					<p class="aside-note mono">OBSERVING childList · characterData</p>
				</div>

				<div class="section__main">
					<Panel title="LIVE PREACT TREE" meta={`render #${renderCount}`}>
						<div class="diff-host" ref={hostRef} />
						<div class="panel__foot mono">
							<span>首次挂载建立 {mountNodes} 个节点</span>
							<span>后续只统计 DOM 变更</span>
						</div>
					</Panel>

					<div class="controls">
						<label class="field">
							<span class="field__label mono">新的标题文本</span>
							<input
								type="text"
								value={draft}
								onInput={event => setDraft(event.currentTarget.value)}
								maxLength={28}
							/>
						</label>
						<div class="controls__buttons">
							<button type="button" class="btn btn--primary" onClick={rerender}>
								再次 render()
							</button>
							<button type="button" class="btn" onClick={append}>
								追加子节点
							</button>
							<button type="button" class="btn btn--ghost" onClick={reset}>
								复位
							</button>
						</div>
					</div>

					<div class="stat-row" aria-live="polite">
						<Stat label="RENDER()" value={String(renderCount)} hint="累计调用" />
						<Stat label="DOM MUTATIONS" value={String(stat.mutations)} hint="本次更新" />
						<Stat label="MUTATION TYPE" value={stat.type} hint="变更类型" />
						<Stat label="ELAPSED" value={stat.ms.toFixed(2)} unit="ms" hint="render() 耗时" />
					</div>

					<div class="log" role="log" aria-live="polite" aria-label="渲染事件日志">
						<div class="log__head mono">
							<span>EVENT LOG</span>
							<span>TARGET: {stat.target}</span>
						</div>
						{log.length === 0 ? (
							<p class="log__empty">等待第一次 render()</p>
						) : (
							<ol>
								{log.map((line, index) => (
									<li key={line} class="mono">
										<span>{String(log.length - index).padStart(2, '0')}</span>
										{line}
									</li>
								))}
							</ol>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
