import { FEATURES } from '../data/content';
import { SectionHead } from './ui';

export function FeatureList() {
	return (
		<section class="band section" id="features">
			<SectionHead
				index="01"
				kicker="CAPABILITIES / 07"
				title="4kB 里，究竟装了什么"
				note="拥有虚拟 DOM 组件的全部能力，却没有相应的开销。下面每一条都来自官方 README，本文用实验台把可验证的部分逐项跑了一遍。"
			/>

			<div class="features" data-reveal>
				<aside class="features__side">
					<p class="prose">
						体积不是靠删功能换来的。Preact 把注意力放在渲染路径本身：更短的代码、更少的抽象层、可以直接替换的调度入口。
					</p>
					<div class="features__figure" aria-hidden="true">
						<span class="mono">07</span>
						<span class="mono">/ CAPABILITIES</span>
					</div>
					<a class="text-link" href="#diff">
						从 diff 实验台开始验证 →
					</a>
				</aside>

				<ol class="features__list">
					{FEATURES.map(feature => (
						<li key={feature.n}>
							<span class="features__n mono">{feature.n}</span>
							<div class="features__body">
								<h3>{feature.title}</h3>
								<p>{feature.body}</p>
							</div>
							<span class="features__tag mono">{feature.tag}</span>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
