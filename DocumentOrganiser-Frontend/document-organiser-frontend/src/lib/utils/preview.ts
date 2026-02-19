import { getFileExtension } from './format';

// ── Preview type classification ──────────────────────────────────────────────

export type PreviewType =
  | 'image'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'office'
  | 'code'
  | 'csv'
  | 'markdown'
  | 'fallback';

const OFFICE_MIME_PREFIXES = [
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-',
  'application/msword',
  'application/vnd.oasis.opendocument',
];

const OFFICE_EXTENSIONS = new Set([
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
]);

const CODE_EXTENSIONS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs',
  'py', 'pyw', 'java', 'c', 'cpp', 'cc', 'h', 'hpp', 'cs',
  'go', 'rs', 'rb', 'php', 'swift', 'kt', 'kts', 'scala',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env',
  'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
  'sql', 'graphql', 'gql', 'r', 'lua', 'dart', 'vue', 'svelte',
  'dockerfile', 'makefile', 'gradle', 'properties',
  'txt', 'log', 'rtf', 'tex', 'rst', 'adoc',
]);

/**
 * Determine the best preview strategy for a given file.
 */
export function getPreviewType(mimeType: string, fileName: string): PreviewType {
  const ext = getFileExtension(fileName).toLowerCase();

  // Images (including SVG)
  if (mimeType.startsWith('image/')) return 'image';

  // PDF
  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';

  // Video
  if (mimeType.startsWith('video/')) return 'video';

  // Audio
  if (mimeType.startsWith('audio/')) return 'audio';

  // Markdown (before generic text)
  if (mimeType === 'text/markdown' || ext === 'md' || ext === 'mdx') return 'markdown';

  // CSV (before generic text)
  if (mimeType === 'text/csv' || ext === 'csv') return 'csv';

  // Office documents
  if (
    OFFICE_MIME_PREFIXES.some((p) => mimeType.startsWith(p)) ||
    OFFICE_EXTENSIONS.has(ext)
  ) {
    return 'office';
  }

  // Code & plain-text
  if (
    mimeType.startsWith('text/') ||
    mimeType.includes('json') ||
    mimeType.includes('xml') ||
    mimeType.includes('javascript') ||
    mimeType.includes('typescript') ||
    mimeType.includes('yaml') ||
    mimeType.includes('x-sh') ||
    mimeType.includes('x-python') ||
    CODE_EXTENSIONS.has(ext)
  ) {
    return 'code';
  }

  return 'fallback';
}

/**
 * Whether this preview type needs the raw text content of the file.
 */
export function needsTextContent(type: PreviewType): boolean {
  return type === 'code' || type === 'csv' || type === 'markdown';
}

// ── Language label for code files ────────────────────────────────────────────

const EXT_LANGUAGE_MAP: Record<string, string> = {
  js: 'JavaScript', jsx: 'JavaScript (JSX)', mjs: 'JavaScript',
  ts: 'TypeScript', tsx: 'TypeScript (TSX)',
  py: 'Python', pyw: 'Python',
  java: 'Java', kt: 'Kotlin', kts: 'Kotlin', scala: 'Scala',
  c: 'C', cpp: 'C++', cc: 'C++', h: 'C Header', hpp: 'C++ Header', cs: 'C#',
  go: 'Go', rs: 'Rust', rb: 'Ruby', php: 'PHP', swift: 'Swift',
  dart: 'Dart', lua: 'Lua', r: 'R',
  html: 'HTML', htm: 'HTML', css: 'CSS', scss: 'SCSS', sass: 'Sass', less: 'Less',
  json: 'JSON', xml: 'XML', yaml: 'YAML', yml: 'YAML', toml: 'TOML',
  sql: 'SQL', graphql: 'GraphQL', gql: 'GraphQL',
  sh: 'Shell', bash: 'Bash', zsh: 'Zsh', fish: 'Fish', ps1: 'PowerShell',
  bat: 'Batch', cmd: 'Batch',
  md: 'Markdown', mdx: 'MDX', txt: 'Plain Text', log: 'Log',
  tex: 'LaTeX', rst: 'reStructuredText', adoc: 'AsciiDoc',
  ini: 'INI', cfg: 'Config', conf: 'Config', env: 'Environment',
  dockerfile: 'Dockerfile', makefile: 'Makefile',
  gradle: 'Gradle', properties: 'Properties',
  vue: 'Vue', svelte: 'Svelte', rtf: 'Rich Text',
};

export function getLanguageLabel(fileName: string): string {
  const ext = getFileExtension(fileName).toLowerCase();
  return EXT_LANGUAGE_MAP[ext] ?? 'Plain Text';
}

// ── CSV parser ───────────────────────────────────────────────────────────────

/**
 * Parse CSV text into a 2D string array.
 * Handles quoted fields, embedded commas, and newlines inside quotes.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(current);
      current = '';
    } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(current);
      current = '';
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      if (ch === '\r') i++;
    } else {
      current += ch;
    }
  }

  // last row
  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((c) => c.length > 0)) rows.push(row);
  }

  return rows;
}

// ── Lightweight Markdown → HTML ──────────────────────────────────────────────

/**
 * Convert a subset of Markdown to sanitised HTML.
 * Supports: headings, bold, italic, inline code, fenced code blocks,
 * links, images, blockquotes, hr, unordered & ordered lists.
 */
export function renderMarkdownToHtml(src: string): string {
  // Escape HTML entities first (prevents XSS)
  let text = src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks  ```lang\n...\n```
  text = text.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="preview-code-block"><code>$2</code></pre>',
  );

  // Headings
  text = text.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  text = text.replace(/^---+$/gm, '<hr/>');

  // Bold + Italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="preview-inline-code">$1</code>');

  // Sanitize URLs: only allow http(s) and mailto protocols
  const sanitizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) return trimmed;
    return '#';
  };

  // Images (before links so ![...](...) doesn't become a link)
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt, src) => `<img src="${sanitizeUrl(src)}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:8px 0"/>`,
  );

  // Links
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label, href) => `<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer" class="preview-link">${label}</a>`,
  );

  // Blockquotes (consecutive > lines)
  text = text.replace(
    /(^&gt; .+\n?)+/gm,
    (match) =>
      '<blockquote class="preview-blockquote">' +
      match.replace(/^&gt; /gm, '') +
      '</blockquote>',
  );

  // Unordered list items  (- or *)
  text = text.replace(
    /(^[\-\*] .+\n?)+/gm,
    (match) => {
      const items = match
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `<li>${l.replace(/^[\-\*] /, '')}</li>`)
        .join('');
      return `<ul class="preview-list">${items}</ul>`;
    },
  );

  // Ordered list items  (1. 2. etc.)
  text = text.replace(
    /(^\d+\. .+\n?)+/gm,
    (match) => {
      const items = match
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`)
        .join('');
      return `<ol class="preview-list">${items}</ol>`;
    },
  );

  // Wrap remaining bare lines in <p>
  text = text.replace(
    /^(?!<[houlpbia]|<\/|<hr|<li|<block|<pre|<code|<img|<a )(.+)$/gm,
    '<p>$1</p>',
  );

  return text;
}
