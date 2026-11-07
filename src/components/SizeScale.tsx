import { useEffect, useRef } from 'preact/hooks';
import { SIZE } from '../data/content';
import { SectionHead } from './ui';

export function SizeScale() {
	const preactRef = useRef<HTMLSpanElement>(null);
	const stackRef = useRef<HTMLSpanElement>(null);
	const barRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const paint = (value: number) => {
			if (preactRef.current) preactRef.current.textContent = (SIZE.preact * value).toFixed(1);
			if (stackRef.current) stackRef.current.textContent = (SIZE.reactStack * value).toFixed(0);
			if (barRef.current) barRef.current.style.transform = `scaleX(${value})`;
		};
		if (reduce) {
			paint(1);
			return;
		}

		let frame = 0;
		let start = 0;
		let triggered = false;
		paint(0);

		const tick = (time: number) => {
			if (!start) start = time;
			const progress = Math.min(1, (time - start) / 1100);
			paint(1 - Math.pow(1 - progress, 3));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};

		const target = preactRef.current;
		const io = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && !triggered) {
					triggered = true;
					frame = requestAnimationFrame(tick);
					io.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		if (target) io.observe(target);

		return () => {
			io.disconnect();
			cancelAnimationFrame(frame);
		};
	}, []);

	const ratio = (SIZE.preact / SIZE.reactStack) * 100;

	return (
		<section class="band section" id="scale">
			<SectionHead
				index="06"
				kicker="FOOTPRINT / GZIP"
				title="少掉的 41kB 是什么"
				note="不是功能，而是重复的抽象与兼容包袱。把运行时压到 4kB，首屏要下载、解析、执行的 JavaScript 也就跟着变小。"
			/>

			<div class="scale" data-reveal>
				<div class="scale__chart" role="img" aria-label={`Preact 运行时 ${SIZE.preact}kB，对比常见 React 技术栈约 ${SIZE.reactStack}kB`}>
					<div class="scale__row">
						<div class="scale__name">
							<span class="mono">01</span>
							<b>Preact</b>
						</div>
						<div class="scale__track">
							<span ref={barRef} class="scale__bar scale__bar--brand" style={{ width: `${ratio}%` }} />
						</div>
						<div class="scale__value">
							<span ref={preactRef}>0.0</span>
							<small>kB</small>
						</div>
					</div>
					<div class="scale__row">
						<div class="scale__name">
							<span class="mono">02</span>
							<b>React + ReactDOM</b>
						</div>
						<div class="scale__track">
							<span class="scale__bar" style={{ width: '100%' }} />
						</div>
						<div class="scale__value">
							<span ref={stackRef}>0</span>
							<small>kB</small>
						</div>
					</div>
					<div class="scale__axis mono">
						<span>0</span>
						<span>约 {SIZE.reactStack} kB（gzip）</span>
					</div>
				</div>

				<div class="scale__notes">
					<p class="prose">
						{'首屏的点阵是 64 × 64 = 4 096 个点，每一点代表一字节。整个运行时就装在这个方格子里：虚拟 DOM、组件、diff、事件、hydration 与调度入口都在其中。'}
					</p>
					<ul class="scale__list">
						<li>
							<span class="mono">A</span> 少下载：更少的字节经过网络
						</li>
						<li>
							<span class="mono">B</span> 少解析：更短的代码进入 JS 引擎
						</li>
						<li>
							<span class="mono">C</span> 少执行：渲染路径没有多余抽象
						</li>
					</ul>
					<p class="scale__source mono">SOURCE · {SIZE.note}</p>
				</div>
			</div>
		</section>
	);
}
