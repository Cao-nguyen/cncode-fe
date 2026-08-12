export type WebRequirement = {

    type: 'has-tag' | 'has-text' | 'has-style' | 'contains';

    selector?: string;

    tag?: string;

    property?: string;

    value?: string;

    text?: string;

};



/** Parse dòng `? ...` thành tiêu chí chấm web. */

export function parseWebRequirementLine(trimmed: string): WebRequirement | null {

    if (!trimmed.startsWith('?')) return null;

    const body = trimmed.slice(1).trim();

    if (!body) return null;



    if (/^style\s+/i.test(body)) {

        const match = body.match(/^style\s+(\S+)\s+(.+)$/i);

        if (match) return { type: 'has-style', property: match[1], value: match[2] };

        return null;

    }

    if (/^text\s+/i.test(body)) {

        return { type: 'has-text', text: body.replace(/^text\s+/i, '').trim() };

    }

    if (/^contains\s+/i.test(body)) {

        return { type: 'contains', value: body.replace(/^contains\s+/i, '').trim() };

    }

    if (/^tag\s+/i.test(body)) {

        return { type: 'has-tag', tag: body.replace(/^tag\s+/i, '').trim() };

    }



    return { type: 'has-tag', tag: body.split(/\s+/)[0] };

}



export function serializeWebRequirement(req: WebRequirement): string {

    switch (req.type) {

        case 'has-tag':

            return `? ${req.tag}`;

        case 'has-text':

            return `? text ${req.text}`;

        case 'has-style':

            return `? style ${req.property} ${req.value}`;

        case 'contains':

            return `? contains ${req.value}`;

        default:

            return '';

    }

}



export function formatWebRequirementLabel(req: WebRequirement): string {

    switch (req.type) {

        case 'has-tag':

            return `Có thẻ <${req.tag}>`;

        case 'has-text':

            return `Có nội dung "${req.text}"`;

        case 'has-style':

            return `CSS ${req.property}: ${req.value}`;

        case 'contains':

            return `Code chứa "${req.value}"`;

        default:

            return '';

    }

}



import { mergeAlgorithmQuestionForBackend } from '@/lib/luyentap/algorithm-question-markdown';

export type EditorQuestionContent = {
    number?: number;
    type: string;
    content?: string;
    codeMode?: 'algorithm' | 'web';
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    webRequirements?: WebRequirement[];
    options?: string[];
    leftItems?: string[];
    correctAnswers?: string[];
    testCases?: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
};

/** Gom nội dung câu hỏi trước khi gửi backend (tránh `question` rỗng). */
export function resolveEditorQuestionText(q: EditorQuestionContent, index: number): string {
    const isAlgorithmCode = q.type === 'code'
        && (q.codeMode === 'algorithm' || !q.codeMode || (q.testCases?.length ?? 0) > 0);

    if (isAlgorithmCode) {
        const merged = mergeAlgorithmQuestionForBackend(q.content || '', {
            algoRequirement: q.algoRequirement,
            algoInputDesc: q.algoInputDesc,
            algoOutputDesc: q.algoOutputDesc,
        });
        if (merged.trim()) return merged.trim();
    }

    const content = (q.content || '').trim();
    if (content) return content;

    if (q.type === 'code' && q.codeMode === 'web' && q.webRequirements?.length) {
        return q.webRequirements.map((req) => serializeWebRequirement(req)).join('\n');
    }

    if (q.algoRequirement?.trim()) return q.algoRequirement.trim();

    if (q.leftItems?.[0]?.trim()) return q.leftItems[0].trim();

    const firstOption = q.options?.[0]?.replace(/^[A-Da-d][).]\s*/, '').trim();
    if (firstOption) return firstOption;

    if (q.correctAnswers?.[0]?.trim()) return q.correctAnswers[0].trim();

    return `Câu ${q.number ?? index + 1}`;
}

export type AnswerCheckQuestion = {

    type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'matching' | 'short-answer' | 'essay' | 'code';

    correctAnswers?: string[];

    matchingPairs?: Array<{ left: string; right: string }>;

    leftItems?: string[];

    rightItems?: string[];

    number?: number;

};



/** Trả về true nếu câu cần đáp án mà chưa có (tự luận & code không bắt buộc). */

export function questionMissingAnswer(q: AnswerCheckQuestion): boolean {

    if (q.type === 'essay' || q.type === 'code') return false;

    if (q.type === 'multiple-choice' || q.type === 'multiple-select' || q.type === 'true-false') {

        return !q.correctAnswers?.length;

    }

    if (q.type === 'matching') {

        const leftCount = q.leftItems?.length || 0;

        const pairCount = q.matchingPairs?.length || 0;

        return leftCount === 0 || pairCount < leftCount;

    }

    if (q.type === 'short-answer') {

        return !q.correctAnswers?.[0]?.trim();

    }

    return false;

}


