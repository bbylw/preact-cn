import { options, render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { CODE } from '../data/content';
import { CodeBlock, Panel, SectionHead, Stat } from './ui';

type Strategy = 'micro' | 'frame' | 'idle';

interface BumpApi {
	bump: () => void;
}

function SchedulerTree(props: { onReady: (api: BumpApi) => void }) {
	const [value, setValue] = useState(0);

	useEffect(() => {
		props.onReady({ bump: () => setValue(current => current + 1) });
	}, []);

	return (
		<div class="sched-meter">
			<span class="mono">STATE VALUE</span>
			<strong>{value}</strong>
			<span class="mono">/ 3</span>
		</div>
	);
}

interface RunResult {
	queued: number;
	commits: number;
	value: string;
	ms: number;
}

type IdleWindow = Window & {
	requestIdleCallback?: (callback: () => void, opts?: { timeout: number }) => number;
};

function schedule(callback: () => void, strategy: Strategy) {
	if (strategy === 'micro') {
		queueMicrotask(callback);
	} else if (strategy === 'frame') {
		requestAnimationFrame(() => callback());
	} else {
		const win = window as IdleWindow;
		if (win.requestIdleCallback) win.requestIdleCallback(callback, { timeout: 300 });
		else window.setTimeout(callback, 60);
	}
}

export function SchedulerLab() {
	const hostRef = useRef<HTMLDivElement>(null);
	const statusRef = useRef<HTMLParagraphElement>(null);
	const apiRef = useRef<BumpApi | null>(null);
	const busyRef = useRef(false);
	const [ready, setReady] = useState(false);
	const [strategy, setStrategy] = useState<Strategy>('micro');
	const [result, setResult] = useState<RunResult | null>(null);
	const [lines, setLines] = useState<string[]>([]);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		render(
			<SchedulerTree
				onReady={api => {
					apiRef.current = api;
					setReady(true);
				}}
			/>,
			host
		);
		return () => {
			apiRef.current = null;
			if (hostRef.current) render(null, hostRef.current);
		};
	}, []);

	const run = () => {
		const api = apiRef.current;
		const host = hostRef.current;
		if (!api || !host || busyRef.current) return;
		busyRef.current = true;
		if (statusRef.current) statusRef.current.textContent = '调度中…';

		const originalDebounce = options.debounceRendering;
		const originalDiffed = options.diffed;
		const started = performance.now();
		const stamp = () => `${(performance.now() - started).toFixed(2)}ms`;
		const trace = [`0.00ms · 同一事件里连续调用 setState × 3`];
		let queued = 0;
		let commits = 0;

		const restore = () => {
			options.debounceRendering = originalDebounce;
			options.diffed = originalDiffed;
		};

		options.debounceRendering = callback => {
			queued += 1;
			trace.push(`${stamp()} · options.debounceRendering 排队 × 1（${strategy}）`);
			schedule(() => {
				callback();
				const elapsed = performance.now() - started;
				const domValue = host.querySelector('strong')?.textContent ?? '—';
				trace.push(`${elapsed.toFixed(2)}ms · diffed × ${commits} · DOM 中的状态值 = ${domValue}`);
				restore();
				if (statusRef.current) statusRef.current.textContent = `上次运行：${elapsed.toFixed(2)}ms 完成提交`;
				setResult({ queued, commits, value: domValue, ms: elapsed });
				setLines(trace);
				busyRef.current = false;
			}, strategy);
		};

		options.diffed = vnode => {
			if (vnode.type === SchedulerTree) commits += 1;
			originalDiffed?.(vnode);
		};

		try {
			api.bump();
			api.bump();
			api.bump();
		} catch {
			restore();
			if (statusRef.current) statusRef.current.textContent = '运行失败，已恢复默认 options';
			busyRef.current = false;
			setLines(['调度器运行失败，已恢复默认 options']);
		}
	};

	const strategies: Array<{ id: Strategy; label: string; hint: string }> = [
		{ id: 'micro', label: '微任务', hint: 'queueMicrotask' },
		{ id: 'frame', label: '动画帧', hint: 'requestAnimationFrame' },
		{ id: 'idle', label: '空闲时段', hint: 'requestIdleCallback' },
	];

	return (
		<section class="band section" id="scheduler">
			<SectionHead
				index="03"
				kicker="SCHEDULER / OPTIONS"
				title="把「何时渲染」交还给你"
				note="透明异步渲染，支持可插拔的调度器。连续三次 setState 并不会触发三次提交：Preact 通过 options.debounceRendering 把它们合并排队。"
			/>

			<div class="section__split section__split--reverse" data-reveal>
				<div class="section__main">
					<Panel title="LIVE SCHEDULER" meta={ready ? 'READY' : 'BOOTING'}>
						<div class="sched-host" ref={hostRef} />
						<div class="sched-picker">
							<span class="mono sched-picker__label">debounceRendering =</span>
							<div class="segmented" role="group" aria-label="选择调度策略">
								{strategies.map(item => (
									<button
										key={item.id}
										type="button"
										class={strategy === item.id ? 'is-active' : ''}
										aria-pressed={strategy === item.id}
										onClick={() => setStrategy(item.id)}
										title={item.hint}
									>
										{item.label}
									</button>
								))}
							</div>
						</div>
						<button
							type="button"
							class="btn btn--primary sched-run"
							onClick={run}
							disabled={!ready}
						>
							连续触发 3 次 setState
						</button>
						<p class="panel__status mono" ref={statusRef} role="status" aria-live="polite">
							{ready ? '待运行 · 每次运行后恢复默认 options' : '独立渲染根正在挂载…'}
						</p>
					</Panel>

					<div class="stat-row" aria-live="polite">
						<Stat label="SETSTATE" value="3" hint="同一事件内" />
						<Stat label="QUEUE" value={result ? String(result.queued) : '—'} hint="调度排队次数" />
						<Stat label="DIFFED" value={result ? String(result.commits) : '—'} hint="实际提交次数" />
						<Stat label="LATENCY" value={result ? result.ms.toFixed(2) : '—'} unit="ms" hint="到提交为止" />
					</div>

					<div class="log" role="log" aria-live="polite" aria-label="调度时序日志">
						<div class="log__head mono">
							<span>TIMELINE</span>
							<span>{result ? `DOM VALUE = ${result.value}` : 'WAITING'}</span>
						</div>
						{lines.length === 0 ? (
							<p class="log__empty">尚未运行。选择策略后触发三次状态更新。</p>
						) : (
							<ol>
								{lines.map((line, index) => (
									<li key={line} class="mono">
										<span>{String(index + 1).padStart(2, '0')}</span>
										{line}
									</li>
								))}
							</ol>
						)}
					</div>
				</div>

				<div class="section__aside">
					<p class="prose">
						调度器不是配置项，而是 Preact 暴露出来的 <code>options.debounceRendering</code> 钩子。默认用微任务合并更新，换掉它就能把渲染对齐到动画帧、或推迟到浏览器空闲时。整个过程对组件代码完全透明。
					</p>
					<CodeBlock snippet={CODE.scheduler} />
					<p class="aside-note mono">OPTIONS ARE GLOBAL · RESTORED AFTER EACH RUN</p>
				</div>
			</div>
		</section>
	);
}
