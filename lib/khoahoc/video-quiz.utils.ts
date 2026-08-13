export type VideoQuizQuestionType =
    | 'multiple-choice'
    | 'multiple-select'
    | 'true-false'
    | 'matching'
    | 'short-answer'
    | 'essay'
    | 'code';

export interface VideoQuizQuestion {
    id: number;
    type: VideoQuizQuestionType | string;
    content: string;
    options?: string[];
    correctAnswers?: string[];
    score: number;
    explanation?: string;
    time?: number;
    leftItems?: string[];
    rightItems?: string[];
    matchingPairs?: Array<{ left: string; right: string }>;
    codeMode?: 'algorithm' | 'web';
    language?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    webRequirements?: unknown[];
}

export interface BackendVideoQuizQuestion {
    time: number;
    type: string;
    question: string;
    options: string[];
    correctAnswer: number;
    correctAnswers: string[];
    score: number;
    explanation: string;
    leftItems?: string[];
    rightItems?: string[];
    matchingPairs?: Array<{ left: string; right: string }>;
    codeMode?: string;
    language?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    webRequirements?: unknown[];
}

const OPTION_RE = /^(\*)?([A-Da-d])[).]\s*(.*)$/;

const extractOption = (trimmedLine: string): { marked: boolean; letter: string; text: string } | null => {
    const m = trimmedLine.match(OPTION_RE);
    if (!m) return null;
    return { marked: !!m[1], letter: m[2], text: m[3] };
};

export const parseVideoQuizQuestions = (text: string): VideoQuizQuestion[] => {
    const lines = text.split('\n');
    const parsed: VideoQuizQuestion[] = [];

    let current: VideoQuizQuestion | null = null;
    let currentOptions: string[] = [];
    let currentCorrect: string[] = [];
    let currentContent = '';

    const flush = () => {
        if (!current) return;
        current.content = currentContent.trim();
        if (currentOptions.length > 0) {
            current.options = currentOptions;
            const isTrueFalse = currentOptions.every((opt) => /^[a-d][).]/.test(opt));
            if (current.type === 'multiple-choice') {
                current.type = isTrueFalse ? 'true-false' : 'multiple-choice';
            }
            current.correctAnswers = currentCorrect;
        }
        parsed.push(current);
    };

    lines.forEach((line) => {
        const trimmed = line.trim();
        const questionMatch = trimmed.match(/^Câu\s*(\d+)\.\s*(.*)/);

        if (questionMatch) {
            flush();
            current = {
                id: parseInt(questionMatch[1], 10),
                type: 'multiple-choice',
                content: '',
                options: [],
                correctAnswers: [],
                score: 1,
                explanation: '',
                time: 0,
            };
            currentOptions = [];
            currentCorrect = [];
            currentContent = questionMatch[2] || '';
            return;
        }

        const option = current ? extractOption(trimmed) : null;
        if (current && option) {
            const displayLine = `${option.letter}${trimmed.includes('.') ? '.' : ')'} ${option.text}`;
            currentOptions.push(displayLine);
            if (option.marked) currentCorrect.push(option.letter);
            return;
        }

        if (current && /^\[.*\]/.test(trimmed)) {
            const match = trimmed.match(/^\[(.*?)\]/);
            if (match) {
                current.correctAnswers = [match[1]];
                current.type = 'short-answer';
            }
            return;
        }

        if (current && /^\{LG:/i.test(trimmed)) {
            const match = trimmed.match(/^\{LG:\s*(.*?)\s*\}/i);
            if (match) current.explanation = match[1];
            return;
        }

        if (current && /^\{TIME:/i.test(trimmed)) {
            const match = trimmed.match(/^\{TIME:\s*(\d+)(?::(\d+))?(?::(\d+))?\s*\}/i);
            if (match) {
                const h = parseInt(match[1], 10) || 0;
                const m = parseInt(match[2], 10) || 0;
                const s = parseInt(match[3], 10) || 0;
                current.time = h * 3600 + m * 60 + s;
            }
            return;
        }

        if (current) {
            currentContent = currentContent ? `${currentContent}\n${line}` : line;
        }
    });

    flush();
    return parsed;
};

export const quizToEditorFormat = (quizzes: Array<{
    time: number;
    question: string;
    options: string[];
    correctAnswer?: number;
    correctAnswers?: string[];
}>): string => {
    return quizzes.map((q, idx) => {
        const h = Math.floor(q.time / 3600);
        const m = Math.floor((q.time % 3600) / 60);
        const s = q.time % 60;
        const timeStr = `{TIME:${h}:${m}:${s}}`;
        const options = q.options.map((opt, i) => {
            const marker = q.correctAnswers?.includes(String.fromCharCode(65 + i)) ? '*' : '';
            if (/^[A-Da-d][).]\s/.test(opt)) {
                return marker ? `*${opt}` : opt;
            }
            const letter = String.fromCharCode(65 + i);
            return `${marker}${letter}. ${opt}`;
        }).join('\n');
        return `Câu ${idx + 1}. ${q.question}\n${timeStr}\n${options}`;
    }).join('\n\n');
};

export const convertQuestionsToBackendFormat = (questions: VideoQuizQuestion[]): BackendVideoQuizQuestion[] => {
    return questions.map((q) => ({
        time: q.time || 0,
        type: q.type || 'multiple-choice',
        question: q.content,
        options: q.options || [],
        correctAnswer:
            (q.type === 'multiple-choice' || q.type === 'multiple-select') && q.correctAnswers?.[0]
                ? q.correctAnswers[0].toUpperCase().charCodeAt(0) - 65
                : 0,
        correctAnswers: q.correctAnswers || [],
        score: q.score || 1,
        explanation: q.explanation || '',
        leftItems: q.leftItems,
        rightItems: q.rightItems,
        matchingPairs: q.matchingPairs,
        codeMode: q.codeMode,
        language: q.language,
        testCases: q.testCases,
        algoRequirement: q.algoRequirement,
        algoInputDesc: q.algoInputDesc,
        algoOutputDesc: q.algoOutputDesc,
        webRequirements: q.webRequirements,
    }));
};

/** Plain-text preview for lesson form — strips TIME/LG meta lines and correct-answer markers. */
export const formatQuizPreviewText = (content: string): string => {
    if (!content.trim()) return '';

    return content
        .split('\n\n')
        .map((block) =>
            block
                .split('\n')
                .filter((line) => {
                    const trimmed = line.trim();
                    return (
                        !/^\{TIME:/i.test(trimmed) &&
                        !/^\{LG:/i.test(trimmed) &&
                        !/^\{(lt|web|match|ms)\}/i.test(trimmed) &&
                        !/^\{LANG:/i.test(trimmed) &&
                        !/^\{(py|cpp|js|cs|pas|c\+\+)\}$/i.test(trimmed) &&
                        !/^\{TC-/i.test(trimmed) &&
                        !/^\{yêu cầu:/i.test(trimmed) &&
                        !/^\{đầu vào:/i.test(trimmed) &&
                        !/^\{đầu ra:/i.test(trimmed) &&
                        !/^\?/.test(trimmed)
                    );
                })
                .map((line) => line.replace(/^\*/, ''))
                .join('\n')
                .trim(),
        )
        .filter(Boolean)
        .join('\n\n');
};

export const formatVideoQuizTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
};

export const parseVideoQuizTimeParts = (seconds: number) => ({
    h: Math.floor(seconds / 3600),
    m: Math.floor((seconds % 3600) / 60),
    s: Math.floor(seconds % 60),
});

export const buildVideoQuizTime = (h: number, m: number, s: number) =>
    Math.max(0, h) * 3600 + Math.min(Math.max(0, m), 59) * 60 + Math.min(Math.max(0, s), 59);
