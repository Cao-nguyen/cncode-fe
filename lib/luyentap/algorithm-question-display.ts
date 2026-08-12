export interface AlgorithmQuestionDisplay {
    /** Tiêu đề / mô tả đề (không gồm yêu cầu, đầu vào, đầu ra) */
    intro: string;
    requirementDesc?: string;
    inputDesc?: string;
    outputDesc?: string;
}

const INPUT_MARKER = /\s*Đầu vào:\s*/i;
const OUTPUT_MARKER = /\s*Đầu ra:\s*/i;

/** Tách yêu cầu dính cùng dòng / đoạn với tiêu đề đề (dữ liệu cũ). */
const INTRO_TAIL_PATTERNS: RegExp[] = [
    /^(.+?\bbên dưới)\.?\s+([\s\S]+)$/i,
    /^(.+?\bsau đây)\.?\s+([\s\S]+)$/i,
    /^(.+?\bphía dưới)\.?\s+([\s\S]+)$/i,
    /^(.+?\bbên trên)\.?\s+([\s\S]+)$/i,
];

const TASK_VERB_PATTERNS: RegExp[] = [
    /^(.{8,}?)\s+(Viết code[\s\S]+)$/i,
    /^(.{8,}?)\s+(In ra[\s\S]+)$/i,
    /^(.{8,}?)\s+(Nhập[\s\S]+)$/i,
    /^(.{8,}?)\s+(Tính[\s\S]+)$/i,
    /^(.{8,}?)\s+(Thực hiện[\s\S]+)$/i,
];

function extractBraceBlock(
    text: string,
    label: 'yêu cầu' | 'đầu vào' | 'đầu ra',
): { content: string; rest: string } | null {
    const pattern = new RegExp(`\\{${label}:\\s*([\\s\\S]*?)\\}`, 'i');
    const match = text.match(pattern);
    if (!match) return null;
    return {
        content: match[1].trim(),
        rest: text.replace(match[0], '').trim(),
    };
}

function stripAlgoNoise(text: string): string {
    return text
        .replace(/\{lt\}/gi, '')
        .replace(/\{web\}/gi, '')
        .replace(/^[+-]\s*.+?=>\s*.+$/gm, '')
        .replace(/^\?\s*.+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function splitInlineIntroRequirement(intro: string): Pick<AlgorithmQuestionDisplay, 'intro' | 'requirementDesc'> {
    const trimmed = stripAlgoNoise(intro);
    if (!trimmed) return { intro: '' };

    const paragraphSplit = splitLegacyIntroAndRequirement(trimmed);
    if (paragraphSplit.requirementDesc) return paragraphSplit;

    for (const pattern of INTRO_TAIL_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match?.[2]?.trim()) {
            return {
                intro: match[1].trim(),
                requirementDesc: match[2].trim(),
            };
        }
    }

    for (const pattern of TASK_VERB_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match?.[2]?.trim()) {
            return {
                intro: match[1].trim(),
                requirementDesc: match[2].trim(),
            };
        }
    }

    const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length >= 2) {
        return {
            intro: lines[0],
            requirementDesc: lines.slice(1).join('\n'),
        };
    }

    return { intro: trimmed };
}

function splitLegacyIntroAndRequirement(intro: string): Pick<AlgorithmQuestionDisplay, 'intro' | 'requirementDesc'> {
    const trimmed = stripAlgoNoise(intro);
    if (!trimmed) return { intro: '' };

    const blocks = trimmed.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
    if (blocks.length >= 2) {
        return {
            intro: blocks[0],
            requirementDesc: blocks.slice(1).join('\n\n'),
        };
    }

    return { intro: trimmed };
}

function parseLegacyIoMarkers(text: string): AlgorithmQuestionDisplay {
    const inputParts = text.split(INPUT_MARKER);
    if (inputParts.length < 2) {
        const outputOnly = text.split(OUTPUT_MARKER);
        if (outputOnly.length >= 2) {
            const split = splitLegacyIntroAndRequirement(outputOnly[0]);
            return {
                intro: split.intro,
                requirementDesc: split.requirementDesc,
                outputDesc: outputOnly.slice(1).join('').trim(),
            };
        }
        return splitLegacyIntroAndRequirement(text);
    }

    const split = splitLegacyIntroAndRequirement(inputParts[0]);
    const afterInput = inputParts.slice(1).join('');
    const outputParts = afterInput.split(OUTPUT_MARKER);

    if (outputParts.length >= 2) {
        return {
            intro: split.intro,
            requirementDesc: split.requirementDesc,
            inputDesc: outputParts[0].trim(),
            outputDesc: outputParts.slice(1).join('').trim(),
        };
    }

    return {
        intro: split.intro,
        requirementDesc: split.requirementDesc,
        inputDesc: afterInput.trim(),
    };
}

/** Tách nội dung đề LT: hỗ trợ `{yêu cầu:}`, `{đầu vào:}`, `{đầu ra:}` và định dạng cũ. */
export function parseAlgorithmQuestionDisplay(question: string): AlgorithmQuestionDisplay {
    let text = question.trim();
    if (!text) return { intro: '' };

    let requirementDesc: string | undefined;
    let inputDesc: string | undefined;
    let outputDesc: string | undefined;

    const requirementBlock = extractBraceBlock(text, 'yêu cầu');
    if (requirementBlock) {
        requirementDesc = requirementBlock.content;
        text = requirementBlock.rest;
    }

    const inputBlock = extractBraceBlock(text, 'đầu vào');
    if (inputBlock) {
        inputDesc = inputBlock.content;
        text = inputBlock.rest;
    }

    const outputBlock = extractBraceBlock(text, 'đầu ra');
    if (outputBlock) {
        outputDesc = outputBlock.content;
        text = outputBlock.rest;
    }

    text = stripAlgoNoise(text);

    if (!inputDesc && !outputDesc) {
        const legacy = parseLegacyIoMarkers(text);
        const inlineSplit = !legacy.requirementDesc
            ? splitInlineIntroRequirement(legacy.intro)
            : { intro: legacy.intro, requirementDesc: legacy.requirementDesc };
        return {
            intro: inlineSplit.intro,
            requirementDesc: requirementDesc || inlineSplit.requirementDesc || legacy.requirementDesc,
            inputDesc: legacy.inputDesc,
            outputDesc: legacy.outputDesc,
        };
    }

    const inlineSplit = !requirementDesc
        ? splitInlineIntroRequirement(text)
        : { intro: text, requirementDesc };

    return {
        intro: inlineSplit.intro,
        requirementDesc: requirementDesc || inlineSplit.requirementDesc,
        inputDesc,
        outputDesc,
    };
}
