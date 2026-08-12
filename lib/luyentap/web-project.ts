export interface WebProjectFiles {
    html: string;
    css: string;
    js: string;
}

export const DEFAULT_WEB_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<script src="script.js"></script>
</body>
</html>`;

export const DEFAULT_WEB_CSS = `/* style.css */`;

export const DEFAULT_WEB_JS = `// script.js`;

export function defaultWebProject(starterCode?: string): WebProjectFiles {
    return {
        html: starterCode?.trim() || DEFAULT_WEB_HTML,
        css: DEFAULT_WEB_CSS,
        js: DEFAULT_WEB_JS,
    };
}

/** Parse codeAnswer — hỗ trợ JSON đa file hoặc HTML thuần (cũ). */
export function parseWebProject(raw: string | undefined | null, starterCode?: string): WebProjectFiles {
    const fallback = defaultWebProject(starterCode);
    if (!raw?.trim()) return fallback;

    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed) as Partial<WebProjectFiles>;
            return {
                html: typeof parsed.html === 'string' ? parsed.html : fallback.html,
                css: typeof parsed.css === 'string' ? parsed.css : fallback.css,
                js: typeof parsed.js === 'string' ? parsed.js : fallback.js,
            };
        } catch {
            return { ...fallback, html: trimmed };
        }
    }

    return { ...fallback, html: trimmed };
}

export function serializeWebProject(files: WebProjectFiles): string {
    return JSON.stringify(files);
}

/** Ghép 3 file thành HTML đầy đủ để preview / chấm điểm. */
export function buildWebPreviewHtml(files: WebProjectFiles): string {
    let html = files.html || '';

    if (files.css.trim()) {
        const styleBlock = `<style>\n${files.css}\n</style>`;
        if (/<\/head>/i.test(html)) {
            html = html.replace(/<\/head>/i, `${styleBlock}\n</head>`);
        } else {
            html = `${styleBlock}\n${html}`;
        }
    }

    if (files.js.trim()) {
        const scriptBlock = `<script>\n${files.js}\n</script>`;
        if (/<\/body>/i.test(html)) {
            html = html.replace(/<\/body>/i, `${scriptBlock}\n</body>`);
        } else {
            html = `${html}\n${scriptBlock}`;
        }
    }

    return html;
}

export type WebEditorFile = 'index.html' | 'style.css' | 'script.js';

export const WEB_EDITOR_FILES: { id: WebEditorFile; label: string }[] = [
    { id: 'index.html', label: 'index.html' },
    { id: 'style.css', label: 'style.css' },
    { id: 'script.js', label: 'script.js' },
];

export function getWebFileContent(files: WebProjectFiles, file: WebEditorFile): string {
    if (file === 'style.css') return files.css;
    if (file === 'script.js') return files.js;
    return files.html;
}

export function setWebFileContent(files: WebProjectFiles, file: WebEditorFile, content: string): WebProjectFiles {
    if (file === 'style.css') return { ...files, css: content };
    if (file === 'script.js') return { ...files, js: content };
    return { ...files, html: content };
}
