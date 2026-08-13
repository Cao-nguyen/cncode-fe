/**
 * Parse uploaded DOCX/TXT/PDF into markdown text for CustomEditorContest
 */
export async function parseExerciseFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'docx' || ext === 'doc') {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const header = new Uint8Array(arrayBuffer.slice(0, 2));
        if (header[0] !== 0x50 || header[1] !== 0x4b) {
            throw new Error('File Word cũ (.doc) chưa hỗ trợ import. Vui lòng lưu lại dạng .docx hoặc dùng PDF/TXT.');
        }
        const result = await mammoth.convertToHtml(
            { arrayBuffer },
            {
                styleMap: [
                    'u => u',
                    "r[style-name='Strong'] => strong",
                    "r[style-name='Emphasis'] => em",
                ],
            },
        );
        return normalizeParsedText(htmlInlineToMarkdown(result.value));
    }

    if (ext === 'txt' || ext === 'md') {
        return normalizeParsedText(await file.text());
    }

    if (ext === 'pdf') {
        return normalizeParsedText(await parsePdfInBrowser(await file.arrayBuffer()));
    }

    throw new Error('Chỉ hỗ trợ file PDF, Word (.docx) hoặc text (.txt, .md)');
}

async function parsePdfInBrowser(arrayBuffer: ArrayBuffer): Promise<string> {
    const pdfjs = await import('pdfjs-dist');
    if (typeof window !== 'undefined') {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
        ).toString();
    }

    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
        pages.push(text);
    }

    return pages.join('\n\n');
}

/** Chuyển HTML từ mammoth sang markdown inline: **bold**, *italic*, __underline__ */
function htmlInlineToMarkdown(html: string): string {
    if (!html.trim()) return '';

    if (typeof DOMParser === 'undefined') {
        return html.replace(/<[^>]+>/g, '');
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');

    const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent ?? '';
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const inner = Array.from(el.childNodes).map(walk).join('');

        switch (tag) {
            case 'strong':
            case 'b':
                return inner ? `**${inner}**` : '';
            case 'em':
            case 'i':
                return inner ? `*${inner}*` : '';
            case 'u':
                return inner ? `__${inner}__` : '';
            case 'br':
                return '\n';
            case 'p':
            case 'div':
            case 'li':
                return `${inner}\n`;
            case 'ul':
            case 'ol':
                return inner;
            default:
                return inner;
        }
    };

    return walk(doc.body)
        .replace(/\u00a0/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const STRUCTURAL_LINE_RE = /^(\*)?(Câu\s*\d+|[A-Da-d][).]|\{|\?|\*[^\s])/i;

function normalizeParsedText(text: string): string {
    const lines = text
        .replace(/\r\n/g, '\n')
        .replace(/\u00a0/g, ' ')
        .split('\n');

    const compact: string[] = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            const prev = compact[compact.length - 1]?.trim() || '';
            if (STRUCTURAL_LINE_RE.test(prev)) continue;
            if (compact.length > 0 && compact[compact.length - 1] === '') continue;
            compact.push('');
            continue;
        }
        compact.push(trimmed);
    }

    return compact
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
