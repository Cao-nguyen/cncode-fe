export interface AlgorithmTestCase {
    input: string;
    expectedOutput: string;
    isSample: boolean;
}

/** `\n` trong dòng TC → xuống dòng thật khi chạy/chấm. */
export function escapeTcLiteral(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}

export function unescapeTcLiteral(value: string): string {
    return value.replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
}

/** Một dòng: + in => out hoặc - in => out */
export function serializeAlgorithmTestCase(tc: AlgorithmTestCase): string {
    const input = escapeTcLiteral((tc.input ?? '').trim());
    const output = escapeTcLiteral((tc.expectedOutput ?? '').trim());
    return `${tc.isSample ? '+' : '-'} ${input} => ${output}`;
}

export function serializeAlgorithmQuestionBody(options: {
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    testCases?: AlgorithmTestCase[];
}): string[] {
    const parts: string[] = ['{lt}'];

    if (options.algoRequirement?.trim()) {
        parts.push('{yêu cầu:');
        parts.push(options.algoRequirement.trim());
        parts.push('}');
    }

    if (options.algoInputDesc?.trim()) {
        parts.push('{đầu vào:');
        parts.push(options.algoInputDesc.trim());
        parts.push('}');
    }

    if (options.algoOutputDesc?.trim()) {
        parts.push('{đầu ra:');
        parts.push(options.algoOutputDesc.trim());
        parts.push('}');
    }

    (options.testCases || []).forEach((tc) => {
        parts.push(serializeAlgorithmTestCase(tc));
    });

    return parts;
}

type AlgoBlockKind = 'yeu-cau' | 'dau-vao' | 'dau-ra';

const BLOCK_OPEN: Record<AlgoBlockKind, RegExp> = {
    'yeu-cau': /^\{yêu cầu:\s*(.*)$/i,
    'dau-vao': /^\{đầu vào:\s*(.*)$/i,
    'dau-ra': /^\{đầu ra:\s*(.*)$/i,
};

export function parseAlgoBlockOpen(trimmed: string): { kind: AlgoBlockKind; inline: string } | null {
    for (const kind of Object.keys(BLOCK_OPEN) as AlgoBlockKind[]) {
        const match = trimmed.match(BLOCK_OPEN[kind]);
        if (!match) continue;
        const inline = (match[1] || '').trim();
        if (inline.endsWith('}')) {
            return { kind, inline: inline.slice(0, -1).trim() };
        }
        return { kind, inline };
    }
    return null;
}

export function isAlgoBlockCompleteInline(trimmed: string): boolean {
    const open = parseAlgoBlockOpen(trimmed);
    if (!open) return false;
    const match = trimmed.match(BLOCK_OPEN[open.kind]);
    if (!match) return false;
    const rest = (match[1] || '').trim();
    return rest.endsWith('}');
}

/** Gộp tiêu đề + mô tả đề khi lưu backend. */
export function mergeAlgorithmQuestionForBackend(
    content: string,
    options?: {
        algoRequirement?: string;
        algoInputDesc?: string;
        algoOutputDesc?: string;
    },
): string {
    const parts: string[] = [];
    if (content.trim()) parts.push(content.trim());
    if (options?.algoRequirement?.trim()) parts.push(options.algoRequirement.trim());
    if (options?.algoInputDesc?.trim()) {
        parts.push(`Đầu vào:\n${options.algoInputDesc.trim()}`);
    }
    if (options?.algoOutputDesc?.trim()) {
        parts.push(`Đầu ra:\n${options.algoOutputDesc.trim()}`);
    }
    return parts.join('\n\n');
}
