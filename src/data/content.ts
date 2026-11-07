import type { CodeLang } from '../lib/highlight';

export const PREACT_VERSION = '11.2.0';

export interface Snippet {
	title: string;
	lang: CodeLang;
	code: string;
	note?: string;
}

export const FEATURES = [
	{
		n: '01',
		title: '熟悉的 React API',
		body: 'ES6 Class、Hooks 与函数组件都在；写法一致，心智负担不增加。',
		tag: 'API',
	},
	{
		n: '02',
		title: 'preact/compat 别名',
		body: '把 react 与 react-dom 指过去，既有的 React 组件与生态库原样可用。',
		tag: '生态',
	},
	{
		n: '03',
		title: '开箱即用的工具链',
		body: 'JSX、虚拟 DOM、DevTools、HMR、SSR，不需要额外装配一整套框架。',
		tag: '工具链',
	},
	{
		n: '04',
		title: '高度优化的 diff',
		body: '只改动真正变化的节点；服务端渲染的标记可以无缝衔接 hydration。',
		tag: '渲染',
	},
	{
		n: '05',
		title: '覆盖现代浏览器',
		body: '不依赖新语法特性才能运行，也不把兼容层的体积转嫁给用户。',
		tag: '兼容',
	},
	{
		n: '06',
		title: '透明异步渲染',
		body: '同一批状态更新合并成一次提交；调度器可替换成微任务、动画帧或空闲时段。',
		tag: '调度',
	},
	{
		n: '07',
		title: '4kB 的运行时',
		body: 'gzip 后约 4kB。体积不是靠删功能换来的，而是靠不做重复实现。',
		tag: '体积',
	},
] as const;

export const SIZE = {
	preact: 4,
	reactStack: 45,
	bytes: 4096,
	grid: 64,
	note: '以 gzip 压缩后的运行时体积计。Preact 数值来自官方体积徽标；对比值为公开打包体积的常见口径，属约数。',
} as const;

export const LINKS = {
	site: 'https://preactjs.com',
	repo: 'https://github.com/preactjs/preact',
	awesome: 'https://github.com/preactjs/awesome-preact',
	devtools: 'https://github.com/preactjs/preact-devtools',
	compat: 'https://github.com/preactjs/preact/tree/main/compat',
	npm: 'https://www.npmjs.com/package/preact',
} as const;

export const CODE: Record<string, Snippet> = {
	install: {
		title: '安装',
		lang: 'bash',
		code: 'bun add preact',
	},
	render: {
		title: 'render() 建立与更新同一棵树',
		lang: 'js',
		code: `import { h, render } from 'preact';

/** @jsx h */
render(
  <main><h1>Hello</h1></main>,
  document.body
);

// 第二次调用复用已有 DOM，只更新 <h1> 的文本
render(
  <main><h1>Hello World!</h1></main>,
  document.body
);`,
		note: '来自官方 README 的第一个例子，右侧实验台用 MutationObserver 把「一次 DOM 操作」实测出来。',
	},
	component: {
		title: '组件 + Hooks',
		lang: 'js',
		code: `import { render } from 'preact';
import { useState } from 'preact/hooks';

const App = () => {
  const [input, setInput] = useState('');
  return (
    <div>
      <p>你是否同意这句话：「Preact 棒极了」？</p>
      <input value={input} onInput={e => setInput(e.target.value)} />
    </div>
  );
};

render(<App />, document.body);`,
		note: '官方 README 的第二个例子。组件把 diff 范围收敛到自身挂载点。',
	},
	scheduler: {
		title: '替换调度器',
		lang: 'js',
		code: `import { options } from 'preact';

// 同一事件里的多次 setState 会被合并排队
options.debounceRendering = cb => {
  requestAnimationFrame(() => cb());
};

// 连续三次 setState，只会提交一次`,
		note: 'Preact 把「何时渲染」交给 options.debounceRendering，右侧可以切换三种真实调度策略。',
	},
	ssr: {
		title: '服务端输出与补水',
		lang: 'js',
		code: `import renderToString from 'preact-render-to-string';
import { hydrate } from 'preact';

const html = renderToString(<Card name="Preact" />);
// 服务端把 html 写进页面，浏览器端：
hydrate(<Card name="Preact" />, container);`,
		note: 'hydrate 复用服务端已有的标记，只接管事件与后续更新。',
	},
	jsx: {
		title: 'JSX（经 Vite 编译）',
		lang: 'js',
		code: `import { render } from 'preact';

const Badge = ({ label }) => (
  <span class="badge"><b>{label}</b><i>4kB</i></span>
);

render(<Badge label="Preact" />, document.body);`,
	},
	htm: {
		title: 'HTM（无需构建工具）',
		lang: 'js',
		code: [
			"import { html } from 'htm/preact';",
			"import { render } from 'preact';",
			'',
			"const Badge = ({ label }) => html`",
			'  <span class="badge"><b>${label}</b><i>4kB</i></span>',
			'`;',
			'',
			"render(html`<${Badge} label=\"Preact\" />`, document.body);",
		].join('\n'),
		note: '官方 README 提到的 HTM：用标签模板描述同一棵树，本站真的用 htm/preact 渲染了右侧这枚徽章。',
	},
	alias: {
		title: 'preact/compat 别名',
		lang: 'ts',
		code: `// vite.config.ts —— 本站真实配置
resolve: {
  alias: [
    { find: /^react$/, replacement: 'preact/compat' },
    { find: /^react-dom$/, replacement: 'preact/compat' }
  ]
}

// 于是这段 React 代码无需改写
import { useState, memo } from 'react';`,
		note: '右侧的徽章由 preact/compat 的 createElement 生成，与 JSX、HTM 两种写法产出完全相同的 DOM。',
	},
};
