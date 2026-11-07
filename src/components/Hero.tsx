import { useEffect, useRef } from 'preact/hooks';
import type { Theme } from '../lib/theme';
import { PREACT_VERSION, SIZE } from '../data/content';
import { CopyButton } from './ui';

function ByteGrid(props: { theme: Theme }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		const side = 384;
		const cols = SIZE.grid;
		const step = side / cols;
		const total = cols * cols;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = side * dpr;
		canvas.height = side * dpr;
		ctx.scale(dpr, dpr);

		const styles = getComputedStyle(document.documentElement);
		const dim = styles.getPropertyValue('--grid-dim').trim() || '#d6d4cc';
		const brand = styles.getPropertyValue('--brand').trim() || '#5c34a6';

		const dot = (index: number, color: string) => {
			const x = (index % cols) * step + step / 2;
			const y = Math.floor(index / cols) * step + step / 2;
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.arc(x, y, 1.35, 0, Math.PI * 2);
			ctx.fill();
		};

		for (let i = 0; i < total; i++) dot(i, dim);

		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			for (let i = 0; i < total; i++) dot(i, brand);
			return;
		}

		let frame = 0;
		let drawn = 0;
		let start = 0;

		const paint = (time: number) => {
			if (!start) start = time;
			const progress = Math.min(1, (time - start) / 1500);
			const eased = 1 - Math.pow(1 - progress, 3);
			const target = Math.floor(total * eased);
			for (let i = drawn; i < target; i++) dot(i, brand);
			drawn = target;
			if (progress < 1) frame = requestAnimationFrame(paint);
		};

		const startAnimation = () => {
			frame = requestAnimationFrame(paint);
		};

		let triggered = false;
		const io = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && !triggered) {
					triggered = true;
					startAnimation();
					io.disconnect();
				}
			},
			{ threshold: 0.25 }
		);
		io.observe(canvas);

		return () => {
			io.disconnect();
			cancelAnimationFrame(frame);
		};
	}, [props.theme]);

	return (
		<canvas
			ref={canvasRef}
			class="bytegrid"
			width="384"
			height="384"
			role="img"
			aria-label={`${SIZE.bytes} 个点组成的点阵，每点代表一字节，合计 4kB`}
		/>
	);
}

export function Hero(props: { theme: Theme }) {
	return (
		<section class="hero shell" id="top">
			<div class="hero__grid">
				<div class="hero__copy" data-reveal>
					<div class="hero__eyebrow">
						<span class="eyebrow">中文技术刊物 · 第 01 期</span>
						<span class="hero__rule" />
						<span class="mono hero__issue">PREACT / VIRTUAL DOM</span>
					</div>

					<h1 class="hero__title">
						把虚拟 DOM
						<br />
						装进 <em>4kB</em>
					</h1>

					<p class="hero__lede">
						与 React API 完全一致、体积小巧的现代替代方案。拥有虚拟 DOM 组件的全部能力，却没有相应的开销。
						这一页不是截图：下面的每个实验台，都由本站正在运行的 Preact {PREACT_VERSION} 亲自驱动。
					</p>

					<div class="hero__actions">
						<a class="btn btn--primary" href="#diff">
							进入 diff 实验台
							<svg viewBox="0 0 16 16" aria-hidden="true">
								<path d="M2 8h11M9 4l4 4-4 4" />
							</svg>
						</a>
						<CopyButton value="bun add preact" label="复制安装命令" />
					</div>

					<dl class="hero__facts">
						<div>
							<dt class="mono">RUNTIME</dt>
							<dd>4 kB / gzip</dd>
						</div>
						<div>
							<dt class="mono">LICENSE</dt>
							<dd>MIT</dd>
						</div>
						<div>
							<dt class="mono">TOOLING</dt>
							<dd>JSX · HMR · SSR</dd>
						</div>
						<div>
							<dt class="mono">TARGET</dt>
							<dd>所有现代浏览器</dd>
						</div>
					</dl>
				</div>

				<div class="hero__instrument" data-reveal>
					<div class="instrument__head mono">
						<span>FIG. 01 / RUNTIME FOOTPRINT</span>
						<span class="instrument__live">
							<i aria-hidden="true" /> LIVE
						</span>
					</div>
					<div class="instrument__body">
						<div class="instrument__number">
							<span>4</span>
							<div class="instrument__unit">
								<b>kB</b>
								<small>gzip</small>
							</div>
						</div>
						<ByteGrid theme={props.theme} />
					</div>
					<div class="instrument__foot mono">
						<span>64 × 64 = {SIZE.bytes} BYTES</span>
						<span>1 DOT = 1 BYTE</span>
					</div>
				</div>
			</div>

			<div class="hero__strip" aria-hidden="true">
				<span class="mono">render()</span>
				<span class="hero__ticks" />
				<span class="mono">hydrate()</span>
				<span class="hero__ticks" />
				<span class="mono">options.debounceRendering</span>
				<span class="hero__ticks" />
				<span class="mono">preact/compat</span>
			</div>
		</section>
	);
}
