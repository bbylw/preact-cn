import { chromium } from 'playwright-core';

const BASE = process.env.VERIFY_BASE ?? 'http://127.0.0.1:8199/';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const failures = [];
const passes = [];

function check(name, ok, detail = '') {
	if (ok) passes.push(name);
	else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch({
	executablePath: CHROME,
	headless: true,
	args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function openPage(theme, viewport) {
	const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
	await context.addInitScript(value => {
		try {
			localStorage.setItem('preact-cn-theme', value);
		} catch {}
	}, theme);
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	page.on('console', message => {
		if (message.type() === 'error') errors.push(message.text());
	});
	await page.goto(BASE, { waitUntil: 'networkidle' });
	await page.waitForTimeout(700);
	return { context, page, errors };
}

async function audit(page, label, theme) {
	const result = await page.evaluate(() => {
		const out = {
			h1: document.querySelectorAll('h1').length,
			overflow: document.documentElement.scrollWidth - window.innerWidth,
			emptyLinks: Array.from(document.querySelectorAll('a')).filter(
				link => !link.getAttribute('href') || link.getAttribute('href') === '#'
			).length,
			theme: document.documentElement.dataset.theme,
			tokens: document.querySelectorAll('.tok-k').length,
			canvas: (() => {
				const canvas = document.querySelector('.bytegrid');
				if (!canvas) return 0;
				const ctx = canvas.getContext('2d');
				const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
				let painted = 0;
				for (let i = 3; i < data.length; i += 4) if (data[i] > 0) painted++;
				return painted;
			})(),
			edges: (() => {
				const list = [];
				for (const section of document.querySelectorAll('main section')) {
					const inner = section.querySelector('.section-head, .hero__grid');
					if (!inner) continue;
					const rect = inner.getBoundingClientRect();
					const left = rect.left;
					const right = window.innerWidth - rect.right;
					if (left < 12 || right < 12) {
						list.push(`${section.id || 'hero'} L${Math.round(left)} R${Math.round(right)}`);
					}
				}
				return list;
			})(),
			navClipped: (() => {
				const nav = document.querySelector('.topnav');
				if (!nav) return 0;
				nav.style.scrollBehavior = 'auto';
				const box = nav.getBoundingClientRect();
				let inaccessible = 0;
				for (const link of nav.querySelectorAll('a')) {
					link.focus();
					const rect = link.getBoundingClientRect();
					if (rect.right > box.right + 1 || rect.left < box.left - 1) inaccessible++;
				}
				nav.scrollTo({ left: 0, behavior: 'instant' });
				return inaccessible;
			})(),
		};
		return out;
	});

	check(`${label} / 单个 h1`, result.h1 === 1, `实际 ${result.h1}`);
	check(`${label} / 无横向溢出`, result.overflow <= 1, `超出 ${result.overflow}px`);
	check(`${label} / 无空链接`, result.emptyLinks === 0, `${result.emptyLinks} 处`);
	check(`${label} / 主题正确`, result.theme === theme, `期望 ${theme}，实际 ${result.theme}`);
	check(`${label} / 代码高亮已生成`, result.tokens > 0, `${result.tokens} 个 token`);
	check(`${label} / 4kB 点阵已绘制`, result.canvas > 1000, `${result.canvas} 个像素`);
	check(`${label} / 章节左右留白`, result.edges.length === 0, result.edges.join(' | '));
	check(`${label} / 导航未被裁切`, result.navClipped === 0, `${result.navClipped} 项`);

	await page.evaluate(async () => {
		document.documentElement.style.scrollBehavior = 'auto';
		const height = document.body.scrollHeight;
		for (let y = 0; y <= height; y += Math.max(300, window.innerHeight / 2)) {
			window.scrollTo(0, y);
			await new Promise(resolve => setTimeout(resolve, 90));
		}
		window.scrollTo(0, height);
		await new Promise(resolve => setTimeout(resolve, 300));
		window.scrollTo(0, 0);
	});
	await page.waitForTimeout(1000);

	const hidden = await page.evaluate(
		() =>
			Array.from(document.querySelectorAll('[data-reveal]')).filter(
				node => !node.classList.contains('is-in')
			).length
	);
	check(`${label} / 进场动画全部完成`, hidden === 0, `${hidden} 个元素仍隐藏`);
}

async function contrast(page, label) {
	const offenders = await page.evaluate(() => {
		const parse = value => {
			const match = value.match(/rgba?\(([^)]+)\)/);
			if (!match) return null;
			const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
			return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
		};
		const lum = color => {
			const channels = [color.r, color.g, color.b].map(channel => {
				const c = channel / 255;
				return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
			});
			return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
		};
		const backgroundOf = element => {
			let node = element;
			while (node && node !== document.documentElement) {
				const bg = parse(getComputedStyle(node).backgroundColor);
				if (bg && bg.a >= 0.9) return bg;
				node = node.parentElement;
			}
			return parse(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };
		};

		const selectors = 'p, span, a, li, dt, dd, button, small, b, strong, h1, h2, h3, h4, label, figcaption';
		const list = [];
		for (const element of document.querySelectorAll(selectors)) {
			if (element.closest('pre, code, .codeblock, .html-out, .syntax-markup, svg')) continue;
			if (element.children.length > 0 && !element.textContent.trim()) continue;
			const text = element.textContent.trim();
			if (!text) continue;
			const style = getComputedStyle(element);
			if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.9) continue;
			const rect = element.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) continue;
			const fg = parse(style.color);
			const bg = backgroundOf(element);
			if (!fg || !bg) continue;
			const l1 = lum(fg);
			const l2 = lum(bg);
			const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
			const size = parseFloat(style.fontSize);
			const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
			const minimum = large ? 3 : 4.5;
			if (ratio < minimum) {
				list.push(`${element.className || element.tagName} "${text.slice(0, 18)}" ${ratio.toFixed(2)}:1`);
			}
		}
		return list;
	});
	check(`${label} / 文本对比度`, offenders.length === 0, offenders.slice(0, 6).join(' | '));
}

async function interactions(page) {
	// 01 diff：再次 render() 应只改动标题文本节点
	await page.locator('#diff').scrollIntoViewIfNeeded();
	await page.getByRole('button', { name: '再次 render()' }).click();
	await page.waitForTimeout(180);
	const diffLog = await page.locator('#diff .log li').first().innerText();
	check('diff / render #2 有事件日志', diffLog.includes('render #2'), diffLog);
	const mutationValue = (await page.locator('#diff .stat__value').nth(1).innerText()).trim();
	check('diff / 统计到 DOM 变更', Number(mutationValue) >= 1, mutationValue);
	await page.getByRole('button', { name: '追加子节点' }).click();
	await page.waitForTimeout(150);
	const listCount = await page.locator('#diff .dtree__list li').count();
	check('diff / 追加子节点生效', listCount === 3, `${listCount} 项`);

	// 02 调度器：三次 setState 合并成一次提交
	await page.locator('#scheduler').scrollIntoViewIfNeeded();
	await page.getByRole('button', { name: '连续触发 3 次 setState' }).click();
	await page.waitForTimeout(500);
	const schedulerValues = await page.locator('#scheduler .stat__value').allInnerTexts();
	check('scheduler / 只排队一次', schedulerValues[1].trim() === '1', schedulerValues[1]);
	check('scheduler / 只提交一次', schedulerValues[2].trim() === '1', schedulerValues[2]);
	const domValue = await page.locator('#scheduler .log__head').innerText();
	check('scheduler / 状态值到达 3', domValue.includes('3'), domValue.replace(/\n/g, ' '));

	// 03 SSR：hydrate 不替换节点，且按钮事件被接管
	await page.locator('#ssr').scrollIntoViewIfNeeded();
	await page.getByRole('button', { name: '执行 hydrate()' }).click();
	await page.waitForTimeout(200);
	const replaced = (await page.locator('#ssr .stat__value').first().innerText()).trim();
	check('ssr / hydrate 未重建 DOM', replaced === '0', replaced);
	await page.locator('#ssr .ssr-card button').click();
	await page.waitForTimeout(150);
	const pings = await page.locator('#ssr .ssr-card__count').innerText();
	check('ssr / 事件已被接管', pings.includes('1'), pings);
	const whiteSpace = await page.evaluate(
		() => getComputedStyle(document.querySelector('#ssr .html-out pre')).whiteSpace
	);
	check('ssr / 输出自动折行', whiteSpace === 'pre-wrap', whiteSpace);

	// 04 三种写法产出相同标记
	await page.locator('#syntax').scrollIntoViewIfNeeded();
	for (const name of ['JSX', 'HTM', 'preact/compat']) {
		await page.getByRole('tab', { name: new RegExp(name) }).click();
		await page.waitForTimeout(160);
		const match = (await page.locator('#syntax .stat__value').first().innerText()).trim();
		const badge = await page.locator('#syntax .badge-host .badge').count();
		check(`syntax / ${name} 标记一致`, match === '一致' && badge === 1, `${match} badge=${badge}`);
	}

	// 05 导航当前区块高亮
	await page.locator('#ssr').scrollIntoViewIfNeeded();
	await page.waitForTimeout(450);
	const current = await page.locator('.topnav a[href="#ssr"]').getAttribute('aria-current');
	check('nav / 当前区块高亮', current === 'true', String(current));

	// 06 体积条与数字动画
	await page.locator('#scale').scrollIntoViewIfNeeded();
	await page.waitForTimeout(1600);
	const scaleValue = (await page.locator('#scale .scale__value').first().innerText()).trim();
	const barScale = await page.evaluate(() => {
		const element = document.querySelector('#scale .scale__bar--brand');
		return new DOMMatrixReadOnly(getComputedStyle(element).transform).a;
	});
	check('scale / 数字计数到 4.0', scaleValue.startsWith('4.0'), scaleValue);
	check('scale / 品牌条展开', barScale > 0.9, String(barScale));

	// 07 主题切换
	const before = await page.evaluate(() => document.documentElement.dataset.theme);
	await page.locator('.theme-toggle').click();
	await page.waitForTimeout(150);
	const after = await page.evaluate(() => document.documentElement.dataset.theme);
	check('主题切换生效', before !== after, `${before} → ${after}`);
}

async function responsiveScan() {
	const { context, page } = await openPage('light', { width: 1440, height: 900 });
	for (const width of [320, 480, 640, 768, 900, 1024, 1100, 1280, 1920]) {
		await page.setViewportSize({ width, height: 900 });
		await page.waitForTimeout(150);
		const state = await page.evaluate(() => {
			const vw = window.innerWidth;
			const edges = Array.from(document.querySelectorAll('main section'))
				.map(section => {
					const inner = section.querySelector('.section-head, .hero__grid');
					if (!inner) return null;
					const rect = inner.getBoundingClientRect();
					return { id: section.id, left: rect.left, right: vw - rect.right };
				})
				.filter(item => item && (item.left < 12 || item.right < 12));
			const nav = document.querySelector('.topnav');
			nav.style.scrollBehavior = 'auto';
			const box = nav.getBoundingClientRect();
			let clipped = 0;
			for (const link of nav.querySelectorAll('a')) {
				link.focus();
				const rect = link.getBoundingClientRect();
				if (rect.right > box.right + 1 || rect.left < box.left - 1) clipped++;
			}
			nav.scrollTo({ left: 0, behavior: 'instant' });
			return { overflow: document.documentElement.scrollWidth - vw, edges, clipped };
		});
		check(`宽度 ${width} / 无横向溢出`, state.overflow <= 1, `${state.overflow}px`);
		check(`宽度 ${width} / 章节左右留白`, state.edges.length === 0, JSON.stringify(state.edges));
		check(`宽度 ${width} / 导航完整`, state.clipped === 0, `${state.clipped} 项被裁`);
	}
	await context.close();
}

try {
	for (const theme of ['light', 'dark']) {
		for (const viewport of [
			{ width: 1440, height: 900, name: 'desktop' },
			{ width: 390, height: 844, name: 'mobile' },
		]) {
			const label = `${theme}/${viewport.name}`;
			const { context, page, errors } = await openPage(theme, {
				width: viewport.width,
				height: viewport.height,
			});
			await audit(page, label, theme);
			await contrast(page, label);
			check(`${label} / 无运行时错误`, errors.length === 0, errors.slice(0, 3).join(' | '));
			if (theme === 'light' && viewport.name === 'desktop') await interactions(page);
			await context.close();
		}
	}
	await responsiveScan();
} finally {
	await browser.close();
}

console.log(`通过 ${passes.length} 项`);
if (failures.length) {
	console.log(`失败 ${failures.length} 项：`);
	for (const failure of failures) console.log(`  ✗ ${failure}`);
	process.exit(1);
}
console.log('全部验收通过');
