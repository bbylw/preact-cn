import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { Snippet } from '../data/content';
import { highlight } from '../lib/highlight';

export function SectionHead(props: {
	index: string;
	kicker: string;
	title: string;
	note?: string;
	children?: ComponentChildren;
}) {
	return (
		<header class="section-head" data-reveal>
			<div class="section-head__meta">
				<span class="eyebrow">第 {props.index} 节</span>
				<span class="section-head__kicker mono">{props.kicker}</span>
			</div>
			<h2 class="section-head__title">{props.title}</h2>
			{props.note && <p class="section-head__note">{props.note}</p>}
			{props.children}
		</header>
	);
}

function fallbackCopy(value: string): boolean {
	const field = document.createElement('textarea');
	field.value = value;
	field.setAttribute('readonly', '');
	field.style.position = 'fixed';
	field.style.opacity = '0';
	document.body.appendChild(field);
	field.select();
	let ok = false;
	try {
		ok = document.execCommand('copy');
	} catch {
		ok = false;
	}
	field.remove();
	return ok;
}

export function CopyButton(props: { value: string; label?: string }) {
	const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');

	const copy = async () => {
		let ok = false;
		try {
			await navigator.clipboard.writeText(props.value);
			ok = true;
		} catch {
			ok = fallbackCopy(props.value);
		}
		setState(ok ? 'ok' : 'fail');
		window.setTimeout(() => setState('idle'), 1900);
	};

	return (
		<button
			type="button"
			class={`copy-btn${state === 'fail' ? ' copy-btn--fail' : ''}`}
			data-state={state}
			onClick={copy}
			aria-label={props.label ?? '复制代码'}
		>
			<svg viewBox="0 0 16 16" aria-hidden="true">
				<rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.4" />
				<path d="M3.2 10.8V4.6A1.4 1.4 0 0 1 4.6 3.2h6.2" />
			</svg>
			{state === 'ok' ? '已复制' : state === 'fail' ? '复制失败' : (props.label ?? '复制')}
			<span class="sr-only" role="status">
				{state === 'ok' ? '代码已复制到剪贴板' : state === 'fail' ? '复制失败，请手动选择' : ''}
			</span>
		</button>
	);
}

export function CodeBlock(props: { snippet: Snippet; compact?: boolean }) {
	const { snippet } = props;
	return (
		<figure class={`codeblock${props.compact ? ' codeblock--compact' : ''}`} data-reveal>
			<figcaption class="codeblock__head">
				<span class="codeblock__title">{snippet.title}</span>
				<span class="codeblock__lang mono">{snippet.lang}</span>
				<CopyButton value={snippet.code} />
			</figcaption>
			<pre class="codeblock__pre">
				<code dangerouslySetInnerHTML={{ __html: highlight(snippet.code, snippet.lang) }} />
			</pre>
			{snippet.note && <p class="codeblock__note">{snippet.note}</p>}
		</figure>
	);
}

export function Stat(props: { label: string; value: string; unit?: string; hint?: string }) {
	return (
		<div class="stat">
			<span class="stat__label mono">{props.label}</span>
			<span class="stat__value">
				{props.value}
				{props.unit && <small>{props.unit}</small>}
			</span>
			{props.hint && <span class="stat__hint">{props.hint}</span>}
		</div>
	);
}

export function Panel(props: { title: string; meta?: string; children: ComponentChildren; class?: string }) {
	return (
		<div class={`panel${props.class ? ` ${props.class}` : ''}`}>
			<div class="panel__head">
				<span class="panel__title mono">{props.title}</span>
				{props.meta && <span class="panel__meta mono">{props.meta}</span>}
			</div>
			<div class="panel__body">{props.children}</div>
		</div>
	);
}
