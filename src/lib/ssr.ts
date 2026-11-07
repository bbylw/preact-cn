import { options } from 'preact';
import type { VNode } from 'preact';
import renderToString from 'preact-render-to-string';

/**
 * preact-render-to-string 6 会调用 Preact 11 的内部钩子
 * （options.__r / options.__b / options.diffed 等）。这些钩子由
 * preact/hooks 注册，会改写模块级的 currentComponent，且 SSR 结束后
 * 不会还原，从而让同页后续的 hooks 调用全部失效。浏览器里同页使用时，
 * 必须在调用期间临时摘掉并在 finally 中恢复。
 * 本站只用 class 组件做服务端输出，因此不依赖 SSR 期间的 hooks 支持。
 */
const DETACHED = [
	'__b',
	'__r',
	'__c',
	'__',
	'__s',
	'__e',
	'diffed',
	'unmount',
	'vnode',
	'errorBoundaries',
] as const;
type MutableOptions = Record<string, unknown>;

export function renderToHtml(vnode: VNode<any>): string {
	const target = options as unknown as MutableOptions;
	const saved = DETACHED.map(key => target[key]);
	DETACHED.forEach(key => {
		delete target[key];
	});

	try {
		return renderToString(vnode);
	} finally {
		DETACHED.forEach((key, index) => {
			if (saved[index] !== undefined) target[key] = saved[index];
			else delete target[key];
		});
	}
}
