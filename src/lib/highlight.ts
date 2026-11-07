export type CodeLang = 'js' | 'html' | 'bash' | 'ts';

const KEYWORDS = new Set(
	'import from export default const let var function return if else new await async class extends type interface as for of in null true false undefined typeof void this try catch finally throw switch case break continue yield delete instanceof'.split(
		' '
	)
);

const BUILTINS = new Set(
	'render hydrate h html createElement useState useEffect useMemo useCallback useRef memo Component options renderToString queueMicrotask requestAnimationFrame requestIdleCallback setState defineConfig preact bun npm npx bunx git'.split(
		' '
	)
);

const ENTITIES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
};

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, char => ENTITIES[char]);

const TOKEN =
	/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|#[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?)\b|(<\/?[A-Za-z][\w.-]*|\/?>)|([A-Za-z_$][\w$]*)|(--?[A-Za-z][\w-]*)/g;

function wrap(kind: string, text: string): string {
	return kind ? `<span class="tok-${kind}">${escapeHtml(text)}</span>` : escapeHtml(text);
}

export function highlight(code: string, _lang: CodeLang = 'js'): string {
	let out = '';
	let cursor = 0;
	TOKEN.lastIndex = 0;

	for (const match of code.matchAll(TOKEN)) {
		const index = match.index ?? 0;
		out += escapeHtml(code.slice(cursor, index));

		const [, comment, string, number, tag, word, flag] = match;
		if (comment) out += wrap('c', comment);
		else if (string) out += wrap('s', string);
		else if (number) out += wrap('n', number);
		else if (tag) out += wrap('g', tag);
		else if (word) {
			if (KEYWORDS.has(word)) out += wrap('k', word);
			else if (BUILTINS.has(word)) out += wrap('f', word);
			else if (/^[A-Z]/.test(word)) out += wrap('t', word);
			else out += wrap('', word);
		} else if (flag) out += wrap('a', flag);

		cursor = index + match[0].length;
	}

	out += escapeHtml(code.slice(cursor));
	return out;
}
