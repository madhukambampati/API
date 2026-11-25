// Minimal, dependency-free Markdown → HTML renderer with a tiny syntax highlighter.
export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const slug = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const stripTags = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');

const KW = {
  python: 'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield None True False self',
  js: 'async await break case catch class const continue default delete do else export extends finally for from function if import in instanceof let new null of return static super switch this throw true false try typeof undefined var void while yield',
  bash: 'if then else fi for do done while case esac function in export source cd echo',
  json: 'true false null',
  sql: 'select from where group by order having join left right inner on as and or not in insert into values update set delete create table limit'
};
const ALIAS = { py: 'python', javascript: 'js', ts: 'js', typescript: 'js', sh: 'bash', shell: 'bash' };

function highlight(code, lang) {
  lang = ALIAS[lang] || lang;
  if (!KW[lang]) return esc(code);
  const kw = new Set(KW[lang].split(' '));
  const hash = lang === 'python' || lang === 'bash';
  const parts = [
    hash ? '(#.*)' : lang === 'sql' ? '(--.*)' : lang === 'json' ? '()' : '(\\/\\/.*)',
    '("""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)',
    '(\\b\\d+(?:\\.\\d+)?\\b)',
    '(\\b[A-Za-z_][A-Za-z0-9_]*\\b)'
  ];
  const re = new RegExp(parts.join('|'), 'g');
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [t, com, str, num, id] = m;
    if (com) out += `<span class="tk-c">${esc(t)}</span>`;
    else if (str) out += `<span class="tk-s">${esc(t)}</span>`;
    else if (num) out += `<span class="tk-n">${esc(t)}</span>`;
    else if (id && (kw.has(id) || (lang === 'sql' && kw.has(id.toLowerCase())))) out += `<span class="tk-k">${esc(t)}</span>`;
    else out += esc(t);
    last = m.index + t.length;
    if (!t.length) re.lastIndex++;
  }
  return out + esc(code.slice(last));
}

function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) =>
      /^https?:/.test(u) ? `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>` : `<a href="${u}">${t}</a>`);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}

const CALLOUTS = { 'key idea': 'key', tip: 'tip', warning: 'warn', note: 'note', example: 'example', exercise: 'exercise', 'common mistake': 'warn', 'try it': 'exercise' };

export function render(md) {
  const lines = md.split('\n');
  const toc = [];
  const html = block(lines, toc);
  return { html, toc };
}

function block(lines, toc) {
  let out = '', i = 0;
  const special = l => /^(```|#{2,3} |> |\||- |\d+\. |---$)/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^```(\w*)/))) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const lang = m[1] || 'text';
      const code = buf.join('\n');
      if (lang === 'diagram') out += `<pre class="diagram"><code>${esc(code)}</code></pre>`;
      else out += `<div class="code"><div class="code-head"><span>${lang}</span><button class="copy" type="button">Copy</button></div><pre><code>${highlight(code, lang)}</code></pre></div>`;
    } else if ((m = line.match(/^(#{2,3}) (.+)$/))) {
      const level = m[1].length, text = m[2].trim(), id = slug(text);
      if (level === 2) toc.push({ id, text: text.replace(/`/g, '') });
      out += `<h${level} id="${id}">${inline(text)}</h${level}>`;
      i++;
    } else if (/^---$/.test(line)) { out += '<hr>'; i++; }
    else if (line.startsWith('> ')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^> ?/, ''));
      const lm = buf[0].match(/^\*\*([^*:]+):?\*\*:?\s*(.*)$/);
      let kind = 'note', label = '';
      if (lm && CALLOUTS[lm[1].toLowerCase()]) { kind = CALLOUTS[lm[1].toLowerCase()]; label = lm[1]; buf[0] = lm[2]; }
      out += `<aside class="callout ${kind}">${label ? `<div class="callout-label">${esc(label)}</div>` : ''}${block(buf, [])}</aside>`;
    } else if (line.startsWith('|') && lines[i + 1] && /^\|[\s:|-]+\|?$/.test(lines[i + 1])) {
      const row = l => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = row(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(row(lines[i++]));
      out += `<div class="table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    } else if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d/.test(line);
      const items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) {
        let t = lines[i].replace(/^(- |\d+\. )/, '');
        i++;
        while (i < lines.length && /^ {2,}\S/.test(lines[i])) t += ' ' + lines[i++].trim();
        items.push(t);
      }
      const tag = ordered ? 'ol' : 'ul';
      out += `<${tag}>${items.map(t => `<li>${inline(t)}</li>`).join('')}</${tag}>`;
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !special(lines[i])) buf.push(lines[i++].trim());
      if (!buf.length) { buf.push(lines[i++].trim()); }
      out += `<p>${inline(buf.join(' '))}</p>`;
    }
  }
  return out;
}
