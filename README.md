<p align="center">
<a href="https://preactjs.com" target="_blank">

![Preact](https://raw.githubusercontent.com/preactjs/preact/8b0bcc927995c188eca83cba30fbc83491cc0b2f/logo.svg?sanitize=true 'Preact')

</a>
</p>
<p align="center">与 React API 完全一致、体积小巧（仅 4kB）的现代替代方案。</p>

**拥有虚拟 DOM 组件的全部能力，却没有相应的开销：**

- 熟悉的 React API 与开发模式：ES6 Class、Hooks 与函数组件
- 通过简单的 [preact/compat] 别名即可获得广泛的 React 兼容能力
- 开箱即用：JSX、<abbr title="Virtual DOM">VDOM</abbr>、[DevTools]、<abbr title="Hot Module Replacement">HMR</abbr>、<abbr title="Server-Side Rendering">SSR</abbr>。
- 高度优化的 diff 算法，以及由服务端渲染（SSR）无缝衔接的 hydration
- 支持所有现代浏览器
- 透明异步渲染，支持可插拔的调度器

### 💁 更多信息请访问 [Preact 官网 ➞](https://preactjs.com)

<table border="0">
<tbody>
<tr>
<td>

[![npm](https://img.shields.io/npm/v/preact.svg)](https://www.npmjs.com/package/preact)
[![Preact Slack Community](https://img.shields.io/badge/Slack%20Community-preact.slack.com-blue)](https://chat.preactjs.com)
[![OpenCollective Backers](https://opencollective.com/preact/backers/badge.svg)](#backers)
[![OpenCollective Sponsors](https://opencollective.com/preact/sponsors/badge.svg)](#sponsors)

[![coveralls](https://img.shields.io/coveralls/preactjs/preact/main.svg)](https://coveralls.io/github/preactjs/preact)
[![gzip size](https://img.badgesize.io/https://unpkg.com/preact/dist/preact.mjs?compression=gzip&label=gzip)](https://unpkg.com/preact/dist/preact.mjs)
[![Drydock review](https://img.shields.io/endpoint?url=https%3A%2F%2Fdrydock.org%2Fpublic%2Fbadge%2Fnpm%2Fpreact)](https://drydock.org/diff/preact)

</td>
</tr>
</tbody>
</table>

你可以在 [awesome-preact 列表](https://github.com/preactjs/awesome-preact) 中找到一些很棒的库 :sunglasses:

---

## 快速开始

> 💁 _**注意：** 使用 Preact [并不要求 ES2015](https://github.com/developit/preact-in-es3)……不过还是值得一试！_

#### 教程：使用 Preact 构建 UI

使用 Preact 时，你通过拼装组件树与元素树来构建用户界面。组件是函数或类，返回对其应当输出的树结构的描述。这些描述通常用 [JSX](https://react.dev/learn/writing-markup-with-jsx)（如下方所示）编写，或使用 [HTM](https://github.com/developit/htm)（它借助标准的 JavaScript 标签模板）。两种语法都能表达带有「props」（类似于 HTML 属性）和子节点的元素树。

要开始使用 Preact，首先来看 `render()` 函数。该函数接收一个树结构描述，并创建所描述的结构。接着，它会把这个结构追加到作为第二个参数传入的父级 DOM 元素上。后续对 `render()` 的调用会复用已有的树，并在 DOM 中原地更新。在内部，`render()` 会计算与之前输出结构之间的差异，以尽可能少地执行 DOM 操作。

```js
import { h, render } from 'preact';
// 告诉 babel 使用 h 作为 JSX 的 pragma。更好的做法是在全局配置。
// 详见 https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#usage
// 在 tsconfig 中可通过 jsxFactory 指定
/** @jsx h */

// 创建我们的树并追加到 document.body：
render(
	<main>
		<h1>Hello</h1>
	</main>,
	document.body
);

// 原地更新这棵树：
render(
	<main>
		<h1>Hello World!</h1>
	</main>,
	document.body
);
// ^ 第二次调用 render(...) 只会执行一次 DOM 操作来更新 <h1> 的文本
```

太棒了！`render()` 已经把我们的结构转换成了一个用户界面！这种方式展示了一个简单的例子，但随着应用复杂度增长，直接使用会变得困难。每次变更都得为整个应用计算当前结构与更新后结构之间的差异。组件可以解决这个问题——把用户界面拆分成嵌套的组件，每个组件只需计算自身挂载点处的差异。下面是一个例子：

```js
import { render, h } from 'preact';
import { useState } from 'preact/hooks';

/** @jsx h */

const App = () => {
	const [input, setInput] = useState('');

	return (
		<div>
			<p>你是否同意这句话：「Preact 棒极了」？</p>
			<input value={input} onInput={e => setInput(e.target.value)} />
		</div>
	);
};

render(<App />, document.body);
```

---

## 赞助商

成为赞助商，把你的 Logo 展示在我们的 GitHub README 上，并附上指向你网站的链接。[[成为赞助商](https://opencollective.com/preact#sponsor)]

<a href="https://opencollective.com/preact/sponsor/0/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/1/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/2/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/3/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/4/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/4/avatar.svg"></a>
<a href="https://snyk.co/preact" target="_blank"><img src="https://res.cloudinary.com/snyk/image/upload/snyk-marketingui/brand-logos/wordmark-logo-color.svg" width="192" height="64"></a>
<a href="https://opencollective.com/preact/sponsor/5/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/6/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/7/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/8/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/9/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/10/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/11/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/12/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/13/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/14/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/15/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/15/avatar.svg"></a>
<a href="https://github.com/guardian" target="_blank"> &nbsp; &nbsp; &nbsp; <img src="https://github.com/guardian.png" width="64" height="64"> &nbsp; &nbsp; &nbsp; </a>
<a href="https://www.sent.dm" target="_blank"><img src="https://github.com/sentdm.png?size=64" alt="SentDM" width="64" height="64" hspace="96"></a>
<a href="https://www.songsterr.com/" target="_blank"><img src="https://github.com/songsterr.png?size=64" alt="Songsterr" width="64" height="64" hspace="96"></a>
<a href="https://deno.land" target="_blank"><img src="https://github.com/denoland.png?size=64" alt="Deno" width="64" height="64" hspace="96"></a>
<a href="https://opencollective.com/preact/sponsor/16/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/17/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/18/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/19/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/20/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/21/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/22/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/23/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/24/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/25/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/26/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/27/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/28/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/preact/sponsor/29/website" target="_blank"><img src="https://opencollective.com/preact/sponsor/29/avatar.svg"></a>

## 支持者

每月捐赠以支持我们，帮助我们持续开展各项活动。[[成为支持者](https://opencollective.com/preact#backer)]

<a href="https://opencollective.com/preact/backer/0/website" target="_blank"><img src="https://opencollective.com/preact/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/1/website" target="_blank"><img src="https://opencollective.com/preact/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/2/website" target="_blank"><img src="https://opencollective.com/preact/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/3/website" target="_blank"><img src="https://opencollective.com/preact/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/4/website" target="_blank"><img src="https://opencollective.com/preact/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/5/website" target="_blank"><img src="https://opencollective.com/preact/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/6/website" target="_blank"><img src="https://opencollective.com/preact/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/7/website" target="_blank"><img src="https://opencollective.com/preact/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/8/website" target="_blank"><img src="https://opencollective.com/preact/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/9/website" target="_blank"><img src="https://opencollective.com/preact/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/10/website" target="_blank"><img src="https://opencollective.com/preact/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/11/website" target="_blank"><img src="https://opencollective.com/preact/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/12/website" target="_blank"><img src="https://opencollective.com/preact/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/13/website" target="_blank"><img src="https://opencollective.com/preact/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/14/website" target="_blank"><img src="https://opencollective.com/preact/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/15/website" target="_blank"><img src="https://opencollective.com/preact/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/16/website" target="_blank"><img src="https://opencollective.com/preact/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/17/website" target="_blank"><img src="https://opencollective.com/preact/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/18/website" target="_blank"><img src="https://opencollective.com/preact/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/19/website" target="_blank"><img src="https://opencollective.com/preact/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/20/website" target="_blank"><img src="https://opencollective.com/preact/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/21/website" target="_blank"><img src="https://opencollective.com/preact/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/22/website" target="_blank"><img src="https://opencollective.com/preact/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/23/website" target="_blank"><img src="https://opencollective.com/preact/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/24/website" target="_blank"><img src="https://opencollective.com/preact/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/25/website" target="_blank"><img src="https://opencollective.com/preact/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/26/website" target="_blank"><img src="https://opencollective.com/preact/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/27/website" target="_blank"><img src="https://opencollective.com/preact/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/28/website" target="_blank"><img src="https://opencollective.com/preact/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/preact/backer/29/website" target="_blank"><img src="https://opencollective.com/preact/backer/29/avatar.svg"></a>

---

## 许可证

MIT

[![Preact](https://i.imgur.com/YqCHvEW.gif)](https://preactjs.com)

[preact/compat]: https://github.com/preactjs/preact/tree/main/compat
[hyperscript]: https://github.com/dominictarr/hyperscript
[DevTools]: https://github.com/preactjs/preact-devtools
