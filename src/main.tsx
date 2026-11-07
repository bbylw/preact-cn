import { render } from 'preact';
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles/global.css';
import { App } from './app';

document.documentElement.classList.add('has-js');
const root = document.getElementById('app');
if (root) render(<App />, root);
