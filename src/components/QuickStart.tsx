import { CODE, LINKS } from '../data/content';
import { CodeBlock, CopyButton, SectionHead } from './ui';

export function QuickStart() {
	return (
		<section class="band section section--start" id="start">
			<SectionHead
				index="07"
				kicker="QUICK START"
				title="写第一个 4kB 应用"
				note="官方 README 的两个例子，加上本站使用的安装方式。复制即可运行：构建工具由 Vite 提供，运行时只有 Preact。"
			/>

			<div class="start" data-reveal>
				<div class="start__install">
					<div class="start__install-head mono">
						<span>01 / INSTALL</span>
						<span>BUN</span>
					</div>
					<p class="start__command">
						<span class="start__prompt mono">$</span>
						<code>bun add preact</code>
						<CopyButton value={CODE.install.code} label="复制命令" />
					</p>
					<p class="start__install-note">
						本站技术栈：Preact · TypeScript · Vite · Bun。别名已配好，HMR 开箱即用。
					</p>
					<div class="start__links">
						<a class="btn btn--primary" href={LINKS.site} target="_blank" rel="noreferrer">
							访问 Preact 官网
						</a>
						<a class="start__link mono" href={LINKS.repo} target="_blank" rel="noreferrer">
							GitHub 源码
						</a>
						<a class="start__link mono" href={LINKS.awesome} target="_blank" rel="noreferrer">
							awesome-preact
						</a>
					</div>
				</div>

				<div class="start__snippets">
					<CodeBlock snippet={CODE.render} />
					<CodeBlock snippet={CODE.component} />
				</div>
			</div>
		</section>
	);
}
