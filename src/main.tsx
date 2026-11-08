import { render } from 'preact';
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles/global.css';
import { App } from './app';

document.documentElement.classList.add('has-js');
const root = document.getElementById('app');
if (root) {
	// 清掉 index.html 里的首屏加载骨架，再交给 Preact 接管
	root.replaceChildren();
	render(<App />, root);
}
