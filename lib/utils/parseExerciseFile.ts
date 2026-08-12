/**
 * Parse uploaded DOCX/TXT/PDF into markdown text for CustomEditorContest
 */
export async function parseExerciseFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'docx' || ext === 'doc') {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return normalizeParsedText(result.value);
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
