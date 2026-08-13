import { parseContestQuestions } from '@/components/custom/CustomEditorContest';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { buildWebPreviewHtml, parseWebProject } from '@/lib/luyentap/web-project';
import type { PracticeQuestion } from '@/types/luyentap.type';
import type { BackendVideoQuizQuestion, VideoQuizQuestion } from '@/lib/khoahoc/video-quiz.utils';

export type VideoQuizPlaybackQuestion = BackendVideoQuizQuestion;

function looksLikeEmbeddedMarkdown(q: BackendVideoQuizQuestion): boolean {
    const text = q.question || '';
    return (
        /\{web\}/i.test(text) ||
        /\{lt\}/i.test(text) ||
        /\{match\}/i.test(text) ||
        /\{ms\}/i.test(text) ||
        /\{CODE:/i.test(text) ||
        /^\?/m.test(text) ||
        /\{TC-/i.test(text) ||
        /\{yêu cầu:/i.test(text) ||
        /\{đầu vào:/i.test(text) ||
        /\{đầu ra:/i.test(text)
    );
}

function hasTrustworthyStoredShape(q: BackendVideoQuizQuestion): boolean {
    if (looksLikeEmbeddedMarkdown(q)) return false;

    const type = q.type || 'multiple-choice';

    if (type === 'multiple-choice' || type === 'multiple-select' || type === 'true-false') {
        return (q.options?.length ?? 0) > 0;
    }
    if (type === 'code') {
        return Boolean(q.codeMode);
    }
    if (type === 'matching') {
        return Boolean(q.leftItems?.length || q.matchingPairs?.length);
    }
    if (type === 'short-answer' || type === 'essay') {
        return true;
    }

    return false;
}

function buildVideoQuizReparseMarkdown(q: BackendVideoQuizQuestion): string {
    const lines = [`Câu 1. ${q.question || ''}`];

    if (q.codeMode === 'web' && !/\{web\}/i.test(q.question || '')) {
        lines.push('{web}');
    } else if (q.codeMode === 'algorithm' && !/\{lt\}/i.test(q.question || '')) {
        lines.push('{lt}');
    }

    if (q.options?.length) {
        q.options.forEach((opt, index) => {
            const mcLetter = String.fromCharCode(65 + index);
            const tfLetter = String.fromCharCode(97 + index);
            const isCorrect = (q.correctAnswers || []).some((answer) => {
                const normalized = answer.trim().toUpperCase();
                return normalized === mcLetter || normalized === tfLetter.toUpperCase() || normalized.startsWith(`${tfLetter}:`);
            });

            if (/^[A-Da-d][).]\s/.test(opt)) {
                lines.push(isCorrect ? `*${opt.replace(/^\*/, '')}` : opt.replace(/^\*/, ''));
                return;
            }

            const letter = q.type === 'true-false' ? tfLetter : mcLetter;
            lines.push(isCorrect ? `*${letter}. ${opt}` : `${letter}. ${opt}`);
        });
    }

    return lines.join('\n');
}

/** Re-parse question markdown when DB type is stale (e.g. code web saved as multiple-choice). */
export function normalizeVideoQuizPlaybackQuestion(q: BackendVideoQuizQuestion): BackendVideoQuizQuestion {
    if (hasTrustworthyStoredShape(q)) {
        return q;
    }

    const markdown = buildVideoQuizReparseMarkdown(q);
    const parsed = parseContestQuestions(markdown)[0];
    if (!parsed) return q;

    return {
        ...q,
        time: Number(q.time) || 0,
        type: parsed.type,
        question: parsed.content || q.question,
        options: parsed.options?.length ? parsed.options : q.options,
        correctAnswers: parsed.correctAnswers?.length ? parsed.correctAnswers : q.correctAnswers,
        leftItems: parsed.leftItems?.length ? parsed.leftItems : q.leftItems,
        rightItems: parsed.rightItems?.length ? parsed.rightItems : q.rightItems,
        matchingPairs: parsed.matchingPairs?.length ? parsed.matchingPairs : q.matchingPairs,
        codeMode: parsed.codeMode || q.codeMode,
        language: parsed.language || q.language,
        testCases: parsed.testCases?.length ? parsed.testCases : q.testCases,
        algoRequirement: parsed.algoRequirement || q.algoRequirement,
        algoInputDesc: parsed.algoInputDesc || q.algoInputDesc,
        algoOutputDesc: parsed.algoOutputDesc || q.algoOutputDesc,
        webRequirements: parsed.webRequirements?.length ? parsed.webRequirements : q.webRequirements,
        score: q.score ?? parsed.score,
        explanation: q.explanation || parsed.explanation || '',
    };
}

export function normalizeVideoQuizPlaybackQuestions(
    questions: BackendVideoQuizQuestion[],
): BackendVideoQuizQuestion[] {
    return questions
        .map(normalizeVideoQuizPlaybackQuestion)
        .sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
}

export function parseVideoQuizQuestionsFromEditor(text: string): VideoQuizQuestion[] {
    return parseContestQuestions(text).map((q) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options,
        correctAnswers: q.correctAnswers,
        score: q.score,
        explanation: q.explanation,
        time: q.time,
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
}

export type MatchingAnswerPair = { leftIndex: number; rightIndex: number };

const normalizeText = (value: string) =>
    value.trim().toLowerCase().replace(/[-,]/g, '');

const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function getOptionLetter(opt: string, index: number): string {
    const match = opt.trim().match(/^([A-Da-d])[).]/);
    return match ? match[1].toUpperCase() : String.fromCharCode(65 + index);
}

export function getOptionText(opt: string): string {
    const idx = opt.indexOf(' ');
    return idx >= 0 ? opt.slice(idx + 1) : opt;
}

export function getTrueFalseLetter(opt: string, index: number): string {
    const match = opt.trim().match(/^([A-Da-d])[).]/);
    return match ? match[1].toLowerCase() : String.fromCharCode(97 + index);
}

export function videoQuizQuestionToPracticeStub(question: VideoQuizPlaybackQuestion): PracticeQuestion {
    return {
        _id: `video-quiz-${question.time}`,
        type: 'code',
        question: question.question,
        points: question.score,
        codeMode: question.codeMode === 'web' ? 'web' : 'algorithm',
        language: (question.language as PracticeQuestion['language']) || 'python',
        starterCode: '',
        testCases: question.testCases,
        webRequirements: (question.webRequirements || []) as PracticeQuestion['webRequirements'],
    };
}

export function parseMatchingAnswer(raw: string | null): MatchingAnswerPair[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as MatchingAnswerPair[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function serializeMatchingAnswer(pairs: MatchingAnswerPair[]): string {
    return JSON.stringify(pairs);
}

function gradeTrueFalse(question: VideoQuizPlaybackQuestion, answer: string): boolean {
    const correctAnswers = question.correctAnswers || [];

    if (correctAnswers[0]?.includes(':')) {
        const userAnswers = answer.split(',').sort().join(',');
        const correctAnswersStr = correctAnswers.sort().join(',');
        return userAnswers === correctAnswersStr;
    }

    const userAnswersObj: Record<string, boolean> = {};
    answer.split(',').forEach((part) => {
        const [letter, value] = part.split(':');
        if (letter && value !== undefined) {
            userAnswersObj[letter] = value === 'true';
        }
    });

    if (correctAnswers.length < 4 && !correctAnswers[0]?.includes('true') && !correctAnswers[0]?.includes('false')) {
        const correctLetters = new Set(correctAnswers.map((l) => l.toLowerCase()));
        const allLetters = (question.options || []).map((opt, i) => getTrueFalseLetter(opt, i));
        return allLetters.every((letter) => userAnswersObj[letter] === correctLetters.has(letter));
    }

    const correctValues = correctAnswers.map((ans) => ans === 'true');
    const userAnswerArray = (question.options || []).map((opt, i) => userAnswersObj[getTrueFalseLetter(opt, i)]);
    return userAnswerArray.every((userVal, idx) => userVal === correctValues[idx]);
}

function gradeMultipleSelect(question: VideoQuizPlaybackQuestion, answer: string): boolean {
    const selected = new Set(
        answer
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean),
    );
    const correct = new Set(
        (question.correctAnswers || []).map((s) => s.trim().toUpperCase()).filter(Boolean),
    );
    if (selected.size !== correct.size) return false;
    for (const letter of correct) {
        if (!selected.has(letter)) return false;
    }
    return true;
}

function gradeMatching(question: VideoQuizPlaybackQuestion, answer: string): boolean {
    const userPairs = parseMatchingAnswer(answer);
    const expected = question.matchingPairs || [];

    if (expected.length === 0) return userPairs.length > 0;

    const userKeys = new Set(
        userPairs.map(
            (pair) => `${pair.leftIndex + 1}-${String.fromCharCode(97 + pair.rightIndex)}`,
        ),
    );

    return expected.every((pair) => userKeys.has(`${pair.left}-${pair.right.toLowerCase()}`));
}

export function isVideoQuizAnswerReady(question: VideoQuizPlaybackQuestion, answer: string | null): boolean {
    if (!answer) return false;

    switch (question.type) {
        case 'multiple-choice':
            return answer.trim().length > 0;
        case 'multiple-select':
            return answer.split(',').some((s) => s.trim());
        case 'true-false': {
            const count = (question.options || []).length;
            const answered = answer.split(',').filter((p) => p.includes(':')).length;
            return answered >= count && count > 0;
        }
        case 'short-answer':
            return answer.trim().length > 0;
        case 'matching': {
            const pairs = parseMatchingAnswer(answer);
            const leftCount = question.leftItems?.length || 0;
            return leftCount > 0 ? pairs.length >= leftCount : pairs.length > 0;
        }
        case 'essay':
            return stripHtml(answer).length > 0;
        case 'code':
            return answer.trim().length > 0;
        default:
            return answer.trim().length > 0;
    }
}

export function gradeVideoQuizAnswer(question: VideoQuizPlaybackQuestion, answer: string): boolean {
    switch (question.type) {
        case 'multiple-choice':
            return answer.toUpperCase() === (question.correctAnswers?.[0] || '').toUpperCase();
        case 'multiple-select':
            return gradeMultipleSelect(question, answer);
        case 'true-false':
            return gradeTrueFalse(question, answer);
        case 'short-answer':
            return normalizeText(answer) === normalizeText(question.correctAnswers?.[0] || '');
        case 'matching':
            return gradeMatching(question, answer);
        case 'essay':
            return stripHtml(answer).length > 0;
        case 'code':
            return answer.trim().length > 0;
        default:
            return false;
    }
}

export async function gradeVideoQuizAnswerAsync(
    question: VideoQuizPlaybackQuestion,
    answer: string,
): Promise<boolean> {
    if (question.type !== 'code') {
        return gradeVideoQuizAnswer(question, answer);
    }

    const stub = videoQuizQuestionToPracticeStub(question);

    if (question.codeMode === 'web') {
        const project = parseWebProject(answer, stub.starterCode);
        const previewHtml = buildWebPreviewHtml(project);
        try {
            const res = await luyentapApi.runCodeTest({
                language: question.language || 'html',
                code: previewHtml,
                codeMode: 'web',
                webRequirements: stub.webRequirements,
            });
            const data = res.data || res;
            const results = Array.isArray(data.results) ? data.results : [];
            return results.length > 0 && results.every((r: { passed?: boolean }) => r.passed);
        } catch {
            return false;
        }
    }

    const sampleCases = (question.testCases || []).filter(
        (tc) => tc.isSample && (tc.input?.trim() || tc.expectedOutput?.trim()),
    );
    if (sampleCases.length === 0) {
        return answer.trim().length > 0;
    }

    try {
        for (const tc of sampleCases) {
            const res = await luyentapApi.runCodeTest({
                language: question.language || 'python',
                code: answer,
                input: tc.input || '',
                expectedOutput: tc.expectedOutput || '',
                codeMode: 'algorithm',
            });
            const data = res.data || res;
            if (!data.passed) {
                return false;
            }
        }
        return true;
    } catch {
        return false;
    }
}
