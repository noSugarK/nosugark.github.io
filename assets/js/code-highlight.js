/* 轻量 JS 高亮：token class 复用全站 .highlight 配色，h(tag, cls, text) 由调用方给。
   静态站不引 Vue/shiki；源码在卡片创建时就整段渲染，不做逐字书写。 */
const KEYWORDS = new Set('const let var function return if else for of in new this async await import export from class try catch throw typeof delete void do while switch case break continue extends super yield static'.split(' '));
const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
const TOKEN_RE = /\/\/.*|\/\*[\s\S]*?\*\/|`(?:\x5c[\s\S]|[^`\x5c])*`|'(?:\x5c[\s\S]|[^'\x5c])*'|"(?:\x5c[\s\S]|[^"\x5c])*"|=>|===|!==|&&|\|\||\?\?|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b/g;
const tokenClass = (text, code, at) => {
  if (text.startsWith('//') || text.startsWith('/*')) return 'c1';
  if (/^['"`]/.test(text)) return 's1';
  if (/^[=!&|?]/.test(text)) return 'ow';
  if (/^\d/.test(text)) return 'mi';
  if (KEYWORDS.has(text)) return 'k';
  if (LITERALS.has(text)) return 'kc';
  if (/^\s*\(/.test(code.slice(at + text.length))) return 'nf';
  return '';
};
export function highlightLines(code, h) {
  const tokens = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN_RE)) {
    if (match.index > last) tokens.push({text: code.slice(last, match.index), cls: ''});
    tokens.push({text: match[0], cls: tokenClass(match[0], code, match.index)});
    last = match.index + match[0].length;
  }
  if (last < code.length) tokens.push({text: code.slice(last), cls: ''});
  const lines = [[]];
  tokens.forEach(({text, cls}) => text.split('\n').forEach((piece, i) => {
    if (i) lines.push([]);
    if (piece) lines[lines.length - 1].push(h('span', cls, piece));
  }));
  return lines;
}
