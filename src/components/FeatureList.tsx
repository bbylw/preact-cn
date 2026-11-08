import { FEATURES } from '../data/content';
import { SectionHead } from './ui';

export function FeatureList() {
	return (
		<section class="band section" id="features">
			<SectionHead
				index="02"
				kicker="CAPABILITIES / 07"
				title="4kB 里，究竟装了什么"
				note="拥有虚拟 DOM 组件的全部能力，却没有相应的开销。下面每一条都来自官方 README，本文用实验台把可验证的部分逐项跑了一遍。"
			/>

			<div class="features" data-reveal>
				<aside class="features__side">
					<p class="prose">
						刚才看到的是一次更新。接下来沿着同一条渲染路径，继续检查调度、服务端补水与多种组件写法。
					</p>
					<div class="features__figure" aria-hidden="true">
						<span class="mono">07</span>
						<span class="mono">/ CAPABILITIES</span>
					</div>
					<a class="text-link" href="#scheduler">
						继续探索调度器 →
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
