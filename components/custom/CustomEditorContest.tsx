'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
    Bold,
    Italic,
    Underline,
    Sigma,
    Image as ImageIcon,
    X,
    Link as LinkIcon,
    Upload,
    Grid3x3,
    Info,
    ChevronDown,
    Code2,
    Globe,
    Sparkles,
    Loader2,
    Undo2,
    Eye,
    EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { luyentapApi } from '@/lib/api/luyentap.api';
import {
    type WebRequirement,
    parseWebRequirementLine,
    serializeWebRequirement,
    formatWebRequirementLabel,
    questionMissingAnswer,
} from '@/lib/luyentap/question-markdown';
import {
    parseAlgoBlockOpen,
    isAlgoBlockCompleteInline,
    serializeAlgorithmQuestionBody,
    unescapeTcLiteral,
} from '@/lib/luyentap/algorithm-question-markdown';

// ============================================================================
// Types
// ============================================================================

type QuestionType = 'multiple-choice' | 'multiple-select' | 'true-false' | 'matching' | 'short-answer' | 'essay' | 'code';

export type TrueFalseScale = {
    correct1: number;
    correct2: number;
    correct3: number;
    correct4: number;
};

const DEFAULT_TRUE_FALSE_SCALE: TrueFalseScale = {
    correct1: 10,
    correct2: 25,
    correct3: 50,
    correct4: 100,
};

interface Question {
    id: number;
    number: number;
    groupTitle?: string;
    type: QuestionType;
    content: string;
    options?: string[];
    correctAnswers?: string[];
    score: number;
    explanation?: string;
    codeMode?: 'algorithm' | 'web';
    language?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
    /** Nội dung {yêu cầu: ...} cho câu LT */
    algoRequirement?: string;
    /** Mô tả đề — {đầu vào: ...} */
    algoInputDesc?: string;
    /** Mô tả đề — {đầu ra: ...} */
    algoOutputDesc?: string;
    webRequirements?: WebRequirement[];
    leftItems?: string[];
    rightItems?: string[];
    matchingPairs?: Array<{ left: string; right: string }>;
}

interface FormulaSnippet {
    label: string;
    latex: string;
}

const FORMULA_SNIPPETS: FormulaSnippet[] = [
    { label: 'Phân số', latex: '\\frac{a}{b}' },
    { label: 'Căn bậc hai', latex: '\\sqrt{x}' },
    { label: 'Lũy thừa', latex: 'x^{2}' },
    { label: 'Chỉ số dưới', latex: 'x_{n}' },
    { label: 'Tổng', latex: '\\sum_{i=1}^{n} a_i' },
    { label: 'Tích phân', latex: '\\int_{a}^{b} f(x)\\,dx' },
];

const TYPE_LABEL: Record<QuestionType, string> = {
    'multiple-choice': 'Trắc nghiệm',
    'multiple-select': 'TN nhiều đáp án',
    'true-false': 'Đúng sai',
    matching: 'Nối câu',
    'short-answer': 'Trả lời ngắn',
    essay: 'Tự luận',
    code: 'Code',
};

const TYPE_BADGE_CLASS: Record<QuestionType, string> = {
    'multiple-choice': 'bg-blue-100 text-blue-700',
    'multiple-select': 'bg-indigo-100 text-indigo-700',
    'true-false': 'bg-teal-100 text-teal-700',
    matching: 'bg-orange-100 text-orange-700',
    'short-answer': 'bg-amber-100 text-amber-700',
    essay: 'bg-purple-100 text-purple-700',
    code: 'bg-slate-100 text-slate-700',
};

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
    { value: 'multiple-choice', label: 'Trắc nghiệm' },
    { value: 'multiple-select', label: 'TN nhiều đáp án' },
    { value: 'true-false', label: 'Đúng sai' },
    { value: 'matching', label: 'Nối câu' },
    { value: 'short-answer', label: 'Trả lời ngắn' },
    { value: 'essay', label: 'Tự luận' },
    { value: 'code', label: 'Code' },
];

type ScoreGroupKey = QuestionType | 'code-algorithm' | 'code-web';

interface ScoreGroup {
    key: ScoreGroupKey;
    label: string;
    count: number;
    questionIds: number[];
}

const SCORE_GROUP_LABELS: Record<ScoreGroupKey, string> = {
    'multiple-choice': 'Tổng điểm câu trắc nghiệm 1 đáp án',
    'multiple-select': 'Tổng điểm câu trắc nghiệm nhiều đáp án',
    'true-false': 'Tổng điểm câu đúng sai',
    matching: 'Tổng điểm câu nối',
    'short-answer': 'Tổng điểm câu trả lời ngắn',
    essay: 'Tổng điểm câu tự luận',
    code: 'Tổng điểm câu lập trình',
    'code-algorithm': 'Tổng điểm câu lập trình thi đấu',
    'code-web': 'Tổng điểm câu lập trình web',
};

const getScoreGroupKey = (q: Question): ScoreGroupKey => {
    if (q.type === 'code') {
        return q.codeMode === 'web' ? 'code-web' : 'code-algorithm';
    }
    return q.type;
};

const buildScoreGroups = (questions: Question[]): ScoreGroup[] => {
    const map = new Map<ScoreGroupKey, ScoreGroup>();
    questions.forEach((q) => {
        const key = getScoreGroupKey(q);
        const existing = map.get(key);
        if (existing) {
            existing.count += 1;
            existing.questionIds.push(q.id);
        } else {
            map.set(key, {
                key,
                label: SCORE_GROUP_LABELS[key],
                count: 1,
                questionIds: [q.id],
            });
        }
    });
    return Array.from(map.values()).sort((a, b) => {
        const order: ScoreGroupKey[] = [
            'multiple-choice',
            'multiple-select',
            'true-false',
            'matching',
            'short-answer',
            'essay',
            'code-algorithm',
            'code-web',
        ];
        return order.indexOf(a.key) - order.indexOf(b.key);
    });
};

const sumGroupPoints = (
    group: ScoreGroup,
    questions: Question[],
    scoreOverrides: Record<number, number>
): number => {
    return group.questionIds.reduce((sum, id) => {
        const q = questions.find((item) => item.id === id);
        const score = scoreOverrides[id] ?? q?.score ?? 0;
        return sum + score;
    }, 0);
};

// ============================================================================
// Parsing helpers
// ============================================================================

/** Matches an option line like "A. text", "a) text", or "*B. text" (marked correct). */
const OPTION_RE = /^(\*)?([A-Da-d])([).])\s*(.*)$/;

const extractOption = (
    trimmedLine: string
): { marked: boolean; letter: string; text: string; sep: '.' | ')' } | null => {
    const m = trimmedLine.match(OPTION_RE);
    if (!m) return null;
    return {
        marked: !!m[1],
        letter: m[2],
        sep: m[3] as '.' | ')',
        text: m[4],
    };
};

/** Lấy phần nội dung phương án sau "A." hoặc "a)" — không bị nhầm bởi ")" trong code. */
const getOptionBody = (optLine: string): { letter: string; sep: '.' | ')'; text: string } => {
    const cleaned = optLine.trim().replace(/^\*/, '');
    const m = cleaned.match(/^([A-Da-d])([).])\s*(.*)$/);
    if (!m) {
        return { letter: optLine.charAt(0), sep: '.', text: '' };
    }
    return { letter: m[1], sep: m[2] as '.' | ')', text: m[3] };
};

const LEFT_ITEM_RE = /^(\d+)\.\s*(.+)$/;
const RIGHT_ITEM_RE = /^([a-z])\.\s*(.+)$/i;
const MATCH_PAIR_RE = /^\*(\d+)-([a-z])$/i;
const QUESTION_HEADER_RE = /^Câu\s*\d+\s*[.:]?/i;

/** Xác định id câu hỏi (thứ tự xuất hiện) tại vị trí con trỏ trong markdown. */
const getQuestionIdAtPosition = (text: string, pos: number): number | null => {
    const lineIndex = text.slice(0, pos).split('\n').length - 1;
    const lines = text.split('\n');
    let questionId = 0;
    for (let i = 0; i <= lineIndex && i < lines.length; i++) {
        if (QUESTION_HEADER_RE.test(lines[i].trim())) {
            questionId++;
        }
    }
    return questionId > 0 ? questionId : null;
};

const LANG_ALIASES: Record<string, string> = {
    py: 'python',
    python: 'python',
    cpp: 'cpp',
    'c++': 'cpp',
    js: 'javascript',
    javascript: 'javascript',
    cs: 'csharp',
    csharp: 'csharp',
    pas: 'pascal',
    pascal: 'pascal',
};

const TC_ONELINE_RE = /^([+\-])\s*(.+?)\s*=>\s*(.+)$/;

const normalizeLang = (raw: string) => LANG_ALIASES[raw.trim().toLowerCase()] || raw.trim().toLowerCase();

const isGroupTitleLine = (trimmed: string): boolean => {
    if (!trimmed || /^Câu\s*\d+/i.test(trimmed)) return false;
    // Không nhận A. B. C. D. là tiêu đề phần (C trùng số La Mã)
    if (extractOption(trimmed)) return false;
    if (/^Phần\s+/i.test(trimmed)) return true;
    // I. V. X. L. đơn hoặc II, III, IV... (>= 2 ký tự La Mã)
    if (/^(I|V|X|L)\.\s*/.test(trimmed)) return true;
    if (/^[IVXLC]{2,}\.\s*/.test(trimmed)) return true;
    return false;
};

const parseQuestions = (text: string): Question[] => {
    const lines = text.split('\n');
    const parsed: Question[] = [];

    let nextId = 1;
    let currentGroupTitle = '';
    let current: Question | null = null;
    let currentOptions: string[] = [];
    let currentCorrect: string[] = [];
    let currentContent = '';
    let collectingTC: 'sample' | 'hidden' | null = null;
    let tcBuffer: string[] = [];
    let collectingAlgoBlock: 'yeu-cau' | 'dau-vao' | 'dau-ra' | null = null;
    let algoBlockBuffer: string[] = [];

    const flushAlgoBlock = () => {
        if (!current || !collectingAlgoBlock) {
            collectingAlgoBlock = null;
            algoBlockBuffer = [];
            return;
        }
        const text = algoBlockBuffer.join('\n').trim();
        current.type = 'code';
        current.codeMode = 'algorithm';
        if (collectingAlgoBlock === 'yeu-cau') {
            current.algoRequirement = text;
        } else if (collectingAlgoBlock === 'dau-vao') {
            current.algoInputDesc = text;
        } else if (collectingAlgoBlock === 'dau-ra') {
            current.algoOutputDesc = text;
        }
        collectingAlgoBlock = null;
        algoBlockBuffer = [];
    };

    const applyAlgoBlockInline = (kind: 'yeu-cau' | 'dau-vao' | 'dau-ra', inline: string) => {
        if (!current) return;
        current.type = 'code';
        current.codeMode = 'algorithm';
        if (kind === 'yeu-cau') {
            current.algoRequirement = inline;
        } else if (kind === 'dau-vao') {
            current.algoInputDesc = inline;
        } else if (kind === 'dau-ra') {
            current.algoOutputDesc = inline;
        }
    };

    const flushTC = () => {
        if (!current || !collectingTC || tcBuffer.length === 0) {
            collectingTC = null;
            tcBuffer = [];
            return;
        }
        const block = tcBuffer.join('\n');
        const sepIndex = block.indexOf('\n---\n');
        if (sepIndex >= 0) {
            if (!current.testCases) current.testCases = [];
            current.testCases.push({
                input: block.slice(0, sepIndex).trim(),
                expectedOutput: block.slice(sepIndex + 5).trim(),
                isSample: collectingTC === 'sample',
            });
        }
        collectingTC = null;
        tcBuffer = [];
    };

    const flush = () => {
        flushTC();
        flushAlgoBlock();
        if (!current) return;
        current.content = currentContent.trim();
        if (currentOptions.length > 0) {
            current.options = currentOptions;
            const isTrueFalse = currentOptions.every((opt) => /^[a-d][).]/.test(opt));
            if (isTrueFalse) {
                current.type = 'true-false';
                current.correctAnswers = currentCorrect;
            } else if (current.type === 'multiple-select' || currentCorrect.length > 1) {
                current.type = 'multiple-select';
                current.correctAnswers = currentCorrect.map((c) => c.toUpperCase());
            } else {
                current.type = 'multiple-choice';
                current.correctAnswers = currentCorrect.length > 0
                    ? [currentCorrect[currentCorrect.length - 1].toUpperCase()]
                    : [];
            }
        } else if (current.type !== 'short-answer' && current.type !== 'code' && current.type !== 'matching') {
            current.type = 'essay';
        }
        parsed.push(current);
        current = null;
        currentOptions = [];
        currentCorrect = [];
        currentContent = '';
        collectingTC = null;
        tcBuffer = [];
        collectingAlgoBlock = null;
        algoBlockBuffer = [];
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (collectingAlgoBlock && current) {
            if (trimmed === '}') {
                flushAlgoBlock();
                return;
            }
            algoBlockBuffer.push(line);
            return;
        }

        if (collectingTC && current) {
            if (trimmed === '{/TC}') {
                flushTC();
                return;
            }
            tcBuffer.push(line);
            return;
        }

        const questionMatch = trimmed.match(/^Câu\s*(\d+)\s*[.:]?\s*(.*)$/i);

        if (isGroupTitleLine(trimmed)) {
            flush();
            currentGroupTitle = trimmed;
            return;
        }

        if (questionMatch) {
            flush();
            current = {
                id: nextId++,
                number: parseInt(questionMatch[1], 10),
                groupTitle: currentGroupTitle || undefined,
                type: 'multiple-choice',
                content: '',
                options: [],
                correctAnswers: [],
                score: 1,
                explanation: '',
            };
            currentOptions = [];
            currentCorrect = [];
            currentContent = questionMatch[2] || '';
            collectingTC = null;
            tcBuffer = [];
            collectingAlgoBlock = null;
            algoBlockBuffer = [];
            return;
        }

        if (current && trimmed === '{ms}') {
            current.type = 'multiple-select';
            return;
        }

        if (current && trimmed === '{match}') {
            current.type = 'matching';
            current.leftItems = [];
            current.rightItems = [];
            current.matchingPairs = [];
            return;
        }

        if (current?.type === 'matching') {
            const pairMatch = trimmed.match(MATCH_PAIR_RE);
            if (pairMatch) {
                if (!current.matchingPairs) current.matchingPairs = [];
                current.matchingPairs.push({ left: pairMatch[1], right: pairMatch[2].toLowerCase() });
                return;
            }
            const leftMatch = trimmed.match(LEFT_ITEM_RE);
            if (leftMatch) {
                if (!current.leftItems) current.leftItems = [];
                current.leftItems.push(leftMatch[2].trim());
                return;
            }
            const rightMatch = trimmed.match(RIGHT_ITEM_RE);
            if (rightMatch && /^[a-z]$/i.test(rightMatch[1])) {
                if (!current.rightItems) current.rightItems = [];
                current.rightItems.push(rightMatch[2].trim());
                return;
            }
        }

        const option = current && current.type !== 'matching' ? extractOption(trimmed) : null;
        if (current && option) {
            const displayLine = `${option.letter}${option.sep} ${option.text}`;
            currentOptions.push(displayLine);
            if (option.marked) {
                const isTrueFalseLine = /^(\*)?[a-d]\)/.test(trimmed);
                if (isTrueFalseLine) {
                    currentCorrect.push(option.letter.toLowerCase());
                } else {
                    const letter = option.letter.toUpperCase();
                    if (!currentCorrect.includes(letter)) currentCorrect.push(letter);
                }
            }
            return;
        }

        if (current && trimmed.startsWith('*')) {
            current.correctAnswers = [trimmed.slice(1).trim()];
            current.type = 'short-answer';
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

        if (current && /^\{CODE:\s*(algorithm|web)\s*\}$/i.test(trimmed)) {
            const match = trimmed.match(/^\{CODE:\s*(algorithm|web)\s*\}$/i);
            if (match) {
                current.type = 'code';
                current.codeMode = match[1].toLowerCase() as 'algorithm' | 'web';
            }
            return;
        }

        if (current && trimmed === '{lt}') {
            current.type = 'code';
            current.codeMode = 'algorithm';
            return;
        }

        const algoOpen = current ? parseAlgoBlockOpen(trimmed) : null;
        if (current && algoOpen) {
            flushTC();
            flushAlgoBlock();
            if (isAlgoBlockCompleteInline(trimmed)) {
                applyAlgoBlockInline(algoOpen.kind, algoOpen.inline);
                return;
            }
            collectingAlgoBlock = algoOpen.kind;
            if (algoOpen.inline) algoBlockBuffer.push(algoOpen.inline);
            return;
        }

        if (current && trimmed === '{web}') {
            current.type = 'code';
            current.codeMode = 'web';
            return;
        }

        if (current && /^\{(py|cpp|js|cs|pas|c\+\+)\}$/i.test(trimmed)) {
            const match = trimmed.match(/^\{(py|cpp|js|cs|pas|c\+\+)\}$/i);
            if (match) {
                current.language = normalizeLang(match[1]);
                if (current.type !== 'code') current.type = 'code';
                if (!current.codeMode) current.codeMode = 'algorithm';
            }
            return;
        }

        if (current && /^\{LANG:\s*(.+)\s*\}$/i.test(trimmed)) {
            const match = trimmed.match(/^\{LANG:\s*(.+)\s*\}$/i);
            if (match) current.language = normalizeLang(match[1]);
            return;
        }

        const tcMatch = current ? trimmed.match(TC_ONELINE_RE) : null;
        if (current && tcMatch) {
            if (!current.testCases) current.testCases = [];
            current.testCases.push({
                input: unescapeTcLiteral(tcMatch[2].trim()),
                expectedOutput: unescapeTcLiteral(tcMatch[3].trim()),
                isSample: tcMatch[1] === '+',
            });
            current.type = 'code';
            if (!current.codeMode) current.codeMode = 'algorithm';
            return;
        }

        if (current && (trimmed === '{TC-MẪU}' || trimmed === '{TC-SAMPLE}')) {
            flushTC();
            collectingTC = 'sample';
            return;
        }

        if (current && (trimmed === '{TC-ẨN}' || trimmed === '{TC-HIDDEN}')) {
            flushTC();
            collectingTC = 'hidden';
            return;
        }

        if (current && /^\{LG:/i.test(trimmed)) {
            const match = trimmed.match(/^\{LG:\s*(.*?)\s*\}$/i);
            if (match) current.explanation = match[1];
            return;
        }

        if (current && /^\{lg:\s*(.*?)\s*\}$/i.test(trimmed)) {
            const match = trimmed.match(/^\{lg:\s*(.*?)\s*\}$/i);
            if (match) current.explanation = match[1];
            return;
        }

        if (current && trimmed.startsWith('?')) {
            const req = parseWebRequirementLine(trimmed);
            if (req) {
                if (!current.webRequirements) current.webRequirements = [];
                current.webRequirements.push(req);
                current.type = 'code';
                current.codeMode = 'web';
            }
            return;
        }

        if (current) {
            if (!trimmed) return;
            currentContent = currentContent ? `${currentContent}\n${line}` : line;
        }
    });

    flush();
    return parsed;
};

/** Đọc lại tất cả đáp án * trong markdown của 1 câu (dùng khi chọn loại TN nhiều đáp án). */
const extractMarkedMcLetters = (text: string, questionNumber: number): string[] => {
    const lines = text.split('\n');
    let active = false;
    const letters: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        const qMatch = trimmed.match(/^Câu\s*(\d+)\s*[.:]?/i);
        if (qMatch) {
            active = parseInt(qMatch[1], 10) === questionNumber;
            continue;
        }
        if (!active) continue;
        if (/^Câu\s*\d+/i.test(trimmed)) break;

        const opt = extractOption(trimmed);
        if (opt?.marked && /^[A-D]$/i.test(opt.letter)) {
            const letter = opt.letter.toUpperCase();
            if (!letters.includes(letter)) letters.push(letter);
        }
    }
    return letters;
};

/** Đọc lại cấu trúc nối câu từ markdown khi chọn loại Nối câu từ dropdown. */
const extractMatchingFromCode = (
    text: string,
    questionNumber: number,
): { leftItems: string[]; rightItems: string[]; matchingPairs: Array<{ left: string; right: string }> } => {
    const lines = text.split('\n');
    let active = false;
    const leftItems: string[] = [];
    const rightItems: string[] = [];
    const matchingPairs: Array<{ left: string; right: string }> = [];

    for (const line of lines) {
        const trimmed = line.trim();
        const qMatch = trimmed.match(/^Câu\s*(\d+)\s*[.:]?/i);
        if (qMatch) {
            active = parseInt(qMatch[1], 10) === questionNumber;
            continue;
        }
        if (!active) continue;
        if (/^Câu\s*\d+/i.test(trimmed)) break;

        const pairMatch = trimmed.match(MATCH_PAIR_RE);
        if (pairMatch) {
            matchingPairs.push({ left: pairMatch[1], right: pairMatch[2].toLowerCase() });
            continue;
        }
        const leftMatch = trimmed.match(LEFT_ITEM_RE);
        if (leftMatch) {
            leftItems.push(leftMatch[2].trim());
            continue;
        }
        const rightMatch = trimmed.match(RIGHT_ITEM_RE);
        if (rightMatch && /^[a-z]$/i.test(rightMatch[1])) {
            rightItems.push(rightMatch[2].trim());
        }
    }

    return { leftItems, rightItems, matchingPairs };
};

const serializeQuestionsToCode = (questions: Question[], groupTitle = ''): string => {
    const parts: string[] = [];
    if (groupTitle.trim()) parts.push(groupTitle.trim(), '');
    let lastGroup = groupTitle.trim();
    questions.forEach((q) => {
        if (q.groupTitle && q.groupTitle !== lastGroup) {
            parts.push(q.groupTitle.trim(), '');
            lastGroup = q.groupTitle;
        }
        parts.push(`Câu ${q.number}. ${q.content}`);
        if (q.type === 'short-answer') {
            if (q.correctAnswers?.[0]) parts.push(`*${q.correctAnswers[0]}`);
        } else if (q.type === 'code') {
            if (q.codeMode === 'web') {
                parts.push('{web}');
                q.webRequirements?.forEach((req) => {
                    const line = serializeWebRequirement(req);
                    if (line) parts.push(line);
                });
            } else {
                parts.push(...serializeAlgorithmQuestionBody({
                    algoRequirement: q.algoRequirement,
                    algoInputDesc: q.algoInputDesc,
                    algoOutputDesc: q.algoOutputDesc,
                    testCases: q.testCases,
                }));
            }
        } else if (q.type === 'matching') {
            parts.push('{match}');
            q.leftItems?.forEach((text, i) => parts.push(`${i + 1}. ${text}`));
            q.rightItems?.forEach((text, i) => parts.push(`${String.fromCharCode(97 + i)}. ${text}`));
            q.matchingPairs?.forEach((p) => parts.push(`*${p.left}-${p.right}`));
        } else if (q.type === 'multiple-select') {
            parts.push('{ms}');
            q.options?.forEach((opt) => {
                const { letter, sep, text } = getOptionBody(opt);
                const marked = q.correctAnswers?.some(
                    (ans) => ans.toLowerCase() === letter.toLowerCase(),
                ) ? '*' : '';
                parts.push(`${marked}${letter}${sep} ${text}`);
            });
        } else if (q.options?.length) {
            q.options.forEach((opt) => {
                const { letter, sep, text } = getOptionBody(opt);
                const marked = q.correctAnswers?.some(
                    (ans) => ans.toLowerCase() === letter.toLowerCase(),
                ) ? '*' : '';
                parts.push(`${marked}${letter}${sep} ${text}`);
            });
        }
        if (q.explanation) parts.push(`{lg: ${q.explanation}}`);
        parts.push('');
    });
    return parts.join('\n').trim();
};

const SAMPLE_TEMPLATES: { label: string; content: string }[] = [
    {
        label: 'Mẫu 1',
        content: `Câu 1. Câu hỏi trắc nghiệm mẫu
A. Đáp án A
*B. Đáp án đúng
C. Đáp án C
D. Đáp án D`,
    },
    {
        label: 'Mẫu 2',
        content: `Câu 1. Câu hỏi đúng/sai mẫu
a) Phát biểu 1
*b) Phát biểu đúng
c) Phát biểu 3
d) Phát biểu 4`,
    },
    {
        label: 'Mẫu 3',
        content: `Câu 1. Điền đáp án ngắn
*42`,
    },
    {
        label: 'Mẫu LT',
        content: `Câu 1. Cộng hai số
{lt}
{yêu cầu:
Nhập hai số nguyên a, b. In ra tổng a + b.
}
{đầu vào:
5
10
}
{đầu ra:
15
}
+ 5 10 => 15
- 100 200 => 300
- 5 \\n 2 => 10`,
    },
    {
        label: 'Mẫu Web',
        content: `Câu 1. Tạo div nền đỏ có đoạn p
{web}
? div
? p
? style background red
? text Xin chào`,
    },
    {
        label: 'Mẫu MS',
        content: `Câu 1. Chọn các đáp án đúng
{ms}
A. Đáp án A
*B. Đáp án đúng 1
C. Đáp án C
*D. Đáp án đúng 2`,
    },
    {
        label: 'Mẫu Nối',
        content: `Câu 1. Nối cột trái với cột phải
{match}
1. Hà Nội
2. TP.HCM
3. Đà Nẵng
a. Thủ đô
b. Thành phố lớn nhất
c. Miền Trung
*1-a
*2-b
*3-c`,
    },
];

const mergeExplanationsIntoMarkdown = (
    content: string,
    explanations: Array<{ questionNumber: number; explanation: string }>
): string => {
    const expMap = new Map(explanations.map((item) => [item.questionNumber, item.explanation]));
    const lines = content.split('\n');
    const result: string[] = [];
    let preamble: string[] = [];
    let currentBlock: string[] = [];
    let currentQNum: number | null = null;
    let hasLg = false;

    const flushPreamble = () => {
        if (preamble.length) {
            result.push(...preamble);
            preamble = [];
        }
    };

    const flushBlock = () => {
        if (currentQNum === null) return;
        result.push(...currentBlock);
        const exp = expMap.get(currentQNum);
        if (exp && !hasLg) {
            result.push(`{lg: ${exp}}`);
        }
        currentBlock = [];
        currentQNum = null;
        hasLg = false;
    };

    for (const line of lines) {
        const qMatch = line.trim().match(/^Câu\s*(\d+)\./);
        if (qMatch) {
            flushPreamble();
            flushBlock();
            currentQNum = parseInt(qMatch[1], 10);
            currentBlock.push(line);
            continue;
        }

        if (currentQNum !== null) {
            if (/^\{lg:/i.test(line.trim())) hasLg = true;
            currentBlock.push(line);
        } else {
            preamble.push(line);
        }
    }

    flushPreamble();
    flushBlock();
    return result.join('\n');
};

const extractGroupTitle = (text: string): string => {
    const lines = text.split('\n');
    for (const line of lines) {
        const t = line.trim();
        if (!t || /^Câu\s*\d+/i.test(t)) break;
        if (isGroupTitleLine(t)) return t;
    }
    return '';
};

const buildQuestionSectionMap = (questions: Question[]): Map<number, number> => {
    const map = new Map<number, number>();
    if (!questions.length) return map;

    let section = 1;
    let lastGroup = questions[0].groupTitle ?? '';

    questions.forEach((q) => {
        const group = q.groupTitle ?? '';
        if (map.size > 0 && group !== lastGroup) {
            section += 1;
            lastGroup = group;
        }
        map.set(q.id, section);
    });
    return map;
};

const EXAM_INFO_TYPE_LABELS: Record<QuestionType, string> = {
    'multiple-choice': 'Tổng số câu trắc nghiệm 1 đáp án',
    'multiple-select': 'Tổng số câu trắc nghiệm nhiều đáp án',
    'true-false': 'Tổng số câu đúng-sai',
    matching: 'Tổng số câu nối',
    'short-answer': 'Tổng số câu trả lời ngắn',
    essay: 'Tổng số câu tự luận',
    code: 'Tổng số câu lập trình',
};

interface ExamInfoRow {
    key: string;
    label: string;
    questions: Question[];
}

const buildExamInfoRows = (questions: Question[]): ExamInfoRow[] => {
    const rows: ExamInfoRow[] = [];

    (['multiple-choice', 'multiple-select', 'true-false', 'matching', 'short-answer', 'essay', 'code'] as QuestionType[]).forEach((type) => {
        const matched = questions.filter((q) => q.type === type);
        if (matched.length > 0) {
            rows.push({
                key: type,
                label: EXAM_INFO_TYPE_LABELS[type],
                questions: matched,
            });
        }
    });

    const noAnswer = questions.filter(questionMissingAnswer);
    if (noAnswer.length > 0) {
        rows.push({
            key: 'no-answer',
            label: 'Tổng số câu chưa chọn đáp án',
            questions: noAnswer,
        });
    }

    const noExplanation = questions.filter((q) => !q.explanation?.trim());
    if (noExplanation.length > 0) {
        rows.push({
            key: 'no-explanation',
            label: 'Tổng số câu không có hướng dẫn giải',
            questions: noExplanation,
        });
    }

    return rows;
};

const formatGroupTitleDisplay = (title: string): string => {
    const t = title.trim();
    if (!t) return '';
    if (/^Phần\s/i.test(t)) return t;
    const match = t.match(/^([IVXLC]+)\.\s*(.*)$/);
    if (match) return `Phần ${match[1]}. ${match[2]}`;
    return t;
};

/** Renders **bold**, __underline__, *italic* and $formula$ within a line of text. */
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(__(.+?)__)|(\*(.+?)\*)|(\$(.+?)\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(
                <React.Fragment key={`${keyPrefix}-t-${key++}`}>
                    {text.slice(lastIndex, match.index)}
                </React.Fragment>
            );
        }
        if (match[1]) {
            nodes.push(<strong key={`${keyPrefix}-b-${key++}`}>{match[2]}</strong>);
        } else if (match[3]) {
            nodes.push(<u key={`${keyPrefix}-u-${key++}`}>{match[4]}</u>);
        } else if (match[5]) {
            nodes.push(<em key={`${keyPrefix}-i-${key++}`}>{match[6]}</em>);
        } else if (match[7]) {
            let html: string;
            try {
                html = katex.renderToString(match[8], { throwOnError: false, displayMode: false });
            } catch {
                html = match[8];
            }
            nodes.push(
                <span key={`${keyPrefix}-f-${key++}`} dangerouslySetInnerHTML={{ __html: html }} />
            );
        }
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        nodes.push(<React.Fragment key={`${keyPrefix}-t-${key++}`}>{text.slice(lastIndex)}</React.Fragment>);
    }
    return nodes;
};

const IMAGE_LINE_RE = /^!\[(.*?)\]\((.*?)\)\s*$/;
const DATA_IMAGE_MD_RE = /!\[(.*?)\]\((data:[^)]+)\)/g;
const IMAGE_REF_MD_RE = /!\[(.*?)\]\((img:[^)]+)\)/g;

const createImageRefId = () =>
    `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const compressDataUrlsInMarkdown = (
    text: string,
    existingMap: Record<string, string> = {}
): { compressed: string; map: Record<string, string> } => {
    const map = { ...existingMap };
    const compressed = text.replace(DATA_IMAGE_MD_RE, (_full, alt, dataUrl) => {
        const id = createImageRefId();
        map[id] = dataUrl;
        return `![${alt}](img:${id})`;
    });
    return { compressed, map };
};

const expandImageRefsInMarkdown = (text: string, map: Record<string, string>): string =>
    text.replace(IMAGE_REF_MD_RE, (full, alt, ref) => {
        const dataUrl = map[ref.slice(4)];
        return dataUrl ? `![${alt}](${dataUrl})` : full;
    });

const resolveImageSrc = (src: string, map: Record<string, string>): string => {
    if (src.startsWith('img:')) {
        return map[src.slice(4)] || src;
    }
    return src;
};

const renderEditorHighlightLine = (line: string, lineIndex: number) => {
    const match = line.match(/^(Câu\s*\d+\.)(.*)$/i);
    if (match) {
        return (
            <div key={lineIndex} className="min-h-[22px] leading-[22px] whitespace-pre-wrap break-words">
                <span className="font-bold text-blue-600">{match[1]}</span>
                <span>{match[2]}</span>
            </div>
        );
    }
    return (
        <div key={lineIndex} className="min-h-[22px] leading-[22px] whitespace-pre-wrap break-words">
            {line || '\u00A0'}
        </div>
    );
};

const ContentBlock: React.FC<{ content: string; questionId: number; imageDataMap: Record<string, string> }> = React.memo(({ content, questionId, imageDataMap }) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                const imgMatch = line.trim().match(IMAGE_LINE_RE);
                if (imgMatch) {
                    return (
                        <div key={`img-${questionId}-${i}`} className="flex justify-center w-full">
                            <img
                                src={resolveImageSrc(imgMatch[2], imageDataMap)}
                                alt={imgMatch[1] || 'Hình minh họa'}
                                className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain mx-auto"
                            />
                        </div>
                    );
                }
                if (line.trim() === '') return null;
                return (
                    <p key={`line-${questionId}-${i}`} className="leading-relaxed">
                        {renderInline(line, `c${questionId}-${i}`)}
                    </p>
                );
            })}
        </div>
    );
});
ContentBlock.displayName = 'ContentBlock';

// ============================================================================
// Component
// ============================================================================

// Type definitions for mathlive
interface MathfieldElement extends HTMLElement {
    value: string;
    readOnly: boolean;
    mathVirtualKeyboardPolicy?: string;
}

// Math Modal Component
const MathModal: React.FC<{ onClose: () => void; onInsert: (latex: string) => void }> = ({ onClose, onInsert }) => {
    const mathFieldRef = useRef<HTMLDivElement>(null);
    const [mathField, setMathField] = useState<MathfieldElement | null>(null);

    useEffect(() => {
        if (mathFieldRef.current && !mathField) {
            import('mathlive').then((MathLive) => {
                const MathfieldElementClass = MathLive.MathfieldElement as unknown as {
                    new(): MathfieldElement;
                };

                const mf = new MathfieldElementClass();
                mf.style.fontSize = '20px';
                mf.style.padding = '12px';
                mf.style.border = '1px solid #d1d5db';
                mf.style.borderRadius = '6px';
                mf.style.minHeight = '60px';
                mf.style.background = '#ffffff';
                mf.mathVirtualKeyboardPolicy = 'manual';

                // Hide virtual keyboard toggle button
                const style = document.createElement('style');
                style.textContent = `
          math-field::part(virtual-keyboard-toggle) {
            display: none !important;
          }
        `;
                document.head.appendChild(style);

                mf.addEventListener('focus', () => {
                    if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { show(): void } }).mathVirtualKeyboard) {
                        (window as Window & { mathVirtualKeyboard: { show(): void } }).mathVirtualKeyboard.show();
                    }
                });

                mathFieldRef.current?.appendChild(mf);
                setMathField(mf);

                // Show keyboard when modal opens
                setTimeout(() => {
                    mf.focus();
                    if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { show(): void } }).mathVirtualKeyboard) {
                        (window as Window & { mathVirtualKeyboard: { show(): void } }).mathVirtualKeyboard.show();
                    }
                }, 100);
            }).catch(err => {
                console.error('Failed to load mathlive:', err);
            });
        }

        return () => {
            if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { hide(): void } }).mathVirtualKeyboard) {
                (window as Window & { mathVirtualKeyboard: { hide(): void } }).mathVirtualKeyboard.hide();
            }
        };
    }, [mathField]);

    const handleInsert = () => {
        if (mathField) {
            const latex = mathField.value;
            if (latex && latex.trim()) {
                onInsert(latex.trim());
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-xl shadow-2xl w-[480px] p-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Chèn công thức toán</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
                        <X size={20} />
                    </button>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontFamily: "Inter, system-ui, sans-serif" }}>
                    Sử dụng bàn phím ảo để nhập công thức toán học
                </div>
                <div ref={mathFieldRef} style={{ marginBottom: 12 }} />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                        Hủy
                    </button>
                    <button onClick={handleInsert} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                        Chèn
                    </button>
                </div>
            </div>
        </div>
    );
};

const DEFAULT_CODE = `Câu 1. Nhập nội dung câu hỏi ở đây
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D`;

const CustomEditorContest: React.FC<{
    initialContent?: string;
    initialScoreOverrides?: Record<number, number>;
    initialTrueFalseScale?: TrueFalseScale;
    onContentChange?: (content: string, questions: Question[]) => void;
    onScoreConfigChange?: (config: { scoreOverrides: Record<number, number>; trueFalseScale: TrueFalseScale }) => void;
    saveStatus?: 'unsaved' | 'saving' | 'saved'
}> = ({
    initialContent,
    initialScoreOverrides,
    initialTrueFalseScale,
    onContentChange,
    onScoreConfigChange,
    saveStatus = 'unsaved',
}) => {
    const [code, setCode] = useState<string>(initialContent !== undefined ? initialContent : DEFAULT_CODE);
    const [scoreOverrides, setScoreOverrides] = useState<Record<number, number>>({});
    const [typeOverrides, setTypeOverrides] = useState<Record<number, QuestionType>>({});
    const [showMathModal, setShowMathModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');
    const [imageUrlDraft, setImageUrlDraft] = useState('');
    const [imageAltDraft, setImageAltDraft] = useState('');
    const [imageDataMap, setImageDataMap] = useState<Record<string, string>>({});
    const [gotoQuestion, setGotoQuestion] = useState('1');
    const [openScoreQuestionId, setOpenScoreQuestionId] = useState<number | null>(null);
    const [scoreDrafts, setScoreDrafts] = useState<Record<number, string>>({});
    const [aiScanning, setAiScanning] = useState(false);
    const [draftBeforeSample, setDraftBeforeSample] = useState<string | null>(null);
    const [activeSampleLabel, setActiveSampleLabel] = useState<string | null>(null);
    const [showDivideModal, setShowDivideModal] = useState(false);
    const [showExamInfoModal, setShowExamInfoModal] = useState(false);
    const [compactView, setCompactView] = useState<'editor' | 'preview'>('editor');
    const [showTemplatesHelp, setShowTemplatesHelp] = useState(false);
    const [totalPointsDraft, setTotalPointsDraft] = useState<Record<string, string>>({});
    const [tfScaleDraft, setTfScaleDraft] = useState<TrueFalseScale>(DEFAULT_TRUE_FALSE_SCALE);
    const [trueFalseScale, setTrueFalseScale] = useState<TrueFalseScale>(
        initialTrueFalseScale ?? DEFAULT_TRUE_FALSE_SCALE
    );
    const scoreInputRef = useRef<HTMLInputElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const previewPanelRef = useRef<HTMLDivElement>(null);

    const editorScrollClass =
        'overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

    const scrollPreviewToQuestion = (questionId: number) => {
        requestAnimationFrame(() => {
            const container = previewPanelRef.current;
            const el = document.getElementById(`azota-question-${questionId}`);
            if (!container || !el) return;

            const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
            container.scrollTo({ top, behavior: 'smooth' });
        });
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
    };

    const syncEditorScroll = () => {
        if (!textareaRef.current) return;
        const { scrollTop } = textareaRef.current;
        if (highlightRef.current) highlightRef.current.scrollTop = scrollTop;
        if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop;
    };

    const parsedQuestions = useMemo(() => parseQuestions(code), [code]);

    const renderInlineMemoized = useMemo(() => renderInline, []);

    const questions = useMemo<Question[]>(
        () =>
            parsedQuestions.map((q) => {
                const type = typeOverrides[q.id] ?? q.type;
                let correctAnswers = q.correctAnswers;
                let leftItems = q.leftItems;
                let rightItems = q.rightItems;
                let matchingPairs = q.matchingPairs;

                if (type === 'multiple-select') {
                    const fromCode = extractMarkedMcLetters(code, q.number);
                    if (fromCode.length > 0) correctAnswers = fromCode;
                } else if (type === 'multiple-choice' && (correctAnswers?.length || 0) > 1) {
                    correctAnswers = [correctAnswers![correctAnswers!.length - 1]];
                }

                if (type === 'matching') {
                    const fromCode = extractMatchingFromCode(code, q.number);
                    if (fromCode.leftItems.length > 0) leftItems = fromCode.leftItems;
                    if (fromCode.rightItems.length > 0) rightItems = fromCode.rightItems;
                    if (fromCode.matchingPairs.length > 0) matchingPairs = fromCode.matchingPairs;
                }

                return {
                    ...q,
                    score: scoreOverrides[q.id] ?? q.score,
                    type,
                    correctAnswers,
                    leftItems,
                    rightItems,
                    matchingPairs,
                };
            }),
        [parsedQuestions, scoreOverrides, typeOverrides, code]
    );

    // Track the previous initialContent to detect external changes
    const prevInitialContentRef = useRef(initialContent);
    // When code is updated FROM the initialContent prop (external source), we must
    // skip the next onContentChange notification. Otherwise the parent receives a
    // "change" event for content it just sent down, which can cause it to set state
    // again, re-triggering this effect and creating an infinite update loop
    // ("Maximum update depth exceeded").
    const skipNextNotifyRef = useRef(false);
    const didHydrateInitialRef = useRef(false);

    // Initialize / hydrate image refs when content loads from server
    useEffect(() => {
        if (initialContent === undefined) return;

        const isExternalUpdate = initialContent !== prevInitialContentRef.current;
        const shouldHydrate = !didHydrateInitialRef.current || isExternalUpdate;
        if (!shouldHydrate) return;

        prevInitialContentRef.current = initialContent;
        skipNextNotifyRef.current = true;
        didHydrateInitialRef.current = true;
        setDraftBeforeSample(null);
        setActiveSampleLabel(null);

        if (initialContent.includes('data:')) {
            const { compressed, map } = compressDataUrlsInMarkdown(initialContent);
            setImageDataMap((prev) => ({ ...prev, ...map }));
            setCode(compressed);
        } else {
            setCode(initialContent);
        }
    }, [initialContent]);

    useEffect(() => {
        if (initialScoreOverrides && Object.keys(initialScoreOverrides).length > 0) {
            setScoreOverrides(initialScoreOverrides);
        }
    }, [initialScoreOverrides]);

    useEffect(() => {
        if (initialTrueFalseScale) {
            setTrueFalseScale(initialTrueFalseScale);
        }
    }, [initialTrueFalseScale]);

    const expandedQuestions = useMemo(() => {
        const expandedCode = expandImageRefsInMarkdown(code, imageDataMap);
        return parseQuestions(expandedCode).map((q) => ({
            ...q,
            score: scoreOverrides[q.id] ?? q.score,
            type: typeOverrides[q.id] ?? q.type,
        }));
    }, [code, imageDataMap, scoreOverrides, typeOverrides]);

    // Notify parent when content changes (excluding onContentChange from deps to prevent infinite loop)
    useEffect(() => {
        if (skipNextNotifyRef.current) {
            // This change originated from the initialContent prop, not from user input.
            // Don't echo it back to the parent.
            skipNextNotifyRef.current = false;
            return;
        }
        if (onContentChange) {
            onContentChange(expandImageRefsInMarkdown(code, imageDataMap), expandedQuestions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, expandedQuestions, imageDataMap]);

    const lineNumbers = useMemo(() => code.split('\n').map((_, i) => i + 1), [code]);

    const stats = useMemo(() => {
        const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
        return { count: questions.length, totalScore };
    }, [questions]);

    const scoreGroups = useMemo(() => buildScoreGroups(questions), [questions]);
    const hasTrueFalse = scoreGroups.some((g) => g.key === 'true-false');
    const examInfoRows = useMemo(() => buildExamInfoRows(questions), [questions]);
    const questionSectionMap = useMemo(() => buildQuestionSectionMap(questions), [questions]);

    // --------------------------------------------------------------------
    // Editor text manipulation
    // --------------------------------------------------------------------

    const applyWrap = (before: string, after: string, placeholder: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = code.slice(start, end) || placeholder;
        const newText = code.slice(0, start) + before + selected + after + code.slice(end);
        setCode(newText);
        requestAnimationFrame(() => {
            textarea.focus();
            const cursorStart = start + before.length;
            textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
        });
    };

    const insertAtCursor = (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = code.slice(0, start);
        const after = code.slice(end);
        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const insertion = (needsNewline ? '\n' : '') + text + '\n';
        const newText = before + insertion + after;
        setCode(newText);
        requestAnimationFrame(() => {
            textarea.focus();
            const pos = before.length + insertion.length;
            textarea.setSelectionRange(pos, pos);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        if (e.key === 'b') {
            e.preventDefault();
            applyWrap('**', '**', 'in đậm');
        } else if (e.key === 'i') {
            e.preventDefault();
            applyWrap('*', '*', 'in nghiêng');
        } else if (e.key === 'u') {
            e.preventDefault();
            applyWrap('__', '__', 'gạch chân');
        }
    };

    const insertCodeQuestion = (mode: 'algorithm' | 'web') => {
        const nextNumber = questions.length > 0 ? Math.max(...questions.map((q) => q.number)) + 1 : 1;
        const template = mode === 'algorithm'
            ? `Câu ${nextNumber}. Tiêu đề bài LT
{lt}
{yêu cầu:
Mô tả yêu cầu bài toán
}
{đầu vào:
Mô tả dữ liệu đầu vào
}
{đầu ra:
Mô tả kết quả cần in
}
+ 5 10 => 15
- 100 200 => 300
`
            : `Câu ${nextNumber}. Tạo div nền đỏ có đoạn p
{web}
? div
? p
? style background red
`;
        setCode((prev) => `${prev.trim() ? `${prev.trim()}\n\n` : ''}${template}`);
    };

    const handleAiScan = async () => {
        const content = expandImageRefsInMarkdown(code, imageDataMap).trim();
        if (!content) {
            toast.error('Chưa có nội dung đề để quét');
            return;
        }

        const missingCount = parsedQuestions.filter((q) => !q.explanation?.trim()).length;
        if (missingCount === 0) {
            toast.info('Tất cả câu đã có {lg: ...}');
            return;
        }

        setAiScanning(true);
        try {
            const explanations = await luyentapApi.scanAiExplanations(content);
            if (!explanations.length) {
                toast.info('AI không tìm thấy câu nào cần thêm lời giải');
                return;
            }
            const updated = mergeExplanationsIntoMarkdown(code, explanations);
            setCode(updated);
            toast.success(`Đã thêm lời giải cho ${explanations.length} câu`);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            toast.error(axiosErr.response?.data?.message || 'Không thể quét AI');
        } finally {
            setAiScanning(false);
        }
    };

    const insertMathFormula = (latex: string) => {
        applyWrap('$', '$', latex);
    };

    const handleApplySample = (label: string, content: string) => {
        if (draftBeforeSample === null) {
            setDraftBeforeSample(code);
        }
        setActiveSampleLabel(label);
        setCode(content);
    };

    const handleRestoreDraft = () => {
        if (draftBeforeSample === null) return;
        setCode(draftBeforeSample);
        setDraftBeforeSample(null);
        setActiveSampleLabel(null);
    };

    // --------------------------------------------------------------------
    // Image insertion
    // --------------------------------------------------------------------

    const confirmInsertImage = (src: string) => {
        if (!src) return;
        let insertSrc = src;
        if (src.startsWith('data:')) {
            const id = createImageRefId();
            setImageDataMap((prev) => ({ ...prev, [id]: src }));
            insertSrc = `img:${id}`;
        }
        insertAtCursor(`![${imageAltDraft || 'Hình ảnh'}](${insertSrc})`);
        setShowImageModal(false);
        setImageUrlDraft('');
        setImageAltDraft('');
    };

    const handleImageFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') confirmInsertImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // --------------------------------------------------------------------
    // Answer correctness (writes '*' markers back into the raw source)
    // --------------------------------------------------------------------

    const markCorrectAnswer = (questionIndex: number, optionIndex: number) => {
        const question = questions[questionIndex];
        const optionLetter = (question.type === 'multiple-choice' || question.type === 'multiple-select')
            ? String.fromCharCode(65 + optionIndex)
            : String.fromCharCode(97 + optionIndex);

        const current = question.correctAnswers || [];
        const isCurrentlyCorrect = current.some((l) => l.toUpperCase() === optionLetter.toUpperCase());

        let nextCorrect: string[];
        if (question.type === 'multiple-choice') {
            nextCorrect = isCurrentlyCorrect ? [] : [optionLetter];
        } else if (question.type === 'multiple-select') {
            nextCorrect = isCurrentlyCorrect
                ? current.filter((l) => l.toUpperCase() !== optionLetter)
                : [...current.filter((l) => l.toUpperCase() !== optionLetter), optionLetter];
        } else {
            nextCorrect = isCurrentlyCorrect
                ? current.filter((l) => l !== optionLetter)
                : [...current, optionLetter];
        }

        const lines = code.split('\n');
        let questionIndexCounter = -1;
        let optionCounter = -1;
        const newLines = lines.map((line) => {
            const trimmed = line.trim();
            if (/^Câu\s*\d+\./.test(trimmed)) {
                questionIndexCounter++;
                optionCounter = -1;
                return line;
            }
            if (questionIndexCounter !== questionIndex) return line;

            const option = extractOption(trimmed);
            if (option) {
                optionCounter++;
            }
            if (optionCounter !== optionIndex) return line;
            if (!option) return line;

            const shouldMark = nextCorrect.includes(option.letter);
            const lineWithoutMarker = line.trimStart().startsWith('*') ? line.replace(/^\s*\*/, '') : line;

            if (shouldMark) {
                // Add * marker
                return lineWithoutMarker.startsWith('*') ? lineWithoutMarker : `*${lineWithoutMarker}`;
            } else {
                // Remove * marker
                return lineWithoutMarker;
            }
        });

        setCode(newLines.join('\n'));
    };

    const markTrueFalseAnswer = (questionIndex: number, optionIndex: number, isTrue: boolean) => {
        const question = questions[questionIndex];
        const optionLetter = String.fromCharCode(97 + optionIndex);
        const isCurrentlyTrue = question.correctAnswers?.includes(optionLetter) ?? false;
        if (isTrue === isCurrentlyTrue) return;

        const lines = code.split('\n');
        let questionIndexCounter = -1;
        let optionCounter = -1;
        const newLines = lines.map((line) => {
            const trimmed = line.trim();
            if (/^Câu\s*\d+\./.test(trimmed)) {
                questionIndexCounter++;
                optionCounter = -1;
                return line;
            }
            if (questionIndexCounter !== questionIndex) return line;

            const option = extractOption(trimmed);
            if (option) optionCounter++;
            if (optionCounter !== optionIndex || !option) return line;

            const lineWithoutMarker = line.trimStart().startsWith('*') ? line.replace(/^\s*\*/, '') : line;
            return isTrue
                ? (lineWithoutMarker.startsWith('*') ? lineWithoutMarker : `*${lineWithoutMarker}`)
                : lineWithoutMarker;
        });

        setCode(newLines.join('\n'));
    };

    const changeScore = (id: number, score: number) => {
        setScoreOverrides((prev) => ({ ...prev, [id]: score }));
    };

    useEffect(() => {
        if (openScoreQuestionId !== null) {
            scoreInputRef.current?.focus();
        }
    }, [openScoreQuestionId]);

    const openScoreInput = (questionId: number) => {
        setOpenScoreQuestionId(questionId);
        setScoreDrafts((prev) => ({
            ...prev,
            [questionId]: prev[questionId] ?? (scoreOverrides[questionId] !== undefined ? String(scoreOverrides[questionId]) : ''),
        }));
    };

    const closeScoreInput = (questionId: number) => {
        const draft = scoreDrafts[questionId]?.trim();
        if (draft) {
            const parsed = parseFloat(draft);
            if (!Number.isNaN(parsed)) changeScore(questionId, parsed);
        }
        setOpenScoreQuestionId((current) => (current === questionId ? null : current));
    };

    const handleScoreDraftChange = (questionId: number, value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        setScoreDrafts((prev) => ({ ...prev, [questionId]: value }));
    };

    const changeQuestionType = (id: number, type: QuestionType) => {
        setTypeOverrides((prev) => ({ ...prev, [id]: type }));
    };

    const handleDividePoints = () => {
        if (questions.length === 0) return;
        const drafts: Record<string, string> = {};
        scoreGroups.forEach((group) => {
            const total = sumGroupPoints(group, questions, scoreOverrides);
            drafts[group.key] = total > 0 ? String(Math.round(total * 100) / 100) : '';
        });
        setTotalPointsDraft(drafts);
        setTfScaleDraft({ ...trueFalseScale });
        setShowDivideModal(true);
    };

    const applyDividePoints = () => {
        const overrides: Record<number, number> = { ...scoreOverrides };

        for (const group of scoreGroups) {
            const total = parseFloat(totalPointsDraft[group.key] ?? '');
            if (Number.isNaN(total) || total < 0) continue;
            if (group.count === 0) continue;

            const perQuestion = Math.round((total / group.count) * 1000) / 1000;
            group.questionIds.forEach((id) => {
                overrides[id] = perQuestion;
            });
        }

        setScoreOverrides(overrides);
        setTrueFalseScale({ ...tfScaleDraft });
        onScoreConfigChange?.({ scoreOverrides: overrides, trueFalseScale: { ...tfScaleDraft } });
        setShowDivideModal(false);
    };

    const updateTfScaleDraft = (key: keyof TrueFalseScale, value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        setTfScaleDraft((prev) => ({
            ...prev,
            [key]: value === '' ? 0 : parseFloat(value),
        }));
    };

    const handleGotoQuestion = () => {
        const num = parseInt(gotoQuestion, 10);
        const target = questions.find((q) => q.number === num) ?? questions.find((q) => q.id === num);
        const targetId = target?.id ?? num;
        scrollPreviewToQuestion(targetId);
    };

    // --------------------------------------------------------------------
    // Render
    // --------------------------------------------------------------------

    return (
        <div className="flex flex-col h-full bg-white font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Toolbar — Azota style */}
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white border-b border-gray-200 flex-wrap sm:px-4">
                <div className="flex min-w-0 flex-1 items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setCompactView((v) => (v === 'editor' ? 'preview' : 'editor'))}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors xl:hidden',
                            compactView === 'preview'
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                        )}
                        title={compactView === 'editor' ? 'Xem preview' : 'Quay lại soạn đề'}
                    >
                        {compactView === 'editor' ? <Eye size={14} /> : <EyeOff size={14} />}
                        {compactView === 'editor' ? 'Preview' : 'Soạn đề'}
                    </button>
                    <button type="button" onClick={handleDividePoints} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e3a8a] text-white text-xs font-semibold hover:bg-[#1e40af]">
                        <Grid3x3 size={14} /> Chia điểm
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowExamInfoModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Info size={14} /> Thông tin đề
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span>Đi đến câu</span>
                        <input
                            type="number"
                            min={1}
                            value={gotoQuestion}
                            onChange={(e) => setGotoQuestion(e.target.value)}
                            className="w-12 px-2 py-1 border border-gray-200 rounded text-center"
                        />
                        <button type="button" onClick={handleGotoQuestion} className="px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 font-medium">Đến</button>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${saveStatus === 'saved' ? 'bg-green-100 text-green-700' : saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
                        {saveStatus === 'saved' ? 'Đã lưu' : saveStatus === 'saving' ? 'Đang lưu...' : 'Chưa lưu'}
                    </span>
                    <span className="text-xs text-gray-400 px-2">{stats.count} câu · {stats.totalScore} điểm</span>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden flex-col xl:flex-row">
                {/* LEFT — Hiển thị câu hỏi (40%) */}
                <div
                    ref={previewPanelRef}
                    className={cn(
                        'custom-scroll min-h-0 space-y-3 overflow-y-auto border-gray-200 bg-white p-3 sm:p-4',
                        compactView === 'preview'
                            ? 'flex-1'
                            : 'hidden xl:block xl:w-[40%] xl:shrink-0 xl:border-r',
                    )}
                >
                    {questions.length === 0 && (
                        <div className="py-12 text-center text-sm text-gray-400">
                            Chưa có câu hỏi.
                            <span className="xl:hidden"> Bấm &quot;Soạn đề&quot; để thêm.</span>
                            <span className="hidden xl:inline"> Soạn ở khung bên phải.</span>
                        </div>
                    )}

                    {questions.map((q, index) => (
                        <React.Fragment key={`q-${q.id}`}>
                            {q.groupTitle && q.groupTitle !== questions[index - 1]?.groupTitle && (
                                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {formatGroupTitleDisplay(q.groupTitle)}
                                    </p>
                                </div>
                            )}
                        <div id={`azota-question-${q.id}`} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-stretch border-b border-gray-200 text-sm">
                                <div className="px-3 py-2.5 flex items-center justify-center shrink-0 border-r border-gray-200">
                                    <span className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded-md text-blue-600 font-semibold whitespace-nowrap">
                                        Câu {q.number}.
                                    </span>
                                </div>

                                <div className="flex-1 px-3 py-2.5 flex items-center justify-center border-r border-gray-200 min-w-[88px]">
                                    {openScoreQuestionId === q.id ? (
                                        <div className="flex items-center justify-center gap-1 text-blue-600">
                                            <input
                                                ref={scoreInputRef}
                                                type="text"
                                                inputMode="decimal"
                                                value={scoreDrafts[q.id] ?? ''}
                                                onChange={(e) => handleScoreDraftChange(q.id, e.target.value)}
                                                onBlur={() => closeScoreInput(q.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        closeScoreInput(q.id);
                                                    }
                                                }}
                                                className="w-10 h-7 px-1 text-center border border-gray-300 rounded text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="whitespace-nowrap">điểm</span>
                                        </div>
                                    ) : scoreOverrides[q.id] !== undefined ? (
                                        <button
                                            type="button"
                                            onClick={() => openScoreInput(q.id)}
                                            className="text-blue-600 whitespace-nowrap hover:text-blue-700"
                                        >
                                            {scoreOverrides[q.id]} điểm
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openScoreInput(q.id)}
                                            className="text-blue-600 whitespace-nowrap hover:text-blue-700"
                                        >
                                            Nhập điểm
                                        </button>
                                    )}
                                </div>

                                <div className="px-3 py-2.5 flex items-center justify-center shrink-0 relative min-w-[130px]">
                                    <select
                                        value={q.type}
                                        onChange={(e) => changeQuestionType(q.id, e.target.value as QuestionType)}
                                        className="w-full appearance-none bg-transparent text-gray-600 text-sm text-center outline-none cursor-pointer pr-6 pl-6"
                                    >
                                        {QUESTION_TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <ContentBlock content={q.content} questionId={q.id} imageDataMap={imageDataMap} />

                                {(q.type === 'multiple-choice' || q.type === 'multiple-select' || q.type === 'true-false') && q.options && q.options.length > 0 && (
                                    <div className="flex flex-col gap-2 pt-1 w-full">
                                        {q.options.map((opt, optIndex) => {
                                            const { letter, text: optText } = getOptionBody(opt);
                                            const isTrue = q.correctAnswers?.some(
                                                (ans) => ans.toLowerCase() === letter.toLowerCase(),
                                            ) ?? false;

                                            if (q.type === 'true-false') {
                                                const displayLetter = letter.toLowerCase();
                                                return (
                                                    <div
                                                        key={optIndex}
                                                        className="w-full flex items-start gap-3 p-2 rounded-lg border border-gray-100"
                                                    >
                                                        <div className="flex-1 min-w-0 text-sm text-gray-800 leading-relaxed">
                                                            <span className="font-semibold">{displayLetter}) </span>
                                                            {renderInlineMemoized(optText, `opt-${q.id}-${optIndex}`)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => markTrueFalseAnswer(index, optIndex, true)}
                                                                className={`min-w-[36px] h-8 px-2 flex items-center justify-center border rounded-md text-sm font-bold transition-colors ${
                                                                    isTrue
                                                                        ? 'border-blue-500 bg-blue-600 text-white'
                                                                        : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                                                }`}
                                                            >
                                                                Đ
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => markTrueFalseAnswer(index, optIndex, false)}
                                                                className={`min-w-[36px] h-8 px-2 flex items-center justify-center border rounded-md text-sm font-bold transition-colors ${
                                                                    !isTrue
                                                                        ? 'border-blue-500 bg-blue-600 text-white'
                                                                        : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                                                }`}
                                                            >
                                                                S
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const displayLetter = letter.toUpperCase();
                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`w-full flex items-start gap-2 p-2 rounded-lg border transition-colors ${
                                                        isTrue
                                                            ? 'border-blue-200 bg-blue-50'
                                                            : 'border-gray-100 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => markCorrectAnswer(index, optIndex)}
                                                        className={`w-8 h-8 shrink-0 flex items-center justify-center border rounded-md text-sm font-bold transition-colors ${
                                                            isTrue
                                                                ? 'border-blue-500 bg-blue-600 text-white'
                                                                : 'border-gray-300 text-gray-700 hover:border-blue-300'
                                                        }`}
                                                        title={q.type === 'multiple-select' ? 'Chọn/bỏ đáp án đúng' : 'Chọn đáp án đúng'}
                                                    >
                                                        {displayLetter}
                                                    </button>
                                                    <div className="flex-1 min-w-0 text-sm text-gray-800 leading-relaxed pt-1">
                                                        {renderInlineMemoized(optText, `opt-${q.id}-${optIndex}`)}
                                                    </div>
                                                    {isTrue && (
                                                        <span className="text-red-500 text-lg leading-none shrink-0 pt-1" title="Đáp án đúng">*</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.type === 'matching' && (
                                    <div className="space-y-3 pt-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Cột trái</p>
                                                <div className="space-y-1">
                                                    {(q.leftItems || []).map((item, li) => (
                                                        <div key={li} className="text-sm text-gray-800 p-2 rounded border border-gray-100">
                                                            <span className="font-semibold mr-1">{li + 1}.</span>
                                                            {renderInlineMemoized(item, `left-${q.id}-${li}`)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Cột phải</p>
                                                <div className="space-y-1">
                                                    {(q.rightItems || []).map((item, ri) => (
                                                        <div key={ri} className="text-sm text-gray-800 p-2 rounded border border-gray-100">
                                                            <span className="font-semibold mr-1">{String.fromCharCode(97 + ri)}.</span>
                                                            {renderInlineMemoized(item, `right-${q.id}-${ri}`)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {(q.matchingPairs?.length || 0) > 0 && (
                                            <p className="text-xs text-gray-600">
                                                Đáp án nối: {q.matchingPairs!.map((p) => `${p.left}-${p.right}`).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {q.type === 'short-answer' && (
                                    <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-sm text-gray-500">Đáp án:</span>
                                        <span className="text-sm font-mono font-medium text-gray-800 tracking-widest">
                                            {q.correctAnswers?.[0] || '—'}
                                        </span>
                                    </div>
                                )}

                                {(q.type === 'essay' || q.type === 'code') && (
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${TYPE_BADGE_CLASS[q.type]}`}>
                                        {q.type === 'code'
                                            ? (q.codeMode === 'web' ? 'Lập trình web' : 'Lập trình thi đấu')
                                            : TYPE_LABEL[q.type]}
                                    </div>
                                )}

                                {q.type === 'code' && q.codeMode === 'algorithm' && (
                                    q.algoRequirement?.trim() || q.algoInputDesc?.trim() || q.algoOutputDesc?.trim()
                                ) && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs space-y-3">
                                        {q.algoRequirement?.trim() && (
                                            <div>
                                                <p className="font-semibold text-blue-700 mb-1">Yêu cầu</p>
                                                <pre className="font-mono text-gray-700 whitespace-pre-wrap">{q.algoRequirement}</pre>
                                            </div>
                                        )}
                                        {q.algoInputDesc?.trim() && (
                                            <div>
                                                <p className="font-semibold text-blue-700 mb-1">Đầu vào</p>
                                                <pre className="font-mono text-gray-700 whitespace-pre-wrap">{q.algoInputDesc}</pre>
                                            </div>
                                        )}
                                        {q.algoOutputDesc?.trim() && (
                                            <div>
                                                <p className="font-semibold text-blue-700 mb-1">Đầu ra</p>
                                                <pre className="font-mono text-gray-700 whitespace-pre-wrap">{q.algoOutputDesc}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {q.type === 'code' && q.codeMode === 'algorithm' && q.testCases && q.testCases.length > 0 && (
                                    <div className="space-y-2">
                                        {q.testCases.map((tc, tcIndex) => (
                                            <div
                                                key={tcIndex}
                                                className={`rounded-lg border p-3 text-xs ${
                                                    tc.isSample
                                                        ? 'border-green-200 bg-green-50/60'
                                                        : 'border-gray-200 bg-gray-50'
                                                }`}
                                            >
                                                <p className={`font-semibold mb-2 ${tc.isSample ? 'text-green-700' : 'text-gray-500'}`}>
                                                    {tc.isSample ? 'Testcase mẫu (học sinh thấy)' : 'Testcase ẩn (chấm điểm)'}
                                                </p>
                                                <div className="space-y-2 font-mono text-gray-700">
                                                    <div>
                                                        <p className="text-gray-500 mb-1">Input:</p>
                                                        <pre className="whitespace-pre-wrap bg-white/80 border border-gray-100 rounded px-2 py-1">{tc.input || '—'}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 mb-1">Output:</p>
                                                        <pre className="whitespace-pre-wrap bg-white/80 border border-gray-100 rounded px-2 py-1">{tc.expectedOutput || '—'}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'code' && q.codeMode === 'web' && q.webRequirements && q.webRequirements.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-indigo-700 px-1">Tiêu chí chấm web</p>
                                        {q.webRequirements.map((req, reqIndex) => (
                                            <div
                                                key={reqIndex}
                                                className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-xs text-indigo-900"
                                            >
                                                <p className="font-mono text-indigo-600 mb-1">{serializeWebRequirement(req)}</p>
                                                <p>{formatWebRequirementLabel(req)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'code' && q.codeMode === 'web' && (!q.webRequirements || q.webRequirements.length === 0) && (
                                    <div className="text-xs text-amber-700 px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                        Chưa có tiêu chí <span className="font-mono">?</span> — thêm dòng như <span className="font-mono">? div</span> hoặc <span className="font-mono">? style background red</span>
                                    </div>
                                )}

                                {q.explanation && (
                                    <div className="text-xs text-gray-500 px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                                        <span className="font-medium text-amber-700">Giải thích: </span>
                                        {renderInlineMemoized(q.explanation, `exp-${q.id}`)}
                                    </div>
                                )}
                            </div>
                        </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* RIGHT — Soạn thảo (60%) */}
                <div
                    className={cn(
                        'min-h-0 min-w-0 shrink-0 flex flex-col bg-white',
                        compactView === 'editor'
                            ? 'flex-1'
                            : 'hidden xl:flex xl:w-[60%]',
                    )}
                >
                    <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 bg-gray-50 border-b border-gray-200 sm:px-3">
                        <ToolbarButton icon={<Bold size={15} />} title="In đậm (Ctrl+B)" onClick={() => applyWrap('**', '**', 'in đậm')} />
                        <ToolbarButton icon={<Italic size={15} />} title="In nghiêng (Ctrl+I)" onClick={() => applyWrap('*', '*', 'in nghiêng')} />
                        <ToolbarButton icon={<Underline size={15} />} title="Gạch chân (Ctrl+U)" onClick={() => applyWrap('__', '__', 'gạch chân')} />
                        <div className="w-px h-5 bg-gray-300 mx-1" />
                        <ToolbarButton icon={<Sigma size={15} />} title="Chèn công thức" onClick={() => setShowMathModal(true)} />
                        <ToolbarButton icon={<ImageIcon size={15} />} title="Chèn hình ảnh" onClick={() => setShowImageModal(true)} />
                        <div className="w-px h-5 bg-gray-300 mx-1" />
                        <button
                            type="button"
                            onClick={() => insertCodeQuestion('algorithm')}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
                            title="Thêm câu lập trình thi đấu"
                        >
                            <Code2 size={14} />
                            Lập trình thi đấu
                        </button>
                        <button
                            type="button"
                            onClick={() => insertCodeQuestion('web')}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
                            title="Thêm câu lập trình web"
                        >
                            <Globe size={14} />
                            Lập trình web
                        </button>
                        <div className="w-px h-5 bg-gray-300 mx-1" />
                        <button
                            type="button"
                            onClick={handleAiScan}
                            disabled={aiScanning}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs text-violet-600 hover:bg-violet-50 transition-colors whitespace-nowrap disabled:opacity-50"
                            title="AI quét và viết {lg: ...} cho các câu chưa có lời giải"
                        >
                            {aiScanning ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            Quét AI
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div
                            ref={lineNumbersRef}
                            className={`bg-gray-50 text-gray-400 py-3 px-2 font-mono text-sm leading-[22px] text-right select-none min-w-[44px] border-r border-gray-200 shrink-0 ${editorScrollClass}`}
                        >
                            {lineNumbers.map((num) => (
                                <div key={num} className="min-h-[22px] leading-[22px] pr-1">{num}</div>
                            ))}
                        </div>
                        <div className="relative flex-1 min-w-0 overflow-hidden">
                            <div
                                ref={highlightRef}
                                aria-hidden
                                className={`absolute inset-0 py-3 px-4 font-mono text-sm leading-[22px] text-gray-900 pointer-events-none ${editorScrollClass}`}
                            >
                                {code.split('\n').map((line, index) => renderEditorHighlightLine(line, index))}
                            </div>
                            <textarea
                                ref={textareaRef}
                                className={`relative z-10 w-full h-full bg-transparent text-transparent caret-gray-900 font-mono text-sm leading-[22px] py-3 px-4 border-none outline-none resize-none whitespace-pre-wrap break-words selection:bg-blue-200/40 ${editorScrollClass}`}
                                value={code}
                                onChange={handleCodeChange}
                                onKeyDown={handleKeyDown}
                                onScroll={syncEditorScroll}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Sample templates footer */}
                    {!(showDivideModal || showExamInfoModal || showImageModal || showMathModal) && (
                    <div className="shrink-0 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                        <button
                            type="button"
                            onClick={() => setShowTemplatesHelp((v) => !v)}
                            className="flex w-full items-center justify-between px-3 py-2.5 text-left font-medium text-gray-600 hover:bg-gray-100/80 xl:hidden"
                        >
                            <span>Mẫu & hướng dẫn</span>
                            <ChevronDown
                                size={16}
                                className={cn('shrink-0 transition-transform', showTemplatesHelp && 'rotate-180')}
                            />
                        </button>
                        <div className={cn('space-y-1 px-3 py-2 sm:px-4', 'hidden xl:block', showTemplatesHelp && 'block')}>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">Mẫu:</span>
                                {SAMPLE_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.label}
                                        type="button"
                                        onClick={() => handleApplySample(tpl.label, tpl.content)}
                                        className={`hover:underline ${
                                            activeSampleLabel === tpl.label ? 'text-blue-800 font-semibold' : 'text-blue-600'
                                        }`}
                                    >
                                        {tpl.label}
                                    </button>
                                ))}
                                {draftBeforeSample !== null && (
                                    <button
                                        type="button"
                                        onClick={handleRestoreDraft}
                                        className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                                    >
                                        <Undo2 size={12} />
                                        Quay lại nội dung đang soạn
                                    </button>
                                )}
                            </div>
                            <p className="leading-relaxed text-gray-400">
                                <span className="font-medium text-gray-500">Gõ nhanh:</span>{' '}
                                *đáp_án · A./a) · {`{ms}`} · {`{match}`} · *1-a · {`{lt}`} · {`{yêu cầu:}`} · {`{đầu vào:}`} · {`{đầu ra:}`} · + in=&gt;out · - in=&gt;out · {`{web}`} · {`{lg: ...}`}
                            </p>
                            <p className="leading-relaxed text-gray-400">
                                <span className="font-medium text-emerald-600">LT thi đấu:</span>{' '}
                                <span className="font-mono">{`{đầu vào:}`}</span> /{' '}
                                <span className="font-mono">{`{đầu ra:}`}</span> mô tả đề · TC:{' '}
                                <span className="font-mono">+ 5 10 =&gt; 15</span> (mẫu) ·{' '}
                                <span className="font-mono">- 5 \\n 2 =&gt; 10</span> (ẩn, xuống dòng)
                            </p>
                            <p className="leading-relaxed text-gray-400">
                                <span className="font-medium text-indigo-600">Web chấm:</span>{' '}
                                <span className="font-mono">? div</span> (có thẻ) ·{' '}
                                <span className="font-mono">? p</span> ·{' '}
                                <span className="font-mono">? style background red</span> (CSS) ·{' '}
                                <span className="font-mono">? text Xin chào</span> ·{' '}
                                <span className="font-mono">? contains flex</span>
                            </p>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {showMathModal && (
                <MathModal onClose={() => setShowMathModal(false)} onInsert={insertMathFormula} />
            )}

            {showExamInfoModal && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowExamInfoModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin đề</h2>
                            <button
                                type="button"
                                onClick={() => setShowExamInfoModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <p className="text-sm text-gray-700 mb-1">
                                Tổng số câu trong đề thi: <strong>{questions.length} câu</strong>
                            </p>
                            <p className="text-xs text-gray-400 mb-4">
                                *Số trong () để đánh dấu câu hỏi đó thuộc nhóm hoặc phần của đề thi
                            </p>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left font-semibold text-gray-700 px-4 py-3 w-[42%]">Thông tin</th>
                                            <th className="text-center font-semibold text-gray-700 px-4 py-3 w-[12%]">Số lượng</th>
                                            <th className="text-left font-semibold text-gray-700 px-4 py-3">Danh sách các câu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examInfoRows.map((row) => (
                                            <tr key={row.key} className="border-b border-gray-100 last:border-b-0">
                                                <td className="px-4 py-3 text-gray-700 align-top">{row.label}</td>
                                                <td className="px-4 py-3 text-center text-gray-900 font-medium align-top">
                                                    {row.questions.length}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {row.questions.map((q) => (
                                                            <span
                                                                key={`${row.key}-${q.id}`}
                                                                className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                                                            >
                                                                Câu {q.number} ({questionSectionMap.get(q.id) ?? 1})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {examInfoRows.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                                    Chưa có câu hỏi trong đề
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDivideModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowDivideModal(false)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Chia điểm</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Nhập tổng điểm theo loại câu — hệ thống chia đều cho từng câu.
                            </p>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                            {scoreGroups.map((group) => (
                                <div
                                    key={group.key}
                                    className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-3"
                                >
                                    <label
                                        htmlFor={`divide-${group.key}`}
                                        className="text-sm leading-snug text-gray-700"
                                    >
                                        {group.label}{' '}
                                        <span className="text-gray-400">({group.count} câu)</span>
                                    </label>
                                    <input
                                        id={`divide-${group.key}`}
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={totalPointsDraft[group.key] ?? ''}
                                        onChange={(e) => setTotalPointsDraft((prev) => ({
                                            ...prev,
                                            [group.key]: e.target.value,
                                        }))}
                                        placeholder="0"
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>
                            ))}

                            {hasTrueFalse && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Cấu hình thang điểm cho câu hỏi đúng sai
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                                        Cấu hình % điểm theo số ý trả lời đúng trong mỗi câu đúng sai.
                                    </p>
                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {([
                                            ['correct1', 'Trả lời đúng 1 ý'] as const,
                                            ['correct2', 'Trả lời đúng 2 ý'] as const,
                                            ['correct3', 'Trả lời đúng 3 ý'] as const,
                                            ['correct4', 'Trả lời đúng 4 ý'] as const,
                                        ]).map(([key, label]) => (
                                            <label
                                                key={key}
                                                htmlFor={`tf-scale-${key}`}
                                                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
                                            >
                                                <span className="min-w-0 flex-1 text-sm text-gray-700">{label}</span>
                                                <input
                                                    id={`tf-scale-${key}`}
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={tfScaleDraft[key]}
                                                    onChange={(e) => updateTfScaleDraft(key, e.target.value)}
                                                    className="w-14 rounded-md border border-gray-200 px-2 py-1.5 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                                                />
                                                <span className="shrink-0 text-sm text-gray-500">%</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowDivideModal(false)}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                onClick={applyDividePoints}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Chia
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showImageModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-[420px] p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Chèn hình ảnh</h3>
                            <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-900"><X size={18} /></button>
                        </div>
                        <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
                            <button onClick={() => setImageTab('url')} className={`flex-1 py-1.5 rounded-md text-sm font-medium ${imageTab === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><LinkIcon size={14} className="inline mr-1" />Từ URL</button>
                            <button onClick={() => setImageTab('upload')} className={`flex-1 py-1.5 rounded-md text-sm font-medium ${imageTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><Upload size={14} className="inline mr-1" />Tải lên</button>
                        </div>
                        <input type="text" placeholder="Mô tả ảnh" value={imageAltDraft} onChange={(e) => setImageAltDraft(e.target.value)} className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm" />
                        {imageTab === 'url' ? (
                            <>
                                <input type="text" placeholder="https://..." value={imageUrlDraft} onChange={(e) => setImageUrlDraft(e.target.value)} className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg text-sm" />
                                <button onClick={() => confirmInsertImage(imageUrlDraft)} disabled={!imageUrlDraft} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40">Chèn ảnh</button>
                            </>
                        ) : (
                            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-blue-500">
                                <Upload size={22} className="text-gray-500" />
                                <span className="text-sm text-gray-500">Chọn file ảnh</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                            </label>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void }> = React.memo(({
    icon,
    title,
    onClick,
}) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className="p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
    >
        {icon}
    </button>
));
ToolbarButton.displayName = 'ToolbarButton';

export default CustomEditorContest;
